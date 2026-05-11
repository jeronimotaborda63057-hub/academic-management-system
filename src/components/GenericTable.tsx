import React, { useState, type JSX } from "react";
import { MoreVertical } from "lucide-react";

export interface Action {
  name: string;
  label: string;
  icon: JSX.Element;
  variant?: "default" | "danger";
  primary?: boolean;
}

export interface Column {
  key: string;
  label: string;
  render?: (value: any, item: Record<string, any>) => React.ReactNode;
}

interface GenericTableProps {
  data: Record<string, any>[];
  columns: Column[];
  actions: Action[];
  primaryAction?: string; // nombre de la acción que va como botón directo (ej: "edit")
  onAction: (name: string, item: Record<string, any>) => void;
}

const GenericTable: React.FC<GenericTableProps> = ({
  data,
  columns,
  actions,
  primaryAction,
  onAction,
}) => {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // Separa la acción primaria (botón directo) del resto (dropdown)
  const primary = actions.find((a) => a.primary);
  const dropdownActions = actions.filter((a) => !a.primary);

  console.log(actions);
  console.log(primaryAction);

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-sm overflow-visible dark:border-strokedark dark:bg-boxdark">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full">

          {/* HEADER */}
          <thead>
            <tr className="border-b border-stroke dark:border-strokedark">
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  className={`py-4 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 ${index === 0 ? "pl-6" : ""}`}
                >
                  {col.label}
                </th>
              ))}
              <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-stroke transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key}
                    className={`py-4 px-4 text-sm text-black dark:text-white ${colIndex === 0 ? "pl-6 font-medium" : ""}`}
                  >
                    {col.render
                      ? col.render(item[col.key], item)
                      : <p>{item[col.key] ?? "-"}</p>
                    }
                  </td>
                ))}

                {/* ACCIONES */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">

                    {/* Acción primaria — botón directo */}
                    {primary && (
                      <button
                        onClick={() => onAction(primary.name, item)}
                        className="rounded-lg border border-stroke p-2 transition hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4"
                        type="button"
                        title={primary.label}
                      >
                        {primary.icon}
                      </button>
                    )}

                    {/* Resto de acciones — dropdown */}
                    {dropdownActions.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === index ? null : index)}
                          className="rounded-lg border border-stroke p-2 transition hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4"
                          type="button"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenu === index && (
                          <div className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
                            {dropdownActions.map((action) => (
                              <button
                                key={action.name}
                                onClick={() => {
                                  onAction(action.name, item);
                                  setOpenMenu(null);
                                }}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 transition
${action.variant === "danger"
                                    ? "text-red-600 hover:bg-red-50"
                                    : "hover:bg-gray-100 dark:hover:bg-meta-4"
                                  }`}
                              >
                                {action.icon}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenericTable;