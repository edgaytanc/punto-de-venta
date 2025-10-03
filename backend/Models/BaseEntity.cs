using System.ComponentModel.DataAnnotations;

namespace MiApi.Models
{
    // Clase base para entidades con campos de auditoría
    public abstract class BaseEntity
    {
        [Key]
        public int Id { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaModificacion { get; set; }
    }
}