using Microsoft.AspNetCore.Mvc;
using AgentPractice.Web.Models;

namespace AgentPractice.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<StatusSummary> Get()
    {
        return Ok(BuildSummary());
    }

    [HttpGet("summary")]
    public ActionResult<StatusSummary> Summary()
    {
        return Ok(BuildSummary());
    }

    private static StatusSummary BuildSummary()
    {
        return new StatusSummary
        {
            Status = "ok",
            Service = "AgentPractice.Web",
            TimestampUtc = DateTime.UtcNow
        };
    }
}
