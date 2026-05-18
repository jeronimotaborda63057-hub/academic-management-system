import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { NavGroup } from "../../../models/nav/NavGroup";
import { adminMenu, studentMenu, teacherMenu } from "./sidebarConfig";
import SidebarNavGroup from "./SidebarNavGroup";
import SidebarLogoutButton from "./SidebarLogoutButton";
import Logo from "../../../assets/logo.png";
import { useLogout } from "../../../hooks/useLogout";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
}

const getMenuByRole = (
    role: string | undefined
): { menu: NavGroup[]; color: string; light: string } => {
    switch (role) {
        case "ADMIN":
            return {
                menu: adminMenu,
                color: "text-green-600",
                light: "bg-green-100 text-green-700",
            };

        case "TEACHER":
            return {
                menu: teacherMenu,
                color: "text-purple-600",
                light: "bg-purple-100 text-purple-700",
            };

        case "STUDENT":
            return {
                menu: studentMenu,
                color: "text-purple-600",
                light: "bg-purple-100 text-purple-700",
            };

        default:
            return {
                menu: [],
                color: "text-gray-600",
                light: "bg-gray-100 text-gray-700",
            };
    }
};

function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const trigger = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);

    const user = useSelector((state: RootState) => state.user.user);
    const logout = useLogout();

    const { menu, color, light } = getMenuByRole(user?.role);

    const handleLogout = async () => {
        const didLogout = await logout();
        if (didLogout) {
            setSidebarOpen(false);
        }
    };

    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!sidebar.current || !trigger.current) return;

            if (
                !sidebarOpen ||
                sidebar.current.contains(target as Node) ||
                trigger.current.contains(target as Node)
            )
                return;

            setSidebarOpen(false);
        };

        document.addEventListener("click", clickHandler);

        return () =>
            document.removeEventListener("click", clickHandler);
    }, [sidebarOpen, setSidebarOpen]);

    useEffect(() => {
        const keyHandler = ({ key }: KeyboardEvent) => {
            if (!sidebarOpen || key !== "Escape") return;

            setSidebarOpen(false);
        };

        document.addEventListener("keydown", keyHandler);

        return () =>
            document.removeEventListener("keydown", keyHandler);
    }, [sidebarOpen, setSidebarOpen]);

    return (
        <>
            <div
                className={`absolute inset-0 z-9998 bg-black/50 lg:hidden transition-opacity duration-300 ${
                    sidebarOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside
                ref={sidebar}
                className={`absolute left-0 top-0 z-9999 flex h-screen w-64 flex-col overflow-y-hidden bg-white border-r border-gray-200 shadow-lg duration-300 ease-linear lg:static lg:translate-x-0 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 px-6 py-5 border-b border-gray-200">
                    <NavLink
                        to="/"
                        className="flex items-center gap-3"
                    >
                        <img
                            src={Logo}
                            alt="Logo"
                            className="h-8 w-auto"
                        />

                        <span className={`text-xl font-bold ${color}`}>
                            EduGest
                        </span>
                    </NavLink>

                    <button
                        ref={trigger}
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar sidebar"
                        className="block lg:hidden text-gray-500 hover:text-black transition-colors"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Inicio */}
                <div className="px-4 pt-5">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? light
                                    : "text-gray-700 hover:bg-gray-100"
                            }`
                        }
                    >
                        <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                        >
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>

                        Inicio
                    </NavLink>
                </div>

                {/* Menú */}
                <div className="no-scrollbar flex flex-col overflow-y-auto flex-1">
                    <nav className="py-4 px-4">
                        {menu.map((group) => (
                            <SidebarNavGroup
                                key={group.title}
                                title={group.title}
                                items={group.items}
                                role={user?.role}
                            />
                        ))}
                    </nav>
                </div>

                <div className="border-t border-gray-200 p-4">
                    <SidebarLogoutButton onLogout={handleLogout} />
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
