using Microsoft.AspNetCore.Mvc;
using AgentPractice.Web.Models;

namespace AgentPractice.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BuildInfoController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public BuildInfoController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var buildInfo = new BuildInfoDto
        {
            AppName = "AgentPractice",
            Environment = _environment.EnvironmentName,
            UtcTimestamp = DateTime.UtcNow
        };

        return Ok(buildInfo);
    }
}
