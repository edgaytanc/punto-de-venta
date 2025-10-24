using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MiApi.DTOs
{
    public class VentaCreateDto
    {
        [Required]
        public int IdCliente { get; set; }

        [Required]
        [MinLength(1)]
        public List<DetalleVentaCreateDto> Detalles { get; set; }
    }
}