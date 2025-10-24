using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MiApi.Models;
// Añade estos using para SaveChangesAsync
using System.Threading;
using System.Threading.Tasks;

namespace MiApi.Data
{
    // Heredamos de IdentityDbContext y le decimos qué clases usar para Usuario y Rol
    public class ApplicationDbContext : IdentityDbContext<Usuario, Rol, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Los DbSets para Usuarios y Roles ya no son necesarios porque IdentityDbContext los incluye.

        public DbSet<Producto> Productos { get; set; }
        public DbSet<CategoriaProducto> CategoriasProductos { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Venta> Ventas { get; set; }
        public DbSet<DetalleVenta> DetallesVenta { get; set; }
        public DbSet<DetalleInventario> DetallesInventario { get; set; }
        public DbSet<HistorialPrecio> HistorialPrecios { get; set; }

        // --- Método OnModelCreating (sin cambios) ---
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // MUY IMPORTANTE: Esta línea debe ser la primera.

            // ... (la configuración de precisión para decimales que ya teníamos)
            modelBuilder.Entity<Producto>().Property(p => p.Precio).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Venta>().Property(v => v.TotalVenta).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<DetalleVenta>().Property(d => d.PrecioUnitario).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<DetalleVenta>().Property(d => d.Subtotal).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<HistorialPrecio>().Property(h => h.PrecioAnterior).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<HistorialPrecio>().Property(h => h.PrecioNuevo).HasColumnType("decimal(18,2)");
        }
        // ------------------------------------------

        // --- REEMPLAZA SaveChanges POR SaveChangesAsync ---
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity && ( // Asegúrate que tus modelos hereden de BaseEntity
                        e.State == EntityState.Added
                        || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                // Usamos UtcNow para consistencia
                ((BaseEntity)entityEntry.Entity).FechaModificacion = DateTime.UtcNow;

                if (entityEntry.State == EntityState.Added)
                {
                    ((BaseEntity)entityEntry.Entity).FechaCreacion = DateTime.UtcNow;
                }
            }

            // Llamamos a la versión async de base
            return base.SaveChangesAsync(cancellationToken);
        }
        // ---------------------------------------------------
    }
}