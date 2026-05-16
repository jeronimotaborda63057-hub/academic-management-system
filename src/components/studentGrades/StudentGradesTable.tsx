import GenericTable from "../ui/GenericTable";
import type { Column } from "../../models/Column";
import type { StudentGradeSummaryRow } from "../../models/StudenGradeSummaryRow";
import { formatGradeDate, formatGradeScore } from "../../hooks/studentGradeDisplay";

interface StudentGradesTableProps {
    grades: StudentGradeSummaryRow[];
    selectedGradeId: string;
    onSelectGrade: (gradeId: string) => void;
}

const columns: Column<StudentGradeSummaryRow>[] = [
    {
        key: "evaluationName",
        label: "Evaluacion",
    },
    {
        key: "rubricTitle",
        label: "Rubrica",
    },
    {
        key: "finalScore",
        label: "Nota",
        render: (value: number) => (
            <span className="font-semibold text-primary">
                {formatGradeScore(value)}
            </span>
        ),
    },
    {
        key: "status",
        label: "Estado",
        render: (value: string) => (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {value}
            </span>
        ),
    },
    {
        key: "updatedAt",
        label: "Fecha",
        render: (value?: string) => formatGradeDate(value),
    },
];

export const StudentGradesTable = ({
    grades,
    selectedGradeId,
    onSelectGrade,
}: StudentGradesTableProps) => (
    <GenericTable
        data={grades}
        columns={columns}
        onRowClick={(row) => onSelectGrade(row.id)}
        selectedRowId={selectedGradeId}
        getRowId={(row) => row.id}
        hideMenuButton
    />
);
