using AgentPractice.Web.Models;

namespace AgentPractice.Web.Services;

public class TaskItemService : ITaskItemService
{
    public IEnumerable<TaskItem> GetTaskItems()
    {
        return new List<TaskItem>
        {
            new() { Id = 1, Title = "Set up MVC project", IsDone = true },
            new() { Id = 2, Title = "Add health endpoint", IsDone = true },
            new() { Id = 3, Title = "Create first domain slice", IsDone = false }
        };
    }
}