import type { FirebaseUserInfo } from "./securityService";

export type SocialAuthProvider = "google" | "microsoft" | "github";

class FirebaseAuthService {
    async redirectToProvider(_providerName: SocialAuthProvider): Promise<void> {
        throw new Error("El inicio de sesion social no esta configurado.");
    }

    async waitForRedirectResult(): Promise<FirebaseUserInfo | null> {
        return null;
    }
}

export const firebaseAuthService = new FirebaseAuthService();
