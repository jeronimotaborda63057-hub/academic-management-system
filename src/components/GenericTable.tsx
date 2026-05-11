import type { Action } from "../models/Action";
import type { Column } from "../models/Column";

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
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className="px-4 py-3 text-left">
                                {col.label}
                            </th>
                        ))}
                        {actions.length > 0 && (
                            <th className="px-4 py-3 text-left">Acciones</th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {(data ?? []).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t">
                            {columns.map((col, colIndex) => {
                                const value =
                                    typeof col.key === "string"
                                        ? (row as any)[col.key]
                                        : row[col.key];

                                return (
                                    <td key={colIndex} className="px-4 py-3">
                                        {col.render
                                            ? col.render(value, row)
                                            : value}
                                    </td>
                                );
                            })}

                            {actions.length > 0 && (
                                <td className="px-4 py-3 flex gap-2">
                                    {actions.map((action, i) => {
                                        const base =
                                            "px-2 py-1 rounded text-xs flex items-center gap-1";

                                        const style =
                                            action.variant === "danger"
                                                ? "bg-red-100 text-red-600"
                                                : action.primary
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-gray-100 text-gray-600";

                                        return (
                                            <button
                                                key={i}
                                                className={`${base} ${style}`}
                                                onClick={() =>
                                                    onAction?.(
                                                        action.name,
                                                        row
                                                    )
                                                }
                                            >
                                                {action.icon}
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default GenericTable;