import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface FormFieldProps {
    children: ReactNode;
    error?: string;
    label: string;
    required?: boolean;
}

export const FormField = ({
    children,
    error,
    label,
    required,
}: FormFieldProps) => (
    <label className="block">
        <span className="mb-2 block text-sm font-semibold text-gray-900">
            {label}
            {required && <span className="text-red-500"> *</span>}
        </span>
        {children}
        {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
);

export const SelectShell = ({ children }: { children: ReactNode }) => (
    <div className="relative">
        {children}
        <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
    </div>
);

export const fieldClassName = (hasError: boolean): string =>
    `h-11 w-full appearance-none rounded-lg border bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-green-700 ${
        hasError ? "border-red-300" : "border-gray-200"
    }`;
