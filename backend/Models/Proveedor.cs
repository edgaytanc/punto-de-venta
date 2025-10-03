namespace MiApi.Models
{
    public class Proveedor : BaseEntity
    {
        public string NombreProveedor { get; set; }
        public string Contacto { get; set; }
        public string Telefono { get; set; }
        public string Direccion { get; set; }
        public string Correo { get; set; }
    }
}
