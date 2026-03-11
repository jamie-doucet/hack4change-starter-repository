# Hack4Change Starter Java Repository
This is the sample Java server repository for the Hack4Change hackathon. Combined with the Hack4Change client applications, you can use this client as a basis to build your own full stack web application.

# Getting Started
To start working with this server project, do the following:
- Download and install a Java development kit. We recommend that you use the most recent version of Temurin, available at https://adoptium.net/.
- Download and install the Maven package manager. You can find instructions on how to install and use Maven at https://maven.apache.org/.
- From this directory, run the `mvn compile` command. This will download your dependencies and then display a confirmation message to indicate that it's been compiled.

# Commands
You can run the following commands from this directory:

- `mvn spring-boot:run` will run the application for you as a web server at `http://localhost:8080`. If you recompile the application then it will reload the server.
- `mvn compile` will recompile the application.
- `mvn package` will run all tests, then build a jar file in the `./target` directory.
- `mvn test -DexcludedGroups=integration` will run only the unit tests for the application.
- `mvn test` will run all tests, including both unit and end-to-end tests. Note that integration tests will require a running server in order to pass.

# Layout
The base directory for this server contains this document and the `pom.xml` file defining the application's dependencies.

The `src` directory contains the source code, and within the `src` directory:
- The `main/java/com/hack4change` directory contains the source code for the server.
- The `main/resources` directory contains the `application.properties` file, which defines the port for the application server.
- The `test/java/com/hack4change` directory contains all test files for the application.

# Frameworks and Tools
This application uses the Java programming language. Learning resources for the language and links to its documentation are available at https://dev.java/learn/.

All of the build and test commands are provided by the Apache Maven build tool. Documentation for this tool is available at https://maven.apache.org/index.html.

The web server is implemented using the Spring Boot framework. Information and resources for Spring Boot are available at https://spring.io/projects/spring-boot.

Unit tests are implemented with JUnit. Resources are available for JUnit at https://docs.junit.org/6.0.3/overview.html. Integration tests also use the Rest Assured library, available at https://rest-assured.io/.
