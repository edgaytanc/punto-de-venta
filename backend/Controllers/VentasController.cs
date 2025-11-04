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

        // POST: api/ventas -> Recibe VentaCreateDto, Devuelve VentaDto
        [HttpPost]
        public async Task<ActionResult<VentaDto>> PostVenta(VentaCreateDto ventaDto)
        {
            // Usamos 'Sub' que es el que arreglamos
            // var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdClaim, out int usuarioId))
                return Unauthorized("No se pudo identificar al usuario desde el token.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Validar Cliente
                var cliente = await _context.Clientes.FindAsync(ventaDto.IdCliente);
                if (cliente == null)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"El cliente con ID {ventaDto.IdCliente} no existe.");
                }

                decimal totalVentaCalculado = 0;
                var detallesVenta = new List<DetalleVenta>();

                // 2. Procesar Detalles (¡AQUÍ ESTÁ EL ARREGLO!)
                foreach (var detalleDto in ventaDto.Detalles)
                {
                    var producto = await _context.Productos.FindAsync(detalleDto.IdProducto);

                    // Validaciones de producto y stock
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

                    // Actualizar Stock
                    producto.Stock -= detalleDto.Cantidad;
                    _context.Entry(producto).State = EntityState.Modified;

                    // --- LÓGICA DE DETALLE VENTA (COMPLETA) ---
                    var detalleVenta = new DetalleVenta
                    {
                        IdProducto = detalleDto.IdProducto,
                        Cantidad = detalleDto.Cantidad,
                        PrecioUnitario = producto.Precio, // Toma el precio de la BD
                        Subtotal = producto.Precio * detalleDto.Cantidad // Calcula el subtotal
                    };
                    detallesVenta.Add(detalleVenta);
                    totalVentaCalculado += detalleVenta.Subtotal;

                    // --- LÓGICA DE DETALLE INVENTARIO (COMPLETA) ---
                    var detalleInventario = new DetalleInventario
                    {
                        IdProducto = detalleDto.IdProducto,
                        Cantidad = -detalleDto.Cantidad, // Venta resta stock
                        TipoMovimiento = "Venta", // <-- ¡EL CAMPO QUE FALTABA!
                        Fecha = DateTime.Now
                        // (Asegúrate de que tu tabla DetalleInventario no tenga otros campos NOT NULL)
                    };
                    _context.DetallesInventario.Add(detalleInventario);
                }

                // 3. Crear Venta
                var venta = new Venta
                {
                    FechaVenta = DateTime.Now,
                    IdCliente = ventaDto.IdCliente,
                    IdUsuario = usuarioId,
                    TotalVenta = totalVentaCalculado,
                    DetallesVenta = detallesVenta
                };
                _context.Ventas.Add(venta);

                // 4. Guardar Todo
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 5. Devolver Respuesta
                var ventaCreadaDto = await MapVentaToDto(venta.Id);
                return CreatedAtAction(nameof(GetVenta), new { id = venta.Id }, ventaCreadaDto);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Devuelve el mensaje de error interno para depurar
                return StatusCode(500, $"Error interno: {ex.Message} --- InnerException: {ex.InnerException?.Message}");
            }
        }

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