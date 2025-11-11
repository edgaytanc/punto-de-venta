using Microsoft.AspNetCore.Identity;

namespace MiApi.Models
{
    
    public class Rol : IdentityRole<int>
    {
      
        public string DescripcionRol { get; set; }
    }
}