window.onload = () => {
  console.log("[docs] swagger-init loaded"); // verify in browser console

  window.ui = SwaggerUIBundle({
    url: "/q/openapi",
    dom_id: "#swagger-ui",
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout",
    oauth2RedirectUrl: `${window.location.origin}/docs/oauth2-redirect.html`
  });

  window.ui.initOAuth({
    clientId: "quarkus-app",
    usePkceWithAuthorizationCodeGrant: true,
    scopes: "openid"
  });
};