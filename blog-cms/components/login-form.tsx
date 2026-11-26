"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "@/app/actions/auth";
import {
  firebaseAuthErrorMessage,
  signInFirebaseAdmin,
  signOutFirebaseAdmin,
} from "@/lib/firebase-auth-client";

export function LoginForm() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(undefined);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    let isFirebaseAdmin: boolean;
    try {
      isFirebaseAdmin = await signInFirebaseAdmin(email, password);
    } catch (authError) {
      setError(firebaseAuthErrorMessage(authError));
      setPending(false);
      return;
    }

    if (!isFirebaseAdmin) {
      setError("This Firebase account is not enabled as an admin.");
      setPending(false);
      return;
    }

    let result: LoginState;
    try {
      result = await loginAction(formData);
    } catch (loginError) {
      try {
        await signOutFirebaseAdmin();
      } catch (signOutError) {
        console.error("Could not clear the Firebase session after CMS sign-in failed.", signOutError);
      }
      console.error("Editorial sign-in failed.", loginError);
      setError("Editorial sign-in could not be completed. Check the server logs and try again.");
      setPending(false);
      return;
    }

    if (result.status === "error") {
      try {
        await signOutFirebaseAdmin();
      } catch (signOutError) {
        console.error("Could not clear the Firebase session after CMS sign-in failed.", signOutError);
      }
      setError(result.error);
      setPending(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <label className="field">
        <span>Email address</span>
        <input type="email" name="email" autoComplete="username" required maxLength={254} aria-describedby={error ? "login-error" : undefined} />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" name="password" autoComplete="current-password" required maxLength={200} aria-describedby={error ? "login-error" : undefined} />
      </label>
      {error && <p id="login-error" className="form-error" role="alert">{error}</p>}
      <button className="button button-dark button-wide" type="submit" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
      <p className="form-note">One sign-in opens the editorial and operations dashboards. Your Firebase account must have admin access.</p>
    </form>
  );
}
