package com.docqa.deid.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DocQA De-identification Service API")
                        .version("1.0")
                        .description("REST API for anonymizing personal and sensitive data (PII/PHI) in clinical documents")
                        .contact(new Contact()
                                .name("DocQA Team")
                                .email("support@docqa.com")));
    }
}
