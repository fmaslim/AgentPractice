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
        Assert.Contains("id=\"task-items-filter\"", html);
        Assert.Contains("id=\"task-items-filter-all\"", html);
        Assert.Contains("id=\"task-items-filter-open\"", html);
        Assert.Contains("id=\"task-items-filter-done\"", html);
        Assert.Contains("id=\"task-items-search\"", html);
        Assert.Contains("id=\"task-items-clear-search\"", html);
        Assert.Contains("Clear Search", html);
        Assert.Contains("id=\"task-items-clear-completed\"", html);
        Assert.Contains("Clear completed", html);
        Assert.Contains("Search by title", html);
        Assert.Contains(">All<", html);
        Assert.Contains(">Open<", html);
        Assert.Contains(">Done<", html);
        Assert.Contains("id=\"task-items-loading\"", html);
        Assert.Contains("Loading task items", html);
        Assert.Contains("id=\"task-items-count\"", html);
        Assert.Contains("id=\"task-items-empty\"", html);
        Assert.Contains("No task items found.", html);
        Assert.Contains("id=\"task-items-error\"", html);
        Assert.Contains("/js/task-items.js", html);
    }

    [Fact]
    public async Task GetTaskItemsPage_ContainsOnlyPlannedListControls()
    {
        var response = await _client.GetAsync("/Home/TaskItems");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var html = await response.Content.ReadAsStringAsync();

        Assert.Contains("Filter task items", html);
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
        Assert.Contains("const countEl = document.getElementById(\"task-items-count\");", script);
        Assert.Contains("const label = count === 1 ? \"task\" : \"tasks\";", script);
        Assert.Contains("countEl.textContent = `Showing ${count} ${label}`;", script);
        Assert.Contains("let selectedFilter = \"all\";", script);
        Assert.Contains("let searchTerm = \"\";", script);
        Assert.Contains("let taskItems = [];", script);
        Assert.Contains("const filterButtonEls = Array.from(document.querySelectorAll(\"[data-task-filter]\"));", script);
        Assert.Contains("const searchInputEl = document.getElementById(\"task-items-search\");", script);
        Assert.Contains("const clearSearchButtonEl = document.getElementById(\"task-items-clear-search\");", script);
        Assert.Contains("const clearCompletedButtonEl = document.getElementById(\"task-items-clear-completed\");", script);
        Assert.Contains("window.confirm(\"Clear all completed tasks?\")", script);
        Assert.Contains("await deleteTaskItem(item.id);", script);
        Assert.Contains("clearCompletedButtonEl.addEventListener(\"click\", clearCompletedTaskItems);", script);
        Assert.Contains("setVisible(clearSearchButtonEl, hasSearchText);", script);
        Assert.Contains("clearSearchButtonEl.addEventListener(\"click\", clearSearch);", script);
        Assert.Contains("const statusFilteredItems = items.filter(item =>", script);
        Assert.Contains("String(item.title ?? \"\").toLowerCase().includes(normalizedSearchTerm)", script);
        Assert.Contains("searchInputEl.addEventListener(\"input\", handleSearchInput);", script);
        Assert.Contains("selectedFilter = nextFilter;", script);
        Assert.Contains("renderTaskItems();", script);
        Assert.Contains("buildStatusBadge(Boolean(item.isDone))", script);
        Assert.Contains("isDone ? \"Done\" : \"Open\"", script);
        Assert.Contains("isDone ? \"badge text-bg-success\" : \"badge text-bg-secondary\"", script);
        Assert.Contains("let editingTaskItemId = null;", script);
        Assert.Contains("button.textContent = \"Edit\"", script);
        Assert.Contains("button.textContent = \"Save\"", script);
        Assert.Contains("button.textContent = \"Cancel\"", script);
        Assert.Contains("button.textContent = \"Delete\"", script);
        Assert.Contains("fetch(`/api/TaskItems/${itemId}`", script);
        Assert.Contains("method: \"PUT\"", script);
        Assert.Contains("JSON.stringify({ title: title, isDone: isDone })", script);
        Assert.Contains("await updateTaskItem(item.id, nextTitle, Boolean(item.isDone));", script);
        Assert.Contains("const shouldDelete = window.confirm(\"Delete this task item?\");", script);
        Assert.Contains("if (!shouldDelete)", script);
        Assert.Contains("method: \"DELETE\"", script);
        Assert.Contains("await deleteTaskItem(item.id);", script);
        Assert.Contains("deleteButton.textContent = \"Deleting...\";", script);
        Assert.Contains("errorEl.textContent = \"Unable to delete task item.\";", script);
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
