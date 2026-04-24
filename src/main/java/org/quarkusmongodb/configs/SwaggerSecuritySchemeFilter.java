package org.quarkusmongodb.configs;

import org.eclipse.microprofile.config.ConfigProvider;
import org.eclipse.microprofile.openapi.OASFactory;
import org.eclipse.microprofile.openapi.OASFilter;
import org.eclipse.microprofile.openapi.models.Components;
import org.eclipse.microprofile.openapi.models.OpenAPI;
import org.eclipse.microprofile.openapi.models.security.OAuthFlow;
import org.eclipse.microprofile.openapi.models.security.OAuthFlows;
import org.eclipse.microprofile.openapi.models.security.SecurityScheme;

public class SwaggerSecuritySchemeFilter implements OASFilter {

    @Override
    public void filterOpenAPI(OpenAPI openAPI) {
        String authUrl = ConfigProvider.getConfig()
                .getOptionalValue("swagger.oauth.authorization-url", String.class)
                .orElse("");

        if (authUrl.isBlank()) {
            return; // nothing to inject
        }

        Components components = openAPI.getComponents();
        if (components == null) {
            components = OASFactory.createComponents();
            openAPI.setComponents(components);
        }

        OAuthFlow implicitFlow = OASFactory.createOAuthFlow();
        implicitFlow.setAuthorizationUrl(authUrl);

        OAuthFlows flows = OASFactory.createOAuthFlows();
        flows.setImplicit(implicitFlow);

        SecurityScheme scheme = OASFactory.createSecurityScheme();
        scheme.setType(SecurityScheme.Type.OAUTH2);
        scheme.setDescription("Authentication");
        scheme.setFlows(flows);

        components.addSecurityScheme("keycloak", scheme);
    }
}