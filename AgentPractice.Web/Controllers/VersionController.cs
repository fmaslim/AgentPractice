using System.Reflection;
using AgentPractice.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace AgentPractice.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VersionController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public VersionController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public ActionResult<VersionDto> Get()
    {
        var assembly = typeof(Program).Assembly;
        var informationalVersion = assembly
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
            .InformationalVersion;
        var assemblyVersion = assembly.GetName().Version?.ToString();
        var normalizedVersion = !string.IsNullOrWhiteSpace(informationalVersion)
            ? informationalVersion.Split('+')[0]
            : assemblyVersion;
        var resolvedVersion = normalizedVersion ?? "unknown";

        return Ok(new VersionDto
        {
            Service = _environment.ApplicationName,
            Version = resolvedVersion,
            InformationalVersion = informationalVersion ?? resolvedVersion,
            Environment = _environment.EnvironmentName,
            UtcTimestamp = DateTime.UtcNow
        });
    }
}