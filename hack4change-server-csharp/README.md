# Hack4Change Starter C# Repository
This is the sample C# server repository for the Hack4Change hackathon. Combined with the Hack4Change client application, you can use this server as a basis to build your own full stack web application.

# Getting Started
To start working with this server project, do the following:
- Download the .NET SDK from https://dotnet.microsoft.com/en-us/download. You will need version 10 or higher for this server.
- Navigate to the base directory for this project and run the `dotnet restore` command.
- Use the commands below to run and test the server.

# Commands
You can run the following commands from a command line in this project:

- `dotnet watch` in the `API` directory will run a development server. It will provide the application on a `localhost` HTTPS port that the client will access for its API calls, and it will automatically rebuild and reload the application on file changes.
- `dotnet publish` in the `API` directory will create a packaged version of the application in the `API/bin/Release/net10.0` directory.
- `dotnet test` will run all tests for the application. If run in the `API.Tests.Unit` directory, it will only run unit tests. If run in the `API.Tests.Integration` directory, it will only run integration tests.

# Layout
The `API` project contains the web server itself and all helper classes.

The `API.Tests.Unit` project contains unit tests for the web server.

The `API.Tests.Integration` project contains integration tests that will create and then run against an instance of the web server.

# Frameworks and Tools
This application is built using the C# programming language. Documentation for the language and its features is available at https://learn.microsoft.com/en-us/dotnet/csharp/.

The various build and test commands are using the .NET command line SDK. More information on how to use this tool is available in the official .NET documentation at https://learn.microsoft.com/en-us/dotnet/.

The web server is implemented using the ASP.NET Core framework. Documentation for this framework is available at https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-10.0.

The unit and integration tests are written using the xUnit testing framework. the xUnit documentation is available at https://xunit.net/.
