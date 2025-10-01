using TaskFlow.Api.Models;
using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Mappers
{
    public static class LocationMapper
    {
        public static LocationDto ToDto(Location location)
        {
            return new LocationDto
            {
                Id = location.Id,
                Address = location.Address,
                Latitude = location.Latitude,
                Longitude = location.Longitude,
                PlaceName = location.PlaceName,
                PlaceId = location.PlaceId,
                CreatedAt = location.CreatedAt
            };
        }

        public static Location ToEntity(LocationDto dto)
        {
            return new Location
            {
                Id = dto.Id,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                PlaceName = dto.PlaceName,
                PlaceId = dto.PlaceId,
                CreatedAt = dto.CreatedAt
            };
        }

        public static Location CreateEntity(LocationDto dto)
        {
            return new Location
            {
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                PlaceName = dto.PlaceName,
                PlaceId = dto.PlaceId,
                CreatedAt = DateTime.UtcNow
            };
        }
    }
}