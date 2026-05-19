import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalShellProps {
    children: ReactNode;
    onClose: () => void;
    title: string;
}

export const ModalShell = ({ children, onClose, title }: ModalShellProps) => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                    aria-label="Cerrar"
                >
                    <X size={18} />
                </button>
            </div>
            {children}
        </div>
    </div>
);
