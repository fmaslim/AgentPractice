using System.Diagnostics;

namespace AgentPractice.Web.Middleware;

public class ApiRequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiRequestLoggingMiddleware> _logger;

    public ApiRequestLoggingMiddleware(RequestDelegate next, ILogger<ApiRequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? string.Empty;
        var requestId = context.TraceIdentifier;
        var timer = Stopwatch.StartNew();

        try
        {
            await _next(context);
            timer.Stop();

            _logger.LogInformation(
                "API request completed {Method} {Path} {StatusCode} in {ElapsedMs}ms {RequestId}",
                method,
                path,
                context.Response.StatusCode,
                timer.Elapsed.TotalMilliseconds,
                requestId);
        }
        catch (Exception ex)
        {
            timer.Stop();
            var statusCode = context.Response.HasStarted ? context.Response.StatusCode : 500;

            _logger.LogError(
                ex,
                "API request failed {Method} {Path} {StatusCode} in {ElapsedMs}ms {RequestId}",
                method,
                path,
                statusCode,
                timer.Elapsed.TotalMilliseconds,
                requestId);

            throw;
        }
    }
}
