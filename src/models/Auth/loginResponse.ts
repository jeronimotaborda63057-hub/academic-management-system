import type { AuthData } from "./authData";

export type LoginResponse = {
    data: AuthData;
    message: string;
}