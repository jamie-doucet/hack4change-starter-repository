package com.hack4change;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class SampleApplication {

	@RequestMapping("/hello")
	String home() {
		return "Welcome to the Hack4Change Web Server!";
	}

	public static void main(String[] args) {
		SpringApplication.run(SampleApplication.class, args);
	} 
}
