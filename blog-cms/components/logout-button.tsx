"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { signOutFirebaseAdmin } from "@/lib/firebase-auth-client";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function handleLogout() {
    setPending(true);
    setError(undefined);
    try {
      try {
        await signOutFirebaseAdmin();
      } catch (firebaseError) {
        console.error("Firebase sign-out failed.", firebaseError);
      }
      await logoutAction();
      router.replace("/admin/login");
      router.refresh();
    } catch (logoutError) {
      console.error("Admin sign-out failed.", logoutError);
      setError("Sign out could not be completed. Please try again.");
      setPending(false);
    }
  }

  return (
    <div>
      <button className="button button-quiet" type="button" onClick={() => void handleLogout()} disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
