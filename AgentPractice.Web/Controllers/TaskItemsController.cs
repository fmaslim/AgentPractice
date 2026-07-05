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
        var taskItem = _taskItemService.CreateTaskItem(request.Title);

        return StatusCode(StatusCodes.Status201Created, taskItem);
    }
}
