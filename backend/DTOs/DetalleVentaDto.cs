namespace MiApi.DTOs
{
    public class DetalleVentaDto
    {
        public int IdProducto { get; set; }
        public string? NombreProducto { get; set; } // Para mostrar el nombre
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }
}