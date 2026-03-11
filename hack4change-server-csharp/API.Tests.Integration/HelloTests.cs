namespace Hack4Change.API.Tests.Integration;

/// <summary>
/// This is a simple test class to demonstrate how integration tests can be written for this server.
/// </summary>
public class HelloTests
{
    private const string WELCOME = "Welcome to the Hack4Change Web Server";
    private const string PATH = "/hello";

    [Fact]
    public async Task GET_ReturnsSuccessCode()
    {
        var response = await WebClientHelper.GetResponse(PATH);

        Assert.True(response.IsSuccessStatusCode);
    }

    [Fact]
    public async Task GET_ReturnsWelcomeMessage()
    {
        var response = await WebClientHelper.GetResponse(PATH);

        var text = await response.Content.ReadAsStringAsync();

        Assert.Equal(WELCOME, text);
    }
}
