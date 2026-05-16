import { NavLink } from 'react-router-dom';
import type { NavItem } from '../../../models/nav/NavItem';

interface SidebarNavGroupProps {
    title: string;
    items: NavItem[];
    role?: string;
}

const SidebarNavGroup = ({
    title,
    items,
    role,
}: SidebarNavGroupProps) => {

    const activeClass =
        role === "ADMIN"
            ? "bg-green-100 text-green-700"
            : "bg-purple-100 text-purple-700";

    return (
        <div className="mb-6">
            <h3 className="mb-4 ml-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                {title}
            </h3>

            <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-xl py-3 px-4 text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? activeClass
                                        : "text-gray-700 hover:bg-gray-100 hover:text-black"
                                }`
                            }
                        >
                            {item.icon}

                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SidebarNavGroup;
