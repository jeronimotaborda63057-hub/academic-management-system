import { LogOut } from "lucide-react";

interface SidebarLogoutButtonProps {
    onLogout: () => void;
}

const SidebarLogoutButton = ({ onLogout }: SidebarLogoutButtonProps) => (
    <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700"
    >
        <LogOut size={18} />
        Cerrar sesion
    </button>
);

export default SidebarLogoutButton;
