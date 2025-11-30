package com.smartdispatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jdbc.repository.config.EnableJdbcRepositories;

@EnableJdbcRepositories
@SpringBootApplication
public class SmartDispatchSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartDispatchSystemApplication.class, args);
	}
}
