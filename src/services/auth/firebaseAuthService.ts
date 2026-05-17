import type { FirebaseUserInfo } from "./securityService";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
    getAuth,
    getRedirectResult,
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
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

const providerByName: Record<SocialAuthProvider, AuthProvider> = {
    google: new GoogleAuthProvider(),
    microsoft: new OAuthProvider("microsoft.com"),
    github: new GithubAuthProvider(),
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
        provider,
    };
};

class FirebaseAuthService {
    async signInWithProvider(
        providerName: SocialAuthProvider
    ): Promise<FirebaseUserInfo> {
        const provider = providerByName[providerName];
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
}

export const firebaseAuthService = new FirebaseAuthService();
