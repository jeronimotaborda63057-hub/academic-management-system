import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { User } from "../../models/User";
import {
    firebaseAuthService,
    type SocialAuthProvider,
} from "../../services/auth/firebaseAuthService";
import { securityService } from "../../services/auth/securityService";
import { setUser } from "../../store/userSlice";

interface LoginState {
    error: string | null;
    loading: boolean;
    loadingProvider: SocialAuthProvider | null;
}

const HOME_PATH_BY_ROLE = {
    ADMIN: "/users/list",
    TEACHER: "/",
    STUDENT: "/",
} satisfies Record<User["role"], string>;

const getAuthErrorMessage = (error: unknown): string => {
    const code = (error as { code?: string }).code;
    if (code === "auth/popup-closed-by-user")
        return "El inicio de sesión fue cancelado.";
    if (code === "auth/account-exists-with-different-credential")
        return "Ya existe una cuenta con este correo usando otro proveedor.";
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 401) return "No fue posible validar tus credenciales.";
    return "Ocurrió un error. Intenta de nuevo.";
};

export function useLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [state, setState] = useState<LoginState>({
        error: null,
        loading: false,
        loadingProvider: null,
    });

    const completeLogin = (user: User) => {
        setState({ error: null, loading: false, loadingProvider: null });
        dispatch(setUser(user));
        navigate("/");
    };

    // Al montar el componente verifica si venimos de un redirect de Firebase.
    // Si hay un provider pendiente en localStorage, espera al usuario autenticado,
    // hace auto-registro si es necesario y completa el login contra el backend.
    useEffect(() => {
        setState((prev) => ({ ...prev, loading: true }));

        firebaseAuthService
            .waitForRedirectResult()
            .then(async (firebaseUser) => {
                if (!firebaseUser) {
                    setState((prev) => ({ ...prev, loading: false }));
                    return;
                }
                const user = await securityService.loginWithFirebase(firebaseUser);
                completeLogin(user);
            })
            .catch((error) => {
                setState({
                    error: getAuthErrorMessage(error),
                    loading: false,
                    loadingProvider: null,
                });
            });
    }, []);

    const login = async (email: string, password: string) => {
        setState({ error: null, loading: true, loadingProvider: null });
        try {
            const user = await securityService.login(email, password);
            completeLogin(user);
        } catch (error) {
            setState({
                error: getAuthErrorMessage(error),
                loading: false,
                loadingProvider: null,
            });
        }
    };

    const loginWithProvider = async (provider: SocialAuthProvider) => {
        setState({ error: null, loading: true, loadingProvider: provider });
        try {
            // Guarda el provider y redirige. La página se recarga sola al volver
            // y el useEffect captura el resultado.
            await firebaseAuthService.redirectToProvider(provider);
        } catch (error) {
            setState({
                error: getAuthErrorMessage(error),
                loading: false,
                loadingProvider: null,
            });
        }
    };

    return { ...state, login, loginWithProvider };
}