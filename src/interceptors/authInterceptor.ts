import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import type { StorageProvider } from "../storage/StorageProvider";

type ResponseError = {
    config?: {
        url?: string;
    };
    response?: {
        status?: number;
    };
};

class AuthInterceptor {
    private api: AxiosInstance;
    private storage: StorageProvider;

    // BUG 4 CORREGIDO: rutas que NO requieren token (el login y registro social no tienen sesión aún)
    private readonly EXCLUDED_ROUTES = ["/auth/login", "/auth/register-admin"];

    // Rutas del flujo de autenticación — los 401 aquí NO deben redirigir al login
    private readonly AUTH_FLOW_ROUTES = ["/auth/login", "/auth/register-admin"];

    constructor() {
        this.storage = new LocalStorageProvider();
        this.api = axios.create({
            headers: { "Content-Type": "application/json" },
            // En desarrollo: baseURL = "/api" → el proxy de Vite lo reescribe a http://localhost:5000
            // y evita el error de CORS (misma origin en el navegador).
            // En producción: VITE_API_BASE_URL debe apuntar al servidor real, p.ej. "https://api.tudominio.com"
            // IMPORTANTE: VITE_API_URL contiene la URL directa del backend y NO se usa aquí como baseURL
            // para no saltarse el proxy y causar CORS en desarrollo.
            baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
        });
        this.initializeInterceptors();
    }

    private handleRequest(config: InternalAxiosRequestConfig) {
        const isExcluded = this.EXCLUDED_ROUTES.some((route) =>
            config.url?.includes(route)
        );
        if (isExcluded) return config;

        const token = this.storage.getItem("access_token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }

    private handleResponseError(error: unknown) {
        const responseError = error as ResponseError;
        const isAuthFlowRequest = this.AUTH_FLOW_ROUTES.some((route) =>
            responseError.config?.url?.includes(route)
        );

        if (responseError.response?.status === 401 && !isAuthFlowRequest) {
            this.storage.removeItem("access_token");
            this.storage.removeItem("user");
            window.location.href = "/auth/signin";
        }
        return Promise.reject(error);
    }

    private initializeInterceptors() {
        this.api.interceptors.request.use(
            this.handleRequest.bind(this),
            (e) => Promise.reject(e)
        );
        this.api.interceptors.response.use(
            (r) => r,
            this.handleResponseError.bind(this)
        );
    }

    public get instance(): AxiosInstance {
        return this.api;
    }
}

export const api = new AuthInterceptor().instance;