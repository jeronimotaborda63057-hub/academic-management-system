import {
    fetchSignInMethodsForEmail,
    GithubAuthProvider,
    GoogleAuthProvider,
    linkWithCredential,
    OAuthProvider,
    signInWithPopup,
    signOut,
    type AuthCredential,
    type AuthProvider,
    type User,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";

import { auth } from "./firebaseConfig";
import type { FirebaseUserInfo } from "./securityService";

export type SocialAuthProvider = "google" | "microsoft" | "github";

type FirebaseAuthError = {
    code?: string;
    customData?: {
        email?: string;
    };
};

const FIREBASE_PROVIDER_BY_NAME: Record<SocialAuthProvider, string> = {
    google: "google.com",
    microsoft: "microsoft.com",
    github: "github.com",
};

const SOCIAL_PROVIDER_BY_FIREBASE_ID: Record<string, SocialAuthProvider> = {
    "google.com": "google",
    "microsoft.com": "microsoft",
    "github.com": "github",
};

const createGoogleProvider = (): GoogleAuthProvider => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
};

const createMicrosoftProvider = (): OAuthProvider => {
    const provider = new OAuthProvider("microsoft.com");
    provider.addScope("openid");
    provider.addScope("profile");
    provider.addScope("email");
    provider.setCustomParameters({
        prompt: "select_account",
        tenant: "common",
    });
    return provider;
};

const createGithubProvider = (): GithubAuthProvider => {
    const provider = new GithubAuthProvider();
    provider.addScope("read:user");
    provider.addScope("user:email");
    return provider;
};

const createProvider = (providerName: SocialAuthProvider): AuthProvider => {
    if (providerName === "google") return createGoogleProvider();
    if (providerName === "microsoft") return createMicrosoftProvider();
    return createGithubProvider();
};

const createProviderByFirebaseId = (providerId: string): AuthProvider | null => {
    if (providerId === "google.com") return createGoogleProvider();
    if (providerId === "microsoft.com") return createMicrosoftProvider();
    if (providerId === "github.com") return createGithubProvider();
    return null;
};

const getCredentialFromError = (
    providerName: SocialAuthProvider,
    error: unknown
): AuthCredential | null => {
    const firebaseError = error as FirebaseError;
    if (providerName === "google") return GoogleAuthProvider.credentialFromError(firebaseError);
    if (providerName === "microsoft") return OAuthProvider.credentialFromError(firebaseError);
    return GithubAuthProvider.credentialFromError(firebaseError);
};

const resolveExistingProviderId = (
    methods: string[],
    requestedProvider: SocialAuthProvider
): string => {
    const requestedProviderId = FIREBASE_PROVIDER_BY_NAME[requestedProvider];
    return (
        methods.find((method) => method !== "password" && method !== requestedProviderId) ??
        methods.find((method) => method !== "password") ??
        "google.com"
    );
};

const normalizeFirebaseUser = (
    user: User,
    providerName: SocialAuthProvider
): FirebaseUserInfo => {
    if (!user.email) {
        throw new Error("El proveedor no devolvio un correo valido.");
    }

    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: providerName,
    };
};

class FirebaseAuthService {
    async signInWithProvider(providerName: SocialAuthProvider): Promise<FirebaseUserInfo> {
        try {
            const result = await signInWithPopup(auth, createProvider(providerName));
            return normalizeFirebaseUser(result.user, providerName);
        } catch (error) {
            const authError = error as FirebaseAuthError;
            if (authError.code !== "auth/account-exists-with-different-credential") {
                throw error;
            }

            return this.signInAndLinkExistingEmail(providerName, error);
        }
    }

    async signOut(): Promise<void> {
        await signOut(auth);
    }

    private async signInAndLinkExistingEmail(
        requestedProvider: SocialAuthProvider,
        error: unknown
    ): Promise<FirebaseUserInfo> {
        const authError = error as FirebaseAuthError;
        const email = authError.customData?.email;
        const pendingCredential = getCredentialFromError(requestedProvider, error);

        if (!email || !pendingCredential) {
            throw error;
        }

        const methods = await fetchSignInMethodsForEmail(auth, email);
        const providerId = resolveExistingProviderId(methods, requestedProvider);
        const existingProvider = createProviderByFirebaseId(providerId);

        if (!existingProvider) {
            throw error;
        }

        const existingUserCredential = await signInWithPopup(auth, existingProvider);

        try {
            await linkWithCredential(existingUserCredential.user, pendingCredential);
        } catch (linkError) {
            const code = (linkError as FirebaseAuthError).code;
            if (code !== "auth/provider-already-linked" && code !== "auth/credential-already-in-use") {
                throw linkError;
            }
        }

        return normalizeFirebaseUser(
            existingUserCredential.user,
            SOCIAL_PROVIDER_BY_FIREBASE_ID[FIREBASE_PROVIDER_BY_NAME[requestedProvider]] ??
            requestedProvider
        );
    }
}

export const firebaseAuthService = new FirebaseAuthService();
