using Microsoft.AspNetCore.Identity;

namespace MiApi.Models
{
    // Heredamos de IdentityUser<int> para usar un 'int' como llave primaria
    public class Usuario : IdentityUser<int>
    {
        // IdentityUser ya tiene Id, UserName, Email, PasswordHash, etc.
        // Podemos añadir propiedades personalizadas si es necesario.
        public bool Estado { get; set; }
    }
}