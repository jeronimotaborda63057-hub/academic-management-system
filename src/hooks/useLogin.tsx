import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { securityService } from "../services/auth/securityService";
import { setUser } from "../store/userSlice";

// Tipo que describe el estado interno del hook:
// si está cargando y si hay un mensaje de error.
interface LoginState {
    loading: boolean;
    error: string | null;
}

// Hook personalizado que orquesta el proceso de login completo.
//
// ¿Por qué un hook y no poner esta lógica directo en SignIn?
// Principio de responsabilidad única (SRP):
//   - SignIn solo maneja el formulario (qué escribe el usuario, cómo se ve).
//   - useLogin maneja la lógica (llamar al servicio, actualizar Redux, navegar).
//
// Además, si mañana hay otra pantalla que también necesita hacer login
// (por ejemplo una ventana modal), reutiliza este hook sin duplicar código.
export function useLogin() {
    const dispatch = useDispatch();   // Para actualizar el estado global de Redux
    const navigate = useNavigate();   // Para redirigir al usuario después del login

    const [state, setState] = useState<LoginState>({
        loading: false,
        error: null,
    });

    const login = async (email: string, password: string) => {
        // Activamos el estado de carga y limpiamos errores previos
        setState({ loading: true, error: null });

        try {
            // 1. Llamamos al servicio que hace la petición al backend
            //    y guarda el token en el storage.
            const user = await securityService.login(email, password);

            // 2. Guardamos el usuario en Redux para que toda la app
            //    sepa quién está logueado sin tener que leer el storage en cada lugar.
            dispatch(setUser(user));

            // 3. Redirigimos al inicio. El ProtectedRoute ya dejará pasar
            //    porque ahora hay token en el storage.
            navigate("/");

        } catch {
            // Si el backend rechaza las credenciales o hay un error de red,
            // mostramos un mensaje amigable al usuario.
            setState({
                loading: false,
                error: "Credenciales incorrectas. Intenta de nuevo.",
            });
        }
    };

    // Exponemos el estado y la función login para que SignIn los use.
    return { ...state, login };
}