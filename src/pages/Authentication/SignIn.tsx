import React, { useState } from 'react';
import { useLogin } from '../../components/hooks/useLogin';

// Página de inicio de sesión.
//
// SRP: este componente solo se encarga de la interfaz del formulario:
// qué campos mostrar, cómo se ven, y qué pasa cuando el usuario escribe o envía.
// Toda la lógica de autenticación vive en el hook useLogin.
const SignIn: React.FC = () => {

    // Estado local del formulario: solo existe aquí, no necesita ir a Redux
    // porque ningún otro componente necesita saber qué está escribiendo el usuario.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Obtenemos del hook: la función para hacer login, si está cargando, y el error.
    // SignIn no sabe nada de axios, Redux ni del storage — solo usa lo que el hook le da.
    const { login, loading, error } = useLogin();

    // Se ejecuta cuando el usuario envía el formulario.
    // e.preventDefault() evita que la página se recargue (comportamiento por defecto del form).
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-boxdark-2 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark p-8">

                <h1 className="text-xl font-medium text-black dark:text-white mb-1">
                    Bienvenido
                </h1>
                <p className="text-sm text-body dark:text-bodydark2 mb-6">
                    Ingresa tus credenciales para continuar
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Campo de correo */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-bodydark2 uppercase tracking-wider">
                            Correo
                        </label>
                        <input
                            type="email"
                            placeholder="correo@universidad.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            // Deshabilitamos los inputs mientras carga para evitar doble envío
                            disabled={loading}
                            className="h-10 rounded-lg border border-stroke dark:border-strokedark bg-transparent px-3 text-sm text-black dark:text-white outline-none focus:border-primary dark:focus:border-primary transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Campo de contraseña */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-bodydark2 uppercase tracking-wider">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="h-10 rounded-lg border border-stroke dark:border-strokedark bg-transparent px-3 text-sm text-black dark:text-white outline-none focus:border-primary dark:focus:border-primary transition-colors disabled:opacity-50"
                        />
                    </div>

                    {/* Mensaje de error: solo se muestra si el hook reportó un error */}
                    {error && (
                        <p className="text-xs text-red-500 dark:text-red-400 text-center">
                            {error}
                        </p>
                    )}

                    {/* Botón de envío: cambia su contenido según el estado de carga */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-10 rounded-lg bg-black dark:bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity mt-1 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            // Spinner animado mientras espera respuesta del backend
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Ingresando...
                            </>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </button>
                </form>

                {/* Separador visual */}
                <div className="flex items-center gap-3 my-5">
                    <span className="flex-1 h-px bg-stroke dark:bg-strokedark" />
                    <span className="text-xs text-bodydark2">o continúa con</span>
                    <span className="flex-1 h-px bg-stroke dark:bg-strokedark" />
                </div>

                {/* Botones de login social — pendientes de implementar */}
                <div className="flex flex-col gap-2">
                    {[
                        {
                            label: 'Continuar con Google',
                            icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            ),
                        },
                        {
                            label: 'Continuar con GitHub',
                            icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                            ),
                        },
                        {
                            label: 'Continuar con Microsoft',
                            icon: (
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M21.386 0H2.614C1.171 0 0 1.171 0 2.614v18.772C0 22.829 1.171 24 2.614 24h18.772C22.829 24 24 22.829 24 21.386V2.614C24 1.171 22.829 0 21.386 0z" fill="#0078D4" />
                                    <path d="M11.4 11.4H3V3h8.4v8.4zM21 11.4h-8.4V3H21v8.4zM11.4 21H3v-8.4h8.4V21zM21 21h-8.4v-8.4H21V21z" fill="white" />
                                </svg>
                            ),
                        },
                    ].map(({ label, icon }) => (
                        <button
                            key={label}
                            type="button"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 h-10 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors disabled:opacity-50"
                        >
                            {icon}
                            {label}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default SignIn;