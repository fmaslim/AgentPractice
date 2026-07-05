using Microsoft.AspNetCore.Mvc;

namespace AgentPractice.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServerTimeController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            UtcTimestamp = DateTime.UtcNow
        });
    }
}