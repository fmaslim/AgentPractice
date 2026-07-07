namespace AgentPractice.Web.Models;

public class UpdateTaskItemRequest
{
    public string? Title { get; set; }

    public bool IsDone { get; set; }

    public string? Priority { get; set; }

    public DateOnly? DueDate { get; set; }
}
