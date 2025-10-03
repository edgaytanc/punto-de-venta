using System.ComponentModel.DataAnnotations.Schema;

namespace MiApi.Models
{

    public class DetalleVenta : BaseEntity
    {
        // Relación con Venta
        public int IdVenta { get; set; }
        [ForeignKey("IdVenta")]
        public Venta Venta { get; set; }

        // Relación con Producto
        public int IdProducto { get; set; }
        [ForeignKey("IdProducto")]
        public Producto Producto { get; set; }

        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }
}