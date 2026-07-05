using AgentPractice.Web.Models;

namespace AgentPractice.Web.Services;

public class TaskItemService : ITaskItemService
{
    private readonly List<TaskItem> _taskItems =
    [
        new() { Id = 1, Title = "Set up MVC project", IsDone = true },
        new() { Id = 2, Title = "Add health endpoint", IsDone = true },
        new() { Id = 3, Title = "Create first domain slice", IsDone = false }
    ];

    public IEnumerable<TaskItem> GetTaskItems()
    {
        return _taskItems;
    }

    public TaskItem? GetTaskItemById(int id)
    {
        return _taskItems.FirstOrDefault(taskItem => taskItem.Id == id);
    }

    public TaskItem CreateTaskItem(string title)
    {
        var nextId = _taskItems.Count == 0 ? 1 : _taskItems.Max(taskItem => taskItem.Id) + 1;

        var taskItem = new TaskItem
        {
            Id = nextId,
            Title = title,
            IsDone = false
        };

        _taskItems.Add(taskItem);

        return taskItem;
    }
}