"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export function SignInButton() {
  const { auth, signIn } = useAuth();

  if (auth.status === "signing-in") {
    return <span className="auth-status">Signing in...</span>;
  }

  return (
    <button className="sign-in-btn" onClick={signIn}>
      Sign in
    </button>
  );
}
