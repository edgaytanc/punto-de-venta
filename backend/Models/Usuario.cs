using System.ComponentModel.DataAnnotations.Schema;

namespace MiApi.Models
{

    public class Usuario : BaseEntity
    {
        public string NombreUsuario { get; set; }
        public string Correo { get; set; }
        public string Contrasena { get; set; }
        public bool Estado { get; set; }

        // Relación con Rol
        public int IdRol { get; set; }
        [ForeignKey("IdRol")]
        public Rol Rol { get; set; }
    }
}