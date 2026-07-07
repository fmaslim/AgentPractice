using AgentPractice.Web.Models;

namespace AgentPractice.Web.Services;

public interface ITaskItemService
{
    IEnumerable<TaskItem> GetTaskItems();

    TaskItem? GetTaskItemById(int id);

    TaskItem CreateTaskItem(string title, string? priority, DateOnly? dueDate);

    TaskItem? UpdateTaskItem(int id, string title, bool isDone, string? priority, DateOnly? dueDate);

    bool DeleteTaskItem(int id);

    TaskItem? CompleteTaskItem(int id);
}