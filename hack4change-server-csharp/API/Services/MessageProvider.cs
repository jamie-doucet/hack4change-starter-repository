namespace Hack4Change.API.Services;

/// <summary>
/// The MessageProvider class provides a simple sample class to demonstrate server code organization and test implementation.
/// 
/// This is implemented as a non-static class so that it can be easily used or replaced via dependency injection.
/// </summary>
public class MessageProvider
{
    private const string WELCOME_MESSAGE = "Welcome to the Hack4Change Web Server";

    public string WelcomeMessage() => WELCOME_MESSAGE;
}