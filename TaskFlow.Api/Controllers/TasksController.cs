using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.Services;
using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TasksController(TaskService taskService)
        {
            _taskService = taskService;
        }

        // GET: api/tasks
        [HttpGet]
        public IActionResult GetTasks()
        {
            var tasks = _taskService.GetAll();
            return Ok(tasks);
        }

        // GET: api/tasks/{id}
        [HttpGet("{id}")]
        public ActionResult<TaskDto> GetTask(int id)
        {
            var task = _taskService.GetById(id);
            if (task == null)
                return NotFound();
            // GET: api/tasks/sp
            [HttpGet("sp")]
            public IActionResult GetTasksWithStoredProcedure()
            {
                var tasks = _taskService.GetAllWithStoredProcedure();
                return Ok(tasks);
            }
            return Ok(task);
        }

        // POST: api/tasks
        [HttpPost]
        public ActionResult<TaskDto> CreateTask([FromBody] TaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = _taskService.Create(dto);
            return CreatedAtAction(nameof(GetTask), new { id = created.Id }, created);
        }

        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateTask(int id, [FromBody] TaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = _taskService.Update(id, dto);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteTask(int id)
        {
            var deleted = _taskService.Delete(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}