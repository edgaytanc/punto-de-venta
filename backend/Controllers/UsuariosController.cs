using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using MiApi.Data;
using MiApi.DTOs; 
using MiApi.Models;
using System.Collections.Generic; 
using System.Linq; 
using System.Threading.Tasks; 

namespace MiApi.Controllers
{
    /// <summary>
    /// Controlador para la gestión de usuarios y roles (Solo accesible por Admins).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Protege todo el controlador
    public class UsuariosController : ControllerBase
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly RoleManager<Rol> _roleManager;
        private readonly ApplicationDbContext _context;

        // Inyectar los servicios de Identity y el DbContext
        public UsuariosController(
            UserManager<Usuario> userManager,
            RoleManager<Rol> roleManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        // --- Endpoints GET (Tarea 6.3) ---

        /// <summary>
        /// GET: /api/usuarios
        /// Obtiene una lista de todos los usuarios con sus roles.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UsuarioDetalleDto>), 200)]
        public async Task<ActionResult<IEnumerable<UsuarioDetalleDto>>> GetUsuarios()
        {
            var usuarios = await _userManager.Users.ToListAsync();
            var usuariosDto = new List<UsuarioDetalleDto>();

            // Iteramos sobre cada usuario para obtener sus roles
            foreach (var usuario in usuarios)
            {
                usuariosDto.Add(new UsuarioDetalleDto
                {
                    Id = usuario.Id,
                    Username = usuario.UserName,
                    Email = usuario.Email,
                    Estado = usuario.Estado,
                    Roles = (await _userManager.GetRolesAsync(usuario)).ToList()
                });
            }

            return Ok(usuariosDto);
        }

        /// <summary>
        /// GET: /api/usuarios/{id}
        /// Obtiene un usuario específico por su ID.
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UsuarioDetalleDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<UsuarioDetalleDto>> GetUsuario(int id)
        {
            var usuario = await _userManager.FindByIdAsync(id.ToString());

            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            var usuarioDto = new UsuarioDetalleDto
            {
                Id = usuario.Id,
                Username = usuario.UserName,
                Email = usuario.Email,
                Estado = usuario.Estado,
                Roles = (await _userManager.GetRolesAsync(usuario)).ToList()
            };

            return Ok(usuarioDto);
        }

        /// <summary>
        /// GET: /api/roles
        /// Obtiene la lista de todos los roles disponibles en el sistema.
        /// </summary>
        [HttpGet("roles")]
        [ProducesResponseType(typeof(IEnumerable<string>), 200)]
        public async Task<ActionResult<IEnumerable<string>>> GetRoles()
        {
            var roles = await _roleManager.Roles
                                          .Select(r => r.Name)
                                          .ToListAsync();
            
            return Ok(roles);
        }

        // --- Endpoint POST (Tarea 6.4) ---

        /// <summary>
        /// POST: /api/usuarios
        /// Crea un nuevo usuario en el sistema.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(UsuarioDetalleDto), 201)] // 201 Created
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)] // 400 Bad Request
        public async Task<ActionResult<UsuarioDetalleDto>> CreateUsuario([FromBody] UsuarioCreateDto usuarioCreateDto)
        {
            // 1. Verificar si los roles enviados existen
            foreach (var roleName in usuarioCreateDto.Roles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    ModelState.AddModelError("Roles", $"El rol '{roleName}' no existe.");
                    return ValidationProblem(ModelState);
                }
            }
            
            // 2. Verificar si el Username ya existe
            if (await _userManager.FindByNameAsync(usuarioCreateDto.Username.ToLower()) != null)
            {
                ModelState.AddModelError("Username", "El nombre de usuario ya está en uso.");
                return ValidationProblem(ModelState);
            }

            // 3. Verificar si el Email ya existe
            if (await _userManager.FindByEmailAsync(usuarioCreateDto.Email.ToLower()) != null)
            {
                ModelState.AddModelError("Email", "El correo electrónico ya está en uso.");
                return ValidationProblem(ModelState);
            }

            // 4. Crear la entidad Usuario
            var newUser = new Usuario
            {
                UserName = usuarioCreateDto.Username.ToLower(),
                Email = usuarioCreateDto.Email.ToLower(),
                Estado = true // Los usuarios creados por Admin están activos por defecto
            };

            // 5. Llamar a UserManager para crear el usuario (maneja el hash de la contraseña)
            var createResult = await _userManager.CreateAsync(newUser, usuarioCreateDto.Password);

            if (!createResult.Succeeded)
            {
                // Si falla la creación de Identity (ej. política de contraseña no cumplida)
                foreach (var error in createResult.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem(ModelState);
            }

            // 6. Asignar roles
            var rolesResult = await _userManager.AddToRolesAsync(newUser, usuarioCreateDto.Roles);

            if (!rolesResult.Succeeded)
            {
                // Si falla la asignación de roles (error grave, no debería pasar si ya validamos)
                // Borramos al usuario que acabamos de crear para evitar un estado inconsistente
                await _userManager.DeleteAsync(newUser); 
                
                foreach (var error in rolesResult.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                ModelState.AddModelError("Roles", "Error al asignar roles al usuario.");
                return ValidationProblem(ModelState);
            }

            // 7. Devolver el UsuarioDetalleDto
            var usuarioDto = new UsuarioDetalleDto
            {
                Id = newUser.Id,
                Username = newUser.UserName,
                Email = newUser.Email,
                Estado = newUser.Estado,
                Roles = usuarioCreateDto.Roles // Usamos los roles del DTO de entrada
            };

            // Devolvemos 201 Created con la ubicación del nuevo recurso y el DTO
            return CreatedAtAction(nameof(GetUsuario), new { id = usuarioDto.Id }, usuarioDto);
        }

        // --- Endpoint PUT (Tarea 6.5) ---

        /// <summary>
        /// PUT: /api/usuarios/{id}
        /// Actualiza un usuario existente.
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(204)] // 204 No Content
        [ProducesResponseType(404)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        public async Task<IActionResult> UpdateUsuario(int id, [FromBody] UsuarioUpdateDto usuarioUpdateDto)
        {
            // 1. Buscar al usuario
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            // 2. Validar que los roles enviados existan
            foreach (var roleName in usuarioUpdateDto.Roles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    ModelState.AddModelError("Roles", $"El rol '{roleName}' no existe.");
                    return ValidationProblem(ModelState);
                }
            }

            // 3. Validar y actualizar Email
            // Normalizamos ambos correos para compararlos
            var newEmail = _userManager.NormalizeEmail(usuarioUpdateDto.Email);
            if (user.NormalizedEmail != newEmail)
            {
                // El email cambió. Debemos verificar que el nuevo email no esté en uso.
                var existingUserWithEmail = await _userManager.FindByEmailAsync(newEmail);
                if (existingUserWithEmail != null && existingUserWithEmail.Id != user.Id)
                {
                    ModelState.AddModelError("Email", "El correo electrónico ya está en uso por otro usuario.");
                    return ValidationProblem(ModelState);
                }
                
                // Actualizamos el email (UserManager se encarga de normalizarlo)
                var setEmailResult = await _userManager.SetEmailAsync(user, usuarioUpdateDto.Email);
                if (!setEmailResult.Succeeded)
                {
                     ModelState.AddModelError("Email", "Error al actualizar el correo.");
                     return ValidationProblem(ModelState);
                }
            }

            // 4. Actualizar Estado
            user.Estado = usuarioUpdateDto.Estado;
            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
            {
                 // Si falla la actualización (ej. error de concurrencia)
                foreach (var error in updateResult.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem(ModelState);
            }

            // 5. Sincronizar Roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            var newRoles = usuarioUpdateDto.Roles;

            var rolesToRemove = currentRoles.Except(newRoles).ToList();
            var rolesToAdd = newRoles.Except(currentRoles).ToList();

            if (rolesToRemove.Any())
            {
                var removeRolesResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                if (!removeRolesResult.Succeeded)
                {
                     ModelState.AddModelError("Roles", "Error al remover los roles del usuario.");
                     return ValidationProblem(ModelState);
                }
            }

            if (rolesToAdd.Any())
            {
                var addRolesResult = await _userManager.AddToRolesAsync(user, rolesToAdd);
                 if (!addRolesResult.Succeeded)
                {
                     ModelState.AddModelError("Roles", "Error al añadir los nuevos roles al usuario.");
                     return ValidationProblem(ModelState);
                }
            }

            // 6. Devolver 204 No Content
            return NoContent();
        }

        // --- 👇 INICIO DE LA MODIFICACIÓN (Tarea 6.6) ---

        /// <summary>
        /// DELETE: /api/usuarios/{id}
        /// Desactiva un usuario (borrado lógico).
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)] // 204 No Content
        [ProducesResponseType(404)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            // 1. Buscar al usuario
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            // 2. No borrar, solo cambiar el estado (Borrado Lógico)
            user.Estado = false;

            // 3. Llamar a UserManager para guardar los cambios
            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
            {
                // Si falla la actualización
                foreach (var error in updateResult.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem(ModelState);
            }

            // 4. Devolver 204 No Content
            return NoContent();
        }
        
        // --- 👆 FIN DE LA MODIFICACIÓN ---
    }
}