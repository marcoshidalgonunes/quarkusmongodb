window.onload = () => {
  const oauthClientId = "quarkus-app";
  const oauthScopes = ["openid"];
  const toPlain = (value) => (value && typeof value.toJS === "function" ? value.toJS() : value);

  const extractAccessTokenFromAuthorized = (authorizedValue) => {
    const authObj = toPlain(authorizedValue);
    if (!authObj || typeof authObj !== "object") {
      return null;
    }

    const entries = Array.isArray(authObj) ? authObj : Object.values(authObj);
    for (const entry of entries) {
      const item = toPlain(entry);
      const token = toPlain(item?.token) || toPlain(item?.value?.token);
      const accessToken = token?.access_token || item?.access_token;
      if (typeof accessToken === "string" && accessToken.length > 0) {
        return accessToken;
      }
    }

    return null;
  };

  window.ui = SwaggerUIBundle({
    url: "/q/openapi",
    dom_id: "#swagger-ui",
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout",
    oauth2RedirectUrl: `${window.location.origin}/docs/oauth2-redirect.html`,
    persistAuthorization: true,
    requestInterceptor: (request) => {
      const authorized = window.ui?.getSystem?.()?.authSelectors?.authorized?.();
      const accessToken = extractAccessTokenFromAuthorized(authorized);

      if (accessToken) {
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${accessToken}`;
      }

      console.info("[docs][diag] request", {
        method: request.method,
        url: request.url,
        hasAccessToken: !!accessToken,
        hasAuthorizationHeader: !!(request.headers && request.headers.Authorization)
      });

      return request;
    }
  });

  window.ui.initOAuth({
    clientId: oauthClientId,
    usePkceWithAuthorizationCodeGrant: true,
    scopes: oauthScopes.join(" ")
  });

  const system = window.ui.getSystem();
  const originalShowDefinitions = system?.authActions?.showDefinitions;
  let isInternalClose = false;
  let baselineAccessTokens = new Set();

  const prepareModalInputs = () => {
    const authContainer = document.querySelector(".auth-container");
    if (!authContainer) {
      return;
    }

    const clientIdInput =
      authContainer.querySelector("input[placeholder='client_id']") ||
      authContainer.querySelector("input[name='client_id']");
    if (clientIdInput && !clientIdInput.value) {
      clientIdInput.value = oauthClientId;
      clientIdInput.dispatchEvent(new Event("input", { bubbles: true }));
      clientIdInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const scopeCheckboxes = Array.from(
      authContainer.querySelectorAll("input[type='checkbox']")
    );
    const hasAnyChecked = scopeCheckboxes.some((cb) => cb.checked);
    if (!hasAnyChecked && scopeCheckboxes.length > 0) {
      scopeCheckboxes.forEach((cb) => {
        cb.click();
      });
    }
  };

  const clickModalAuthorize = () => {
    prepareModalInputs();

    const modalAuthorizeBtn =
      document.querySelector(".auth-container .modal-btn.authorize") ||
      document.querySelector(".auth-container button.authorize");

    if (!modalAuthorizeBtn || modalAuthorizeBtn.disabled) {
      return false;
    }

    modalAuthorizeBtn.click();
    return true;
  };

  const collectAccessTokens = () => {
    const authorized = system?.authSelectors?.authorized?.();
    const tokens = new Set();

    const token = extractAccessTokenFromAuthorized(authorized);
    if (token) {
      tokens.add(token);
    }

    return tokens;
  };

  const hasFreshAccessToken = () => {
    const currentTokens = collectAccessTokens();
    if (currentTokens.size === 0) {
      return false;
    }

    for (const token of currentTokens) {
      if (!baselineAccessTokens.has(token)) {
        return true;
      }
    }

    return false;
  };

  const closeModalIfAuthorized = () => {
    if (!hasFreshAccessToken()) {
      return false;
    }

    if (typeof originalShowDefinitions === "function") {
      isInternalClose = true;
      originalShowDefinitions(false);
      setTimeout(() => {
        isInternalClose = false;
      }, 0);
      console.info("[docs][diag] modal closed after fresh token acquisition");
    }
    return true;
  };

  const monitorAuthorizationResult = () => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (closeModalIfAuthorized()) {
        clearInterval(timer);
        return;
      }

      if (attempts > 120) {
        clearInterval(timer);
        const currentTokens = collectAccessTokens();
        console.warn("[docs][diag] fresh token not detected after callback", {
          baselineTokens: baselineAccessTokens.size,
          currentTokens: currentTokens.size
        });
      }
    }, 250);
  };

  const autoConfirmAuthorizeModal = () => {
    if (clickModalAuthorize()) {
      console.info("[docs][diag] modal authorize clicked immediately");
      return;
    }

    const observer = new MutationObserver(() => {
      if (clickModalAuthorize()) {
        console.info("[docs][diag] modal authorize clicked via observer");
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (clickModalAuthorize() || attempts > 60) {
        if (attempts > 60) {
          console.info("[docs][diag] modal authorize button not found");
        }
        clearInterval(timer);
        observer.disconnect();
      }
    }, 50);
  };

  if (typeof originalShowDefinitions === "function") {
    console.info("[docs][diag] showDefinitions override installed");
    system.authActions.showDefinitions = (definitions) => {
      if (isInternalClose || definitions === false) {
        return originalShowDefinitions(definitions);
      }

      baselineAccessTokens = collectAccessTokens();
      console.info("[docs][diag] showDefinitions called");

      const result = originalShowDefinitions(definitions);
      setTimeout(autoConfirmAuthorizeModal, 0);
      setTimeout(monitorAuthorizationResult, 0);
      return result;
    };
  } else {
    console.warn("[docs][diag] unable to override showDefinitions");
  }
};
