import type { ReactNode } from "react";
import { Building2, GitBranch, Mail } from "lucide-react";

import type { SocialAuthProvider } from "../../firebase/firebaseAuth";

interface SocialProviderOption {
    icon: ReactNode;
    label: string;
    provider: SocialAuthProvider;
}

interface SocialAuthButtonsProps {
    disabled: boolean;
    loadingProvider: SocialAuthProvider | null;
    actionLabel: string;
    loadingLabel: string;
    onProviderSelect: (provider: SocialAuthProvider) => void;
}

const socialProviders: SocialProviderOption[] = [
    {
        provider: "google",
        label: "Google",
        icon: <Mail size={18} />,
    },
    {
        provider: "microsoft",
        label: "Microsoft",
        icon: <Building2 size={18} />,
    },
    {
        provider: "github",
        label: "GitHub",
        icon: <GitBranch size={18} />,
    },
];

const SocialAuthButtons = ({
    disabled,
    loadingProvider,
    actionLabel,
    loadingLabel,
    onProviderSelect,
}: SocialAuthButtonsProps) => (
    <div className="mb-5 grid grid-cols-1 gap-2">
        {socialProviders.map(({ icon, label, provider }) => (
            <button
                key={provider}
                type="button"
                disabled={disabled}
                onClick={() => onProviderSelect(provider)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
            >
                {icon}
                {loadingProvider === provider
                    ? `${loadingLabel} ${label}...`
                    : `${actionLabel} ${label}`}
            </button>
        ))}
    </div>
);

export default SocialAuthButtons;
