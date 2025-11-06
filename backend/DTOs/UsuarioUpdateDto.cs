using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MiApi.DTOs
{
    /// <summary>
    /// DTO para actualizar un usuario existente desde el panel de admin.
    /// </summary>
    public class UsuarioUpdateDto
    {
        [Required(ErrorMessage = "El correo es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del correo no es válido")]
        public string Email { get; set; }

        // bool no es nullable, por lo que siempre tendrá un valor (true/false)
        public bool Estado { get; set; }

        [Required(ErrorMessage = "Debe asignar al menos un rol")]
        [MinLength(1, ErrorMessage = "Debe asignar al menos un rol")]
        public List<string> Roles { get; set; }
    }
}