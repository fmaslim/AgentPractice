namespace AgentPractice.Web.Models;

public class StatusSummary
{
    public string Status { get; set; } = string.Empty;

    public string Service { get; set; } = string.Empty;

    public DateTime TimestampUtc { get; set; }
}
