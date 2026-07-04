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
}
