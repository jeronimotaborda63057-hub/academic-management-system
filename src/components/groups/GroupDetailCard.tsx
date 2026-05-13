import type { Group } from "../../models/Group";
import type { Semester } from "../../models/Semester";
import type { Teacher } from "../../models/Teacher";
import type { Subject } from "../../models/Subject";

interface GroupDetailsCardProps {
  group: Group | null;
  semester: Semester | null;
  teachers: Teacher[];
  subjects: Subject[];
}

const GroupDetailsCard = ({
  group,
  semester,
  teachers,
  subjects,
}: GroupDetailsCardProps) => {
  const subject = subjects.find(
    (subject) => subject.id === group?.subject_id
  );

  const teacher = teachers.find(
    (teacher) => teacher.id === group?.teacher_id
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-6">
      <h2 className="text-lg font-semibold mb-6">
        Resumen
      </h2>

      {!group && (
        <div className="text-sm text-gray-500">
          Selecciona un grupo para visualizar su
          información.
        </div>
      )}

      {group && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">
              Grupo
            </p>

            <p className="font-medium text-gray-900">
              {group.name}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">
              Código
            </p>

            <p className="font-medium text-gray-900">
              {group.group_code}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">
              Capacidad
            </p>

            <p className="font-medium text-gray-900">
              {group.capacity} estudiantes
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">
              Semestre
            </p>

            <p className="font-medium text-gray-900">
              {semester?.name || "No definido"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">
              Asignatura
            </p>

            <div className="flex flex-col">
              <p className="font-medium text-gray-900">
                {subject?.name || "No definida"}
              </p>

              {subject?.code && (
                <span className="text-sm text-gray-500">
                  {subject.code}
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">
              Docente actual
            </p>

            <p className="font-medium text-gray-900">
              {teacher
                ? `${teacher.first_name} ${teacher.last_name}`
                : "Sin asignar"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsCard;