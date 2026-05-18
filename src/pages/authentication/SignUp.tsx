import AuthDivider from "../../components/auth/AuthDivider";
import AuthErrorAlert from "../../components/auth/AuthErrorAlert";
import AuthShell from "../../components/auth/AuthShell";
import SignUpEmailForm from "../../components/auth/SignUpEmailForm";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import { useLogin } from "../../components/hooks/useLogin";

const SignUp = () => {
    const {
        error,
        loading,
        loadingProvider,
        registerWithProvider,
        signUpWithEmailPassword,
    } = useLogin();

    return (
        <AuthShell
            title="Crear cuenta"
            subtitle="Registrate con tu cuenta institucional para entrar al sistema"
            footerText="Ya tienes cuenta?"
            footerLinkLabel="Inicia sesion"
            footerLinkTo="/auth/signin"
        >
            <AuthErrorAlert message={error} />

            <SocialAuthButtons
                disabled={loading}
                loadingProvider={loadingProvider}
                actionLabel="Registrarse con"
                loadingLabel="Registrando con"
                onProviderSelect={registerWithProvider}
            />

            <AuthDivider />

            <SignUpEmailForm
                loading={loading && !loadingProvider}
                onSubmit={signUpWithEmailPassword}
            />
        </AuthShell>
    );
};

export default SignUp;
