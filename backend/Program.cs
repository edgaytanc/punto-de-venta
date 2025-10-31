using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; 
using MiApi.Data;
using MiApi.Models;
using MiApi.Services; // Para TokenService
using System.Text; 
using MiApi.Middleware; 
// --- AÑADIR ESTOS DOS ---
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// --- SECCIÓN DE CONFIGURACIÓN DE SERVICIOS ---
// (Todo tu código de servicios va aquí... es el mismo que ya tienes)
// 1. Registrar el DbContext...
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- CONFIGURACIÓN DE IDENTITY ---
builder.Services.AddIdentity<Usuario, Rol>(options => {
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();
// ... (El resto de AddIdentity y AddAuthentication) ...

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        ValidateIssuer = true, 
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true, 
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero 
    };
});

builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<TokenService>();


var app = builder.Build();

// --- 👇 INICIO: LÓGICA DE MIGRACIÓN Y SEEDING CON REINTENTOS ---
// (REEMPLAZA TU BLOQUE TRY-CATCH CON ESTE)
async Task InitializeDatabaseAsync(IHost host)
{
    using (var scope = host.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();
        var context = services.GetRequiredService<ApplicationDbContext>();

        var maxRetries = 10;
        var retryDelay = TimeSpan.FromSeconds(5);
        var retries = 0;

        while (retries < maxRetries)
        {
            try
            {
                logger.LogInformation($"Intento {retries + 1}/{maxRetries} de conectar a la base de datos...");
                
                // 1. Aplicar migraciones pendientes
                if ((await context.Database.GetPendingMigrationsAsync()).Any())
                {
                    logger.LogInformation("Aplicando migraciones pendientes...");
                    await context.Database.MigrateAsync();
                    logger.LogInformation("Migraciones aplicadas correctamente.");
                }
                else
                {
                    logger.LogInformation("La base de datos ya está actualizada.");
                }

                // 2. Ejecutar el DataSeeder
                logger.LogInformation("Ejecutando DataSeeder para roles y admin...");
                await DataSeeder.SeedRolesAndAdminUserAsync(services);
                logger.LogInformation("DataSeeder completado.");

                // Si todo fue exitoso, salimos del bucle
                break; 
            }
            catch (SqlException ex)
            {
                retries++;
                logger.LogWarning(ex, $"No se pudo conectar a la base de datos (Intento {retries}). Reintentando en {retryDelay.TotalSeconds} segundos...");
                if (retries >= maxRetries)
                {
                    logger.LogCritical(ex, "No se pudo conectar a la base de datos después de varios intentos. La aplicación no puede iniciar.");
                    throw; // Lanza la excepción si se superan los reintentos
                }
                await Task.Delay(retryDelay); // Espera antes de reintentar
            }
            catch (Exception ex)
            {
                // Captura cualquier otro error durante el seeding (ej. validación)
                logger.LogCritical(ex, "Ocurrió un error crítico durante la migración o el seeding.");
                throw; // Lanza para que la app falle y no inicie en un estado corrupto
            }
        }
    }
}

// Ejecutamos la inicialización
try
{
    await InitializeDatabaseAsync(app);
}
catch (Exception ex)
{
    // Si la inicialización falla (después de reintentos), detenemos la app.
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogCritical(ex, "La inicialización de la base de datos falló. La aplicación se detendrá.");
    return; // Detiene el inicio de la aplicación
}
// --- 👆 FIN DE LA LÓGICA DE SEEDING ---


// --- SECCIÓN DE CONFIGURACIÓN DEL PIPELINE HTTP ---
// (Tu código sigue igual desde aquí)
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();  
app.MapControllers();
app.Run();
