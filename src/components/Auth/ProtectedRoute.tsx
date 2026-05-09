import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { UserRole } from "../../models/User";
import { securityService } from "../../services/auth/securityService";

interface Props {
    allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
    const user = useSelector((state: RootState) => state.user.user);

    // Verifica AMBAS cosas:
    // 1. Que exista el objeto user en Redux
    // 2. Que exista el token en localStorage
    if (!user || !securityService.isAuthenticated()) {
        return <Navigate to="/auth/signin" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;