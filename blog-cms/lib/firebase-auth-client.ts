"use client";

type FirebaseCompatUser = {
  getIdTokenResult(forceRefresh?: boolean): Promise<{ claims: Record<string, unknown> }>;
};

type FirebaseCompatAuth = {
  signInWithEmailAndPassword(email: string, password: string): Promise<{ user: FirebaseCompatUser }>;
  signOut(): Promise<void>;
};

type FirebaseCompatApp = {
  auth(): FirebaseCompatAuth;
};

type FirebaseCompatNamespace = {
  apps: FirebaseCompatApp[];
  initializeApp(config: Record<string, string>): FirebaseCompatApp;
};

declare global {
  interface Window {
    firebase?: FirebaseCompatNamespace;
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyBz2cCCWyurx4Vl5Di1DapY76CD082G3b8",
  authDomain: "varsa-test.firebaseapp.com",
  projectId: "varsa-test",
  storageBucket: "varsa-test.firebasestorage.app",
  messagingSenderId: "1046259220582",
  appId: "1:1046259220582:web:c74180f8c026421cda2da7",
};

const scriptUrls = [
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js",
];
const scriptLoads = new Map<string, Promise<void>>();
let authInstance: FirebaseCompatAuth | undefined;

function loadScript(src: string) {
  const existingLoad = scriptLoads.get(src);
  if (existingLoad) return existingLoad;

  const scriptLoad = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Firebase authentication could not be loaded."));
    document.head.appendChild(script);
  });
  scriptLoads.set(src, scriptLoad);
  return scriptLoad.catch((error: unknown) => {
    scriptLoads.delete(src);
    throw error;
  });
}

async function getFirebaseAuth() {
  if (authInstance) return authInstance;
  await loadScript(scriptUrls[0]);
  await loadScript(scriptUrls[1]);
  const firebase = window.firebase;
  if (!firebase) throw new Error("Firebase authentication is unavailable.");
  const app = firebase.apps[0] ?? firebase.initializeApp(firebaseConfig);
  authInstance = app.auth();
  return authInstance;
}

export async function signInFirebaseAdmin(email: string, password: string) {
  const auth = await getFirebaseAuth();
  await auth.signOut();
  const credential = await auth.signInWithEmailAndPassword(email, password);
  const token = await credential.user.getIdTokenResult(true);
  if (token.claims.admin !== true) {
    await auth.signOut();
    return false;
  }
  return true;
}

export async function signOutFirebaseAdmin() {
  const auth = await getFirebaseAuth();
  await auth.signOut();
}

export function firebaseAuthErrorMessage(error: unknown) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  if (["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(code)) {
    return "Email or password is incorrect for the Firebase admin account.";
  }
  if (code === "auth/too-many-requests") {
    return "Firebase has temporarily blocked sign-in attempts. Please wait and try again.";
  }
  if (code === "auth/network-request-failed") {
    return "Could not reach Firebase. Check your connection and try again.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Email/password sign-in is not enabled for the Firebase project.";
  }
  return "Could not verify the Firebase admin account. Please try again.";
}
