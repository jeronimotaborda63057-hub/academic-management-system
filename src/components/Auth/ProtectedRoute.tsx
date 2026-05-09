import { Navigate, Outlet } from "react-router-dom";
import { securityService } from "../../services/auth/securityService";

// Este componente actúa como un "guardia de seguridad" para las rutas privadas.
// Se coloca en App.tsx envolviendo las rutas que requieren sesión iniciada.
//
// Cómo funciona:
//   - Si el usuario ESTÁ autenticado → renderiza <Outlet />, que es la página que pidió.
//   - Si NO está autenticado → lo redirige al login automáticamente.
//
// <Outlet /> es un concepto de React Router: es el "hueco" donde se dibuja
// la página hija de la ruta. Si esta ruta es "/" y adentro hay "/students",
// el Outlet muestra el contenido de "/students".
//
// SRP: este componente solo decide si dejar pasar o redirigir.
// No sabe cómo verificar la sesión — eso lo delega a securityService.
const ProtectedRoute = () => {
    return securityService.isAuthenticated()
        ? <Outlet />
        : <Navigate to="/auth/signin" replace />;
    // `replace` evita que el login quede en el historial del navegador,
    // así el usuario no puede volver atrás con el botón "atrás" al logout.
};

export default ProtectedRoute;