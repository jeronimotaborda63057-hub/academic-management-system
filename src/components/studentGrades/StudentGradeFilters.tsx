import type { StudentGradeSummaryRow } from "../../models/StudenGradeSummaryRow";

interface SubjectOption {
    id: string;
    name: string;
}

interface StudentGradeFiltersProps {
    grades: StudentGradeSummaryRow[];
    subjects: SubjectOption[];
    selectedGradeId: string;
    selectedSubjectId: string;
    onSelectGrade: (gradeId: string) => void;
    onSelectSubject: (subjectId: string) => void;
}

export const StudentGradeFilters = ({
    grades,
    subjects,
    selectedGradeId,
    selectedSubjectId,
    onSelectGrade,
    onSelectSubject,
}: StudentGradeFiltersProps) => {
    const selectedGrade = grades.find(
        (grade) => grade.id === selectedGradeId
    );

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Asignatura
                    </label>

                    <select
                        value={selectedSubjectId}
                        onChange={(event) =>
                            onSelectSubject(event.target.value)
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-primary"
                    >
                        {subjects.map((subject) => (
                            <option
                                key={subject.id}
                                value={subject.id}
                            >
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Evaluación
                    </label>

                    <select
                        value={selectedGradeId}
                        onChange={(event) =>
                            onSelectGrade(event.target.value)
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-primary"
                    >
                        {grades.map((grade) => (
                            <option
                                key={grade.id}
                                value={grade.id}
                            >
                                {grade.evaluationName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Grupo
                    </label>

                    <input
                        value={selectedGrade?.groupName ?? ""}
                        readOnly
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Docente
                    </label>

                    <input
                        value={selectedGrade?.teacherName ?? ""}
                        readOnly
                        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
                    />
                </div>
            </div>
        </div>
    );
};