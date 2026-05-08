import { Navigate, Outlet } from "react-router-dom";
import { LocalStorageProvider } from "../../storage/LocalStorageProvider";
import { type Teacher } from "../../models/Teacher";


const storage = new LocalStorageProvider();

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
    const teacher = storage.getItem("teacher") || null;

    if (!teacher) return false;

    try {
        const parsedTeacher : Teacher= JSON.parse(teacher);
        return !!parsedTeacher; // puedes validar más campos aquí si quieres
    } catch (error) {
        return false;
    }
};

// Componente de Ruta Protegida
const ProtectedRoute = () => {
    return isAuthenticated() ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

export default ProtectedRoute;