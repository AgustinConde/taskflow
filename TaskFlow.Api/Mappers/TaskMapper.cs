using TaskFlow.Api.Models;
using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Mappers
{
    public static class TaskMapper
    {
        public static TaskDto ToDto(TaskFlow.Api.Models.Task task)
        {
            return new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                IsCompleted = task.IsCompleted,
                CreatedAt = task.CreatedAt
            };
        }

        public static TaskFlow.Api.Models.Task ToEntity(TaskDto dto)
        {
            return new TaskFlow.Api.Models.Task
            {
                Id = dto.Id,
                Title = dto.Title,
                Description = dto.Description,
                IsCompleted = dto.IsCompleted,
                CreatedAt = dto.CreatedAt
            };
        }
    }
}

