using AgentPractice.Web.Models;

namespace AgentPractice.Web.Services;

public interface ITaskItemService
{
    IEnumerable<TaskItem> GetTaskItems();

    TaskItem? GetTaskItemById(int id);

    TaskItem CreateTaskItem(string title);

    TaskItem? UpdateTaskItem(int id, string title, bool isDone);

    bool DeleteTaskItem(int id);

    TaskItem? CompleteTaskItem(int id);
}