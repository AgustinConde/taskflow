using System.ComponentModel.DataAnnotations;

namespace TaskFlow.Api.DTOs
{
    public class LocationDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Address is required")]
        [StringLength(500, ErrorMessage = "Address can't be longer than 500 characters")]
        public required string Address { get; set; }

        [Required(ErrorMessage = "Latitude is required")]
        [Range(-90.0, 90.0, ErrorMessage = "Latitude must be between -90 and 90")]
        public double Latitude { get; set; }

        [Required(ErrorMessage = "Longitude is required")]
        [Range(-180.0, 180.0, ErrorMessage = "Longitude must be between -180 and 180")]
        public double Longitude { get; set; }

        [StringLength(200, ErrorMessage = "Place name can't be longer than 200 characters")]
        public string? PlaceName { get; set; }

        [StringLength(500, ErrorMessage = "Place ID can't be longer than 500 characters")]
        public string? PlaceId { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}