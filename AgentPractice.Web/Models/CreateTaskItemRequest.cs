using System.ComponentModel.DataAnnotations;

namespace AgentPractice.Web.Models;

public class CreateTaskItemRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Priority { get; set; }

    public DateOnly? DueDate { get; set; }
}