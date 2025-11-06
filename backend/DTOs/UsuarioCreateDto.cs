using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MiApi.DTOs
{
    /// <summary>
    /// DTO para la creación de un nuevo usuario desde el panel de admin.
    /// </summary>
    public class UsuarioCreateDto
    {
        [Required(ErrorMessage = "El nombre de usuario es obligatorio")]
        [MinLength(3, ErrorMessage = "El nombre de usuario debe tener al menos 3 caracteres")]
        public string Username { get; set; }

        [Required(ErrorMessage = "El correo es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "La contraseña es obligatoria")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Debe asignar al menos un rol")]
        [MinLength(1, ErrorMessage = "Debe asignar al menos un rol")]
        public List<string> Roles { get; set; }
    }
}