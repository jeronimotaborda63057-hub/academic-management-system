import { useState } from "react";

import AuthDivider from "../../components/auth/AuthDivider";
import AuthErrorAlert from "../../components/auth/AuthErrorAlert";
import AuthShell from "../../components/auth/AuthShell";
import EmailPasswordForm from "../../components/auth/EmailPasswordForm";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import { useLogin } from "../../components/hooks/useLogin";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { error, loading, loadingProvider, login, loginWithProvider } = useLogin();

    return (
        <AuthShell
            title="Bienvenido"
            subtitle="Ingresa tus credenciales para continuar"
            footerText="Aun no tienes cuenta?"
            footerLinkLabel="Registrate"
            footerLinkTo="/auth/signup"
        >
            <AuthErrorAlert message={error} />

            <SocialAuthButtons
                disabled={loading}
                loadingProvider={loadingProvider}
                actionLabel="Continuar con"
                loadingLabel="Conectando con"
                onProviderSelect={loginWithProvider}
            />

            <AuthDivider />

            <EmailPasswordForm
                email={email}
                password={password}
                loading={loading && !loadingProvider}
                loadingText="Iniciando sesion..."
                submitText="Iniciar sesion"
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={() => login(email, password)}
            />
        </AuthShell>
    );
};

export default SignIn;
