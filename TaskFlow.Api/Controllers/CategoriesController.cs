using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.Services;
using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _categoryService;
        private readonly JwtService _jwtService;

        public CategoriesController(CategoryService categoryService, JwtService jwtService)
        {
            _categoryService = categoryService;
            _jwtService = jwtService;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var userId = _jwtService.GetUserIdFromToken(User);
                if (userId == null) return Unauthorized();

                var categories = await _categoryService.GetAllByUserAsync(userId.Value);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCategories: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving categories" });
            }
        }

        // GET: api/categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();

            var category = await _categoryService.GetByIdAndUserAsync(id, userId.Value);
            if (category == null)
                return NotFound();

            return Ok(category);
        }        // POST: api/categories
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();


            var nameExists = await _categoryService.NameExistsAsync(dto.Name, userId.Value);
            if (nameExists)
            {
                return BadRequest(new { message = "A category with this name already exists" });
            }

            var created = await _categoryService.CreateAsync(dto, userId.Value);
            return CreatedAtAction(nameof(GetCategory), new { id = created.Id }, created);
        }

        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();

            var exists = await _categoryService.ExistsAsync(id, userId.Value);
            if (!exists)
                return NotFound();

            if (!string.IsNullOrEmpty(dto.Name))
            {
                var nameExists = await _categoryService.NameExistsAsync(dto.Name, userId.Value, id);
                if (nameExists)
                {
                    return BadRequest(new { message = "A category with this name already exists" });
                }
            }

            var updated = await _categoryService.UpdateAsync(id, dto, userId.Value);
            if (!updated)
                return NotFound();

            return NoContent();
        }

        // DELETE: api/categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var userId = _jwtService.GetUserIdFromToken(User);
            if (userId == null) return Unauthorized();

            var deleted = await _categoryService.DeleteAsync(id, userId.Value);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
