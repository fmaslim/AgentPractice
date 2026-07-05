namespace AgentPractice.Web.Models;

public class BuildInfoDto
{
    public string AppName { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public DateTime UtcTimestamp { get; set; }
}
