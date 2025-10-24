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
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out int usuarioId)) return Unauthorized("...");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // ... (Validaciones y lógica de creación de Venta y Detalles sin cambios)...
                 decimal totalVentaCalculado = 0;
                var detallesVenta = new List<DetalleVenta>();
                var cliente = await _context.Clientes.FindAsync(ventaDto.IdCliente);
                if (cliente == null) {/*... rollback y badrequest ...*/}

                foreach (var detalleDto in ventaDto.Detalles)
                {
                   // ... (Validación producto, stock, actualización stock, creación DetalleVenta y DetalleInventario)...
                   var producto = await _context.Productos.FindAsync(detalleDto.IdProducto);
                    if (producto == null){/*... rollback y badrequest ...*/}
                    if (producto.Stock < detalleDto.Cantidad){/*... rollback y badrequest ...*/}
                    producto.Stock -= detalleDto.Cantidad;
                    _context.Entry(producto).State = EntityState.Modified;
                    var detalleVenta = new DetalleVenta {/*...*/};
                     detallesVenta.Add(detalleVenta);
                    totalVentaCalculado += detalleVenta.Subtotal;
                     var detalleInventario = new DetalleInventario {/*...*/};
                     _context.DetallesInventario.Add(detalleInventario);
                }

                var venta = new Venta
                {
                    FechaVenta = DateTime.Now,
                    IdCliente = ventaDto.IdCliente,
                    IdUsuario = usuarioId,
                    TotalVenta = totalVentaCalculado,
                    DetallesVenta = detallesVenta
                };
                _context.Ventas.Add(venta);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                 // Mapeo a VentaDto para la respuesta
                var ventaCreadaDto = await MapVentaToDto(venta.Id); // Usar método auxiliar

                return CreatedAtAction(nameof(GetVenta), new { id = venta.Id }, ventaCreadaDto);

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "...");
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
    }
}