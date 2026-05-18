import type { StudentGradeSummaryRow } from "../../models/interfaces/StudenGradeSummaryRow";

interface StudentGradeFiltersProps {
    grades: StudentGradeSummaryRow[];
    selectedGradeId: string;
    onSelectGrade: (gradeId: string) => void;
}

export const StudentGradeFilters = ({
    grades,
    selectedGradeId,
    onSelectGrade,
}: StudentGradeFiltersProps) => {
    const selectedGrade = grades.find((grade) => grade.id === selectedGradeId);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500">
                        Asignatura
                    </label>
                    <select
                        value={selectedGradeId}
                        onChange={(event) => onSelectGrade(event.target.value)}
                        className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
                    >
                        {grades.map((grade) => (
                            <option key={grade.id} value={grade.id}>
                                {grade.subjectName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500">
                        Evaluacion
                    </label>
                    <select
                        value={selectedGradeId}
                        onChange={(event) => onSelectGrade(event.target.value)}
                        className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
                    >
                        {grades.map((grade) => (
                            <option key={grade.id} value={grade.id}>
                                {grade.evaluationName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500">
                        Grupo
                    </label>
                    <input
                        value={selectedGrade?.groupName ?? ""}
                        readOnly
                        className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500">
                        Docente
                    </label>
                    <input
                        value={selectedGrade?.teacherName ?? ""}
                        readOnly
                        className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none"
                    />
                </div>
            </div>
        </div>
    );
};
