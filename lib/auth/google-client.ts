// Google Identity Services (GIS) implicit grant flow
// Uses the newer google.accounts.oauth2 API (not the deprecated gapi.auth2)

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: TokenClientConfig): TokenClient;
          revoke(token: string, callback?: () => void): void;
        };
        id: {
          initialize(config: IdConfig): void;
          prompt(callback?: (notification: PromptNotification) => void): void;
          renderButton(parent: HTMLElement, config: ButtonConfig): void;
        };
      };
    };
  }
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: { type: string; message: string }) => void;
  prompt?: string;
}

interface TokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  error?: string;
}

interface IdConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
  auto_select?: boolean;
}

interface PromptNotification {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
}

interface ButtonConfig {
  type: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
}

const SCOPES =
  "openid email profile https://www.googleapis.com/auth/drive.appdata";

let gsiLoaded = false;
let loadPromise: Promise<void> | null = null;

export function loadGsiScript(): Promise<void> {
  if (gsiLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gsiLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function createTokenClient(
  clientId: string,
  onSuccess: (response: TokenResponse) => void,
  onError: (error: { type: string; message: string }) => void
): TokenClient {
  if (!window.google) {
    throw new Error("Google Identity Services not loaded");
  }

  return window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: onSuccess,
    error_callback: onError,
  });
}

export function requestAccessToken(
  client: TokenClient,
  prompt?: "consent" | "none"
): void {
  client.requestAccessToken(prompt ? { prompt } : undefined);
}

export function revokeToken(accessToken: string): void {
  window.google?.accounts.oauth2.revoke(accessToken);
}

// Decode the JWT id_token to extract user info
// (We get this from the userinfo endpoint instead, since implicit flow
// doesn't always return id_token)
export async function fetchUserInfo(
  accessToken: string
): Promise<{ email: string; name: string; picture: string; sub: string }> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user info: ${res.status}`);
  }

  return res.json();
}
