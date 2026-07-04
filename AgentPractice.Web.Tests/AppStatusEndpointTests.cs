using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgentPractice.Web.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AgentPractice.Web.Tests;

public class AppStatusEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AppStatusEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(_ => { }).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task GetAppStatus_ReturnsExpectedPayload()
    {
        var response = await _client.GetAsync("/api/appstatus");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(rawJson);
        var root = document.RootElement;

        Assert.True(root.TryGetProperty("appName", out _));
        Assert.True(root.TryGetProperty("environment", out _));
        Assert.True(root.TryGetProperty("utcTimestamp", out _));
        Assert.True(root.TryGetProperty("version", out _));

        var payload = await response.Content.ReadFromJsonAsync<AppStatusDto>();

        Assert.NotNull(payload);
        Assert.False(string.IsNullOrWhiteSpace(payload.AppName));
        Assert.False(string.IsNullOrWhiteSpace(payload.Environment));
        Assert.NotEqual(default, payload.UtcTimestamp);
        Assert.Equal(DateTimeKind.Utc, payload.UtcTimestamp.Kind);
        Assert.Equal("TBD", payload.Version);
    }
}
