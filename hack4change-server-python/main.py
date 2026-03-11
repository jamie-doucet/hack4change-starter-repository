from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
import uvicorn

app = FastAPI()

WELCOME_MESSAGE = "Welcome to the Hack4Change Web Server"


@app.get("/hello", response_class=PlainTextResponse)
def read_root():
    return WELCOME_MESSAGE


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8080)
