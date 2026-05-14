// src/components/FormLayout.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";

// ─────────────────────────────────────────────────────────────
//  Props
//
//  ISP: se definen solo las props que el consumidor necesita.
//  No se expone lógica interna.
// ─────────────────────────────────────────────────────────────

interface FormLayoutProps {
    /** Título de la página */
    title: string;

    /** Subtítulo descriptivo */
    subtitle: string;

    /** Migas de pan */
    breadcrumb: string[];

    /** Handler del submit del formulario */
    onSubmit: (e: React.FormEvent) => void;

    /** Handler cancelar (default: navigate(-1)) */
    onCancel?: () => void;

    /** Etiqueta botón cancelar */
    cancelLabel?: string;

    /** Etiqueta botón submit */
    submitLabel?: string;

    /** Estado de carga — deshabilita el submit */
    isLoading?: boolean;

    /** Campos del formulario */
    children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────
//  FormLayout
//
//  SRP  → envuelve layout, header y botones de acción.
//          No sabe nada de validaciones ni de modelos.
//  OCP  → se extiende via children; no se modifica para
//          nuevos formularios.
//  LSP  → no rompe contratos de ningún sub-componente.
//  ISP  → props mínimas y todas opcionales con defaults.
//  DIP  → depende de PageHeader (abstracción), no de rutas
//          concretas (usa navigate(-1) por defecto).
// ─────────────────────────────────────────────────────────────

const FormLayout: React.FC<FormLayoutProps> = ({
    title,
    subtitle,
    breadcrumb,
    onSubmit,
    onCancel,
    cancelLabel = "Cancelar",
    submitLabel = "Guardar",
    isLoading   = false,
    children,
}) => {

    const navigate = useNavigate();

    /** Cancelar: usa el callback o retrocede en historial */
    const handleCancel = onCancel ?? (() => navigate(-1));

    return (
        <div>

            {/* ===== HEADER ===== */}
            <PageHeader
                title={title}
                subtitle={subtitle}
                breadcrumb={breadcrumb}
            />

            {/* ===== FORM ===== */}
            <form
                onSubmit={onSubmit}
                className="
                    bg-white dark:bg-boxdark
                    rounded-2xl
                    border border-stroke dark:border-strokedark
                    p-6
                    flex flex-col
                    gap-4
                "
            >
                {/* Campos — definidos por el consumidor */}
                {children}

                {/* ===== ACCIONES ===== */}
                <div className="flex justify-end gap-3 pt-2 border-t border-stroke dark:border-strokedark">

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="
                            h-11 px-6
                            rounded-xl
                            border border-stroke dark:border-strokedark
                            text-sm text-black dark:text-white
                            hover:bg-gray-50 dark:hover:bg-meta-4
                            transition
                        "
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="
                            h-11 px-6
                            rounded-xl
                            bg-green-600
                            text-white text-sm font-medium
                            hover:bg-green-700
                            transition
                            disabled:opacity-60
                        "
                    >
                        {isLoading ? "Guardando..." : submitLabel}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default FormLayout;