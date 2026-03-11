using Microsoft.AspNetCore.Mvc.Testing;

namespace Hack4Change.API.Tests.Integration;

/// <summary>
/// This is a helper class meant to simplify access to web commands. Currently it only supports GET requests. Feel free to add or adjust this as needed.
/// </summary>
public static class WebClientHelper
{
    public static async Task<HttpResponseMessage> GetResponse(string path)
    {
        await using var application = new WebApplicationFactory<Program>();

        using var client = application.CreateClient();

        var response = await client.GetAsync(path);

        return response;
    }
}