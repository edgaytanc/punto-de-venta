using Microsoft.EntityFrameworkCore;
using MiApi.Models;
// Añade estos using para SaveChangesAsync
using System.Threading;
using System.Threading.Tasks;

namespace MiApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // --- Tus DbSets (sin cambios) ---
        public DbSet<Producto> Productos { get; set; }
        public DbSet<CategoriaProducto> CategoriasProductos { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Venta> Ventas { get; set; }
        public DbSet<DetalleVenta> DetallesVenta { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Rol> Roles { get; set; }
        public DbSet<DetalleInventario> DetallesInventario { get; set; }
        public DbSet<HistorialPrecio> HistorialPrecios { get; set; }
        // ---------------------------------

        // --- Método OnModelCreating (sin cambios) ---
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
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