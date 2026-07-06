using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AgentPractice.Web.Tests;

public class TaskItemsPageTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public TaskItemsPageTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(_ => { }).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task GetTaskItemsPage_ReturnsOk_AndCreateViewHeader()
    {
        var response = await _client.GetAsync("/Home/TaskItems");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var html = await response.Content.ReadAsStringAsync();

        Assert.Contains("Task Items", html);
        Assert.Contains("Create + View", html);
        Assert.Contains("/api/TaskItems", html);
    }

    [Fact]
    public async Task GetTaskItemsPage_ContainsCreateLoadingEmptyAndErrorStates()
    {
        var response = await _client.GetAsync("/Home/TaskItems");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var html = await response.Content.ReadAsStringAsync();

        Assert.Contains("id=\"task-item-create-form\"", html);
        Assert.Contains("id=\"task-item-title\"", html);
        Assert.Contains("id=\"task-item-add-button\"", html);
        Assert.Contains("id=\"task-item-create-success\"", html);
        Assert.Contains("id=\"task-item-create-error\"", html);
        Assert.Contains("id=\"task-items-loading\"", html);
        Assert.Contains("Loading task items", html);
        Assert.Contains("id=\"task-items-empty\"", html);
        Assert.Contains("No task items found.", html);
        Assert.Contains("id=\"task-items-error\"", html);
        Assert.Contains("/js/task-items.js", html);
    }

    [Fact]
    public async Task GetTaskItemsPage_DoesNotContainOutOfScopeControls()
    {
        var response = await _client.GetAsync("/Home/TaskItems");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var html = await response.Content.ReadAsStringAsync();

        Assert.DoesNotContain(">Delete<", html);
        Assert.DoesNotContain("btn-outline-danger", html);
        Assert.DoesNotContain("Filter", html);
        Assert.DoesNotContain("Sort", html);
        Assert.DoesNotContain("Pagination", html);
    }

    [Fact]
    public async Task GetTaskItemsScript_UsesApiGetPostPutPatchValidationAndCompleteFlow()
    {
        var response = await _client.GetAsync("/js/task-items.js");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var script = await response.Content.ReadAsStringAsync();

        Assert.Contains("createFormEl.addEventListener(\"submit\"", script);
        Assert.Contains("let isSubmittingCreate = false;", script);
        Assert.Contains("if (isSubmittingCreate)", script);
        Assert.Contains("if (!title)", script);
        Assert.Contains("Title is required.", script);
        Assert.Contains("fetch(\"/api/TaskItems\"", script);
        Assert.Contains("method: \"POST\"", script);
        Assert.Contains("JSON.stringify({ title: title })", script);
        Assert.Contains("isSubmittingCreate = true;", script);
        Assert.Contains("isSubmittingCreate = false;", script);
        Assert.Contains("addButtonEl.disabled = isSubmitting", script);
        Assert.Contains("await loadTaskItems();", script);
        Assert.Contains("titleInputEl.value = \"\";", script);
        Assert.Contains("createSuccessEl.textContent = \"Task item created.\";", script);
        Assert.Contains("fetch(\"/api/TaskItems\"", script);
        Assert.Contains("method: \"GET\"", script);
        Assert.Contains("buildStatusBadge(Boolean(item.isDone))", script);
        Assert.Contains("isDone ? \"Done\" : \"Open\"", script);
        Assert.Contains("isDone ? \"badge text-bg-success\" : \"badge text-bg-secondary\"", script);
        Assert.Contains("let editingTaskItemId = null;", script);
        Assert.Contains("button.textContent = \"Edit\"", script);
        Assert.Contains("button.textContent = \"Save\"", script);
        Assert.Contains("button.textContent = \"Cancel\"", script);
        Assert.Contains("fetch(`/api/TaskItems/${itemId}`", script);
        Assert.Contains("method: \"PUT\"", script);
        Assert.Contains("JSON.stringify({ title: title, isDone: isDone })", script);
        Assert.Contains("await updateTaskItem(item.id, nextTitle, Boolean(item.isDone));", script);
        Assert.Contains("editingTaskItemId = item.id;", script);
        Assert.Contains("editingTaskItemId = null;", script);
        Assert.Contains("errorEl.textContent = \"Unable to save task item.\";", script);
        Assert.Contains("if (!item.isDone)", script);
        Assert.Contains("button.textContent = \"Mark Complete\"", script);
        Assert.Contains("fetch(`/api/TaskItems/${itemId}/complete`", script);
        Assert.Contains("method: \"PATCH\"", script);
        Assert.Contains("completeButton.disabled = true;", script);
        Assert.Contains("completeButton.textContent = \"Completing...\";", script);
        Assert.Contains("await completeTaskItem(item.id);", script);
        Assert.Contains("completeButton.disabled = false;", script);
        Assert.Contains("errorEl.textContent = \"Unable to complete task item.\";", script);
        Assert.Contains("errorEl.textContent = \"Task completed, but the list could not be refreshed. Please reload.\";", script);
    }
}
