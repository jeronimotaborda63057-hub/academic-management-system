import React, { useEffect, useMemo, useState } from "react";
import { Pencil, ClipboardList, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/ui/PageHeader";
import GenericTable from "../../components/ui/GenericTable";
import type { Column } from "../../models/interfaces/Column";
import type { Group } from "../../models/uml/Group";
import { groupService } from "../../services/groupService";

type GroupRow = Group;

const List: React.FC = () => {
    const navigate = useNavigate();

    const [groups, setGroups] = useState<GroupRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const data = await groupService.getAllWithAuth();
                if (mounted) setGroups(data ?? []);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const columns = useMemo<Column<GroupRow>[]>(
        () =>
            [
                {
                    key: "group_code",
                    label: "Código",
                },
                {
                    key: "name",
                    label: "Nombre",
                },
                {
                    key: "semester",
                    label: "Semestre",
                    render: (_value, row) => row.semester?.name ?? "-",
                },
                {
                    key: "teacher",
                    label: "Docente",
                    render: (_value, row) =>
                        row.teacher
                            ? `${row.teacher.first_name} ${row.teacher.last_name}`.trim()
                            : "-",
                },
            ],
        []
    );

    return (
        <div>
            <PageHeader
                title="Grupos"
                subtitle="Listado de grupos por semestre"
                action={
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/groups/create")}
                            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                            <ClipboardList size={16} />
                            Crear grupo
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/groups/assign-teacher")}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                        >
                            <UserPlus size={16} />
                            Asignar docente
                        </button>
                    </div>
                }
            />

            <GenericTable<GroupRow>
                data={loading ? [] : groups}
                columns={columns}
                getRowId={(g) => g.id}
                actions={[
                    {
                        name: "edit",
                        label: "Editar",
                        icon: <Pencil size={16} />,
                        primary: true,
                    },
                ]}
                onAction={(action, item) => {
                    if (action === "edit") {
                        if (!item.id) return;
                        navigate(`/groups/edit/${item.id}`);
                    }
                }}
            />
        </div>
    );
};

export default List;

