import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { User } from "../../models/User";
import {
    firebaseAuthService,
    type SocialAuthProvider,
} from "../../services/auth/firebaseAuthService";
import {
    securityService,
    type EmailSignUpData,
} from "../../services/auth/securityService";
import { getAuthErrorMessage } from "../../services/auth/authErrorMessages";
import { setUser } from "../../store/userSlice";

interface LoginState {
    error: string | null;
    loading: boolean;
    loadingProvider: SocialAuthProvider | null;
}
export function useLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [state, setState] = useState<LoginState>({
        error: null,
        loading: false,
        loadingProvider: null,
    });

    const completeLogin = (user: User) => {
        setState({ error: null, loading: false, loadingProvider: null });
        dispatch(setUser(user));
        navigate("/");
    };

    const login = async (email: string, password: string) => {
        setState({ error: null, loading: true, loadingProvider: null });
        try {
            const user = await securityService.login(email, password);
            completeLogin(user);
        } catch (error) {
            setState({
                error: getAuthErrorMessage(error),
                loading: false,
                loadingProvider: null,
            });
        }
    };

    const loginWithProvider = async (provider: SocialAuthProvider) => {
        setState({ error: null, loading: true, loadingProvider: provider });
        try {
            const firebaseUser = await firebaseAuthService.signInWithProvider(provider);
            const user = await securityService.loginWithFirebase(firebaseUser);
            completeLogin(user);
        } catch (error) {
            setState({
                error: getAuthErrorMessage(error),
                loading: false,
                loadingProvider: null,
            });
        }
    };

    const signUpWithEmailPassword = async (data: EmailSignUpData) => {
        setState({ error: null, loading: true, loadingProvider: null });
        try {
            const user = await securityService.signUpWithEmailPassword(data);
            completeLogin(user);
        } catch (error) {
            setState({
                error: getAuthErrorMessage(error),
                loading: false,
                loadingProvider: null,
            });
        }
    };

    return { ...state, login, loginWithProvider, signUpWithEmailPassword };
}

