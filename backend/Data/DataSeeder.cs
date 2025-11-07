using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MiApi.Models; // 1. Importamos Usuario y Rol
using Microsoft.Extensions.Logging;

namespace MiApi.Data
{
    public static class DataSeeder
    {
        public static async Task SeedRolesAndAdminUserAsync(IServiceProvider serviceProvider)
        {
            var logger = serviceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<Usuario>>();
            
            // --- CAMBIO 1: Usar 'Rol' (que es IdentityRole<int>) ---
            var roleManager = serviceProvider.GetRequiredService<RoleManager<Rol>>(); 
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();

            // --- 👇 AÑADE ESTA LÍNEA 👇 ---
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>(); 
            // --- 👆 FIN DE LÍNEA A AÑADIR 👆 ---
            string[] roleNames = { "Admin", "User", "POS" };
            
            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    // --- CAMBIO 2: Crear un objeto 'Rol', no 'IdentityRole' ---
                    
                    // --- 👇 AQUÍ ESTÁ LA CORRECCIÓN ---
                    // Añadimos un valor para DescripcionRol que no sea nulo
                    await roleManager.CreateAsync(new Rol 
                    { 
                        Name = roleName, 
                        DescripcionRol = $"Rol de {roleName}" // Puedes poner lo que quieras aquí
                    });
                    // --- 👆 FIN DE LA CORRECCIÓN ---

                    logger.LogInformation($"Rol '{roleName}' creado.");
                }
            }

            var adminEmail = configuration["AdminUser:Email"] ?? "admin@pos.com";
            var adminPassword = configuration["AdminUser:Password"] ?? "Admin12345";
            var adminUsername = configuration["AdminUser:Username"] ?? "admin";
            
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                var newAdminUser = new Usuario
                {
                    UserName = adminUsername,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    // --- CAMBIO 3: Línea 'FullName' eliminada ---

                    // --- CAMBIO 4: Añadimos 'Estado' (de tu modelo Usuario.cs) ---
                    Estado = true
                };

                var result = await userManager.CreateAsync(newAdminUser, adminPassword);

                if (result.Succeeded)
                {
                    await userManager.AddToRolesAsync(newAdminUser, roleNames);
                    logger.LogInformation($"Usuario admin '{adminEmail}' creado y asignado a roles.");
                }
                else
                {
                    foreach (var error in result.Errors)
                    {
                        logger.LogError($"Error creando admin: {error.Description}");
                    }
                }
            }
            else
            {
                logger.LogInformation($"Usuario admin '{adminEmail}' ya existe.");
            }
            
            // --- 👇 INICIO DEL CÓDIGO NUEVO PARA EL CLIENTE 👇 ---
        
        // 3. Seeding del Cliente por Defecto
        try
        {
            // Verificamos si ya existe algún cliente en la BD
            if (!context.Clientes.Any())
            {
                // Si no hay ninguno, creamos el "Consumidor Final"
                var defaultClient = new Cliente
                {
                    Nombre = "Consumidor Final",
                    Direccion = "Ciudad",
                    Telefono = "N/A",
                    Correo = "consumidor@final.com"
                    // Las fechas de creación/modificación se manejan automáticamente
                };

                await context.Clientes.AddAsync(defaultClient);
                await context.SaveChangesAsync(); // Guardamos los cambios en la BD
                
                logger.LogInformation("Cliente por defecto 'Consumidor Final' creado con Id=1.");
            }
            else
            {
                logger.LogInformation("La tabla de Clientes ya tiene datos. No se crea cliente default.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ocurrió un error al intentar crear el cliente por defecto.");
        }
        // --- 👆 FIN DEL CÓDIGO NUEVO PARA EL CLIENTE 👆 ---
        }
    }
}

