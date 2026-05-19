import type { SocialAuthProvider } from "../../firebase/firebaseAuth";

export interface FirebaseUserInfo {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    provider: SocialAuthProvider;
}