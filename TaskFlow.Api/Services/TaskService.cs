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

        public List<TaskDto> GetAll()
        {
            return _context.Tasks
                .Select(t => TaskMapper.ToDto(t))
                .ToList();
        }

        public TaskDto? GetById(int id)
        {
            var t = _context.Tasks.Find(id);
            return t == null ? null : TaskMapper.ToDto(t);
        }

        public TaskDto Create(TaskDto dto)
        {
            var task = TaskMapper.ToEntity(dto);
            task.CreatedAt = DateTime.UtcNow;

            _context.Tasks.Add(task);
            _context.SaveChanges();
            dto.Id = task.Id;
            dto.CreatedAt = task.CreatedAt;
            return dto;
        }

        public bool Update(int id, TaskDto dto)
        {
            var task = _context.Tasks.Find(id);
            if (task == null) return false;
            task.Title = dto.Title;
            task.Description = dto.Description;
            task.IsCompleted = dto.IsCompleted;
            task.DueDate = dto.DueDate;
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