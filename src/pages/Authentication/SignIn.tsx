import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { securityService } from "../../services/auth/securityService";
import { setUser } from "../../store/userSlice";
import type { AppDispatch } from "../../store/store";
import Logo from "../../assets/logo.png";

const SignIn: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const user = await securityService.login(email, password);

            // ✅ Guarda en Redux
            dispatch(setUser(user));

            // ✅ Redirige según el rol
            switch (user.role) {
                case "ADMIN":
                    navigate("/users/list");
                    break;
                case "TEACHER":
                    navigate("/");
                    break;
                case "STUDENT":
                    navigate("/");
                    break;
                default:
                    navigate("/");
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError("Correo o contraseña incorrectos.");
            } else {
                setError("Ocurrió un error. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-boxdark-2 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-8 shadow-sm">

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src={Logo} alt="Logo" className="h-12 w-auto" />
                </div>

                {/* Título */}
                <h1 className="text-xl font-semibold text-black dark:text-white mb-1">
                    Bienvenido
                </h1>
                <p className="text-sm text-body dark:text-bodydark2 mb-6">
                    Ingresa tus credenciales para continuar
                </p>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                            Correo institucional
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@universidad.edu"
                            required
                            className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="h-11 px-4 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-11 rounded-xl bg-black dark:bg-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60 mt-1"
                    >
                        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;