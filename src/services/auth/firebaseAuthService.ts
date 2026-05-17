import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import {
    getAuth,
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithRedirect,
    onAuthStateChanged,
    type AuthProvider,
} from "firebase/auth";
import type { FirebaseUserInfo } from "./securityService";

export type SocialAuthProvider = "google" | "microsoft" | "github";

const PENDING_PROVIDER_KEY = "pending_auth_provider";

const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(firebaseApp);

const createGoogleProvider = (): GoogleAuthProvider => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    return provider;
};

const createMicrosoftProvider = (): OAuthProvider => {
    const provider = new OAuthProvider("microsoft.com");
    provider.addScope("email");
    provider.addScope("profile");
    return provider;
};

const createGithubProvider = (): GithubAuthProvider => {
    const provider = new GithubAuthProvider();
    provider.addScope("user:email");
    return provider;
};

const createProvider = (provider: SocialAuthProvider): AuthProvider => {
    const providers: Record<SocialAuthProvider, () => AuthProvider> = {
        google: createGoogleProvider,
        microsoft: createMicrosoftProvider,
        github: createGithubProvider,
    };
    return providers[provider]();
};

class FirebaseAuthService {
    // Guarda el provider en localStorage y redirige al proveedor OAuth.
    async redirectToProvider(providerName: SocialAuthProvider): Promise<void> {
        localStorage.setItem(PENDING_PROVIDER_KEY, providerName);
        await signInWithRedirect(auth, createProvider(providerName));
    }

    // Espera el resultado del redirect. Retorna uid, email, displayName y provider
    // para que securityService pueda hacer el auto-registro + login.
    waitForRedirectResult(): Promise<FirebaseUserInfo | null> {
        return new Promise((resolve, reject) => {
            const provider = localStorage.getItem(
                PENDING_PROVIDER_KEY
            ) as SocialAuthProvider | null;

            // Sin provider pendiente → no venimos de un redirect
            if (!provider) {
                resolve(null);
                return;
            }

            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe();

                if (!user) {
                    resolve(null);
                    return;
                }

                try {
                    localStorage.removeItem(PENDING_PROVIDER_KEY);
                    resolve({
                        uid: user.uid,
                        email: user.email!,
                        displayName: user.displayName,
                        provider,
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}

export const firebaseAuthService = new FirebaseAuthService();