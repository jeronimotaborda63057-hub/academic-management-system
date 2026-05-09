import axios from "axios";
import type { User } from "../../models/User";
import type { StorageProvider } from "../../storage/StorageProvider";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import type { LoginResponse } from "../../models/auth/loginResponse";

// SRP: esta clase tiene una única responsabilidad — todo lo relacionado
// con autenticación (login, logout, verificar sesión, leer el usuario guardado).
// No sabe nada de Redux ni de la interfaz gráfica.
class SecurityService {

    // Claves con las que se guarda cada dato en el storage.
    // Las definimos como constantes privadas para no escribir strings
    // sueltos por todo el código (evita errores de tipeo).
    private readonly userKey = "user";
    private readonly accessTokenKey = "access_token";
    private readonly tokenTypeKey = "token_type";

    private readonly apiURL: string;

    // Usamos la interfaz StorageProvider en vez de LocalStorage directamente.
    // Principio de inversión de dependencias (DIP): dependemos de una abstracción,
    // no de una implementación concreta. Esto permite cambiar el storage fácilmente
    // (por ejemplo, usar SessionStorage en vez de LocalStorage) sin tocar esta clase.
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        this.storage = storage;

        // Leemos la URL del backend desde las variables de entorno (.env).
        // VITE_API_URL está definida en el archivo .env del proyecto.
        this.apiURL = import.meta.env.VITE_API_URL + "/auth" || "";
    }

    // Hace la petición POST al backend con email y contraseña.
    // Si el backend responde bien, guarda el usuario y el token en el storage
    // y retorna el usuario para que quien llame pueda hacer lo que necesite (ej: Redux).
    async login(email: string, password: string): Promise<User> {
        const response = await axios.post<LoginResponse>(
            `${this.apiURL}/login`,
            { email, password },
            { headers: { "Content-Type": "application/json" } }
        );

        // Desestructuramos los datos que vienen del backend.
        // La forma de la respuesta está definida en models/Auth/loginResponse.ts
        const { user, access_token, token_type } = response.data.data;

        // Guardamos todo en el storage para mantener la sesión
        // aunque el usuario recargue la página.
        this.storage.setItem(this.userKey, JSON.stringify(user));
        this.storage.setItem(this.accessTokenKey, access_token);
        this.storage.setItem(this.tokenTypeKey, token_type);

        // Retornamos el usuario para que el hook useLogin lo despache a Redux.
        return user;
    }

    // Limpia todos los datos de sesión del storage.
    // Se llama cuando el usuario cierra sesión.
    logout(): void {
        this.storage.removeItem(this.userKey);
        this.storage.removeItem(this.accessTokenKey);
        this.storage.removeItem(this.tokenTypeKey);
    }

    // Lee el usuario guardado en el storage y lo retorna parseado.
    // Útil para hidratar Redux al recargar la página (ya lo hace userSlice).
    // Si el dato está corrupto, lo elimina y retorna null para no romper la app.
    getStoredUser(): User | null {
        const stored = this.storage.getItem(this.userKey);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            this.storage.removeItem(this.userKey);
            return null;
        }
    }

    // Verifica si hay una sesión activa comprobando si existe el token.
    // Lo usa ProtectedRoute para decidir si dejar pasar al usuario o mandarlo al login.
    isAuthenticated(): boolean {
        return !!this.storage.getItem(this.accessTokenKey);
    }
}

// Exportamos una única instancia (patrón Singleton).
// Así toda la app comparte el mismo objeto y no se crean múltiples instancias.
export const securityService = new SecurityService();