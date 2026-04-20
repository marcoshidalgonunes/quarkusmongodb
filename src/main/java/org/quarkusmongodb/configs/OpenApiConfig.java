package org.quarkusmongodb.configs;

import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;

import jakarta.ws.rs.core.Application;

@OpenAPIDefinition(
    info = @Info(
        title = "Books API",
        version = "1.0.0",
        description = "API secured with Keycloak"
    ),
    security = @SecurityRequirement(name = "keycloak")
)
public class OpenApiConfig extends Application {
}
