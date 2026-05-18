import type { FirebaseUserInfo } from "./securityService";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
    getAuth,
    getRedirectResult,
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    signOut as signOutFirebase,
    signInWithPopup,
    type AuthProvider,
    type User,
} from "firebase/auth";

export type SocialAuthProvider = "google" | "microsoft" | "github";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const createProvider = (providerName: SocialAuthProvider): AuthProvider => {
    if (providerName === "google") {
        const provider = new GoogleAuthProvider();
        provider.addScope("email");
        provider.addScope("profile");
        provider.setCustomParameters({ prompt: "select_account" });
        return provider;
    }

    if (providerName === "microsoft") {
        const provider = new OAuthProvider("microsoft.com");
        provider.addScope("openid");
        provider.addScope("profile");
        provider.addScope("email");
        provider.setCustomParameters({
            prompt: "select_account",
            tenant: "common",
        });
        return provider;
    }

    const provider = new GithubAuthProvider();
    provider.addScope("read:user");
    provider.addScope("user:email");
    return provider;
};

const firebaseProviderId: Record<string, SocialAuthProvider> = {
    "google.com": "google",
    "microsoft.com": "microsoft",
    "github.com": "github",
};

const normalizeFirebaseUser = (
    user: User,
    provider: SocialAuthProvider
): FirebaseUserInfo => {
    if (!user.email) {
        throw new Error("El proveedor no devolvio un correo valido.");
    }

    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider,
    };
};

class FirebaseAuthService {
    async signInWithProvider(
        providerName: SocialAuthProvider
    ): Promise<FirebaseUserInfo> {
        const provider = createProvider(providerName);
        const result = await signInWithPopup(auth, provider);
        return normalizeFirebaseUser(result.user, providerName);
    }

    async waitForRedirectResult(): Promise<FirebaseUserInfo | null> {
        const result = await getRedirectResult(auth);
        if (!result) return null;

        const providerId = result.providerId ?? result.user.providerData[0]?.providerId;
        const provider = providerId ? firebaseProviderId[providerId] : undefined;

        if (!provider) {
            throw new Error("No fue posible identificar el proveedor de autenticacion.");
        }

        return normalizeFirebaseUser(result.user, provider);
    }

    async signOut(): Promise<void> {
        await signOutFirebase(auth);
    }
}

export const firebaseAuthService = new FirebaseAuthService();
