using Microsoft.AspNetCore.Authorization; // <-- AÑADE ESTE USING
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiApi.Data;
using MiApi.Models;
using MiApi.DTOs;

namespace MiApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // <-- AÑADE ESTA LÍNEA PARA REQUERIR AUTENTICACIÓN
    public class ProductosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/productos?searchTerm=...&pageNumber=1&pageSize=10
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos(
            [FromQuery] string searchTerm = "",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            // Empezamos con una consulta base IQueryable.
            // Esto es eficiente porque no trae todos los datos de la BD a memoria.
            var query = _context.Productos.AsQueryable();

            // 1. Aplicar filtro de búsqueda si se proporcionó un término
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(p => p.NombreProducto.Contains(searchTerm));
            }

            // 2. Aplicar paginación
            var productosPaginados = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(productosPaginados);
        }

        // GET: api/productos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> GetProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
            {
                return NotFound(); // Devuelve un código de error 404 si no se encuentra
            }

            return Ok(producto);
        }

        // DELETE: api/Productos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) { return NotFound(); }
             _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();
             return NoContent();
        }

        // --- MÉTODO POST MODIFICADO ---
        [HttpPost]
        public async Task<ActionResult<Producto>> PostProducto(ProductoCreateDto productoDto) // <-- Acepta el DTO
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validar si existen la categoría y el proveedor antes de crear
             if (!await _context.CategoriasProductos.AnyAsync(c => c.Id == productoDto.IdCategoria))
            {
                 ModelState.AddModelError("IdCategoria", "La categoría especificada no existe.");
            }
             if (!await _context.Proveedores.AnyAsync(p => p.Id == productoDto.IdProveedor))
            {
                 ModelState.AddModelError("IdProveedor", "El proveedor especificado no existe.");
            }

             if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            // Mapea del DTO a la entidad Producto
            var producto = new Producto
            {
                NombreProducto = productoDto.NombreProducto,
                ImagenUrl = productoDto.ImagenUrl,
                Precio = productoDto.Precio,
                Stock = productoDto.Stock,
                IdCategoria = productoDto.IdCategoria,
                IdProveedor = productoDto.IdProveedor
                // Las fechas las establecerá SaveChangesAsync
            };

            _context.Productos.Add(producto);

             try
            {
                 await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                 // Si hay un error de base de datos (ej. FK no existe, aunque ya validamos)
                 Console.WriteLine($"Error al guardar: {ex.InnerException?.Message ?? ex.Message}");
                 return StatusCode(StatusCodes.Status500InternalServerError, "Error interno al guardar el producto.");
            }


            // Devuelve el objeto Producto completo creado (incluyendo ID y fechas)
            return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, producto);
        }
        // --- FIN MÉTODO POST MODIFICADO ---


        // --- MÉTODO PUT MODIFICADO ---
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProducto(int id, ProductoUpdateDto productoDto) // <-- Acepta el DTO
        {
            // Verifica que el ID de la ruta coincida con el ID en el DTO
            if (id != productoDto.Id)
            {
                return BadRequest("El ID de la ruta no coincide con el ID del producto enviado.");
            }

            // Verifica si el modelo recibido (DTO) es válido
             if (!ModelState.IsValid)
            {
                 return BadRequest(ModelState);
            }

             // Busca el producto existente en la base de datos
            var productoExistente = await _context.Productos.FindAsync(id);
            if (productoExistente == null)
            {
                return NotFound($"No se encontró el producto con ID {id}.");
            }

             // Valida que las claves foráneas (Categoría, Proveedor) existan
             if (!await _context.CategoriasProductos.AnyAsync(c => c.Id == productoDto.IdCategoria))
            {
                 ModelState.AddModelError("IdCategoria", "La categoría especificada no existe.");
            }
             if (!await _context.Proveedores.AnyAsync(p => p.Id == productoDto.IdProveedor))
            {
                 ModelState.AddModelError("IdProveedor", "El proveedor especificado no existe.");
            }
             if (!ModelState.IsValid)
            {
                 return BadRequest(ModelState);
            }


            // Mapea los valores del DTO a la entidad existente
            productoExistente.NombreProducto = productoDto.NombreProducto;
            productoExistente.ImagenUrl = productoDto.ImagenUrl;
            productoExistente.Precio = productoDto.Precio;
            productoExistente.Stock = productoDto.Stock;
            productoExistente.IdCategoria = productoDto.IdCategoria;
            productoExistente.IdProveedor = productoDto.IdProveedor;
            // La FechaModificacion la actualizará SaveChangesAsync automáticamente

             // Marcamos la entidad como modificada (aunque EF Core a menudo lo detecta solo)
             _context.Entry(productoExistente).State = EntityState.Modified;


            try
            {
                await _context.SaveChangesAsync(); // Guarda los cambios
            }
            catch (DbUpdateConcurrencyException) // Manejo de concurrencia (si alguien más modificó)
            {
                if (!ProductoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw; // Relanza si es otro error de concurrencia
                }
            }
             catch (DbUpdateException ex) // Manejo de otros errores de BD
            {
                 Console.WriteLine($"Error al actualizar: {ex.InnerException?.Message ?? ex.Message}");
                 return StatusCode(StatusCodes.Status500InternalServerError, "Error interno al actualizar el producto.");
            }

            // Devuelve 204 No Content si todo fue bien
            return NoContent();
        }
        // --- FIN MÉTODO PUT MODIFICADO ---

        // Método privado para verificar si un producto existe
        private bool ProductoExists(int id)
        {
            return _context.Productos.Any(e => e.Id == id);
        }
    }
}