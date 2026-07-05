using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AgentPractice.Web.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AgentPractice.Web.Tests;

public class VersionEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public VersionEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(_ => { }).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task GetVersion_ReturnsExpectedPayload()
    {
        var response = await _client.GetAsync("/api/version");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(rawJson);
        var root = document.RootElement;

        Assert.True(root.TryGetProperty("service", out _));
        Assert.True(root.TryGetProperty("version", out _));
        Assert.True(root.TryGetProperty("informationalVersion", out _));
        Assert.True(root.TryGetProperty("environment", out _));
        Assert.True(root.TryGetProperty("utcTimestamp", out _));

        var payload = await response.Content.ReadFromJsonAsync<VersionDto>();

        Assert.NotNull(payload);
        Assert.False(string.IsNullOrWhiteSpace(payload.Service));
        Assert.False(string.IsNullOrWhiteSpace(payload.Version));
        Assert.False(string.IsNullOrWhiteSpace(payload.InformationalVersion));
        Assert.False(string.IsNullOrWhiteSpace(payload.Environment));
        Assert.NotEqual(default, payload.UtcTimestamp);
        Assert.Equal(DateTimeKind.Utc, payload.UtcTimestamp.Kind);
    }
}