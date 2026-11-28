package com.nelja.urqr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.Ordered;
import org.springframework.modulith.Modulithic;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@Modulithic
@EnableScheduling
@EnableTransactionManagement(order = Ordered.LOWEST_PRECEDENCE - 2)
public class UrqrServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(UrqrServerApplication.class, args);
	}

}
