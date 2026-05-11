import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import Logo from '../../assets/logo.png';
import { adminMenu, studentMenu, teacherMenu } from "./sidebarConfig";
import SidebarNavGroup from "./SidebarNavGroup";
import type { NavGroup } from "../../models/nav/NavGroup";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
}

// Devuelve el menú y color según el rol del usuario
const getMenuByRole = (role: string | undefined): { menu: NavGroup[]; color: string } => {
    switch (role) {
        case "ADMIN":
            return { menu: adminMenu, color: "bg-white" };
        case "TEACHER":
            return { menu: teacherMenu, color: "bg-white" };
        case "STUDENT":
            return { menu: studentMenu, color: "bg-white" };
        default:
            return { menu: [], color: "bg-white" };
    }
};

function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const trigger = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);

    // Obtenemos el rol del usuario desde Redux
    const user = useSelector((state: RootState) => state.user.user);
    const { menu } = getMenuByRole(user?.role);

    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!sidebar.current || !trigger.current) return;
            if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
            setSidebarOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    }, [sidebarOpen, setSidebarOpen]);

    useEffect(() => {
        const keyHandler = ({ key }: KeyboardEvent) => {
            if (!sidebarOpen || key !== 'Escape') return;
            setSidebarOpen(false);
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
    }, [sidebarOpen, setSidebarOpen]);

    return (
        <>
            {/* Overlay mobile */}
            <div
                className={`absolute inset-0 z-9998 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside
                ref={sidebar}
                className={`absolute left-0 top-0 z-9999 flex h-screen w-64 flex-col overflow-y-hidden bg-white border-r border-stroke dark:bg-boxdark dark:border-strokedark duration-300 ease-linear lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header — Logo */}
                <div className="flex items-center justify-between gap-2 px-6 py-5 border-b border-stroke dark:border-strokedark">
                    <NavLink to="/" className="flex items-center gap-2">
                        <img src={Logo} alt="Logo" className="h-8 w-auto" />
                        <span className="text-lg font-bold text-black dark:text-white">EduGest</span>
                    </NavLink>

                    <button
                        ref={trigger}
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar sidebar"
                        className="block lg:hidden text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Inicio — siempre visible */}
                <div className="px-4 pt-5">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-primary bg-opacity-10 text-primary"
                                    : "text-gray-600 dark:text-bodydark1 hover:bg-gray-100 dark:hover:bg-graydark"
                            }`
                        }
                    >
                        <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                        Inicio
                    </NavLink>
                </div>

                {/* Menú dinámico por rol */}
                <div className="no-scrollbar flex flex-col overflow-y-auto flex-1">
                    <nav className="py-4 px-4">
                        {menu.map((group) => (
                            <SidebarNavGroup
                                key={group.title}
                                title={group.title}
                                items={group.items}
                            />
                        ))}
                    </nav>
                </div>

                {/* Footer — Colapsar */}
                <div className="border-t border-stroke dark:border-strokedark px-6 py-4">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                        Colapsar menú
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;