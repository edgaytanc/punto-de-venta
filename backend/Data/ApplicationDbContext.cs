using Microsoft.EntityFrameworkCore;
using MiApi.Models;

namespace MiApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

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

        // 👇 MÉTODO AÑADIDO PARA CONFIGURAR LA PRECISIÓN DE LOS DECIMALES
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Especificar la precisión para todas las propiedades decimales
            modelBuilder.Entity<Producto>().Property(p => p.Precio).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Venta>().Property(v => v.TotalVenta).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<DetalleVenta>().Property(d => d.PrecioUnitario).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<DetalleVenta>().Property(d => d.Subtotal).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<HistorialPrecio>().Property(h => h.PrecioAnterior).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<HistorialPrecio>().Property(h => h.PrecioNuevo).HasColumnType("decimal(18,2)");
        }

        public override int SaveChanges()
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity && (
                        e.State == EntityState.Added ||
                        e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                ((BaseEntity)entityEntry.Entity).FechaModificacion = DateTime.Now;

                if (entityEntry.State == EntityState.Added)
                {
                    ((BaseEntity)entityEntry.Entity).FechaCreacion = DateTime.Now;
                }
            }

            return base.SaveChanges();
        }
    }
}