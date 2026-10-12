package com.securevault.securevault_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity   // enables @PreAuthorize / @PostAuthorize on controllers & services
public class SecurevaultBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SecurevaultBackendApplication.class, args);
	}

}
