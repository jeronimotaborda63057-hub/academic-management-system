import { useMemo, useState } from "react";

import type { Teacher } from "../../models/uml/Teacher";

interface TeacherSelectionPanelProps {
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  onSelectTeacher: (teacher: Teacher) => void;
  onNext: () => void;
  onBack: () => void;
}

const TeacherSelectionPanel = ({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  onNext,
  onBack,
}: TeacherSelectionPanelProps) => {
  const [search, setSearch] = useState("");

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const fullName = `
        ${teacher.first_name || ""}
        ${teacher.last_name || ""}
      `.toLowerCase();

      const searchText = search.toLowerCase();

      return (
        fullName.includes(searchText) ||
        teacher.identification
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [teachers, search]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">
            Seleccionar docente
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Busca y selecciona el docente que será
            asignado al grupo.
          </p>
        </div>

        <input
          type="text"
          placeholder="Buscar docente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-700 w-full md:w-72"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 w-16">
                Selección
              </th>
              <th className="text-left py-4 px-4">
                Código
              </th>
              <th className="text-left py-4 px-4">
                Nombre
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTeachers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  No se encontraron docentes.
                </td>
              </tr>
            )}

            {filteredTeachers.map((teacher) => {
              const isSelected =
                selectedTeacher?.id === teacher.id;

              return (
                <tr
                  key={teacher.id}
                  className={`
                    border-b border-gray-100 cursor-pointer transition-all
                    ${isSelected
                      ? "bg-green-50"
                      : "hover:bg-gray-50"
                    }
                  `}
                  onClick={() =>
                    onSelectTeacher(teacher)
                  }
                >
                  <td className="py-4 px-4">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() =>
                        onSelectTeacher(teacher)
                      }
                    />
                  </td>

                  <td className="py-4 px-4 font-medium">
                    {teacher.identification}
                  </td>

                  <td className="py-4 px-4">
                    {teacher.first_name}{" "}
                    {teacher.last_name}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onBack}
          className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-xl transition-all"
        >
          Volver
        </button>

        <button
          onClick={onNext}
          disabled={!selectedTeacher}
          className={`
            px-6 py-3 rounded-xl text-white transition-all
            ${selectedTeacher
              ? "bg-green-700 hover:bg-green-800"
              : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default TeacherSelectionPanel;
