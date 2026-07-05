using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AgentPractice.Web.Tests;

public class ServerTimeEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ServerTimeEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(_ => { }).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task GetServerTime_ReturnsUtcTimestamp()
    {
        var beforeRequest = DateTime.UtcNow;

        var response = await _client.GetAsync("/api/servertime");

        var afterRequest = DateTime.UtcNow;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(rawJson);
        var root = document.RootElement;

        Assert.True(root.TryGetProperty("utcTimestamp", out _));
        Assert.Single(root.EnumerateObject());

        var payload = await response.Content.ReadFromJsonAsync<ServerTimeResponse>();

        Assert.NotNull(payload);
        Assert.NotEqual(default, payload.UtcTimestamp);
        Assert.Equal(DateTimeKind.Utc, payload.UtcTimestamp.Kind);
        Assert.InRange(payload.UtcTimestamp, beforeRequest.AddSeconds(-1), afterRequest.AddSeconds(1));
    }

    private sealed class ServerTimeResponse
    {
        public DateTime UtcTimestamp { get; set; }
    }
}