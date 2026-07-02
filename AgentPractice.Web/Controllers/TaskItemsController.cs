using AgentPractice.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace AgentPractice.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskItemsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<TaskItem>> Get()
    {
        var items = new List<TaskItem>
        {
            new() { Id = 1, Title = "Set up MVC project", IsDone = true },
            new() { Id = 2, Title = "Add health endpoint", IsDone = true },
            new() { Id = 3, Title = "Create first domain slice", IsDone = false }
        };

        return Ok(items);
    }
}
