import React from "react";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    breadcrumb?: string[];
    action?: React.ReactNode | React.ReactNode[];
}

const PageHeader = ({ title, subtitle, breadcrumb = [], action }: PageHeaderProps) => {
    return (
        <div className="flex items-center justify-between mb-6">

            {/* Izquierda — título + subtítulo */}
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-black dark:text-white">
                    {title}
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                </span>
            </div>

            {/* Derecha — breadcrumb + acción opcional */}
            <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-gray-400">
                    {breadcrumb.map((item, index) => (
                        <span key={index} className="flex items-center">
                            {index < breadcrumb.length - 1 ? (
                                <>
                                    <span className="hover:text-primary cursor-pointer">{item}</span>
                                    <span className="mx-1">›</span>
                                </>
                            ) : (
                                <span className="text-black dark:text-white font-medium">{item}</span>
                            )}
                        </span>
                    ))}
                </div>

                {action && <div>{action}</div>}
            </div>

        </div>
    );
};

export default PageHeader;
