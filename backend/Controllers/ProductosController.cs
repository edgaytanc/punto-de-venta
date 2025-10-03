using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiApi.Data;
using MiApi.Models;

namespace MiApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

        // POST: api/productos
        [HttpPost]
        public async Task<ActionResult<Producto>> PostProducto(Producto producto)
        {
            // Añadimos el nuevo producto al DbSet
            _context.Productos.Add(producto);

            // Guardamos los cambios en la base de datos
            await _context.SaveChangesAsync();

            // Devolvemos una respuesta 201 Created con la ubicación del nuevo recurso y el producto creado.
            // Es una buena práctica de API REST.
            return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, producto);
        }

        // PUT: api/productos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProducto(int id, Producto producto)
        {
            // Validamos que el ID de la ruta coincida con el ID del objeto
            if (id != producto.Id)
            {
                return BadRequest(); // Devuelve 400 Bad Request
            }

            // Marcamos el estado de la entidad como Modificada
            _context.Entry(producto).State = EntityState.Modified;

            try
            {
                // Guardamos los cambios en la base de datos
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Manejamos el caso en que el producto ya no exista
                if (!ProductoExists(id))
                {
                    return NotFound(); // Devuelve 404 Not Found
                }
                else
                {
                    throw; // Lanza la excepción si ocurrió otro error
                }
            }

            // Devolvemos 204 No Content, la respuesta estándar para una actualización exitosa.
            return NoContent();
        }

        // Método privado para verificar si un producto existe
        private bool ProductoExists(int id)
        {
            return _context.Productos.Any(e => e.Id == id);
        }
    }
}