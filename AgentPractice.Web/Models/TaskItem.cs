namespace AgentPractice.Web.Models;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Priority { get; set; } = "Medium";

    public DateOnly? DueDate { get; set; }

    public bool IsDone { get; set; }
}
