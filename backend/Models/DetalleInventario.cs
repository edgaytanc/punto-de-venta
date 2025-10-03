using System.ComponentModel.DataAnnotations.Schema;

namespace MiApi.Models
{

    public class DetalleInventario : BaseEntity
    {
        public int IdProducto { get; set; }
        [ForeignKey("IdProducto")]
        public Producto Producto { get; set; }

        public string TipoMovimiento { get; set; } // "Entrada", "Salida", "Ajuste"
        public int Cantidad { get; set; }
        public DateTime Fecha { get; set; }
    }
}