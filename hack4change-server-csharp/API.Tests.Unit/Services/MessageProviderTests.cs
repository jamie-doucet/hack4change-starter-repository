namespace Hack4Change.API.Tests.Unit.Services;

using Xunit;
using Hack4Change.API.Services;

/// <summary>
/// This is an extremely basic test just to demonstrate how a unit test can be written for this project.
/// </summary>
public class MessageProviderTests
{
    private const string WELCOME = "Welcome to the Hack4Change Web Server";

    [Fact]
    public void MessageProvider_WelcomeMessage_ReturnsCorrectMessage()
    {
        Assert.Equal(WELCOME, new MessageProvider().WelcomeMessage());
    }
}
