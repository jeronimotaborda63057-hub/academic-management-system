import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

import PageHeader from '../../components/ui/PageHeader';
import TableToolbar from '../../components/TableToolBar';
import GenericTable from '../../components/ui/GenericTable';

import { groupService } from '../../services/groupService';
import type { Group } from '../../models/uml/Group';
import type { Action } from '../../models/interfaces/Action';
import type { Column } from '../../models/interfaces/Column';

// Página de grupos del docente — punto de entrada al CU-12 (Registrar nota final)
const TeacherGroupsPage: React.FC = () => {
    const navigate = useNavigate();

    const [groups, setGroups] = useState<Group[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        groupService.getAll()
            .then(data => setGroups(data ?? []))
            .finally(() => setLoading(false));
    }, []);

    // ── Columnas de la tabla ────────────────────────────────────────────────
    const columns: Column<Group>[] = [
        { key: 'group_code', label: 'Código' },
        { key: 'name', label: 'Nombre' },
        {
            key: 'subject',
            label: 'Asignatura',
            render: (_value, row) =>
                row.subject ? `${row.subject.name} (${row.subject.code ?? ''})` : '—',
        },
        {
            key: 'semester',
            label: 'Semestre',
            render: (_value, row) => row.semester?.name ?? '—',
        },
        {
            key: 'semester',
            label: 'Estado',
            render: (_value, row) =>
                row.semester ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">
                        Activo
                    </span>
                ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                        Inactivo
                    </span>
                ),
        },
    ];

    // ── Acción: ir a registrar nota final ───────────────────────────────────
    const actions: Action[] = [
        {
            name: 'register',
            label: 'Registrar nota final',
            icon: <ClipboardList size={16} />,
            primary: true,
            variant: 'default',
        },
    ];

    const handleAction = (action: string, group: Group) => {
        if (action === 'register') {
            navigate(`/grades/register/${group.id}`);
        }
    };

    // ── Filtro local de búsqueda ────────────────────────────────────────────
    const filtered = groups.filter(g =>
        [g.group_code, g.name, g.subject?.name, g.semester?.name]
            .some(val => val?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <PageHeader
                title="Mis grupos"
                subtitle="Selecciona un grupo para registrar sus notas finales."
                breadcrumb={['Inicio', 'Grupos']}
            />

            <TableToolbar
                searchPlaceholder="Buscar por código, nombre, asignatura…"
                onSearchChange={setSearch}
                onClear={() => setSearch('')}
            />

            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cargando grupos…</p>
                </div>
            ) : (
                <GenericTable<Group>
                    data={filtered}
                    columns={columns}
                    actions={actions}
                    onAction={handleAction}
                />
            )}
        </div>
    );
};

export default TeacherGroupsPage;
