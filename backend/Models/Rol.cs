using Microsoft.AspNetCore.Identity;

namespace MiApi.Models
{
    // Heredamos de IdentityRole<int> para usar un 'int' como llave primaria
    public class Rol : IdentityRole<int>
    {
        // IdentityRole ya tiene Id y Name. Podemos añadir más detalles.
        public string DescripcionRol { get; set; }
    }
}