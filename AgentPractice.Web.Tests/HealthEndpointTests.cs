using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgentPractice.Web.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AgentPractice.Web.Tests;

public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(_ => { }).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task GetHealth_ReturnsExpectedPayload()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(rawJson);
        var root = document.RootElement;

        Assert.True(root.TryGetProperty("status", out _));
        Assert.True(root.TryGetProperty("service", out _));
        Assert.True(root.TryGetProperty("timestampUtc", out _));

        var payload = await response.Content.ReadFromJsonAsync<StatusSummary>();

        Assert.NotNull(payload);
        Assert.Equal("ok", payload.Status);
        Assert.Equal("AgentPractice.Web", payload.Service);
        Assert.NotEqual(default, payload.TimestampUtc);
        Assert.Equal(DateTimeKind.Utc, payload.TimestampUtc.Kind);
    }
}
