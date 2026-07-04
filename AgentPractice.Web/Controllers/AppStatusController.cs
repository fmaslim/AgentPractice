using AgentPractice.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace AgentPractice.Web.Controllers;

[ApiController]
[Route("api/appstatus")]
public class AppStatusController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public AppStatusController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    public ActionResult<AppStatusDto> Get()
    {
        return Ok(new AppStatusDto
        {
            AppName = _environment.ApplicationName,
            Environment = _environment.EnvironmentName,
            UtcTimestamp = DateTime.UtcNow,
            Version = "TBD"
        });
    }
}
