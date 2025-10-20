namespace MiApi.DTOs // Asegúrate que el namespace sea correcto
{
    // Este DTO solo tiene los campos necesarios para crear un producto
    public class ProductoCreateDto
    {
        public string NombreProducto { get; set; }
        public string ImagenUrl { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public int IdCategoria { get; set; }
        public int IdProveedor { get; set; }
        // Nota: No incluimos Id, FechaCreacion, FechaModificacion, Categoria, Proveedor
    }
}