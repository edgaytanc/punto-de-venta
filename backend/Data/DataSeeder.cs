using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MiApi.Models; // 1. Importamos Usuario y Rol

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

            string[] roleNames = { "Admin", "User", "POS" };
            
            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    // --- CAMBIO 2: Crear un objeto 'Rol', no 'IdentityRole' ---
                    await roleManager.CreateAsync(new Rol { Name = roleName });
                    logger.LogInformation($"Rol '{roleName}' creado.");
                }
            }

            var adminEmail = configuration["AdminUser:Email"] ?? "admin@pos.com";
            var adminPassword = configuration["AdminUser:Password"] ?? "Admin123*";
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
        }
    }
}