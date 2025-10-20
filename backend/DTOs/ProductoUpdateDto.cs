namespace MiApi.DTOs // Asegúrate que el namespace sea correcto
{
    // Este DTO tiene los campos que se pueden actualizar
    public class ProductoUpdateDto
    {
        // Incluimos Id para verificar consistencia
        public int Id { get; set; }
        public string NombreProducto { get; set; }
        public string ImagenUrl { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public int IdCategoria { get; set; }
        public int IdProveedor { get; set; }
        // Nota: No incluimos FechaCreacion, FechaModificacion, Categoria, Proveedor
    }
}