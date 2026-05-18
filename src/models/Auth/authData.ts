import type { User } from "../uml/User";

export type AuthData = {
    access_token: string;
    token_type: string;
    user: User;
}