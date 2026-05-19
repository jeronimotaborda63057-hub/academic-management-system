import { CheckCircle2, X, XCircle } from "lucide-react";

import type { ToastState } from "../../models/interfaces/States";

interface FeedbackToastProps {
    onClose: () => void;
    toast: ToastState;
}

export const FeedbackToast = ({ onClose, toast }: FeedbackToastProps) => {
    if (!toast) return null;

    const isSuccess = toast.type === "success";
    const Icon = isSuccess ? CheckCircle2 : XCircle;

    return (
        <div
            className={`fixed bottom-6 left-1/2 z-[10000] flex w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 items-start gap-4 rounded-lg border bg-white p-4 shadow-xl ${isSuccess ? "border-green-100" : "border-red-100"
                }`}
        >
            <Icon
                size={22}
                className={isSuccess ? "text-green-700" : "text-red-700"}
            />
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
                <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="text-gray-500 transition hover:text-gray-900"
                aria-label="Cerrar notificacion"
            >
                <X size={18} />
            </button>
        </div>
    );
};
