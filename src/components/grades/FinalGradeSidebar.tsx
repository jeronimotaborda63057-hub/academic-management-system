import type { Group } from "../../models/uml/Group";
import type { Semester } from "../../models/uml/Semester";

interface FinalGradeSidebarProps {
    activeSemester?: Semester;
    groups: Group[];
    selectedGroupIsInActiveSemester: boolean;
    selectedGroupId: string;
    onGroupChange: (groupId: string) => void;
}

export const FinalGradeSidebar = ({
    activeSemester,
    groups,
    selectedGroupIsInActiveSemester,
    selectedGroupId,
    onGroupChange,
}: FinalGradeSidebarProps) => (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 space-y-5">
        <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase text-gray-400">Semestre activo</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                {activeSemester?.name ?? "Sin semestre activo"}
            </p>
            {activeSemester && (
                <p className="mt-1 text-xs text-gray-500">
                    {activeSemester.start_date} - {activeSemester.end_date}
                </p>
            )}
        </div>

        <div>
            <label className="text-xs font-semibold uppercase text-gray-400">
                Grupo
            </label>
            <select
                value={selectedGroupId}
                onChange={(event) => onGroupChange(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
                disabled={!activeSemester}
            >
                <option value="">Selecciona un grupo</option>
                {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                        {group.name ?? group.group_code ?? "Grupo sin nombre"}
                    </option>
                ))}
            </select>
            {selectedGroupId && !selectedGroupIsInActiveSemester && (
                <p className="mt-2 text-xs text-amber-600">
                    Este grupo no pertenece al semestre activo.
                </p>
            )}
        </div>
    </aside>
);
