package com.nelja.urqr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.modulith.Modulithic;

@SpringBootApplication
@Modulithic
public class UrqrServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(UrqrServerApplication.class, args);
	}

}
