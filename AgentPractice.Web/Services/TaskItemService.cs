using AgentPractice.Web.Models;

namespace AgentPractice.Web.Services;

public class TaskItemService : ITaskItemService
{
    private const string PriorityLow = "Low";
    private const string PriorityMedium = "Medium";
    private const string PriorityHigh = "High";

    private readonly List<TaskItem> _taskItems =
    [
        new() { Id = 1, Title = "Set up MVC project", Priority = PriorityMedium, IsDone = true },
        new() { Id = 2, Title = "Add health endpoint", Priority = PriorityMedium, IsDone = true },
        new() { Id = 3, Title = "Create first domain slice", Priority = PriorityMedium, IsDone = false }
    ];

    public IEnumerable<TaskItem> GetTaskItems()
    {
        return _taskItems;
    }

    public TaskItem? GetTaskItemById(int id)
    {
        return _taskItems.FirstOrDefault(taskItem => taskItem.Id == id);
    }

    public TaskItem CreateTaskItem(string title, string? priority)
    {
        var nextId = _taskItems.Count == 0 ? 1 : _taskItems.Max(taskItem => taskItem.Id) + 1;

        var taskItem = new TaskItem
        {
            Id = nextId,
            Title = title,
            Priority = NormalizePriority(priority),
            IsDone = false
        };

        _taskItems.Add(taskItem);

        return taskItem;
    }

    public TaskItem? UpdateTaskItem(int id, string title, bool isDone, string? priority)
    {
        var existingItem = _taskItems.FirstOrDefault(taskItem => taskItem.Id == id);

        if (existingItem is null)
        {
            return null;
        }

        existingItem.Title = title;
        existingItem.Priority = priority is null
            ? NormalizePriority(existingItem.Priority)
            : NormalizePriority(priority);
        existingItem.IsDone = isDone;

        return existingItem;
    }

    public bool DeleteTaskItem(int id)
    {
        var existingItem = _taskItems.FirstOrDefault(taskItem => taskItem.Id == id);

        if (existingItem is null)
        {
            return false;
        }

        _taskItems.Remove(existingItem);

        return true;
    }

    public TaskItem? CompleteTaskItem(int id)
    {
        var existingItem = _taskItems.FirstOrDefault(taskItem => taskItem.Id == id);

        if (existingItem is null)
        {
            return null;
        }

        existingItem.IsDone = true;

        return existingItem;
    }

    private static string NormalizePriority(string? priority)
    {
        if (string.IsNullOrWhiteSpace(priority))
        {
            return PriorityMedium;
        }

        return priority.Trim().ToLowerInvariant() switch
        {
            "low" => PriorityLow,
            "medium" => PriorityMedium,
            "high" => PriorityHigh,
            _ => PriorityMedium
        };
    }
}