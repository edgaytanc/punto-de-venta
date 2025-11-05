using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Necesario para evitar ambigüedad con SignInResult
using MiApi.DTOs;
using MiApi.Models;
using MiApi.Services;
using System.Threading.Tasks;

namespace MiApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly SignInManager<Usuario> _signInManager;
        private readonly TokenService _tokenService;

        public AuthController(UserManager<Usuario> userManager, SignInManager<Usuario> signInManager, TokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            // Verificar si el nombre de usuario ya existe
            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDto.Username.ToLower()))
            {
                return BadRequest("El nombre de usuario ya está en uso.");
            }
            // Verificar si el email ya existe
             if (await _userManager.Users.AnyAsync(x => x.Email == registerDto.Email.ToLower()))
            {
                return BadRequest("El correo electrónico ya está en uso.");
            }

            var user = new Usuario
            {
                UserName = registerDto.Username.ToLower(),
                Email = registerDto.Email.ToLower(),
                Estado = true // O el estado por defecto que desees
            };

            // Crear el usuario usando UserManager (maneja el hash de la contraseña)
            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                // Si falla la creación, devolver los errores
                return BadRequest(result.Errors);
            }

            // Por ahora, no asignaremos roles al registrar, podrías añadirlo aquí si quieres
            await _userManager.AddToRoleAsync(user, "POS");

            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user) // Opcional: devolver token al registrarse
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByNameAsync(loginDto.Username.ToLower());

            if (user == null)
            {
                return Unauthorized("Nombre de usuario inválido."); // Error genérico por seguridad
            }

            // Verificar la contraseña usando SignInManager
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false); // false = no bloquear cuenta en caso de fallo

            if (!result.Succeeded)
            {
                 return Unauthorized("Contraseña inválida."); // Error genérico por seguridad
            }

             if (!user.Estado) // Opcional: Verificar si el usuario está activo
            {
                return Unauthorized("Usuario inactivo.");
            }


            // Si la contraseña es correcta, generar y devolver el token
            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                Token = await _tokenService.CreateToken(user)
            });
        }
    }
}