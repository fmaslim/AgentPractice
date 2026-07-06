using System.Net;
using System.Net.Http.Json;
using AgentPractice.Web.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AgentPractice.Web.Tests;

public class TaskItemsEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public TaskItemsEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(_ => { }).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task GetTaskItems_ReturnsExpectedItems()
    {
        var response = await _client.GetAsync("/api/taskitems");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var items = await response.Content.ReadFromJsonAsync<TaskItem[]>();

        Assert.NotNull(items);
        Assert.Equal(3, items.Length);
        Assert.Equal(1, items[0].Id);
        Assert.Equal("Set up MVC project", items[0].Title);
        Assert.True(items[0].IsDone);
    }

    [Fact]
    public async Task GetTaskItemById_WithExistingId_ReturnsOkAndItem()
    {
        var response = await _client.GetAsync("/api/taskitems/2");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var item = await response.Content.ReadFromJsonAsync<TaskItem>();

        Assert.NotNull(item);
        Assert.Equal(2, item.Id);
        Assert.Equal("Add health endpoint", item.Title);
        Assert.True(item.IsDone);
    }

    [Fact]
    public async Task GetTaskItemById_WithMissingId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/taskitems/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PostTaskItem_CreatesItem_AndReturnsIt()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/taskitems", new { title = "Write endpoint plan" });

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var createdItem = await createResponse.Content.ReadFromJsonAsync<TaskItem>();

        Assert.NotNull(createdItem);
        Assert.True(createdItem.Id > 3);
        Assert.Equal("Write endpoint plan", createdItem.Title);
        Assert.False(createdItem.IsDone);

        var getResponse = await _client.GetAsync("/api/taskitems");

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var items = await getResponse.Content.ReadFromJsonAsync<TaskItem[]>();

        Assert.NotNull(items);
        Assert.Contains(items, item => item.Id == createdItem.Id && item.Title == createdItem.Title && !item.IsDone);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task PostTaskItem_WithInvalidTitle_ReturnsBadRequest(string title)
    {
        var response = await _client.PostAsJsonAsync("/api/taskitems", new { title });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PutTaskItem_WithExistingId_ReturnsOkAndUpdatedItem()
    {
        var response = await _client.PutAsJsonAsync("/api/taskitems/2", new { title = "Update endpoint docs", isDone = false });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updatedItem = await response.Content.ReadFromJsonAsync<TaskItem>();

        Assert.NotNull(updatedItem);
        Assert.Equal(2, updatedItem.Id);
        Assert.Equal("Update endpoint docs", updatedItem.Title);
        Assert.False(updatedItem.IsDone);
    }

    [Fact]
    public async Task PutTaskItem_WithMissingId_ReturnsNotFound()
    {
        var response = await _client.PutAsJsonAsync("/api/taskitems/999", new { title = "Does not matter", isDone = true });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PutTaskItem_WithNonPositiveId_ReturnsBadRequest()
    {
        var response = await _client.PutAsJsonAsync("/api/taskitems/0", new { title = "Invalid id", isDone = true });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PutTaskItem_WithNegativeId_ReturnsBadRequest()
    {
        var response = await _client.PutAsJsonAsync("/api/taskitems/-1", new { title = "Invalid id", isDone = true });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task PutTaskItem_WithInvalidTitle_ReturnsBadRequest(string title)
    {
        var response = await _client.PutAsJsonAsync("/api/taskitems/1", new { title, isDone = true });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PutTaskItem_WithNullTitle_ReturnsBadRequest()
    {
        var response = await _client.PutAsJsonAsync("/api/taskitems/1", new { title = (string?)null, isDone = true });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
