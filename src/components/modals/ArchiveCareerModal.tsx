import React from "react";
import { AlertTriangle, X } from "lucide-react";
import type { Semester } from "../../models/Semester";
import { formatDateOnly } from "../../utils/dateUtils";

interface ArchiveCareerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>; // ✅ agregado
    careerName: string;
    careerCode: string;
    activeSemesters: Semester[];
}

const ArchiveCareerModal: React.FC<ArchiveCareerModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    careerName,
    careerCode,
    activeSemesters,
}) => {
    if (!isOpen) return null;

    const hasActiveSemesters = activeSemesters.length > 0;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />

            <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
                    <h2 className="text-base font-semibold text-black dark:text-white">
                        Archivar carrera
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black dark:hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-4 px-6 py-6">

                    {/* Ícono advertencia */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                        <AlertTriangle size={32} className="text-yellow-500" />
                    </div>

                    <h3 className="text-base font-semibold text-black dark:text-white text-center">
                        ¿Estás seguro que deseas archivar esta carrera?
                    </h3>

                    {/* ✅ HU-02 criterio 3: bloquea si tiene semestres activos */}
                    {hasActiveSemesters ? (
                        <>
                            <p className="text-sm text-center text-gray-500 dark:text-bodydark2">
                                No se puede archivar porque tiene semestres activos asociados.
                            </p>

                            <div className="w-full rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 px-4 py-3 flex flex-col gap-2">
                                <p className="text-sm font-medium text-black dark:text-white">
                                    Carrera: {careerName} ({careerCode})
                                </p>
                                <p className="text-sm text-gray-600 dark:text-bodydark2">
                                    Semestres activos: {activeSemesters.length}
                                </p>
                                {activeSemesters.map((s) => (
                                    <p key={s.id} className="text-xs text-gray-500 dark:text-bodydark2">
                                        {s.name} ({formatDateOnly(s.start_date)} – {formatDateOnly(s.end_date)})
                                    </p>
                                ))}
                            </div>

                            {/* Solo cerrar si hay semestres activos */}
                            <button
                                onClick={onClose}
                                className="w-full h-11 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                            >
                                Cerrar
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-center text-gray-500 dark:text-bodydark2">
                                Esta acción dejará la carrera inactiva. No podrá ser usada en nuevos semestres.
                            </p>

                            {/* Cancelar y confirmar si no hay semestres activos */}
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-11 rounded-xl border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                                >
                                    Archivar
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ArchiveCareerModal;
