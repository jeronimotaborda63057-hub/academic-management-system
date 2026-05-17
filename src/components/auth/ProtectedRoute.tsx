import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { securityService } from "../../services/auth/securityService";

const ProtectedRoute = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const isAuth = user !== null || securityService.isAuthenticated();
    return isAuth ? <Outlet /> : <Navigate to="/auth/signin" replace />;
};

export default ProtectedRoute;