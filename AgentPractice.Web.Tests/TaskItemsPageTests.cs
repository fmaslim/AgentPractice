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
    public async Task GetTaskItemsPage_ReturnsOk_AndReadOnlyHeader()
    {
        var response = await _client.GetAsync("/Home/TaskItems");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var html = await response.Content.ReadAsStringAsync();

        Assert.Contains("Task Items", html);
        Assert.Contains("Read-Only", html);
        Assert.Contains("/api/TaskItems", html);
    }

    [Fact]
    public async Task GetTaskItemsPage_ContainsLoadingEmptyAndErrorStates()
    {
        var response = await _client.GetAsync("/Home/TaskItems");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var html = await response.Content.ReadAsStringAsync();

        Assert.Contains("id=\"task-items-loading\"", html);
        Assert.Contains("Loading task items", html);
        Assert.Contains("id=\"task-items-empty\"", html);
        Assert.Contains("No task items found.", html);
        Assert.Contains("id=\"task-items-error\"", html);
        Assert.Contains("/js/task-items.js", html);
    }

    [Fact]
    public async Task GetTaskItemsPage_DoesNotContainEditDeleteOrCompleteControls()
    {
        var response = await _client.GetAsync("/Home/TaskItems");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var html = await response.Content.ReadAsStringAsync();

        Assert.DoesNotContain(">Edit<", html);
        Assert.DoesNotContain(">Delete<", html);
        Assert.DoesNotContain(">Complete<", html);
        Assert.DoesNotContain("btn-outline-primary", html);
        Assert.DoesNotContain("btn-outline-danger", html);
    }

    [Fact]
    public async Task GetTaskItemsScript_UsesApiGetAndMapsIsDoneToBadges()
    {
        var response = await _client.GetAsync("/js/task-items.js");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var script = await response.Content.ReadAsStringAsync();

        Assert.Contains("fetch(\"/api/TaskItems\"", script);
        Assert.Contains("method: \"GET\"", script);
        Assert.Contains("buildStatusBadge(Boolean(item.isDone))", script);
        Assert.Contains("isDone ? \"Done\" : \"Open\"", script);
        Assert.Contains("isDone ? \"badge text-bg-success\" : \"badge text-bg-secondary\"", script);
    }
}
