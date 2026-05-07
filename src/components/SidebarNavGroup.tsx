import { NavLink } from 'react-router-dom';

export interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface SidebarNavGroupProps {
    title: string;
    items: NavItem[];
}

const SidebarNavGroup = ({ title, items }: SidebarNavGroupProps) => {
    return (
        <div className="mb-6">
            {/* Título del grupo */}
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2 uppercase tracking-wider">
                {title}
            </h3>

            {/* Lista de botones */}
            <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${isActive ? 'bg-graydark dark:bg-meta-4' : ''
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