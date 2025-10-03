using System.ComponentModel.DataAnnotations.Schema;

namespace MiApi.Models
{

    public class Producto : BaseEntity
    {
        public string NombreProducto { get; set; }
        public string ImagenUrl { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }

        // Relación con CategoriaProducto
        public int IdCategoria { get; set; }
        [ForeignKey("IdCategoria")]
        public CategoriaProducto Categoria { get; set; }

        // Relacion con Proveedor
        public int IdProveedor { get; set; }
        [ForeignKey("IdProveedor")]
        public Proveedor Proveedor { get; set; }
    }
}