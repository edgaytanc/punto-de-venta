using System.ComponentModel.DataAnnotations.Schema;

namespace MiApi.Models
{

    public class HistorialPrecio : BaseEntity
    {
        public int IdProducto { get; set; }
        [ForeignKey("IdProducto")]
        public Producto Producto { get; set; }

        public decimal PrecioAnterior { get; set; }
        public decimal PrecioNuevo { get; set; }
        public DateTime FechaCambio { get; set; }
    }
}