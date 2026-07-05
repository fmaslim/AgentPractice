using AgentPractice.Web.Models;

namespace AgentPractice.Web.Services;

public interface ITaskItemService
{
    IEnumerable<TaskItem> GetTaskItems();

    TaskItem? GetTaskItemById(int id);

    TaskItem CreateTaskItem(string title);
}