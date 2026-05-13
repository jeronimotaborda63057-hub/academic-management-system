import { useMemo, useState } from "react";

import type { Group } from "../../models/Group";

interface GroupSelectionTableProps {
  groups: Group[];
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
  onNext: () => void;
  onBack: () => void;
}

const GroupSelectionTable = ({
  groups,
  selectedGroup,
  onSelectGroup,
  onNext,
  onBack,
}: GroupSelectionTableProps) => {
  const [search, setSearch] = useState("");
    //useMemo sirve para memorizar cálculos y evitar que se vuelvan a ejecutar innecesariamente en cada render.
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const searchText = search.toLowerCase();

      return (
        group.name?.toLowerCase().includes(searchText) ||
        group.group_code
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [groups, search]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">
            Seleccionar grupo
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Selecciona el grupo al cual deseas asignar
            un docente.
          </p>
        </div>

        <input
          type="text"
          placeholder="Buscar grupo..."
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
                Nombre
              </th>

              <th className="text-left py-4 px-4">
                Código
              </th>

              <th className="text-left py-4 px-4">
                Capacidad
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredGroups.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  No se encontraron grupos.
                </td>
              </tr>
            )}

            {filteredGroups.map((group) => {
              const isSelected =
                selectedGroup?.id === group.id;

              return (
                <tr
                  key={group.id}
                  className={`
                    border-b border-gray-100 cursor-pointer transition-all
                    ${
                      isSelected
                        ? "bg-green-50"
                        : "hover:bg-gray-50"
                    }
                  `}
                  onClick={() => onSelectGroup(group)}
                >
                  <td className="py-4 px-4">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() =>
                        onSelectGroup(group)
                      }
                    />
                  </td>

                  <td className="py-4 px-4 font-medium">
                    {group.name}
                  </td>

                  <td className="py-4 px-4">
                    {group.group_code}
                  </td>

                  <td className="py-4 px-4">
                    {group.capacity}
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
          disabled={!selectedGroup}
          className={`
            px-6 py-3 rounded-xl text-white transition-all
            ${
              selectedGroup
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

export default GroupSelectionTable;