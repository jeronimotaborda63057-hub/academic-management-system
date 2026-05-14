import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import type { Action } from "../../models/Action";
import type { Column } from "../../models/Column";

export type ActionVariant = "default" | "danger";

interface GenericTableProps<T> {
    data: T[];
    columns: Column<T>[];
    actions?: Action[];
    onAction?: (action: string, item: T) => void;
}

function GenericTable<T>({
    data,
    columns,
    actions = [],
    onAction,
}: GenericTableProps<T>) {
    const [openMenu, setOpenMenu] = useState<number | null>(null);

    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
    });

    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpenMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const toggleMenu = (
        rowIndex: number,
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        if (openMenu === rowIndex) {
            setOpenMenu(null);
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        setMenuPosition({
            top: rect.bottom + 8,
            left: rect.right - 220,
        });

        setOpenMenu(rowIndex);
    };

    return (
        <div className="overflow-x-auto overflow-y-visible bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="px-4 py-3 text-left"
                            >
                                {col.label}
                            </th>
                        ))}

                        {actions.length > 0 && (
                            <th className="px-4 py-3 text-left">
                                Acciones
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {(data ?? []).map((row, rowIndex) => {
                        const primaryAction = actions.find(
                            (a) => a.primary
                        );

                        const secondaryActions = actions.filter(
                            (a) => !a.primary
                        );

                        return (
                            <tr
                                key={rowIndex}
                                className="border-t"
                            >
                                {columns.map((col, colIndex) => {
                                    const value =
                                        typeof col.key === "string"
                                            ? (row as any)[col.key]
                                            : row[col.key];

                                    return (
                                        <td
                                            key={colIndex}
                                            className="px-4 py-3"
                                        >
                                            {col.render
                                                ? col.render(
                                                      value,
                                                      row
                                                  )
                                                : value}
                                        </td>
                                    );
                                })}

                                {actions.length > 0 && (
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {/* BOTÓN PRINCIPAL */}
                                            {primaryAction && (
                                                <button
                                                    className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center transition"
                                                    onClick={() =>
                                                        onAction?.(
                                                            primaryAction.name,
                                                            row
                                                        )
                                                    }
                                                >
                                                    {
                                                        primaryAction.icon
                                                    }
                                                </button>
                                            )}

                                            {/* BOTÓN MENÚ */}
                                            {secondaryActions.length >
                                                0 && (
                                                <button
                                                    className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center transition"
                                                    onClick={(e) =>
                                                        toggleMenu(
                                                            rowIndex,
                                                            e
                                                        )
                                                    }
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                            )}
                                        </div>

                                        {/* DROPDOWN GLOBAL */}
                                        {openMenu === rowIndex && (
                                            <div
                                                ref={menuRef}
                                                className="fixed w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden"
                                                style={{
                                                    top: menuPosition.top,
                                                    left: menuPosition.left,
                                                }}
                                            >
                                                {secondaryActions.map(
                                                    (
                                                        action,
                                                        i
                                                    ) => {
                                                        const textStyle =
                                                            action.variant ===
                                                            "danger"
                                                                ? "text-red-600 hover:bg-red-50"
                                                                : "text-gray-700 hover:bg-gray-50";

                                                        return (
                                                            <button
                                                                key={
                                                                    i
                                                                }
                                                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${textStyle}`}
                                                                onClick={() => {
                                                                    onAction?.(
                                                                        action.name,
                                                                        row
                                                                    );

                                                                    setOpenMenu(
                                                                        null
                                                                    );
                                                                }}
                                                            >
                                                                {
                                                                    action.icon
                                                                }

                                                                <span>
                                                                    {
                                                                        action.label
                                                                    }
                                                                </span>
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default GenericTable;