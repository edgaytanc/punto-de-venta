import { Injectable, inject } from '@angular/core';
// --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 8.1) ---
import { DatePipe } from '@angular/common';
// --- 👆 FIN DE LA MODIFICACIÓN ---
import { AuthService } from './auth.service';

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
  // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 8.1) ---
  private datePipe = inject(DatePipe); // Inyectar DatePipe
  // --- 👆 FIN DE LA MODIFICACIÓN ---

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
  public generateVentaReceipt(venta: Venta): void {

    // 1. Inicializar el documento
    const doc = new jsPDF('p', 'mm', 'a4');

    // 2. Formatear datos
    const cajero = this.currentUserName;

    const fecha = new Date(venta.fechaVenta);
    // Usamos el DatePipe inyectado (aunque toLocaleDateString también funciona)
    const fechaFormateada = this.datePipe.transform(fecha, 'dd/MM/yyyy h:mm a', 'es-GT');

    // 3. Diseñar el PDF

    // --- Encabezado ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Comercial Abi', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text('Recibo de Venta', 105, 28, { align: 'center' });

    // --- Información de la Venta ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const startYInfo = 40;
    doc.text(`Recibo No.:`, 20, startYInfo);
    doc.text(`${venta.id}`, 50, startYInfo);

    doc.text(`Fecha:`, 20, startYInfo + 7);
    doc.text(fechaFormateada ?? '', 50, startYInfo + 7);

    doc.text(`Cajero:`, 20, startYInfo + 14);
    doc.text(cajero, 50, startYInfo + 14);

    // --- Tabla de Productos ---

    // 4. Formatear los datos para autoTable
    const tableHeaders = ["Cantidad", "Producto", "Precio Unitario", "Subtotal"];

    const tableData = (venta.detalles ?? []).map((detalle: DetalleVenta) => [
      detalle.cantidad,
      detalle.nombreProducto,
      `Q ${detalle.precioUnitario.toFixed(2)}`,
      `Q ${detalle.subtotal.toFixed(2)}`
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

  // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 8.1) ---

  /**
   * Genera un reporte de ventas en PDF basado en una lista de ventas.
   * @param ventas Lista de ventas (filtrada o completa)
   * @param fechaInicio Fecha de inicio del filtro (opcional)
   * @param fechaFin Fecha de fin del filtro (opcional)
   */
  public generateVentasReport(
    ventas: Venta[],
    fechaInicio?: Date | null,
    fechaFin?: Date | null
  ): void {

    // 1. Inicializar el documento
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageHeight = doc.internal.pageSize.getHeight();

    // 2. Título y Subtítulo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Reporte de Ventas', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    let subtitulo: string;
    if (fechaInicio && fechaFin) {
      const inicio = this.datePipe.transform(fechaInicio, 'dd/MM/yyyy');
      const fin = this.datePipe.transform(fechaFin, 'dd/MM/yyyy');
      subtitulo = `Filtrado desde: ${inicio} - Hasta: ${fin}`;
    } else {
      subtitulo = 'Mostrando todos los registros';
    }
    doc.text(subtitulo, 105, 28, { align: 'center' });

    // 3. Definir Cabeceras (coinciden con la UI, excepto 'acciones')
    const tableHeaders = ["ID", "Fecha", "Cliente", "Cajero", "Total"];

    // 4. Mapear Datos y Calcular Gran Total
    let granTotal = 0;
    const tableData = ventas.map(venta => {
      granTotal += venta.totalVenta; // Acumular el total

      return [
        venta.id,
        this.datePipe.transform(venta.fechaVenta, 'dd/MM/yyyy h:mm a'), // Formatear fecha
        venta.nombreCliente || 'Mostrador',
        venta.nombreUsuario || 'N/A',
        `Q ${venta.totalVenta.toFixed(2)}` // Formatear moneda
      ];
    });

    // 5. Llamar a autoTable
    autoTable(doc, {
      startY: 40, // Empezar después del subtítulo
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [38, 83, 131], textColor: 255 },
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // ID
        4: { halign: 'right' } // Total
      },
      didDrawPage: (data) => {
        // --- 6. Añadir Gran Total ---
        const tableEndY = data.cursor?.y ?? 0;
        const totalY = tableEndY + 12;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Gran Total: Q ${granTotal.toFixed(2)}`, 190, totalY, { align: 'right' });

        // --- Pie de Página (en cada página) ---
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Reporte generado el: ${new Date().toLocaleDateString("es-GT")}`, 20, pageHeight - 10);
        doc.text(`Página ${data.pageNumber}`, 190, pageHeight - 10, { align: 'right' });
      }
    });

    // 7. Guardar el archivo PDF
    doc.save('reporte-ventas.pdf');
  }
  // --- 👆 FIN DE LA MODIFICACIÓN ---

}
