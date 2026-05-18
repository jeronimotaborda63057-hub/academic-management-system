import { api } from "../../interceptors/authInterceptor";
import type { AuthData } from "../../models/Auth/authData";
import type { LoginResponse } from "../../models/Auth/loginResponse";
import type { User } from "../../models/User";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { StorageProvider } from "../../storage/StorageProvider";
import type { SocialAuthProvider } from "./firebaseAuthService";

export interface FirebaseUserInfo {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    provider: SocialAuthProvider;
}

interface SessionProfile {
    displayName?: string | null;
    photoURL?: string | null;
}

export interface EmailSignUpData {
    fullName: string;
    email: string;
    password: string;
}

interface RegisterAdminPayload {
    email: string;
    password: string;
    code: string;
    first_name: string;
    last_name: string;
}

const isUnauthorizedError = (error: unknown): boolean =>
    (error as { response?: { status?: number } }).response?.status === 401;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const getStableHash = (value: string): string => {
    let hash = 0;
    for (const char of value) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return hash.toString(36).toUpperCase();
};

const getSocialPassword = (email: string): string =>
    `Social123*${getStableHash(normalizeEmail(email))}`;

const getLegacySocialPassword = (email: string): string => {
    const localPart = normalizeEmail(email).split("@")[0];
    return `Social@1-${localPart}`;
};

const getAdminCode = (email: string): string =>
    `ADM-${getStableHash(normalizeEmail(email)).slice(0, 8)}`;

class SecurityService {
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        this.storage = storage;
    }

    async login(email: string, password: string, profile?: SessionProfile): Promise<User> {
        const response = await api.post<LoginResponse>("/auth/login", {
            email,
            password,
        });
        return this.persistSession(response.data.data, profile);
    }

    async loginWithFirebase(firebaseUser: FirebaseUserInfo): Promise<User> {
        const { uid, email, displayName, photoURL } = firebaseUser;
        const profile = { displayName, photoURL };
        const [primaryPassword, ...fallbackPasswords] = this.getSocialPasswordCandidates({
            email,
            uid,
        });

        try {
            return await this.loginWithPasswordCandidates({
                email,
                passwords: [primaryPassword, ...fallbackPasswords],
                profile,
            });
        } catch (error) {
            if (!isUnauthorizedError(error)) {
                throw error;
            }

            await this.registerSocialUser({
                email,
                password: primaryPassword,
                displayName,
            });
            return await this.login(email, primaryPassword, profile);
        }
    }

    async signUpWithEmailPassword({
        fullName,
        email,
        password,
    }: EmailSignUpData): Promise<User> {
        await this.registerBasicUser({ email, password, fullName });
        return await this.login(email, password, { displayName: fullName });
    }

    logout(): void {
        this.storage.removeItem("user");
        this.storage.removeItem("access_token");
        this.storage.removeItem("token_type");
    }

    getStoredUser(): User | null {
        const stored = this.storage.getItem("user");
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        return !!this.storage.getItem("access_token");
    }

    private persistSession(authData: AuthData, profile?: SessionProfile): User {
        const { user, access_token, token_type } = authData;
        const sessionUser = this.enrichUser(user, profile);
        this.storage.setItem("user", JSON.stringify(sessionUser));
        this.storage.setItem("access_token", access_token);
        this.storage.setItem("token_type", token_type);
        return sessionUser;
    }

    private enrichUser(user: User, profile?: SessionProfile): User {
        if (!profile) return user;
        return {
            ...user,
            display_name: profile.displayName ?? user.display_name,
            photo_url: profile.photoURL ?? user.photo_url,
        };
    }

    private async registerSocialUser({
        email,
        password,
        displayName,
    }: {
        email: string;
        password: string;
        displayName: string | null;
    }): Promise<void> {
        const { firstName, lastName } = this.splitFullName(
            displayName ?? email.split("@")[0]
        );
        await this.registerAdmin({
            email,
            password,
            firstName,
            lastName,
        });
    }

    private getSocialPasswordCandidates({
        email,
        uid,
    }: {
        email: string;
        uid: string;
    }): string[] {
        return Array.from(
            new Set([
                getSocialPassword(email),
                getLegacySocialPassword(email),
                uid,
            ])
        );
    }

    private async loginWithPasswordCandidates({
        email,
        passwords,
        profile,
    }: {
        email: string;
        passwords: string[];
        profile: SessionProfile;
    }): Promise<User> {
        let lastUnauthorizedError: unknown = null;

        for (const password of passwords) {
            try {
                return await this.login(email, password, profile);
            } catch (error) {
                if (!isUnauthorizedError(error)) {
                    throw error;
                }
                lastUnauthorizedError = error;
            }
        }

        throw lastUnauthorizedError;
    }

    private async registerBasicUser({
        email,
        password,
        fullName,
    }: {
        email: string;
        password: string;
        fullName: string;
    }): Promise<void> {
        const { firstName, lastName } = this.splitFullName(fullName);
        await this.registerAdmin({
            email,
            password,
            firstName,
            lastName,
        });
    }

    private async registerAdmin({
        email,
        password,
        firstName,
        lastName,
    }: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<void> {
        const payload: RegisterAdminPayload = {
            email,
            password,
            code: getAdminCode(email),
            first_name: firstName,
            last_name: lastName,
        };

        await api.post("/auth/register-admin", payload);
    }

    private splitFullName(fullName: string): { firstName: string; lastName: string } {
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        return {
            firstName: nameParts[0] ?? "Usuario",
            lastName: nameParts.slice(1).join(" ") || "Social",
        };
    }
}

export const securityService = new SecurityService();
