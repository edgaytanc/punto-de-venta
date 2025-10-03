using System.ComponentModel.DataAnnotations.Schema;

namespace MiApi.Models
{

    public class Venta : BaseEntity
    {
        public DateTime FechaVenta { get; set; }
        public decimal TotalVenta { get; set; }

        // Relación con Cliente
        public int IdCliente { get; set; }
        [ForeignKey("IdCliente")]
        public Cliente Cliente { get; set; }

        // Relación con Usuario
        public int IdUsuario { get; set; }
        [ForeignKey("IdUsuario")]
        public Usuario Usuario { get; set; }

        // Relación uno a muchos con DetalleVenta
        public ICollection<DetalleVenta> DetallesVenta { get; set; }
    }
}