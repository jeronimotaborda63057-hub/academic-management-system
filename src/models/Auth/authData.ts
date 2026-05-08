import type { User } from "../User";

export type AuthData = {
    access_token: string;
    token_type: string;
    user: User;
}