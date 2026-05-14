import type { Group } from "../../models/Group";
import type { Teacher } from "../../models/Teacher";
import type { Semester } from "../../models/Semester";
import type { Subject } from "../../models/Subject";

interface AssignmentConfirmationProps {
    semester: Semester | null;
    group: Group | null;
    teacher: Teacher | null;
    subjects: Subject[];
    loading: boolean;
    onBack: () => void;
    onConfirm: () => void;
}

const AssignmentConfirmation = ({
    semester,
    group,
    teacher,
    subjects,
    loading,
    onBack,
    onConfirm,
}: AssignmentConfirmationProps) => {
    const subject = subjects.find(
        (subject) => subject.id === group?.subject_id
    );

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="mb-8">
                <h2 className="text-lg font-semibold">
                    Confirmar asignación
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Verifica la información antes de confirmar
                    la asignación del docente.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-2xl p-5">
                    <p className="text-xs uppercase text-gray-400 mb-2">
                        Grupo
                    </p>

                    <p className="font-semibold text-gray-900">
                        {group?.name || "-"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        Código: {group?.group_code || "-"}
                    </p>
                </div>

                <div className="border border-gray-200 rounded-2xl p-5">
                    <p className="text-xs uppercase text-gray-400 mb-2">
                        Semestre
                    </p>

                    <p className="font-semibold text-gray-900">
                        {semester?.name || "-"}
                    </p>
                </div>

                <div className="border border-gray-200 rounded-2xl p-5">
                    <p className="text-xs uppercase text-gray-400 mb-2">
                        Docente
                    </p>

                    <p className="font-semibold text-gray-900">
                        {teacher
                            ? `${teacher.first_name} ${teacher.last_name}`
                            : "-"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        {teacher?.identification || "-"}
                    </p>
                </div>

                <div className="border border-gray-200 rounded-2xl p-5">
                    <p className="text-xs uppercase text-gray-400 mb-2">
                        Asignatura
                    </p>

                    <p className="font-semibold text-gray-900">
                        {subject?.name || "No definida"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                        {subject?.code || "-"}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-8">
                <button
                    onClick={onBack}
                    disabled={loading}
                    className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                    Volver
                </button>

                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                    {loading
                        ? "Asignando..."
                        : "Confirmar asignación"}
                </button>
            </div>
        </div>
    );
};

export default AssignmentConfirmation;