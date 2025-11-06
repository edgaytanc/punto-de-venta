using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiApi.Data;
using MiApi.DTOs;
using MiApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;

namespace MiApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VentasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<Usuario> _userManager;

        public VentasController(ApplicationDbContext context, UserManager<Usuario> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // --- 👇 INICIO DE LA CORRECCIÓN ---
        // POST: api/ventas -> Recibe VentaCreateDto, Devuelve VentaDto
        [HttpPost]
        public async Task<ActionResult<VentaDto>> PostVenta(VentaCreateDto ventaDto)
        {
            // 1. Obtener ID y Objeto del Usuario
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out int usuarioId))
                return Unauthorized("No se pudo identificar al usuario desde el token.");
            
            var usuario = await _userManager.FindByIdAsync(usuarioId.ToString());
            if (usuario == null)
            {
                return Unauthorized("Usuario no encontrado.");
            }

            // 2. Diccionario para guardar los productos cargados (para el DTO de respuesta)
            // Esto es clave para la corrección.
            var productosCargados = new Dictionary<int, Producto>();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 3. Validar Cliente
                var cliente = await _context.Clientes.FindAsync(ventaDto.IdCliente);
                if (cliente == null)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"El cliente con ID {ventaDto.IdCliente} no existe.");
                }

                decimal totalVentaCalculado = 0;
                var detallesVenta = new List<DetalleVenta>();

                // 4. Procesar Detalles
                foreach (var detalleDto in ventaDto.Detalles)
                {
                    var producto = await _context.Productos.FindAsync(detalleDto.IdProducto);

                    if (producto == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"El producto con ID {detalleDto.IdProducto} no existe.");
                    }
                    if (producto.Stock < detalleDto.Cantidad)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Stock insuficiente para '{producto.NombreProducto}'. Stock: {producto.Stock}, Solicitado: {detalleDto.Cantidad}.");
                    }

                    // 5. Guardar el producto en el diccionario
                    if (!productosCargados.ContainsKey(producto.Id))
                    {
                        productosCargados.Add(producto.Id, producto);
                    }

                    // Actualizar Stock
                    producto.Stock -= detalleDto.Cantidad;
                    _context.Entry(producto).State = EntityState.Modified;

                    // Lógica de Detalle Venta
                    var detalleVenta = new DetalleVenta
                    {
                        IdProducto = detalleDto.IdProducto,
                        Cantidad = detalleDto.Cantidad,
                        PrecioUnitario = producto.Precio, 
                        Subtotal = producto.Precio * detalleDto.Cantidad 
                    };
                    detallesVenta.Add(detalleVenta);
                    totalVentaCalculado += detalleVenta.Subtotal;

                    // Lógica de Detalle Inventario
                    var detalleInventario = new DetalleInventario
                    {
                        IdProducto = detalleDto.IdProducto,
                        Cantidad = -detalleDto.Cantidad, 
                        TipoMovimiento = "Venta", 
                        Fecha = DateTime.Now
                    };
                    _context.DetallesInventario.Add(detalleInventario);
                }

                // 6. Crear Venta
                var venta = new Venta
                {
                    FechaVenta = DateTime.Now,
                    IdCliente = ventaDto.IdCliente,
                    IdUsuario = usuarioId,
                    TotalVenta = totalVentaCalculado,
                    DetallesVenta = detallesVenta
                };
                _context.Ventas.Add(venta);

                // 7. Guardar Todo
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 8. Devolver Respuesta (Mapeo Manual)
                // NO LLAMAMOS a MapVentaToDto(venta.Id) por el bug de caché.
                // Construimos el DTO manualmente con los objetos que ya tenemos en memoria.
                var ventaCreadaDto = new VentaDto
                {
                    Id = venta.Id,
                    FechaVenta = venta.FechaVenta,
                    TotalVenta = venta.TotalVenta,
                    IdCliente = venta.IdCliente,
                    NombreCliente = cliente.Nombre, // Usamos el cliente cargado
                    IdUsuario = usuarioId,
                    NombreUsuario = usuario.UserName, // Usamos el usuario cargado
                    Detalles = venta.DetallesVenta.Select(d => new DetalleVentaDto
                    {
                        // 'd' es el DetalleVenta que acabamos de guardar
                        IdProducto = d.IdProducto,
                        // ¡LA CORRECCIÓN! Usamos el diccionario
                        NombreProducto = productosCargados[d.IdProducto].NombreProducto, 
                        Cantidad = d.Cantidad,
                        PrecioUnitario = d.PrecioUnitario,
                        Subtotal = d.Subtotal
                    }).ToList()
                };
                
                // 9. Devolver el DTO con los nombres de producto
                return CreatedAtAction(nameof(GetVenta), new { id = venta.Id }, ventaCreadaDto);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error interno: {ex.Message} --- InnerException: {ex.InnerException?.Message}");
            }
        }
        // --- 👆 FIN DE LA CORRECCIÓN ---


        // GET: api/ventas -> Devuelve Lista de VentaDto (simplificado)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VentaDto>>> GetVentas(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var ventas = await _context.Ventas
                .Include(v => v.Cliente)
                .Include(v => v.Usuario)
                .OrderByDescending(v => v.FechaVenta)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new VentaDto // Mapeo directo en la consulta
                {
                    Id = v.Id,
                    FechaVenta = v.FechaVenta,
                    TotalVenta = v.TotalVenta,
                    IdCliente = v.IdCliente,
                    NombreCliente = v.Cliente.Nombre, // Necesita Include(Cliente)
                    IdUsuario = v.IdUsuario,
                    NombreUsuario = v.Usuario.UserName, // Necesita Include(Usuario)
                    Detalles = null // No incluimos detalles en la lista general
                })
                .ToListAsync();

            return Ok(ventas);
        }

        // GET: api/ventas/5 -> Devuelve VentaDto (completo)
        [HttpGet("{id}")]
        public async Task<ActionResult<VentaDto>> GetVenta(int id)
        {
            var ventaDto = await MapVentaToDto(id); // Usar método auxiliar
            if (ventaDto == null) return NotFound();
            return Ok(ventaDto);
        }

        // --- Método auxiliar para mapear Venta a VentaDto ---
        // Este método está 100% correcto y es usado por GetVenta
        private async Task<VentaDto?> MapVentaToDto(int ventaId)
        {
            var venta = await _context.Ventas
               .Include(v => v.Cliente)
               .Include(v => v.Usuario)
               .Include(v => v.DetallesVenta)
                   .ThenInclude(d => d.Producto)
               .FirstOrDefaultAsync(v => v.Id == ventaId);

            if (venta == null) return null;

            return new VentaDto
            {
                Id = venta.Id,
                FechaVenta = venta.FechaVenta,
                TotalVenta = venta.TotalVenta,
                IdCliente = venta.IdCliente,
                NombreCliente = venta.Cliente?.Nombre,
                IdUsuario = venta.IdUsuario,
                NombreUsuario = venta.Usuario?.UserName,
                Detalles = venta.DetallesVenta?.Select(d => new DetalleVentaDto
                {
                    IdProducto = d.IdProducto,
                    NombreProducto = d.Producto?.NombreProducto,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal
                }).ToList() ?? new List<DetalleVentaDto>()
            };
        }

        // --- PEGAR ESTOS DOS MÉTODOS DENTRO DE VentasController.cs ---

        /// <summary>
        /// Obtiene todas las ventas registradas por un usuario específico.
        /// GET: api/ventas/usuario/5
        /// </summary>
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<VentaDto>>> GetVentasPorUsuario(int usuarioId)
        {
            // Verificamos si el usuario existe
            var usuarioExiste = await _userManager.FindByIdAsync(usuarioId.ToString());
            if (usuarioExiste == null)
            {
                return NotFound($"No se encontró un usuario con ID {usuarioId}.");
            }

            // Buscamos las ventas
            var ventas = await _context.Ventas
                .Include(v => v.Cliente)
                .Include(v => v.Usuario)
                .Where(v => v.IdUsuario == usuarioId) // <-- El filtro por ID de Usuario
                .OrderByDescending(v => v.FechaVenta)
                .Select(v => new VentaDto // Mapeo simplificado (sin detalles)
                {
                    Id = v.Id,
                    FechaVenta = v.FechaVenta,
                    TotalVenta = v.TotalVenta,
                    IdCliente = v.IdCliente,
                    NombreCliente = v.Cliente.Nombre,
                    IdUsuario = v.IdUsuario,
                    NombreUsuario = v.Usuario.UserName,
                    Detalles = null
                })
                .ToListAsync();

            return Ok(ventas);
        }


        /// <summary>
        /// Obtiene todas las ventas dentro de un rango de fechas.
        /// GET: api/ventas/fecha?fechaInicio=2023-10-01&fechaFin=2023-10-31
        /// </summary>
        [HttpGet("fecha")]
        public async Task<ActionResult<IEnumerable<VentaDto>>> GetVentasPorFecha(
            [FromQuery] DateTime fechaInicio,
            [FromQuery] DateTime fechaFin)
        {
            // Para asegurarnos de que la fecha final incluya todo el día,
            // la ajustamos a las 23:59:59 de ese día.
            var fechaFinAjustada = fechaFin.Date.AddDays(1).AddTicks(-1);
            var fechaInicioAjustada = fechaInicio.Date; // Asegura que empezamos desde las 00:00

            var ventas = await _context.Ventas
                .Include(v => v.Cliente)
                .Include(v => v.Usuario)
                .Where(v => v.FechaVenta >= fechaInicioAjustada && v.FechaVenta <= fechaFinAjustada) // <-- El filtro por rango de fechas
                .OrderByDescending(v => v.FechaVenta)
                .Select(v => new VentaDto // Mapeo simplificado (sin detalles)
                {
                    Id = v.Id,
                    FechaVenta = v.FechaVenta,
                    TotalVenta = v.TotalVenta,
                    IdCliente = v.IdCliente,
                    NombreCliente = v.Cliente.Nombre,
                    IdUsuario = v.IdUsuario,
                    NombreUsuario = v.Usuario.UserName,
                    Detalles = null
                })
                .ToListAsync();

            return Ok(ventas);
        }

        // --- FIN DE LOS MÉTODOS A PEGAR ---
    }
}