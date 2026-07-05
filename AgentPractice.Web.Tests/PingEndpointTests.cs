using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AgentPractice.Web.Tests;

public class PingEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public PingEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(_ => { }).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task GetPing_ReturnsExpectedPayload()
    {
        var response = await _client.GetAsync("/api/ping");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(rawJson);
        var root = document.RootElement;

        Assert.True(root.TryGetProperty("message", out _));
        Assert.True(root.TryGetProperty("utcTimestamp", out _));

        var payload = await response.Content.ReadFromJsonAsync<PingResponse>();

        Assert.NotNull(payload);
        Assert.Equal("pong", payload.Message);
        Assert.NotEqual(default, payload.UtcTimestamp);
        Assert.Equal(DateTimeKind.Utc, payload.UtcTimestamp.Kind);
    }

    private sealed class PingResponse
    {
        public string Message { get; set; } = string.Empty;

        public DateTime UtcTimestamp { get; set; }
    }
}
