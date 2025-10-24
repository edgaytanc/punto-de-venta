using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting; // Para IHostEnvironment
using Microsoft.Extensions.Logging; // Para ILogger
using System;
using System.Net;
using System.Text.Json; // Para JsonSerializer
using System.Threading.Tasks;

namespace MiApi.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env; // Para saber si estamos en desarrollo

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Llama al siguiente middleware en el pipeline
                await _next(context);
            }
            catch (Exception ex)
            {
                // Si ocurre una excepción, la manejamos aquí
                _logger.LogError(ex, "Ocurrió una excepción no controlada.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // Código 500

            // Creamos un objeto de respuesta anónimo o una clase específica
            var response = new
            {
                StatusCode = context.Response.StatusCode,
                Message = "Ocurrió un error interno en el servidor. Intente más tarde.",
                // Incluir detalles solo en el entorno de desarrollo por seguridad
                Detailed = _env.IsDevelopment() ? exception.StackTrace?.ToString() : null
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var jsonResponse = JsonSerializer.Serialize(response, options);

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}