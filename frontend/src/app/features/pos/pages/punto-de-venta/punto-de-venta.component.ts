import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../../core/services/auth.service';
import { ProductoService } from '../../../../core/services/producto.service';
import { VentaService } from '../../../../core/services/venta.service';
import { User } from '../../../../core/models/user.model';
import { Producto } from '../../../../core/models/producto.model';

// Importamos los modelos que usaremos en finalizarVenta
import { VentaCreate } from '../../../../core/models/venta.model';
import { DetalleVentaCreate } from '../../../../core/models/detalle-venta.model';
import { Venta } from '../../../../core/models/venta.model';

// --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 7.4) ---
// 1. Importar el nuevo servicio de recibos
import { ReceiptService } from '../../../../core/services/receipt.service';
// --- 👆 FIN DE LA MODIFICACIÓN ---

// Interfaz interna para manejar los items del carrito
interface CarritoItem {
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  stock: number;
}

@Component({
  selector: 'app-punto-de-venta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatSnackBarModule,
    CurrencyPipe,
  ],
  templateUrl: './punto-de-venta.component.html',
  styleUrls: ['./punto-de-venta.component.scss'],
})
export class PuntoDeVentaComponent implements OnInit {
  // --- Inyección de Servicios ---
  private authService = inject(AuthService);
  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private snackBar = inject(MatSnackBar);

  // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 7.4) ---
  // 2. Inyectar el servicio de recibos
  private receiptService = inject(ReceiptService);
  // --- 👆 FIN DE LA MODIFICACIÓN ---


  // --- Estado del Componente ---
  public currentUser: User | null = null;
  public searchControl = new FormControl('');
  public productoEncontrado: Producto | null = null;
  public productoNoEncontrado = false;

  public carrito: CarritoItem[] = [];
  public totalVenta = 0.0;

  public isLoading = false;

  ngOnInit(): void {
    // Obtenemos el usuario actual (con ID: number)
    this.authService.currentUser$.subscribe((user) => {

      console.log('DATOS DEL USUARIO ACTUAL (desde ngOnInit):', user);

      this.currentUser = user;
    });
  }

  /**
   * Tarea 2.4: Busca un producto por ID o por nombre
   */
  buscarProducto(event?: Event): void {
    // Prevenir comportamiento por defecto del formulario
    if (event) {
      event.preventDefault();
    }
    
    const busqueda = this.searchControl.value?.trim();
    if (!busqueda) return;

    console.log('Buscando producto:', busqueda); // Debug log

    this.isLoading = true;
    this.productoEncontrado = null;
    this.productoNoEncontrado = false;

    // Verificar si es un número (ID) o texto (nombre)
    const esNumero = !isNaN(Number(busqueda)) && Number(busqueda) > 0;

    console.log('Es número:', esNumero); // Debug log

    if (esNumero) {
      // Búsqueda por ID (como estaba originalmente)
      this.productoService.getProducto(Number(busqueda)).subscribe({
        next: (producto: Producto) => {
          console.log('Producto encontrado por ID:', producto); // Debug log
          this.productoEncontrado = producto;
          this.isLoading = false;
          this.searchControl.setValue('');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error búsqueda por ID:', err); // Debug log
          this.manejarErrorBusqueda(busqueda, err);
        }
      });
    } else {
      // Búsqueda por nombre (NUEVO)
      console.log('Buscando por nombre...'); // Debug log
      this.productoService.searchProductosByName(busqueda).subscribe({
        next: (productos: Producto[]) => {
          console.log('Productos encontrados por nombre:', productos); // Debug log
          if (productos.length > 0) {
            this.productoEncontrado = productos[0]; // Tomar el primer resultado
            this.isLoading = false;
            this.searchControl.setValue('');
            
            if (productos.length > 1) {
              this.snackBar.open(`Se encontraron ${productos.length} productos. Mostrando el primero.`, 'Cerrar', {
                duration: 3000,
              });
            }
          } else {
            this.productoNoEncontrado = true;
            this.isLoading = false;
            this.snackBar.open(`No se encontraron productos con "${busqueda}".`, 'Cerrar', {
              duration: 3000,
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error búsqueda por nombre:', err); // Debug log
          this.manejarErrorBusqueda(busqueda, err);
        }
      });
    }
  }

  /**
   * Método auxiliar para manejar errores de búsqueda
   */
  private manejarErrorBusqueda(termino: string, err: HttpErrorResponse): void {
    this.productoNoEncontrado = true;
    this.isLoading = false;
    this.snackBar.open(`Error al buscar "${termino}". Inténtalo de nuevo.`, 'Cerrar', {
      duration: 3000,
    });
    console.error('Error al buscar producto:', err);
  }

  /**
   * Tarea 2.4/2.5: Añade producto al carrito
   */
  agregarAlCarrito(producto: Producto): void {
    if (producto.stock <= 0) {
      this.snackBar.open('Este producto no tiene stock disponible.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const itemExistente = this.carrito.find(
      (item) => item.productoId === producto.id
    );

    if (itemExistente) {
      if (itemExistente.cantidad + 1 > producto.stock) {
        this.snackBar.open(
          `No puedes agregar más. Stock máximo: ${producto.stock}`,
          'Cerrar',
          {
            duration: 3000,
          }
        );
        return;
      }
      itemExistente.cantidad++;
      itemExistente.subtotal =
        itemExistente.cantidad * itemExistente.precioUnitario;
    } else {
      const nuevoItem: CarritoItem = {
        productoId: producto.id,
        nombreProducto: producto.nombreProducto,
        precioUnitario: producto.precio,
        cantidad: 1,
        subtotal: producto.precio,
        stock: producto.stock,
      };
      this.carrito.push(nuevoItem);
    }

    this.productoEncontrado = null;
    this.calcularTotal();

    this.snackBar.open('Producto agregado al carrito.', 'Cerrar', {
      duration: 1500,
    });
  }

  /**
   * Tarea 2.5: Actualiza la cantidad
   */
  actualizarCantidad(item: CarritoItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    let nuevaCantidad = Number(input.value);

    if (nuevaCantidad > item.stock) {
      nuevaCantidad = item.stock;
      input.value = nuevaCantidad.toString();
      this.snackBar.open(
        `Stock máximo alcanzado: ${item.stock} unidades.`,
        'Cerrar',
        {
          duration: 2000,
        }
      );
    }

    if (nuevaCantidad <= 0) {
      nuevaCantidad = 1;
      input.value = nuevaCantidad.toString();
      this.snackBar.open('La cantidad debe ser al menos 1.', 'Cerrar', {
        duration: 2000,
      });
    }

    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * item.precioUnitario;

    this.calcularTotal();
  }

  /**
   * Tarea 2.5: Elimina un item
   */
  eliminarItem(productoId: number): void {
    this.carrito = this.carrito.filter(
      (item) => item.productoId !== productoId
    );
    this.calcularTotal();
    this.snackBar.open('Producto eliminado del carrito.', 'Cerrar', {
      duration: 1500,
    });
  }

  /**
   * Tarea 2.5: Calcula el total
   */
  private calcularTotal(): void {
    this.totalVenta = this.carrito.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );
  }


  // --- 👇 NUEVA IMPLEMENTACIÓN TAREA 2.6 ---

  /**
   * Tarea 2.6: Finaliza la venta
   */
  finalizarVenta(): void {
    // 1. Validar que el carrito no esté vacío
    if (this.carrito.length === 0) {
      this.snackBar.open('El carrito está vacío.', 'Cerrar', { duration: 3000 });
      return;
    }

    // 2. Validar que tengamos un currentUser
    if (!this.currentUser || !this.currentUser.id) {
      this.snackBar.open('Error de autenticación. Inicie sesión de nuevo.', 'Cerrar', {
        duration: 3000,
      });
      this.authService.logout(); // Forzar logout
      return;
    }

    // 3. Mapear this.carrito a DetalleVentaCreate[]
    const detallesVenta: DetalleVentaCreate[] = this.carrito.map((item) => {
      return {
        IdProducto: item.productoId,
        Cantidad: item.cantidad,
      };
    });

    // 4. Crear el objeto VentaCreate
    const nuevaVenta: VentaCreate = {
      IdCliente: 1, // Dejamos clienteId 1 (Mostrador) por ahora
      Detalles: detallesVenta,
    };

    console.log('ENVIANDO AL BACKEND:', nuevaVenta);

    // 5. Llamar a this.ventaService.crearVenta(venta)
    this.isLoading = true;
    this.ventaService.crearVenta(nuevaVenta).subscribe({
      next: (ventaRegistrada: Venta) => {
        this.isLoading = false;

        // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 7.4) ---
        // 3. Generar el recibo PDF
        try {
          this.receiptService.generateVentaReceipt(ventaRegistrada);
        } catch (pdfError) {
          console.error("Error al generar el PDF:", pdfError);
          // Opcional: Notificar si solo el PDF falló
          this.snackBar.open(
            'Venta registrada, pero falló la generación del recibo PDF.',
            'Cerrar',
            { duration: 5000, panelClass: ['snackbar-error'] } // Asumiendo que tienes 'snackbar-error' en styles.scss
          );
        }
        // --- 👆 FIN DE LA MODIFICACIÓN ---

        // 6. En éxito, limpiar carrito y mostrar SnackBar (Lógica existente)
        this.snackBar.open(
          `Venta #${ventaRegistrada.id} registrada con éxito.`,
          'Cerrar',
          {
            duration: 3000,
            panelClass: ['snackbar-success'],
          }
        );
        this.limpiarVenta();
      },
      error: (err: HttpErrorResponse) => {
        // 7. En error, mostrar SnackBar de error
        this.isLoading = false;
        this.snackBar.open(
          'Error al registrar la venta. Verifique el stock o intente más tarde.',
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['snackbar-error'],
          }
        );
        console.error('Error al finalizar la venta:', err);
      },
    });
  }

  /**
   * Limpia el carrito y el total después de una venta exitosa.
   */
  private limpiarVenta(): void {
    this.carrito = [];
    this.totalVenta = 0;
  }

  // --- 👆 FIN DE IMPLEMENTACIÓN TAREA 2.6 ---
}
