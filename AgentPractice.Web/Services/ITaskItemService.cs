using AgentPractice.Web.Models;

namespace AgentPractice.Web.Services;

public interface ITaskItemService
{
    IEnumerable<TaskItem> GetTaskItems();
}