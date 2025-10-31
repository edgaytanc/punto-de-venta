using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; 
using MiApi.Data;
using MiApi.Models;
using MiApi.Services; // Para TokenService
using System.Text; 
using MiApi.Middleware; 

var builder = WebApplication.CreateBuilder(args);

// --- SECCIÓN DE CONFIGURACIÓN DE SERVICIOS ---

// 1. Registrar el DbContext para la conexión con SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- CONFIGURACIÓN DE IDENTITY ---
builder.Services.AddIdentity<Usuario, Rol>(options => {
    // Opciones de configuración de contraseña (puedes personalizarlas)
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();
// --- FIN DE LA CONFIGURACIÓN DE IDENTITY --- 

// --- CONFIGURACIÓN DE AUTENTICACIÓN JWT --- 
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
        ValidateIssuer = true, // Valida quién emitió el token
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true, // Valida para quién es el token
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true, // Valida que el token no haya expirado
        ClockSkew = TimeSpan.Zero // Elimina el margen de tiempo por defecto al validar expiración
    };
});
// --- FIN CONFIGURACIÓN JWT --- 


// 2. Add services to the container.
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- AÑADIR EL SERVICIO DE TOKEN (si no lo tenías ya) ---
// Es necesario para que AuthController pueda inyectarlo
builder.Services.AddScoped<TokenService>();


var app = builder.Build();

// --- 👇 NUEVO: LÓGICA DE MIGRACIÓN Y SEEDING ---
// Se ejecuta al iniciar la app, ANTES de aceptar peticiones
try
{
    // Creamos un "scope" de servicios para poder inyectarlos aquí
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();
        
        logger.LogInformation("Iniciando la aplicación...");

        // Obtener el DbContext
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Aplicar migraciones pendientes (Crucial para Docker)
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

        // Ejecutar el DataSeeder
        logger.LogInformation("Ejecutando DataSeeder para roles y admin...");
        await DataSeeder.SeedRolesAndAdminUserAsync(services); // Llama a la clase del Paso 1
        logger.LogInformation("DataSeeder completado.");
    }
}
catch (Exception ex)
{
    // Si algo falla al migrar o sembrar, lo capturamos
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogCritical(ex, "Ocurrió un error durante la migración o el seeding de la base de datos.");
}
// --- 👆 FIN DE LA LÓGICA DE SEEDING ---


// --- SECCIÓN DE CONFIGURACIÓN DEL PIPELINE HTTP ---

// REGISTRAR EL MIDDLEWARE DE MANEJO DE ERRORES
// Debe ir muy al principio del pipeline
app.UseMiddleware<ErrorHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// AÑADIR MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
// ¡Importante! Deben ir ANTES de MapControllers
app.UseAuthentication(); // Verifica quién es el usuario (lee el token)
app.UseAuthorization();  // Verifica qué puede hacer el usuario (roles, políticas)

// Habilita el enrutamiento para los controladores
app.MapControllers();

app.Run();