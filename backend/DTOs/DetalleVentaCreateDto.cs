using System.ComponentModel.DataAnnotations;

namespace MiApi.DTOs
{
    public class DetalleVentaCreateDto
    {
        [Required]
        public int IdProducto { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Cantidad { get; set; }
    }
}