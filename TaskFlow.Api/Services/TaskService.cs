using TaskFlow.Api.Models;
using TaskFlow.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Mappers;
using Dapper;
using Microsoft.Data.SqlClient;

namespace TaskFlow.Api.Services
{
    public class TaskService
    {
        private readonly TaskFlowDbContext _context;

        public TaskService(TaskFlowDbContext context)
        {
            _context = context;
        }

        public List<TaskDto> GetAllByUser(int userId)
        {
            return _context.Tasks
                .Where(t => t.UserId == userId)
                .Select(t => TaskMapper.ToDto(t))
                .ToList();
        }

        public TaskDto? GetByIdAndUser(int id, int userId)
        {
            var task = _context.Tasks
                .FirstOrDefault(t => t.Id == id && t.UserId == userId);
            return task == null ? null : TaskMapper.ToDto(task);
        }

        public TaskDto Create(TaskDto dto, int userId)
        {
            var task = TaskMapper.ToEntity(dto, userId);
            task.CreatedAt = DateTime.UtcNow;

            _context.Tasks.Add(task);
            _context.SaveChanges();

            dto.Id = task.Id;
            dto.CreatedAt = task.CreatedAt;
            dto.UserId = userId;
            return dto;
        }

        public bool Update(int id, TaskDto dto, int userId)
        {
            var task = _context.Tasks
                .FirstOrDefault(t => t.Id == id && t.UserId == userId);

            if (task == null) return false;

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.IsCompleted = dto.IsCompleted;
            task.DueDate = dto.DueDate;
            task.CategoryId = dto.CategoryId;

            _context.SaveChanges();
            return true;
        }

        public bool Delete(int id, int userId)
        {
            var task = _context.Tasks
                .FirstOrDefault(t => t.Id == id && t.UserId == userId);

            if (task == null) return false;

            _context.Tasks.Remove(task);
            _context.SaveChanges();
            return true;
        }

        // Legacy methods para compatibilidad con versiones anteriores
        [Obsolete("Use GetAllByUser instead")]
        public List<TaskDto> GetAll()
        {
            return _context.Tasks
                .Select(t => TaskMapper.ToDto(t))
                .ToList();
        }

        [Obsolete("Use GetByIdAndUser instead")]
        public TaskDto? GetById(int id)
        {
            var t = _context.Tasks.Find(id);
            return t == null ? null : TaskMapper.ToDto(t);
        }

        public List<TaskDto> GetAllWithStoredProcedure()
        {
            var connectionString = _context.Database.GetDbConnection().ConnectionString;
            using (var connection = new Microsoft.Data.SqlClient.SqlConnection(connectionString))
            {
                var tasks = connection.Query<TaskDto>(
                    "GetAllTasks",
                    commandType: System.Data.CommandType.StoredProcedure
                ).ToList();
                return tasks;
            }
        }
    }
}