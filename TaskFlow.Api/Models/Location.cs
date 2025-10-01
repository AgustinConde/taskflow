namespace TaskFlow.Api.Models
{
    public class Location
    {
        public int Id { get; set; }
        public required string Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? PlaceName { get; set; }
        public string? PlaceId { get; set; }
        public DateTime CreatedAt { get; set; }

        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}