import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";
import Logo from '../assets/logo.png';
import SidebarNavGroup from "./SidebarNavGroup";

const menuItems = [
    {
        label: 'Calendar',
        path: '/calendar',
        icon: <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24"><path d="M7 2V4H17V2H19V4H22V22H2V4H5V2H7ZM20 10H4V20H20V10ZM6 12H11V17H6V12Z" /></svg>,
    },
    {
        label: 'Profile',
        path: '/profile',
        icon: <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12ZM12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" /></svg>,
    },
    {
        label: 'Tables',
        path: '/tables',
        icon: <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24"><path d="M3 3H21V21H3V3ZM5 5V10H10V5H5ZM12 5V10H19V5H12ZM5 12V19H10V12H5ZM12 12V19H19V12H12Z" /></svg>,
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24"><path d="M19.14 12.94C19.19 12.63 19.22 12.32 19.22 12C19.22 11.68 19.19 11.37 19.14 11.06L21.19 9.47C21.37 9.33 21.42 9.08 21.31 8.87L19.31 5.13C19.2 4.92 18.95 4.84 18.73 4.92L16.32 5.88C15.82 5.5 15.28 5.19 14.68 4.97L14.32 2.39C14.29 2.17 14.1 2 13.88 2H10.12C9.9 2 9.71 2.17 9.68 2.39L9.32 4.97C8.72 5.19 8.18 5.5 7.68 5.88L5.27 4.92C5.05 4.84 4.8 4.92 4.69 5.13L2.69 8.87C2.58 9.08 2.63 9.33 2.81 9.47L4.86 11.06C4.81 11.37 4.78 11.68 4.78 12C4.78 12.32 4.81 12.63 4.86 12.94L2.81 14.53C2.63 14.67 2.58 14.92 2.69 15.13L4.69 18.87C4.8 19.08 5.05 19.16 5.27 19.08L7.68 18.12C8.18 18.5 8.72 18.81 9.32 19.03L9.68 21.61C9.71 21.83 9.9 22 10.12 22H13.88C14.1 22 14.29 21.83 14.32 21.61L14.68 19.03C15.28 18.81 15.82 18.5 16.32 18.12L18.73 19.08C18.95 19.16 19.2 19.08 19.31 18.87L21.31 15.13C21.42 14.92 21.37 14.67 21.19 14.53L19.14 12.94ZM12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z" /></svg>,
    },
];

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (arg: boolean) => void;
}

function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
    const trigger = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);

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
                className={`absolute left-0 top-0 z-9999 flex h-screen w-64 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header del sidebar */}
                <div className="flex items-center justify-between gap-2 px-6 py-4">
                    <NavLink to="/">
                        <img src={Logo} alt="Logo" className="h-8 w-auto" />
                    </NavLink>

                    <button
                        ref={trigger}
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar sidebar"
                        className="block lg:hidden text-white hover:text-gray-300 transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Menú */}
                <div className="no-scrollbar flex flex-col overflow-y-auto">
                    <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
                        <SidebarNavGroup title="MENU" items={menuItems} />
                    </nav>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;