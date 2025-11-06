import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

// --- 👇 CORRECCIÓN 1: Importar 'Venta' (en lugar de VentaDto) y 'DetalleVenta' ---
import { Venta } from '../models/venta.model';
import { DetalleVenta } from '../models/detalle-venta.model';

// Importar las bibliotecas de PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// Esta sintaxis es necesaria para que autoTable funcione como plugin de jsPDF
import 'jspdf-autotable';

/**
 * Servicio encargado de generar documentos PDF en el lado del cliente.
 * No consume APIs, solo procesa datos y genera archivos.
 */
@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private authService = inject(AuthService);
  private currentUserName: string = 'N/A';

  constructor() {
    // Nos suscribimos al usuario actual para tener siempre el nombre del cajero.
    this.authService.currentUser$.subscribe(user => {
      // Usamos el 'username' (ej. 'admin', 'juan.perez')
      this.currentUserName = user?.username ?? 'N/A';
    });
  }

  /**
   * Genera un recibo de venta en PDF y lo descarga en el navegador.
   * @param venta El objeto Venta que viene del backend.
   */
  // --- 👇 CORRECCIÓN 1: Cambiar VentaDto por Venta ---
  public generateVentaReceipt(venta: Venta): void {

    // 1. Inicializar el documento
    const doc = new jsPDF('p', 'mm', 'a4');

    // 2. Formatear datos
    const cajero = this.currentUserName;

    const fecha = new Date(venta.fechaVenta);
    const fechaFormateada = fecha.toLocaleDateString("es-GT", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    // 3. Diseñar el PDF

    // --- Encabezado ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Librería MiPOS', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text('Recibo de Venta', 105, 28, { align: 'center' });

    // --- Información de la Venta ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const startYInfo = 40;
    doc.text(`Recibo No.:`, 20, startYInfo);
    doc.text(`${venta.id}`, 50, startYInfo);

    doc.text(`Fecha:`, 20, startYInfo + 7);
    doc.text(fechaFormateada, 50, startYInfo + 7);

    doc.text(`Cajero:`, 20, startYInfo + 14);
    doc.text(cajero, 50, startYInfo + 14);

    // --- Tabla de Productos ---

    // 4. Formatear los datos para autoTable
    const tableHeaders = ["Cantidad", "Producto", "Precio Unitario", "Subtotal"];

    // --- 👇 CORRECCIÓN 2: Tipar 'detalle' y usar 'venta.detalles' (manejando nulos) ---
   const tableData = (venta.detalles ?? []).map((detalle: DetalleVenta) => [
      detalle.cantidad,
      detalle.productoNombre,
      `Q ${detalle.precioUnitario.toFixed(2)}`, // Corregido: precio -> precioUnitario
      `Q ${detalle.subtotal.toFixed(2)}`        // Corregido: cálculo -> subtotal (del DTO)
    ]);

    // 5. Llamar a autoTable
    autoTable(doc, {
      startY: startYInfo + 25, // Posición Y donde empieza la tabla
      head: [tableHeaders],
      body: tableData,
      theme: 'grid', // Estilo de la tabla
      headStyles: {
        fillColor: [38, 83, 131], // Color azul oscuro para el encabezado
        textColor: 255
      },
      styles: {
        font: 'helvetica',
        fontSize: 10
      },
      columnStyles: {
        0: { halign: 'center' }, // Cantidad (centrada)
        2: { halign: 'right' },  // Precio (alineado a la derecha)
        3: { halign: 'right' }   // Subtotal (alineado a la derecha)
      },
      didDrawPage: (data) => {
        // --- 6. Añadir el Total ---
        const tableEndY = data.cursor?.y ?? 0;
        const totalY = tableEndY + 12; // Dejar un espacio

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);

        // --- 👇 CORRECCIÓN 3: Usar 'venta.totalVenta' en lugar de 'venta.total' ---
        doc.text(`Total: Q ${venta.totalVenta.toFixed(2)}`, 190, totalY, { align: 'right' });


        // --- 7. Añadir Pie de Página ---
        const pageHeight = doc.internal.pageSize.getHeight();
        const footerY = pageHeight - 15; // 15mm desde el fondo

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text('¡Gracias por su compra!', 105, footerY, { align: 'center' });
      }
    });

    // 8. Guardar el archivo PDF
    doc.save(`recibo-venta-${venta.id}.pdf`);
  }
}
