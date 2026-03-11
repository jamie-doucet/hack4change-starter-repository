from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

EXPECTED_MESSAGE = "Welcome to the Hack4Change Web Server"


def test_read_main():
    response = client.get("/hello")
    assert response.status_code == 200
    assert response.text == EXPECTED_MESSAGE
