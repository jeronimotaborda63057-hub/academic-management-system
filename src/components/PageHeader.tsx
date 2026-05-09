// components/PageHeader.tsx
import { Link } from "react-router-dom";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    breadcrumb: string[];
    action?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, breadcrumb=[], action }: PageHeaderProps) => {
    return (
        <div className="flex items-start justify-between mb-6">

            {/* Izquierda — título y subtítulo */}
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-black dark:text-white">
                        {title}
                    </h1>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {subtitle}
                    </span>
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
                    {breadcrumb.map((item, index) => (
                        <span key={index} className="flex items-center gap-1">
                            {index < breadcrumb.length - 1 ? (
                                <>
                                    <span className="hover:text-primary cursor-pointer">{item}</span>
                                    <span>›</span>
                                </>
                            ) : (
                                <span className="text-black dark:text-white font-medium">{item}</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>

            {/* Derecha — acción opcional */}
            {action && <div>{action}</div>}
        </div>
    );
};

export default PageHeader;