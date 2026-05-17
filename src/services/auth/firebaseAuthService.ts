import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import {
    getAuth,
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    type AuthProvider,
} from "firebase/auth";

export type SocialAuthProvider = "google" | "microsoft" | "github";

const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

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
    async getIdToken(providerName: SocialAuthProvider): Promise<string> {
        const credential = await signInWithPopup(auth, createProvider(providerName));
        return credential.user.getIdToken();
    }
}

export const firebaseAuthService = new FirebaseAuthService();
