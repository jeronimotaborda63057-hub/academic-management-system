/**
 * App.tsx — CORREGIDO
 *
 * Fix: <ErrorBoundary> estaba directamente dentro de <Routes>,
 * lo cual no está permitido. Ahora envuelve el `element` de cada Route.
 */

import { lazy, Suspense, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import RoleGuard from "./components/RoleGuard";
import routes from "./routes";

const DefaultLayout = lazy(() => import("./layout/DefaultLayout"));
const SignIn        = lazy(() => import("./pages/authentication/SignIn"));
const SignUp        = lazy(() => import("./pages/authentication/SignUp"));
const Home          = lazy(() => import("./pages/home/Home"));
const NotFound      = lazy(() => import("./pages/NotFound"));

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
        {/* Rutas públicas */}
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />

        {/* Rutas protegidas */}
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

            {/* ✅ FIX: ErrorBoundary ahora envuelve el `element` de cada Route,
                no el Route en sí. Routes solo acepta <Route> como hijos directos. */}
            {routes.map((route, index) => {
              const { path, component: Component, roles } = route;
              const page = (
                <ErrorBoundary>
                  <Suspense fallback={<Loader />}>
                    <Component />
                  </Suspense>
                </ErrorBoundary>
              );

              return (
                <Route
                  key={index}
                  path={path}
                  element={
                    roles ? (
                      <RoleGuard allowedRoles={roles}>{page}</RoleGuard>
                    ) : (
                      page
                    )
                  }
                />
              );
            })}

            {/* Ruta catch-all dentro del layout */}
            <Route
              path="*"
              element={
                <Suspense fallback={<Loader />}>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* Catch-all fuera del layout */}
        <Route
          path="*"
          element={
            <Suspense fallback={<Loader />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;