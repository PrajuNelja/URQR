package com.nelja.urqr.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean OpenAPI urqrOpenApi() {
        return new OpenAPI().openapi("3.1.0").info(new Info().title("URQR Hotel POS API").version("v1")
                .description("Multi-hotel point-of-sale API. Hotel scope is taken from the authenticated JWT."))
                .components(new Components().addSecuritySchemes("bearerAuth",new SecurityScheme().type(SecurityScheme.Type.HTTP)
                        .scheme("bearer").bearerFormat("JWT")));
    }
}
