using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Api.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(50, ErrorMessage = "Name can't be longer than 50 characters")]
        public required string Name { get; set; }

        [Required(ErrorMessage = "Color is required")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Color must be a valid hex color")]
        public required string Color { get; set; }

        [StringLength(200, ErrorMessage = "Description can't be longer than 200 characters")]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UserId { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(50, ErrorMessage = "Name can't be longer than 50 characters")]
        public required string Name { get; set; }

        [Required(ErrorMessage = "Color is required")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Color must be a valid hex color")]
        public required string Color { get; set; }

        [StringLength(200, ErrorMessage = "Description can't be longer than 200 characters")]
        public string? Description { get; set; }
    }

    public class UpdateCategoryDto
    {
        [StringLength(50, ErrorMessage = "Name can't be longer than 50 characters")]
        public string? Name { get; set; }

        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Color must be a valid hex color")]
        public string? Color { get; set; }

        [StringLength(200, ErrorMessage = "Description can't be longer than 200 characters")]
        public string? Description { get; set; }
    }
}
