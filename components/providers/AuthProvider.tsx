"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthState, GoogleUser } from "@/lib/types";
import {
  loadGsiScript,
  createTokenClient,
  requestAccessToken,
  revokeToken,
  fetchUserInfo,
} from "@/lib/auth/google-client";
import { isEmailAllowed } from "@/lib/auth/allowlist";

// ─── Context ─────────────────────────────────────────────────

interface AuthContextValue {
  auth: AuthState;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────

const AUTH_FLAG_KEY = "mihu-signed-in";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthState>({
    status: "signed-out",
    user: null,
    accessToken: null,
    error: null,
  });

  const tokenClientRef = useRef<ReturnType<typeof createTokenClient> | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Initialize GIS on mount
  useEffect(() => {
    if (!clientId) return;

    loadGsiScript()
      .then(() => {
        tokenClientRef.current = createTokenClient(
          clientId,
          handleTokenResponse,
          handleTokenError
        );

        // Note: silent re-auth via prompt:"none" opens a popup which
        // browsers block without a user gesture. Instead, we just
        // initialize GIS and let the user click "Sign in" again.
        // Their progress is safe in localStorage regardless.
      })
      .catch((err) => {
        console.error("Failed to load GIS:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function handleTokenResponse(response: { access_token: string; error?: string }) {
    if (response.error) {
      setAuth({
        status: "error",
        user: null,
        accessToken: null,
        error: response.error,
      });
      return;
    }

    try {
      setAuth((prev) => ({ ...prev, status: "signing-in" }));

      const userInfo = await fetchUserInfo(response.access_token);

      if (!isEmailAllowed(userInfo.email)) {
        revokeToken(response.access_token);
        setAuth({
          status: "error",
          user: null,
          accessToken: null,
          error: "Sorry, you don't have access right now. Ask Ashish to add your email if you'd like to join!",
        });
        localStorage.removeItem(AUTH_FLAG_KEY);
        return;
      }

      const user: GoogleUser = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub,
      };

      setAuth({
        status: "signed-in",
        user,
        accessToken: response.access_token,
        error: null,
      });

      localStorage.setItem(AUTH_FLAG_KEY, "true");
    } catch (err) {
      setAuth({
        status: "error",
        user: null,
        accessToken: null,
        error: err instanceof Error ? err.message : "Sign-in failed",
      });
    }
  }

  function handleTokenError(error: { type: string; message: string }) {
    // "popup_closed" or "access_denied" from silent auth is not a real error
    if (error.type === "popup_closed_by_user" || error.type === "access_denied") {
      localStorage.removeItem(AUTH_FLAG_KEY);
      return;
    }

    setAuth({
      status: "error",
      user: null,
      accessToken: null,
      error: error.message || "Authentication failed",
    });
  }

  const signIn = useCallback(() => {
    if (!tokenClientRef.current) return;
    setAuth((prev) => ({ ...prev, status: "signing-in", error: null }));
    requestAccessToken(tokenClientRef.current, "consent");
  }, []);

  const signOut = useCallback(() => {
    if (auth.accessToken) {
      revokeToken(auth.accessToken);
    }
    setAuth({
      status: "signed-out",
      user: null,
      accessToken: null,
      error: null,
    });
    localStorage.removeItem(AUTH_FLAG_KEY);
  }, [auth.accessToken]);

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
