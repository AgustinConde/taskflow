using TaskFlow.Api.Models;
using TaskFlow.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Mappers;
using Dapper;
using Microsoft.Data.SqlClient;

namespace TaskFlow.Api.Services
{
    public class TaskService(TaskFlowDbContext context)
    {
        private readonly TaskFlowDbContext _context = context;

        public List<TaskDto> GetAllByUser(int userId)
        {
            return _context.Tasks
                .Include(t => t.Location)
                .Where(t => t.UserId == userId)
                .Select(t => TaskMapper.ToDto(t))
                .ToList();
        }

        public PaginatedResultDto<TaskDto> GetAllByUserPaginated(int userId, int pageNumber = 1, int pageSize = 20)
        {
            var query = _context.Tasks
                .Include(t => t.Location)
                .Where(t => t.UserId == userId);

            var totalCount = query.Count();

            var tasks = query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(t => TaskMapper.ToDto(t))
                .ToList();

            return new PaginatedResultDto<TaskDto>
            {
                Items = tasks,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public TaskDto? GetByIdAndUser(int id, int userId)
        {
            var task = _context.Tasks
                .Include(t => t.Location)
                .FirstOrDefault(t => t.Id == id && t.UserId == userId);
            return task == null ? null : TaskMapper.ToDto(task);
        }

        public TaskDto Create(TaskDto dto, int userId)
        {
            var task = TaskMapper.ToEntity(dto, userId);
            task.CreatedAt = DateTime.UtcNow;

            if (dto.Location != null)
            {
                var location = new Location
                {
                    Address = dto.Location.Address,
                    Latitude = dto.Location.Latitude,
                    Longitude = dto.Location.Longitude,
                    PlaceName = dto.Location.PlaceName,
                    PlaceId = dto.Location.PlaceId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Locations.Add(location);
                _context.SaveChanges();

                task.LocationId = location.Id;
                task.Location = location;
            }

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
                .Include(t => t.Location)
                .FirstOrDefault(t => t.Id == id && t.UserId == userId);

            if (task == null) return false;

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.IsCompleted = dto.IsCompleted;
            task.DueDate = dto.DueDate;
            task.CategoryId = dto.CategoryId;

            if (dto.Location != null)
            {
                if (task.Location != null)
                {
                    task.Location.Address = dto.Location.Address;
                    task.Location.Latitude = dto.Location.Latitude;
                    task.Location.Longitude = dto.Location.Longitude;
                    task.Location.PlaceName = dto.Location.PlaceName;
                    task.Location.PlaceId = dto.Location.PlaceId;
                }
                else
                {
                    var location = new Location
                    {
                        Address = dto.Location.Address,
                        Latitude = dto.Location.Latitude,
                        Longitude = dto.Location.Longitude,
                        PlaceName = dto.Location.PlaceName,
                        PlaceId = dto.Location.PlaceId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Locations.Add(location);
                    _context.SaveChanges();

                    task.LocationId = location.Id;
                    task.Location = location;
                }
            }
            else if (task.Location != null)
            {
                var locationToRemove = task.Location;
                task.LocationId = null;
                task.Location = null;
                _context.Locations.Remove(locationToRemove);
            }

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

        // Legacy methods for compatibility
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
            using var connection = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
            var tasks = connection.Query<TaskDto>(
                "GetAllTasks",
                commandType: System.Data.CommandType.StoredProcedure
            ).ToList();
            return tasks;
        }
    }
}