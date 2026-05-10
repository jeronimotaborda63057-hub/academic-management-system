import { NavLink } from 'react-router-dom';
import type { NavItem } from '../../models/NavItem';

interface SidebarNavGroupProps {
    title: string;
    items: NavItem[];
}

const SidebarNavGroup = ({ title, items }: SidebarNavGroupProps) => {
    return (
        <div className="mb-6">
            <h3 className="mb-4 ml-4 text-xs font-semibold uppercase tracking-wider text-bodydark2">
                {title}
            </h3>
            <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `group flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium duration-300 ease-in-out hover:bg-graydark text-bodydark1 ${
                                    isActive ? 'bg-graydark' : ''
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