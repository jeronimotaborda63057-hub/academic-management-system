import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ArchiveSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    subjectName: string;
    subjectCode: string;
}

const ArchiveSubjectModal: React.FC<ArchiveSubjectModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    subjectName,
    subjectCode,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />

            <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
                    <h2 className="text-base font-semibold text-black dark:text-white">
                        Archivar asignatura
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-4 px-6 py-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                        <AlertTriangle size={32} className="text-yellow-500" />
                    </div>

                    <h3 className="text-base font-semibold text-black dark:text-white text-center">
                        ¿Archivar esta asignatura?
                    </h3>

                    {/* ✅ HU-04 criterio 3: avisa que no podrá asociarse a grupos */}
                    <div className="w-full rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 px-4 py-3 flex flex-col gap-1">
                        <p className="text-sm font-medium text-black dark:text-white">
                            {subjectName} ({subjectCode})
                        </p>
                        <p className="text-xs text-gray-500 dark:text-bodydark2">
                            Una asignatura archivada no puede asociarse a nuevos grupos ni a nuevas versiones de un plan de estudios.
                        </p>
                    </div>

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
                </div>
            </div>
        </div>
    );
};

export default ArchiveSubjectModal;