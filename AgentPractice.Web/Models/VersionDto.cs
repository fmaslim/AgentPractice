namespace AgentPractice.Web.Models;

public class VersionDto
{
    public string Service { get; set; } = string.Empty;

    public string Version { get; set; } = string.Empty;

    public string InformationalVersion { get; set; } = string.Empty;

    public string Environment { get; set; } = string.Empty;

    public DateTime UtcTimestamp { get; set; }
}