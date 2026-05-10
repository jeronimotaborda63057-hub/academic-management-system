import React, { useState } from "react";

import {
  Pencil,
  MoreVertical,
  UserX,
  Eye,
} from "lucide-react";

interface Action {
  name: string;
  label: string;
}

interface Column {
  key: string;
  label: string;

  render?: (
    value: any,
    item: Record<string, any>
  ) => React.ReactNode;
}

interface GenericTableProps {
  data: Record<string, any>[];
  columns: Column[];
  actions: Action[];

  onAction: (
    name: string,
    item: Record<string, any>
  ) => void;
}

const GenericTable: React.FC<GenericTableProps> = ({
  data,
  columns,
  actions,
  onAction,
}) => {

  const [openMenu, setOpenMenu] =
    useState<number | null>(null);

  return (

    <div
      className="
        rounded-2xl
        border
        border-stroke
        bg-white
        shadow-sm
        overflow-visible
        dark:border-strokedark
        dark:bg-boxdark
      "
    >

      <div className="max-w-full overflow-x-auto">

        <table className="w-full">

          {/* HEADER */}
          <thead>

            <tr
              className="
                border-b
                border-stroke
                dark:border-strokedark
              "
            >

              {columns.map((col, index) => (

                <th
                  key={col.key}
                  className={`
                    py-4
                    px-4
                    text-left
                    text-sm
                    font-semibold
                    text-gray-600
                    dark:text-gray-300

                    ${index === 0
                      ? "pl-6"
                      : ""
                    }
                  `}
                >
                  {col.label}
                </th>
              ))}

              <th
                className="
                  py-4
                  px-4
                  text-left
                  text-sm
                  font-semibold
                  text-gray-600
                  dark:text-gray-300
                "
              >
                Acciones
              </th>

            </tr>

          </thead>

          {/* BODY */}
          <tbody>

            {data.map((item, index) => (

              <tr
                key={index}
                className="
                  border-b
                  border-stroke
                  transition
                  hover:bg-gray-50
                  dark:border-strokedark
                  dark:hover:bg-meta-4
                "
              >

                {/* COLUMNAS */}
                {columns.map((col, colIndex) => {

                  const value = item[col.key];

                  return (

                    <td
                      key={col.key}
                      className={`
                        py-4
                        px-4
                        text-sm
                        text-black
                        dark:text-white

                        ${colIndex === 0
                          ? "pl-6 font-medium"
                          : ""
                        }
                      `}
                    >

                      {col.render
                        ? col.render(value, item)
                        : (
                          <p>
                            {value ?? "-"}
                          </p>
                        )
                      }

                    </td>
                  );
                })}

                {/* ACTIONS */}
                <td className="py-4 px-4">

                  <div className="flex items-center gap-2">

                    {/* EDIT */}
                    <button
                      onClick={() =>
                        onAction("edit", item)
                      }
                      className="
                        rounded-lg
                        border
                        border-stroke
                        p-2
                        transition
                        hover:bg-gray-100
                        dark:border-strokedark
                        dark:hover:bg-meta-4
                      "
                      type="button"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* MENU */}
                    <div className="relative">

                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu === index
                              ? null
                              : index
                          )
                        }
                        className="
                          rounded-lg
                          border
                          border-stroke
                          p-2
                          transition
                          hover:bg-gray-100
                          dark:border-strokedark
                          dark:hover:bg-meta-4
                        "
                        type="button"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* DROPDOWN */}
                      {openMenu === index && (

                        <div
                          className="
                            absolute
                            top-full
                            right-0
                            z-50
                            mt-2
                            w-56
                            overflow-hidden
                            rounded-xl
                            border
                            border-stroke
                            bg-white
                            shadow-lg
                            dark:border-strokedark
                            dark:bg-boxdark
                          "
                        >

                          {/* EDITAR */}
                          <button
                            onClick={() => {
                              onAction("edit", item);

                              setOpenMenu(null);
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              px-4
                              py-3
                              text-sm
                              transition
                              hover:bg-gray-100
                              dark:hover:bg-meta-4
                            "
                            type="button"
                          >
                            <Pencil size={16} />

                            Editar usuario
                          </button>

                          {/* DESACTIVAR */}
                          <button
                            onClick={() => {
                              onAction(
                                "deactivate",
                                item
                              );

                              setOpenMenu(null);
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              px-4
                              py-3
                              text-sm
                              transition
                              hover:bg-gray-100
                              dark:hover:bg-meta-4
                            "
                            type="button"
                          >
                            <UserX size={16} />

                            Desactivar usuario
                          </button>

                          {/* VER DETALLE */}
                          <button
                            onClick={() => {
                              onAction("view", item);

                              setOpenMenu(null);
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-3
                              px-4
                              py-3
                              text-sm
                              transition
                              hover:bg-gray-100
                              dark:hover:bg-meta-4
                            "
                            type="button"
                          >
                            <Eye size={16} />

                            Ver detalle
                          </button>

                        </div>
                      )}

                    </div>

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