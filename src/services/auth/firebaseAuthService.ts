import {
    GithubAuthProvider,
    GoogleAuthProvider,
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

// BUG 5 CORREGIDO: fetchSignInMethodsForEmail fue deprecado en Firebase 9
// y eliminado en Firebase 10+. Con firebase ^12 esta función no existe,
// lanzando un error runtime que rompía GitHub y Microsoft silenciosamente.
//
// Solución: extraer el providerId directamente del error
// auth/account-exists-with-different-credential, que desde Firebase 9
// expone customData._tokenResponse.verifiedProvider o bien
// podemos resolverlo intentando con los proveedores conocidos en orden.
const resolveProviderFromError = (error: unknown): AuthProvider | null => {
    const authError = error as FirebaseError & {
        customData?: {
            _tokenResponse?: {
                verifiedProvider?: string[];
            };
        };
    };

    // Firebase v9+ incluye los proveedores verificados en el error
    const verifiedProviders =
        authError?.customData?._tokenResponse?.verifiedProvider ?? [];

    for (const pid of verifiedProviders) {
        const provider = createProviderByFirebaseId(pid);
        if (provider) return provider;
    }

    // Fallback: intentar con Google (el proveedor más común)
    return createGoogleProvider();
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

            return this.signInAndLinkExistingAccount(providerName, error);
        }
    }

    async signOut(): Promise<void> {
        await signOut(auth);
    }

    private async signInAndLinkExistingAccount(
        requestedProvider: SocialAuthProvider,
        error: unknown
    ): Promise<FirebaseUserInfo> {
        const authError = error as FirebaseAuthError;
        const pendingCredential = getCredentialFromError(requestedProvider, error);

        if (!pendingCredential) {
            throw error;
        }

        // BUG 5 CORREGIDO: resolvemos el proveedor existente sin fetchSignInMethodsForEmail
        const existingProvider = resolveProviderFromError(error);
        if (!existingProvider) {
            throw error;
        }

        let existingUserCredential;
        try {
            existingUserCredential = await signInWithPopup(auth, existingProvider);
        } catch {
            // Si el segundo popup también falla, propagar el error original
            throw error;
        }

        try {
            const { linkWithCredential } = await import("firebase/auth");
            await linkWithCredential(existingUserCredential.user, pendingCredential);
        } catch (linkError) {
            const code = (linkError as FirebaseAuthError).code;
            if (code !== "auth/provider-already-linked" && code !== "auth/credential-already-in-use") {
                throw linkError;
            }
        }

        // Determinar el nombre del proveedor del usuario existente
        const existingProviderId =
            existingUserCredential.user.providerData[0]?.providerId ?? "google.com";
        const resolvedProvider: SocialAuthProvider =
            SOCIAL_PROVIDER_BY_FIREBASE_ID[existingProviderId] ?? requestedProvider;

        return normalizeFirebaseUser(existingUserCredential.user, resolvedProvider);
    }
}

export const firebaseAuthService = new FirebaseAuthService();