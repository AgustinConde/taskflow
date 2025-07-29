using TaskFlow.Api.Models;
using TaskFlow.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Mappers;

namespace TaskFlow.Api.Services
{
    public class CategoryService
    {
        private readonly TaskFlowDbContext _context;

        public CategoryService(TaskFlowDbContext context)
        {
            _context = context;
        }

        public async Task<List<CategoryDto>> GetAllByUserAsync(int userId)
        {
            var categories = await _context.Categories
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return categories.Select(CategoryMapper.ToDto).ToList();
        }

        public async Task<CategoryDto?> GetByIdAndUserAsync(int id, int userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            return category == null ? null : CategoryMapper.ToDto(category);
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, int userId)
        {
            var category = CategoryMapper.ToEntity(dto, userId);

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CategoryMapper.ToDto(category);
        }

        public async Task<bool> UpdateAsync(int id, UpdateCategoryDto dto, int userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null) return false;

            CategoryMapper.UpdateEntity(category, dto);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null) return false;

            var hasAssociatedTasks = await _context.Tasks
                .AnyAsync(t => t.CategoryId == id);

            if (hasAssociatedTasks)
            {
                var tasksToUpdate = await _context.Tasks
                    .Where(t => t.CategoryId == id)
                    .ToListAsync();

                foreach (var task in tasksToUpdate)
                {
                    task.CategoryId = null;
                }
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ExistsAsync(int id, int userId)
        {
            return await _context.Categories
                .AnyAsync(c => c.Id == id && c.UserId == userId);
        }

        public async Task<bool> NameExistsAsync(string name, int userId, int? excludeId = null)
        {
            var query = _context.Categories
                .Where(c => c.UserId == userId && c.Name.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
