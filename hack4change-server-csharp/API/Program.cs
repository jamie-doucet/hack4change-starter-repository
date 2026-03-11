/// For this application, we're using a very simple structure. The API is defined entirely in this file, along with all the server settings.
/// If your application is more complex then feel free to reorganize or replace this as needed.
using Hack4Change.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Services are injected here so that they can be created and/or provided as necessary for any API requests.
builder.Services.AddScoped<MessageProvider>();

// After services are injected, we use the builder to create the web application.
var app = builder.Build();

// All of the APIs are created here. For now there's only one, which provides a welcome message to the user.
app.MapGet("/hello", (MessageProvider messageProvider) =>
    messageProvider.WelcomeMessage())
.WithName("GetHello");

// Once all the configuration is completed, the app is launched.
app.Run();
