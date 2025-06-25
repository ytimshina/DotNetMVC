using System;
using System.ComponentModel.DataAnnotations;

namespace AuthApp.Models
{
    public class CalculationHistory
    {
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        public ApplicationUser? User { get; set; }
        
        [Required]
        public DateTime CalculationDate { get; set; }
        
        [Required]
        public string InputData { get; set; } = string.Empty;
        
        [Required]
        public string ResultData { get; set; } = string.Empty;
        
        public string? Description { get; set; }
    }
}