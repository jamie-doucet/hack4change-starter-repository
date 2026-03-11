package com.hack4change;

import static io.restassured.RestAssured.*;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

@Tag("integration")
public class SampleE2ETest {
    @Test
    public void basicEndpointCheck(){
        String response = given().port(8080).get("/hello").body().asString();
        String statusLine = given().port(8080).get("/hello").statusLine();
        String[] statusParts = statusLine.split(" ");
        assertEquals(response, "Welcome to the Hack4Change Web Server!");
        assertEquals(statusParts[statusParts.length - 1], "200");
    }
}
