using TaskFlow.Api.Models;
using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Mappers
{
    public static class CategoryMapper
    {
        public static CategoryDto ToDto(Category category)
        {
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Color = category.Color,
                Description = category.Description,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                UserId = category.UserId
            };
        }

        public static Category ToEntity(CreateCategoryDto dto, int userId)
        {
            return new Category
            {
                Name = dto.Name,
                Color = dto.Color,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = userId
            };
        }

        public static void UpdateEntity(Category category, UpdateCategoryDto dto)
        {
            if (!string.IsNullOrEmpty(dto.Name))
                category.Name = dto.Name;

            if (!string.IsNullOrEmpty(dto.Color))
                category.Color = dto.Color;

            if (dto.Description != null)
                category.Description = dto.Description;

            category.UpdatedAt = DateTime.UtcNow;
        }
    }
}
