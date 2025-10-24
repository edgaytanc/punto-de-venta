namespace MiApi.DTOs
{
    public class UserDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Token { get; set; } // Incluimos el token aquí para devolverlo al iniciar sesión
    }
}