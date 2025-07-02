using TaskFlow.Api.Models;
using TaskFlow.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace TaskFlow.Api.Services
{
    public class TaskService
    {
        private readonly TaskFlowDbContext _context;

        public TaskService(TaskFlowDbContext context)
        {
            _context = context;
        }

        public List<TaskDto> GetAll()
        {
            return _context.Tasks
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    IsCompleted = t.IsCompleted,
                    CreatedAt = t.CreatedAt
                })
                .ToList();
        }

        public TaskDto? GetById(int id)
        {
            var t = _context.Tasks.Find(id);
            if (t == null) return null;
            return new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt
            };
        }

        public TaskDto Create(TaskDto dto)
        {
            var task = new Task
            {
                Title = dto.Title,
                Description = dto.Description,
                IsCompleted = dto.IsCompleted,
                CreatedAt = dto.CreatedAt
            };
            _context.Tasks.Add(task);
            _context.SaveChanges();
            dto.Id = task.Id;
            return dto;
        }

        public bool Update(int id, TaskDto dto)
        {
            var task = _context.Tasks.Find(id);
            if (task == null) return false;
            task.Title = dto.Title;
            task.Description = dto.Description;
            task.IsCompleted = dto.IsCompleted;
            task.CreatedAt = dto.CreatedAt;
            _context.SaveChanges();
            return true;
        }

        public bool Delete(int id)
        {
            var task = _context.Tasks.Find(id);
            if (task == null) return false;
            _context.Tasks.Remove(task);
            _context.SaveChanges();
            return true;
        }
    }
}