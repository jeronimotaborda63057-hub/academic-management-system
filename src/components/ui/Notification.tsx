/**
 * Notification — componente de notificación unificado
 *
 * Reemplaza el uso disperso de react-hot-toast, sweetalert2 y FeedbackToast
 * para los casos que las HU/CU exigen notificación explícita al usuario:
 *
 *  • HU-05 / CU-05 — notifica al docente cuando se le asigna un grupo
 *  • HU-06 / CU-06 — notifica al estudiante cuando se le matricula en carrera
 *  • HU-07 / CU-07 — notifica al estudiante cuando se le inscribe en grupo
 *  • HU-11 / CU-11 — notifica al estudiante cuando el docente envía la calificación
 *
 * Uso:
 *   <Notification
 *     open={open}
 *     type="success"          // "success" | "error" | "warning" | "info"
 *     title="Título"
 *     message="Descripción opcional"
 *     onClose={() => setOpen(false)}
 *     duration={4500}         // ms; 0 = no auto-close
 *   />
 *
 *   O mediante el hook useNotification():
 *   const { notify, NotificationOutlet } = useNotification();
 *   notify({ type: "success", title: "Hecho" });
 *   return <>{...}<NotificationOutlet /></>;
 */

import { useEffect, useRef, useState } from "react";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    X,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationProps {
    /** Controla visibilidad */
    open: boolean;
    type?: NotificationType;
    title: string;
    message?: string;
    /** Milisegundos hasta cierre automático. 0 = manual. Default: 4500 */
    duration?: number;
    onClose: () => void;
}

// ─── Configuración visual por tipo ───────────────────────────────────────────

const CONFIG: Record<
    NotificationType,
    { icon: React.ElementType; border: string; iconClass: string; bg: string }
> = {
    success: {
        icon: CheckCircle2,
        border: "border-green-200",
        iconClass: "text-green-600",
        bg: "bg-white",
    },
    error: {
        icon: XCircle,
        border: "border-red-200",
        iconClass: "text-red-600",
        bg: "bg-white",
    },
    warning: {
        icon: AlertTriangle,
        border: "border-amber-200",
        iconClass: "text-amber-500",
        bg: "bg-white",
    },
    info: {
        icon: Info,
        border: "border-blue-200",
        iconClass: "text-blue-500",
        bg: "bg-white",
    },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export const Notification = ({
    open,
    type = "info",
    title,
    message,
    duration = 4500,
    onClose,
}: NotificationProps) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Barra de progreso
    const [progress, setProgress] = useState(100);
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!open) {
            setProgress(100);
            return;
        }

        if (duration === 0) return;

        // Progreso visual
        const steps = 60;
        const interval = duration / steps;
        let step = 0;

        progressRef.current = setInterval(() => {
            step++;
            setProgress(Math.max(0, 100 - (step / steps) * 100));
        }, interval);

        timerRef.current = setTimeout(() => {
            onClose();
        }, duration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
            setProgress(100);
        };
    }, [open, duration, onClose]);

    if (!open) return null;

    const { icon: Icon, border, iconClass, bg } = CONFIG[type];

    return (
        // Portal-style fixed overlay — aparece en esquina inferior derecha
        <div
            role="alert"
            aria-live="assertive"
            className={`
                fixed bottom-6 right-6 z-[9999]
                flex w-[min(400px,calc(100vw-2rem))] flex-col
                overflow-hidden rounded-xl border ${border} ${bg}
                shadow-xl
                animate-in slide-in-from-bottom-4 fade-in duration-300
            `}
        >
            {/* Cuerpo */}
            <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                <Icon size={22} className={`mt-0.5 shrink-0 ${iconClass}`} />

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {title}
                    </p>
                    {message && (
                        <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                            {message}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar notificación"
                    className="shrink-0 rounded-md p-0.5 text-gray-400 transition hover:text-gray-700 hover:bg-gray-100"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Barra de progreso */}
            {duration > 0 && (
                <div className="h-0.5 w-full bg-gray-100">
                    <div
                        className={`h-full transition-all ease-linear ${
                            type === "success"
                                ? "bg-green-500"
                                : type === "error"
                                ? "bg-red-500"
                                : type === "warning"
                                ? "bg-amber-400"
                                : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

// ─── Hook useNotification ─────────────────────────────────────────────────────

export interface NotifyOptions {
    type?: NotificationType;
    title: string;
    message?: string;
    duration?: number;
}

interface NotificationState extends NotifyOptions {
    open: boolean;
}

/**
 * Hook para disparar notificaciones de forma imperativa.
 *
 * @example
 * const { notify, NotificationOutlet } = useNotification();
 * // ...
 * notify({ type: "success", title: "Docente asignado", message: "Se notificó al docente." });
 * // En el JSX:
 * return <><main>...</main><NotificationOutlet /></>;
 */
export const useNotification = () => {
    const [state, setState] = useState<NotificationState>({
        open: false,
        title: "",
    });

    const notify = (options: NotifyOptions) => {
        setState({ ...options, open: true });
    };

    const close = () => setState((prev) => ({ ...prev, open: false }));

    const NotificationOutlet = () => (
        <Notification
            open={state.open}
            type={state.type}
            title={state.title}
            message={state.message}
            duration={state.duration}
            onClose={close}
        />
    );

    return { notify, NotificationOutlet };
};

export default Notification;