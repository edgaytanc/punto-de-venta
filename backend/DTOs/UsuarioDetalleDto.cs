using System;
using System.Collections.Generic;

namespace MiApi.DTOs
{
    /// <summary>
    /// DTO para mostrar los detalles de un usuario, incluyendo sus roles.
    /// </summary>
    public class UsuarioDetalleDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public bool Estado { get; set; }
        public List<string> Roles { get; set; }
    }
}