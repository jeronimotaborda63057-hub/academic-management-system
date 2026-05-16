import { lazy, Suspense, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import ProtectedRoute from './components/auth/ProtectedRoute';
import routes from './routes';
import { UserSwitcher } from './components/UserSwitcher';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));
const SignIn = lazy(() => import('./pages/authentication/SignIn'));
const Home = lazy(() => import('./pages/home/Home'));

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
        <Provider store={store}>
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
                {/* ✅ Ruta pública — signin sin layout */}
                <Route path="/auth/signin" element={<SignIn />} />

                {/* ✅ Rutas protegidas — con layout */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={
                        <Suspense fallback={<Loader />}>
                            <DefaultLayout />
                        </Suspense>
                    }>
                        <Route
                            index
                            element={
                                <Suspense fallback={<Loader />}>
                                    <Home />
                                </Suspense>
                            }
                        />
                        {routes.map((route, index) => {
                            const { path, component: Component } = route;
                            return (
                                <Route
                                    key={index}
                                    path={path}
                                    element={
                                        <Suspense fallback={<Loader />}>
                                            <Component />
                                        </Suspense>
                                    }
                                />
                            );
                        })}
                    </Route>
                </Route>
            </Routes>
        </Provider>
    );
}

export default App;
