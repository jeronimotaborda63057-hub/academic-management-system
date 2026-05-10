import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import { type StorageProvider } from "../storage/StorageProvider";

export class AuthInterceptor {
    private api: AxiosInstance;
    private storage: StorageProvider;

    private EXCLUDED_ROUTES = ["/login", "/register"];

    constructor() {
        this.storage = new LocalStorageProvider();

        // 🔥 CLAVE: usar proxy en desarrollo
        const isDev = import.meta.env.DEV;

        this.api = axios.create({
            baseURL: isDev
                ? "/api" // ✅ usa proxy de Vite → evita CORS
                : import.meta.env.VITE_API_URL, // ✅ producción
            headers: { "Content-Type": "application/json" },
        });

        this.initializeInterceptors();
    }

    private handleRequest(config: InternalAxiosRequestConfig) {
        const token = this.storage.getItem("token");

        // 🚫 rutas excluidas (login/register)
        if (this.EXCLUDED_ROUTES.some((route) => config.url?.includes(route))) {
            return config;
        }

        // 🔐 agregar token si existe
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    }

    private handleResponseError(error: any) {
        if (error.response?.status === 401) {
            console.log("No autorizado, redirigiendo a login...");
            window.location.href = "/auth/signin";
        }

        return Promise.reject(error);
    }

    private initializeInterceptors() {
        this.api.interceptors.request.use(
            this.handleRequest.bind(this),
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            this.handleResponseError.bind(this)
        );
    }

    public get instance(): AxiosInstance {
        return this.api;
    }
}

// 🔥 export final
export const api = new AuthInterceptor().instance;