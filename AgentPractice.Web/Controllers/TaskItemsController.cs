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
}
