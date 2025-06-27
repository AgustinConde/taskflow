using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api;
using TaskFlow.Api.Models;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskFlowDbContext _context;

        public TasksController(TaskFlowDbContext context)
        {
            _context = context;
        }

        // GET: api/tasks
        [HttpGet]
        public IActionResult GetTasks()
        {
            var tasks = _context.Tasks.ToList();
            return Ok(tasks);
        }

        // GET: api/tasks/5
        [HttpGet("{id}")]
        public IActionResult GetTask(int id)
        {
            var task = _context.Tasks.Find(id);
            if (task == null)
                return NotFound();
            return Ok(task);
        }

        // POST: api/tasks
        [HttpPost]
        public IActionResult CreateTask([FromBody] TaskFlow.Api.Models.Task task)
        {
            _context.Tasks.Add(task);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        // PUT: api/tasks/5
        [HttpPut("{id}")]
        public IActionResult UpdateTask(int id, [FromBody] TaskFlow.Api.Models.Task updatedTask)
        {
            var task = _context.Tasks.Find(id);
            if (task == null)
                return NotFound();

            task.Title = updatedTask.Title;
            task.Description = updatedTask.Description;
            task.IsCompleted = updatedTask.IsCompleted;
            task.CreatedAt = updatedTask.CreatedAt;

            _context.SaveChanges();
            return NoContent();
        }

        // DELETE: api/tasks/5
        [HttpDelete("{id}")]
        public IActionResult DeleteTask(int id)
        {
            var task = _context.Tasks.Find(id);
            if (task == null)
                return NotFound();

            _context.Tasks.Remove(task);
            _context.SaveChanges();
            return NoContent();
        }
    }
}