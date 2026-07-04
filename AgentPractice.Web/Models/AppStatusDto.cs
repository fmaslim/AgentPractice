namespace AgentPractice.Web.Models;

public class AppStatusDto
{
    public string AppName { get; set; } = string.Empty;

    public string Environment { get; set; } = string.Empty;

    public DateTime UtcTimestamp { get; set; }

    public string Version { get; set; } = string.Empty;
}
