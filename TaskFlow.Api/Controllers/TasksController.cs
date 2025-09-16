using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.Services;
using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController(TaskService _taskService, JwtService _jwtService) : ControllerBase
    {

        // GET: api/tasks
        [HttpGet]
        public IActionResult GetTasks()
        {
            try
            {
                var userId = _jwtService.GetUserIdFromToken(User);
                if (userId == null) return Unauthorized();

                var tasks = _taskService.GetAllByUser(userId.Value);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetTasks: {ex.Message}");
                return StatusCode(500, new { message = "task.get.error" });
            }
        }

        // GET: api/tasks/{id}
        [HttpGet("{id}")]
        public ActionResult<TaskDto> GetTask(int id)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();

            var task = _taskService.GetByIdAndUser(id, userId.Value);
            if (task == null)
                return NotFound();
            return Ok(task);
        }

        // GET: api/tasks/sp - Legacy endpoint
        [HttpGet("sp")]
        public IActionResult GetTasksWithStoredProcedure()
        {
            var tasks = _taskService.GetAllWithStoredProcedure();
            return Ok(tasks);
        }

        // POST: api/tasks
        [HttpPost]
        public ActionResult<TaskDto> CreateTask([FromBody] TaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();

            var created = _taskService.Create(dto, userId.Value);
            return CreatedAtAction(nameof(GetTask), new { id = created.Id }, created);
        }

        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateTask(int id, [FromBody] TaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();

            var updated = _taskService.Update(id, dto, userId.Value);
            if (!updated)
                return NotFound();
            return Ok(new { success = true });
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteTask(int id)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();

            var deleted = _taskService.Delete(id, userId.Value);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}