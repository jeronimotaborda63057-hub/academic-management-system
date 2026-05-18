export const getAuthErrorMessage = (error: unknown): string => {
    const code = (error as { code?: string }).code;

    if (code === "auth/popup-closed-by-user") {
        return "El inicio de sesion fue cancelado.";
    }

    if (code === "auth/popup-blocked") {
        return "El navegador bloqueo la ventana de autenticacion.";
    }

    if (code === "auth/operation-not-allowed") {
        return "Este proveedor no esta habilitado en Firebase.";
    }

    if (code === "auth/account-exists-with-different-credential") {
        return "Este correo ya esta vinculado a otro proveedor en Firebase. Habilita multiples cuentas por correo en Firebase o inicia con el proveedor original.";
    }

    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 401) return "No fue posible validar tus credenciales.";
    if (status === 409) return "Ya existe una cuenta con este correo.";

    return "Ocurrio un error. Intenta de nuevo.";
};
