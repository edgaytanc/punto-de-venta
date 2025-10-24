using System;
using System.Collections.Generic;

namespace MiApi.DTOs
{
    public class VentaDto
    {
        public int Id { get; set; }
        public DateTime FechaVenta { get; set; }
        public decimal TotalVenta { get; set; }
        public int IdCliente { get; set; }
        public string? NombreCliente { get; set; } // Para mostrar nombre
        public int IdUsuario { get; set; }
        public string? NombreUsuario { get; set; } // Para mostrar nombre
        public List<DetalleVentaDto> Detalles { get; set; }
    }
}