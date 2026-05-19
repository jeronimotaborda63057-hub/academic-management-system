import type { ReactNode } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";

interface InfoBannerProps {
    children: ReactNode;
    title: string;
    tone: "error" | "info" | "warning";
}

export const InfoBanner = ({ children, title, tone }: InfoBannerProps) => {
    const toneClass = {
        error: "border-red-200 bg-red-50 text-red-700",
        info: "border-blue-200 bg-blue-50 text-blue-800",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
    }[tone];

    const Icon = tone === "error" ? XCircle : tone === "warning" ? AlertTriangle : Info;

    return (
        <div className={`mt-4 rounded-lg border px-4 py-3 ${toneClass}`}>
            <div className="flex gap-3 text-sm">
                <Icon size={17} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 leading-5">{children}</p>
                </div>
            </div>
        </div>
    );
};
