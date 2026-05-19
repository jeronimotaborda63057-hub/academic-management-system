import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { firebaseAuthService } from "../firebase/firebaseAuth";
import { securityService } from "../services/auth/securityService";
import { clearUser } from "../store/userSlice";

export const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return useCallback(async () => {
        const { isConfirmed } = await Swal.fire({
            title: "Cerrar sesion",
            text: "Quieres salir de tu cuenta?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Si, cerrar sesion",
            cancelButtonText: "Cancelar",
        });

        if (!isConfirmed) return false;

        securityService.logout();
        dispatch(clearUser());

        try {
            await firebaseAuthService.signOut();
        } finally {
            navigate("/auth/signin", { replace: true });
        }
        return true;
    }, [dispatch, navigate]);
};
