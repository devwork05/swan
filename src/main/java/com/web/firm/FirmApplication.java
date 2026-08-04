package com.web.firm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FirmApplication {

	public static void main(String[] args) {
		SpringApplication.run(FirmApplication.class, args);
	}

}
