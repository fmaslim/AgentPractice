using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using AgentPractice.Web.Models;

namespace AgentPractice.Web.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Status()
    {
        var model = new StatusSummary
        {
            Status = "ok",
            Service = "AgentPractice.Web",
            TimestampUtc = DateTime.UtcNow
        };

        return View(model);
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
