import { Navigate, Outlet } from "react-router-dom";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";

const storage = new LocalStorageProvider();

// Verifica si hay sesión activa buscando el access_token,
// que es la clave con la que securityService lo guarda.
const isAuthenticated = () => {
    return !!storage.getItem("access_token");
};

const ProtectedRoute = () => {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

export default ProtectedRoute;