import axios from "axios";
import type { User } from "../../models/User";
import type { StorageProvider } from "../../storage/StorageProvider";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { LoginResponse } from "../../models/auth/loginResponse"; 

class SecurityService extends EventTarget {
    private readonly userKey: string;
    private readonly accessToken: string;
    private readonly tokenTypeKey: string;

    private readonly apiURL: string;
    private user: User | null;
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        super();

        this.storage = storage;
        this.userKey = "user";
        this.accessToken = "access_token";
        this.tokenTypeKey = "token_type";
        this.apiURL = import.meta.env.VITE_API_URL || "";
        this.user = this.loadStoredUser()
    }

    private loadStoredUser(): User | null {
        const storedUser = this.storage.getItem(this.userKey);

        if (!storedUser) {
            return null
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Error al analizar usuario guardado: " + error);
            this.storage.removeItem(this.userKey);
            return null;
        }
    }

    async login(user: User) {
        const response = await axios.post<LoginResponse>(`${this.apiURL}/login`, user, 
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        if (response.status !== 200) {
            throw new Error(`Error al hacer login. Status: ` + response.status);
        }

        const data = response.data.data;

        this.user = data.user;
        this.storage.setItem(this.userKey, JSON.stringify(this.user));

        if (data?.access_token) {
            this.storage.setItem(this.accessToken, data.access_token);
        }

        if (data?.token_type) {
            this.storage.setItem(this.tokenTypeKey, data.token_type);
        }

        //Falta poner el dispatch event para cambiar interfaz cuando se inicie sesión.
        return this.user;
    }
}