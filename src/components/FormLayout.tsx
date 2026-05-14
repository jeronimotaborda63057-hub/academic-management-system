import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "./common/PageHeader";

interface FormLayoutProps {
    title: string;
    subtitle: string;
    breadcrumb: string[];
    onSubmit: (e: React.FormEvent) => void;
    onCancel?: () => void;
    cancelLabel?: string;
    submitLabel?: string;
    isLoading?: boolean;
    children: React.ReactNode;
}

const FormLayout: React.FC<FormLayoutProps> = ({
    title,
    subtitle,
    breadcrumb,
    onSubmit,
    onCancel,
    cancelLabel = "Cancelar",
    submitLabel = "Guardar",
    isLoading = false,
    children,
}) => {
    const navigate = useNavigate();

    const handleCancel = onCancel ?? (() => navigate(-1));

    return (
        <div>
            <PageHeader
                title={title}
                subtitle={subtitle}
                breadcrumb={breadcrumb}
            />

            <form
                onSubmit={onSubmit}
                className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 flex flex-col gap-4"
            >
                {/* ✅ Los campos los pone quien use el componente */}
                {children}

                {/* Acciones — siempre iguales */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="h-11 px-6 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 px-6 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {isLoading ? "Guardando..." : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormLayout;