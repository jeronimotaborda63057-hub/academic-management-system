import { lazy, Suspense, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import routes from './routes';
import RoleGuard from './components/RoleGuard';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));
const SignIn = lazy(() => import('./pages/authentication/SignIn'));
const SignUp = lazy(() => import('./pages/authentication/SignUp'));
const Home = lazy(() => import('./pages/home/Home'));

// BUG 3 CORREGIDO: se eliminó el <Provider store={store}> duplicado.
// main.tsx ya envuelve toda la app con <Provider store={store}>.
// Tener dos Provider anidados crea dos instancias separadas del store de Redux:
// useLogin despachaba setUser() al store "hijo" pero ProtectedRoute leía
// del store "padre" — el usuario nunca aparecía autenticado tras el login social.
function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark-2">
                <Loader className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
                {/* Rutas públicas — sin layout */}
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />

                {/* Rutas protegidas — con layout */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/"
                        element={
                            <Suspense fallback={<Loader />}>
                                <DefaultLayout />
                            </Suspense>
                        }
                    >
                        <Route
                            index
                            element={
                                <Suspense fallback={<Loader />}>
                                    <Home />
                                </Suspense>
                            }
                        />
                        {routes.map((route, index) => {
                            const { path, component: Component, roles } = route;
                            const page = (
                                <Suspense fallback={<Loader />}>
                                    <Component />
                                </Suspense>
                            );

                            return (
                                <Route
                                    key={index}
                                    path={path}
                                    element={
                                        roles ? (
                                            <RoleGuard allowedRoles={roles}>
                                                {page}
                                            </RoleGuard>
                                        ) : page
                                    }
                                />
                            );
                        })}
                    </Route>
                </Route>
            </Routes>
        </>
    );
}

export default App;