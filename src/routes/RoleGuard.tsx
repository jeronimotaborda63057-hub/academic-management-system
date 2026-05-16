import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { UserRole } from "../models/User";
import type { RootState } from "../store/store";

interface RoleGuardProps {
    allowedRoles: UserRole[];
    children: ReactNode;
}

const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
    const user = useSelector((state: RootState) => state.user.user);

    if (!user) {
        return <Navigate to="/auth/signin" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
