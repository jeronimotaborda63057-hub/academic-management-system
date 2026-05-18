export const getAuthErrorMessage = (error: unknown): string => {
    const message = (error as { message?: string }).message;
    const code = (error as { code?: string }).code;

    if (message === "USUARIO_NO_REGISTRADO")
        return "Tu cuenta no está registrada. Contacta al administrador.";
    if (message === "USUARIO_INACTIVO")
        return "Tu cuenta está desactivada. Contacta al administrador.";
    if (message === "CONTRASEÑA_INCOMPATIBLE")
        return "Esta cuenta fue creada con usuario y contraseña. Inicia sesión de esa forma.";
    if (message === "USUARIO_YA_EXISTE")
        return "Ya existe una cuenta con este correo. Usa el inicio de sesión con el mismo proveedor o con correo y contraseña.";
    if (message === "GITHUB_EMAIL_PRIVADO")
        return "Tu email de GitHub está configurado como privado. Ve a github.com/settings/emails y desmarca 'Keep my email addresses private'.";
    if (message === "EMAIL_NO_DISPONIBLE")
        return "El proveedor no compartió tu correo. Intenta con otro método.";

    if (code === "auth/popup-closed-by-user") return "Inicio de sesión cancelado.";
    if (code === "auth/popup-blocked") return "El navegador bloqueó la ventana. Permite popups para este sitio.";
    if (code === "auth/operation-not-allowed") return "Este proveedor no está habilitado. Contacta al administrador.";
    if (code === "auth/account-exists-with-different-credential")
        return "Tu cuenta está vinculada a otro proveedor. Te conectaremos automáticamente a través del proveedor original.";
    if (message === "AUTH_EXISTS_WITH_PASSWORD")
        return "Esta cuenta existe con correo y contraseña. Usa el inicio de sesión normal.";

    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 400) return "Los datos enviados son incorrectos. Verifica la información e intenta de nuevo.";
    if (status === 401) return "Credenciales incorrectas.";
    if (status === 409) return "Ya existe una cuenta con este correo.";

    return "Ocurrió un error. Intenta de nuevo.";
};