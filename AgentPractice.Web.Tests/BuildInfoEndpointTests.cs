using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AgentPractice.Web.Tests;

public class BuildInfoEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public BuildInfoEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(_ => { }).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task GetBuildInfo_ReturnsOkWithValidData()
    {
        // Act
        var response = await _client.GetAsync("/api/buildinfo");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        var root = jsonDoc.RootElement;

        Assert.True(root.TryGetProperty("appName", out var appName));
        Assert.NotEqual(JsonValueKind.Null, appName.ValueKind);
        Assert.True(appName.GetString()?.Length > 0);

        Assert.True(root.TryGetProperty("environment", out var environment));
        Assert.NotEqual(JsonValueKind.Null, environment.ValueKind);
        Assert.True(environment.GetString()?.Length > 0);

        Assert.True(root.TryGetProperty("utcTimestamp", out var utcTimestamp));
        Assert.NotEqual(JsonValueKind.Null, utcTimestamp.ValueKind);
    }
}
