// src/components/groups/GroupDetailCard.tsx

import type { Group } from "../../models/Group";
import type { Semester } from "../../models/Semester";
import type { Teacher } from "../../models/Teacher";
import type { Subject } from "../../models/Subject";

import SummaryCard from "../ui/SummaryCard";

interface GroupDetailsCardProps {
    group: Group | null;
    semester: Semester | null;
    teachers: Teacher[];
    subjects: Subject[];
}

/**
 * Card resumen de grupos.
 *
 * Ahora reutiliza SummaryCard
 * para evitar duplicación.
 *
 * Esto respeta:
 * - SRP
 * - DRY
 * - Open/Closed
 */
const GroupDetailsCard = ({
    group,
    semester,
    teachers,
    subjects,
}: GroupDetailsCardProps) => {

    /**
     * Buscar asignatura asociada
     */
    const subject = subjects.find(
        (subject) => subject.id === group?.subject_id
    );

    /**
     * Buscar docente asociado
     */
    const teacher = teachers.find(
        (teacher) => teacher.id === group?.teacher_id
    );

    /**
     * Datos resumen
     */
    const summaryItems = group
        ? [
            {
                label: "Grupo",
                value: group.name || "-"
            },
            {
                label: "Código",
                value: group.group_code || "-"
            },
            {
                label: "Capacidad",
                value: `${group.capacity} estudiantes`
            },
            {
                label: "Semestre",
                value: semester?.name || "No definido"
            },
            {
                label: "Asignatura",
                value: subject?.name || "No definida",
                secondaryValue: subject?.code
            },
            {
                label: "Docente actual",
                value: teacher
                    ? `${teacher.first_name} ${teacher.last_name}`
                    : "Sin asignar"
            }
        ]
        : [];

    return (

        <SummaryCard
            title="Resumen"
            hasData={!!group}
            items={summaryItems}
            emptyMessage="
                Selecciona un grupo para visualizar su información.
            "
        />
    );
};

export default GroupDetailsCard;