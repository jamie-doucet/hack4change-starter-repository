# Hack4Change Starter Python Repository
This is the sample Python server repository for the Hack4Change hackathon. Combined with one of the Hack4Change client applications, you can use this server as a basis to build your own full stack web application.

# Getting Started
To start working with this server project, do the following:

- Download Python 3 from https://www.python.org/downloads/ and install it.
- Install `pipenv` from https://pipenv.pypa.io/en/latest/.
- From this directory, run the command `pipenv install`. This will restore the application's dependencies.

# Commands
In order to use this application, start by running the `pipenv shell` command from this directory. This will open a `pipenv` shell will all of the installed dependencies and modules. Once this is done, you can run the following commands:

- `fastapi dev main.py --port 8080` will run a development server at `http://localhost:8080`. The server will automatically update when you change your source code.
- `pytest` will run all tests.
- `pytest <name>` will run tests in the named file or directory. For example, `pytest test_main.py` will run any tests in the `test_main.py` file.
- `python main.py` will run a production version of the server.

# Layout
The `Pipfile` and `Pipfile.lock` files contain the dependencies for the server application.
The `main.py` file contains the web server source code.
The `test_main.py` file contains all tests for the web server.

# Frameworks and Tools
This application is built using the Python programming language. Documentation for the language and its features is available at https://www.python.org/doc/.

Dependency and environment management are provided by Pipenv. More information about Pipenv is available at https://pipenv.pypa.io/en/latest/.

REST API and some additional testing support are provided by the FastAPI package. Documentation and resources for this package are available at https://fastapi.tiangolo.com/.
