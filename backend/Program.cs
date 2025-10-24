
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // Añadido
using MiApi.Data;
using MiApi.Models;
using MiApi.Services; // Añadido para TokenService
using System.Text; // Añadido
using MiApi.Middleware; // <-- AÑADE ESTE USING

var builder = WebApplication.CreateBuilder(args);

// --- SECCIÓN DE CONFIGURACIÓN DE SERVICIOS ---

// 1. Registrar el DbContext para la conexión con SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// 👇 --- NUEVA CONFIGURACIÓN DE IDENTITY --- 👇
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
// 👆 --- FIN DE LA CONFIGURACIÓN DE IDENTITY --- 👆

// 👇 --- NUEVA CONFIGURACIÓN DE AUTENTICACIÓN JWT --- 👇
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
// 👆 --- FIN CONFIGURACIÓN JWT --- 👆


// 2. Add services to the container.
builder.Services.AddControllers(); // Habilita el uso de controladores
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- SECCIÓN DE CONFIGURACIÓN DEL PIPELINE HTTP ---

// 👇 --- REGISTRAR EL MIDDLEWARE DE MANEJO DE ERRORES --- 👇
// Debe ir muy al principio del pipeline
app.UseMiddleware<ErrorHandlingMiddleware>();
// 👆 --- FIN REGISTRO MIDDLEWARE --- 👆

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 👇 --- AÑADIR MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN --- 👇
// ¡Importante! Deben ir ANTES de MapControllers
app.UseAuthentication(); // Verifica quién es el usuario (lee el token)
app.UseAuthorization();  // Verifica qué puede hacer el usuario (roles, políticas)
// 👆 --- FIN MIDDLEWARE --- 👆

// Habilita el enrutamiento para los controladores
app.MapControllers();

app.Run();