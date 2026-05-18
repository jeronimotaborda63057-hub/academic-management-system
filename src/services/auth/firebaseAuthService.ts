import {
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    fetchSignInMethodsForEmail,
    getRedirectResult,
    linkWithCredential,
    signInWithPopup,
    signOut as signOutFirebase,
    type AuthCredential,
    type AuthProvider,
    type UserCredential,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

export type SocialAuthProvider = "google" | "microsoft" | "github";

export interface FirebaseUserInfo {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    provider: SocialAuthProvider;
    oauthAccessToken?: string | null;
}


const createProvider = (providerName: SocialAuthProvider): AuthProvider => {
    if (providerName === "google") {
        const p = new GoogleAuthProvider();
        p.addScope("email");
        p.addScope("profile");
        p.setCustomParameters({ prompt: "select_account" });
        return p;
    }

    if (providerName === "microsoft") {
        const p = new OAuthProvider("microsoft.com");
        p.addScope("openid");
        p.addScope("profile");
        p.addScope("email");
        p.setCustomParameters({ prompt: "select_account", tenant: "common" });
        return p;
    }

    // GitHub
    const p = new GithubAuthProvider();
    p.addScope("read:user");
    p.addScope("user:email"); // ✅ pide acceso al email aunque sea privado
    return p;
};

const getGithubAccessToken = (result: UserCredential): string | null => {
    const credential = GithubAuthProvider.credentialFromResult(result);
    return credential?.accessToken ?? null;
};

const getErrorEmail = (error: any): string | null => {
    return error.customData?.email ?? error.email ?? null;
};

const getPendingCredential = (
    error: any,
    providerName: SocialAuthProvider
): AuthCredential | null => {
    if (providerName === "google") {
        return GoogleAuthProvider.credentialFromError(error);
    }
    if (providerName === "microsoft") {
        return OAuthProvider.credentialFromError(error);
    }
    return GithubAuthProvider.credentialFromError(error);
};

const getSocialProviderByMethod = (method: string): SocialAuthProvider | null => {
    if (method === "google.com") return "google";
    if (method === "microsoft.com") return "microsoft";
    if (method === "github.com") return "github";
    return null;
};

const resolveDifferentCredential = async (
    error: any,
    attemptedProvider: SocialAuthProvider
): Promise<UserCredential> => {
    const email = getErrorEmail(error);
    if (!email) throw error;

    const methods = await fetchSignInMethodsForEmail(auth, email);
    const credential = getPendingCredential(error, attemptedProvider);

    const fallbackMethod = methods.find((method) =>
        ["google.com", "microsoft.com", "github.com"].includes(method)
    );

    if (!fallbackMethod) {
        if (methods.includes("password")) {
            throw new Error("AUTH_EXISTS_WITH_PASSWORD");
        }
        throw error;
    }

    const fallbackProvider = getSocialProviderByMethod(fallbackMethod);
    if (!fallbackProvider) throw error;

    const result = await signInWithPopup(auth, createProvider(fallbackProvider));
    if (credential && auth.currentUser) {
        try {
            await linkWithCredential(auth.currentUser, credential);
        } catch {
            // If link fails, we still can continue with the primary sign-in result.
        }
    }

    return result;
};

const fetchGithubEmail = async (accessToken: string): Promise<string | null> => {
    try {
        const response = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
        });
        if (!response.ok) return null;

        const emails = await response.json() as Array<{
            email?: string;
            primary?: boolean;
            verified?: boolean;
        }>;

        const primary = emails.find((item) => item.primary && item.verified && item.email);
        if (primary?.email) return primary.email;

        const verified = emails.find((item) => item.verified && item.email);
        return verified?.email ?? emails.find((item) => item.email)?.email ?? null;
    } catch {
        return null;
    }
};

const extractEmail = async (result: UserCredential, providerName: SocialAuthProvider): Promise<string> => {
    if (result.user.email) return result.user.email;

    if (providerName === "github") {
        const providerEmail = result.user.providerData[0]?.email;
        if (providerEmail) return providerEmail;

        const accessToken = getGithubAccessToken(result);
        if (accessToken) {
            const apiEmail = await fetchGithubEmail(accessToken);
            if (apiEmail) return apiEmail;
        }

        throw new Error("GITHUB_EMAIL_PRIVADO");
    }

    throw new Error("EMAIL_NO_DISPONIBLE");
};

const firebaseProviderId: Record<string, SocialAuthProvider> = {
    "google.com": "google",
    "microsoft.com": "microsoft",
    "github.com": "github",
};

const normalizeFirebaseUser = async (
    result: UserCredential,
    provider: SocialAuthProvider
): Promise<FirebaseUserInfo> => {
    const email = await extractEmail(result, provider);
    const oauthAccessToken = getGithubAccessToken(result);

    return {
        uid: result.user.uid,
        email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider,
        oauthAccessToken,
    };
};

class FirebaseAuthService {
    async signInWithProvider(providerName: SocialAuthProvider): Promise<FirebaseUserInfo> {
        const provider = createProvider(providerName);

        try {
            const result = await signInWithPopup(auth, provider);
            return await normalizeFirebaseUser(result, providerName);
        } catch (error: any) {
            if (error.code === "auth/account-exists-with-different-credential") {
                const resolvedResult = await resolveDifferentCredential(error, providerName);
                const providerId = resolvedResult.providerId ?? resolvedResult.user.providerData[0]?.providerId;
                const resolvedProvider = providerId ? firebaseProviderId[providerId] : undefined;
                if (!resolvedProvider) throw error;
                return await normalizeFirebaseUser(resolvedResult, resolvedProvider);
            }
            throw error;
        }
    }

    async waitForRedirectResult(): Promise<FirebaseUserInfo | null> {
        const result = await getRedirectResult(auth);
        if (!result) return null;

        const providerId = result.providerId ?? result.user.providerData[0]?.providerId;
        const provider = providerId ? firebaseProviderId[providerId] : undefined;

        if (!provider) throw new Error("No fue posible identificar el proveedor.");

        return await normalizeFirebaseUser(result, provider);
    }

    async signOut(): Promise<void> {
        await signOutFirebase(auth);
    }
}

export const firebaseAuthService = new FirebaseAuthService();