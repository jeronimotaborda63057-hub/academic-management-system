import GenericTable from "../ui/GenericTable";
import type { Column } from "../../models/Column";
import type { EnrollableGroupRow } from "../../models/EnrollableGroupRow";

interface GroupEnrollmentTableProps {
    groups: EnrollableGroupRow[];
    selectedGroupIds: string[];
    onToggleGroup: (groupId: string) => void;
}

export const GroupEnrollmentTable = ({
    groups,
    selectedGroupIds,
    onToggleGroup,
}: GroupEnrollmentTableProps) => {
    const columns: Column<EnrollableGroupRow>[] = [
        {
            key: "group",
            label: "Grupo",
            render: (_, row) => (
                <div>
                    <p className="font-medium text-gray-900">
                        {row.group.name ?? "Grupo sin nombre"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {row.group.group_code ?? row.group.id}
                    </p>
                </div>
            ),
        },
        {
            key: "subject",
            label: "Asignatura",
            render: (_, row) => (
                <div>
                    <p className="font-medium text-gray-900">
                        {row.subject?.name ?? "Asignatura no disponible"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {row.subject?.code ?? ""}
                    </p>
                </div>
            ),
        },
        {
            key: "credits",
            label: "Creditos",
        },
        {
            key: "availableSpots",
            label: "Cupos",
            render: (value: number, row) => `${value} / ${row.group.capacity ?? 0}`,
        },
        {
            key: "isInCareerPlan",
            label: "Plan",
            render: (value: boolean) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                        value
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                >
                    {value ? "Pertenece" : "Fuera del plan"}
                </span>
            ),
        },
        {
            key: "isAlreadyEnrolled",
            label: "Estado",
            render: (value: boolean, row) => {
                if (value) {
                    return (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            Ya inscrito
                        </span>
                    );
                }

                if (row.availableSpots <= 0) {
                    return (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            Sin cupo
                        </span>
                    );
                }

                return (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        Disponible
                    </span>
                );
            },
        },
        {
            key: "id",
            label: "Seleccionar",
            render: (_, row) => (
                <input
                    type="checkbox"
                    checked={selectedGroupIds.includes(row.id)}
                    disabled={row.isAlreadyEnrolled || row.availableSpots <= 0}
                    onChange={() => onToggleGroup(row.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
            ),
        },
    ];

    return (
        <GenericTable
            data={groups}
            columns={columns}
            hideMenuButton
        />
    );
};
