import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import type { StorageProvider } from "../storage/StorageProvider";

type ResponseError = {
    response?: {
        status?: number;
    };
};

class AuthInterceptor {
    private api: AxiosInstance;
    private storage: StorageProvider;
    private readonly EXCLUDED_ROUTES = ["/login"];

    constructor() {
        this.storage = new LocalStorageProvider();
        this.api = axios.create({
            headers: { "Content-Type": "application/json" },
            baseURL: "/api",
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

        if (responseError.response?.status === 401) {
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
