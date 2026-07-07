using AgentPractice.Web.Models;
using AgentPractice.Web.Services;
using Microsoft.AspNetCore.Mvc;

namespace AgentPractice.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskItemsController : ControllerBase
{
    private readonly ITaskItemService _taskItemService;

    public TaskItemsController(ITaskItemService taskItemService)
    {
        _taskItemService = taskItemService;
    }

    [HttpGet]
    public ActionResult<IEnumerable<TaskItem>> Get()
    {
        var items = _taskItemService.GetTaskItems();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public ActionResult<TaskItem> GetById(int id)
    {
        var item = _taskItemService.GetTaskItemById(id);

        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public ActionResult<TaskItem> Create(CreateTaskItemRequest request)
    {
        var taskItem = _taskItemService.CreateTaskItem(request.Title, request.Priority, request.DueDate);

        return StatusCode(StatusCodes.Status201Created, taskItem);
    }

    [HttpPut("{id:int}")]
    public ActionResult<TaskItem> Update(int id, UpdateTaskItemRequest request)
    {
        if (id <= 0)
        {
            return BadRequest();
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest();
        }

        var updatedItem = _taskItemService.UpdateTaskItem(id, request.Title, request.IsDone, request.Priority, request.DueDate);

        if (updatedItem is null)
        {
            return NotFound();
        }

        return Ok(updatedItem);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        if (id <= 0)
        {
            return BadRequest();
        }

        var deleted = _taskItemService.DeleteTaskItem(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPatch("{id:int}/complete")]
    public ActionResult<TaskItem> Complete(int id)
    {
        if (id <= 0)
        {
            return BadRequest();
        }

        var completedItem = _taskItemService.CompleteTaskItem(id);

        if (completedItem is null)
        {
            return NotFound();
        }

        return Ok(completedItem);
    }
}
