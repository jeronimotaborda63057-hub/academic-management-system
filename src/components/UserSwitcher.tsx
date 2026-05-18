import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { User } from "../models/User";
import { userService } from "../services/userService";
import type { RootState } from "../store/store";
import { setUser } from "../store/userSlice";

const ROLE_CONFIG = {
    ADMIN: {
        label: "Admin",
        title: "Admins",
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700 border-rose-200",
    },
    TEACHER: {
        label: "Docente",
        title: "Docentes",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
    },
    STUDENT: {
        label: "Estudiante",
        title: "Estudiantes",
        dot: "bg-sky-500",
        badge: "bg-sky-50 text-sky-700 border-sky-200",
    },
} as const;

const ROLE_ORDER: User["role"][] = ["ADMIN", "TEACHER", "STUDENT"];

const getUserLabel = (user: User) => {
    if (user.role === "ADMIN") return user.code;

    const fullName = [
        user.profile?.first_name,
        user.profile?.last_name,
    ].filter(Boolean).join(" ");

    return fullName || user.code;
};

export function UserSwitcher() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.user.user);
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!import.meta.env.DEV) return;

        const loadUsers = async () => {
            setLoading(true);
            const data = await userService.getAll();
            setUsers(data);
            setLoading(false);
        };

        loadUsers();
    }, []);

    const handleSwitch = (user: User) => {
        localStorage.setItem("access_token", "dev-token");
        localStorage.setItem("token_type", "bearer");
        dispatch(setUser(user));
        setOpen(false);
        navigate("/");
    };

    const grouped = ROLE_ORDER.map((role) => ({
        role,
        users: users.filter((user) => user.role === role),
    }));

    const currentConfig = currentUser ? ROLE_CONFIG[currentUser.role] : null;

    if (!import.meta.env.DEV) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
            {open && (
                <div className="w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Cambiar usuario de prueba
                            </p>
                        </div>
                    </div>

                    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                        {loading && (
                            <div className="rounded-xl bg-gray-50 px-3 py-4 text-sm text-gray-500">
                                Cargando usuarios...
                            </div>
                        )}

                        {!loading && users.length === 0 && (
                            <div className="rounded-xl bg-gray-50 px-3 py-4 text-sm text-gray-500">
                                No hay usuarios disponibles.
                            </div>
                        )}

                        {!loading && grouped.map(({ role, users }) => {
                            const config = ROLE_CONFIG[role];

                            if (users.length === 0) return null;

                            return (
                                <div key={role}>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        {config.title}
                                    </p>

                                    <div className="space-y-1">
                                        {users.map((user) => {
                                            const isActive = currentUser?.id === user.id;

                                            return (
                                                <button
                                                    key={user.id}
                                                    type="button"
                                                    onClick={() => handleSwitch(user)}
                                                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${isActive
                                                            ? "border-primary bg-green-50"
                                                            : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />

                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold text-gray-900">
                                                            {getUserLabel(user)}
                                                        </span>

                                                        <span className="block truncate text-xs text-gray-500">
                                                            {user.email}
                                                        </span>
                                                    </span>

                                                    {isActive && (
                                                        <span className="text-xs font-medium text-primary">
                                                            Actual
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-lg transition hover:border-primary"
            >
                {currentConfig ? (
                    <>
                        <span className={`h-2.5 w-2.5 rounded-full ${currentConfig.dot}`} />
                        <span>{currentUser?.role === "ADMIN" ? currentUser.code : getUserLabel(currentUser!)}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${currentConfig.badge}`}>
                            {currentConfig.label}
                        </span>
                    </>
                ) : (
                    <span className="text-gray-500">Sin usuario</span>
                )}
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition ${open ? "rotate-180" : ""}`}
                />
            </button>
        </div>
    );
}
