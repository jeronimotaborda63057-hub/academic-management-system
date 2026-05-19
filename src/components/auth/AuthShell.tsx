import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import Logo from "../../assets/logo.png";

interface AuthShellProps {
    title: string;
    subtitle: string;
    footerText?: string;
    footerLinkLabel?: string;
    footerLinkTo?: string;
    children: ReactNode;
}

const AuthShell = ({
    title,
    subtitle,
    footerText,
    footerLinkLabel,
    footerLinkTo,
    children,
}: AuthShellProps) => (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-boxdark-2">
        <div className="w-full max-w-sm rounded-2xl border border-stroke bg-white p-8 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="mb-6 flex justify-center">
                <img src={Logo} alt="Logo" className="h-12 w-auto" />
            </div>

            <h1 className="mb-1 text-xl font-semibold text-black dark:text-white">
                {title}
            </h1>
            <p className="mb-6 text-sm text-body dark:text-bodydark2">
                {subtitle}
            </p>

            {children}

            {footerText && footerLinkLabel && footerLinkTo && (
                <p className="mt-5 text-center text-sm text-gray-500 dark:text-bodydark2">
                    {footerText}{" "}
                    <Link
                        to={footerLinkTo}
                        className="font-medium text-black hover:underline dark:text-white"
                    >
                        {footerLinkLabel}
                    </Link>
                </p>
            )}
        </div>
    </div>
);

export default AuthShell;
