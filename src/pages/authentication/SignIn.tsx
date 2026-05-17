import React, { useState } from "react";
import { Building2, GitBranch, Mail } from "lucide-react";

import { useLogin } from "../../components/hooks/useLogin";
import Logo from "../../assets/logo.png";
import type { SocialAuthProvider } from "../../services/auth/firebaseAuthService";

const socialProviders: {
    icon: React.ReactNode;
    label: string;
    provider: SocialAuthProvider;
}[] = [
    {
        provider: "google",
        label: "Google",
        icon: <Mail size={18} />,
    },
    {
        provider: "microsoft",
        label: "Microsoft",
        icon: <Building2 size={18} />,
    },
    {
        provider: "github",
        label: "GitHub",
        icon: <GitBranch size={18} />,
    },
];

const SignIn: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { error, loading, loadingProvider, login, loginWithProvider } = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-boxdark-2">
            <div className="w-full max-w-sm rounded-2xl border border-stroke bg-white p-8 shadow-sm dark:border-strokedark dark:bg-boxdark">
                <div className="mb-6 flex justify-center">
                    <img src={Logo} alt="Logo" className="h-12 w-auto" />
                </div>

                <h1 className="mb-1 text-xl font-semibold text-black dark:text-white">
                    Bienvenido
                </h1>
                <p className="mb-6 text-sm text-body dark:text-bodydark2">
                    Ingresa tus credenciales para continuar
                </p>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-700 dark:bg-red-900/20">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <div className="mb-5 grid grid-cols-1 gap-2">
                    {socialProviders.map(({ icon, label, provider }) => (
                        <button
                            key={provider}
                            type="button"
                            disabled={loading}
                            onClick={() => loginWithProvider(provider)}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
                        >
                            {icon}
                            {loadingProvider === provider
                                ? `Conectando con ${label}...`
                                : `Continuar con ${label}`}
                        </button>
                    ))}
                </div>

                <div className="mb-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-stroke dark:bg-strokedark" />
                    <span className="text-xs font-medium uppercase text-gray-400">
                        o
                    </span>
                    <span className="h-px flex-1 bg-stroke dark:bg-strokedark" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-bodydark2">
                            Correo institucional
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@universidad.edu"
                            required
                            className="h-11 rounded-xl border border-stroke bg-white px-4 text-sm text-black outline-none transition-colors focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-bodydark2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="h-11 rounded-xl border border-stroke bg-white px-4 text-sm text-black outline-none transition-colors focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 h-11 rounded-xl bg-black text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-primary"
                    >
                        {loading && !loadingProvider ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
