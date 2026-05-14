// src/components/tables/GenericTable.tsx

import { useEffect, useRef, useState } from "react";

import { MoreVertical } from "lucide-react";

import type { Action } from "../../models/Action";
import type { Column } from "../../models/Column";

export type ActionVariant =
    | "default"
    | "danger";

/**
 * Props tabla genérica
 */
interface GenericTableProps<T> {

    /**
     * Data tabla
     */
    data: T[];

    /**
     * Columnas
     */
    columns: Column<T>[];

    /**
     * Acciones
     */
    actions?: Action[];

    /**
     * Callback acciones
     */
    onAction?: (
        action: string,
        item: T
    ) => void;

    /**
     * NUEVO:
     * Ocultar botón menú (...)
     *
     * Permite reutilizar
     * GenericTable en escenarios
     * donde las acciones deben
     * verse directamente.
     */
    hideMenuButton?: boolean;
}

/**
 * Tabla genérica reutilizable.
 *
 * Responsabilidades:
 * - renderizar tablas
 * - renderizar acciones
 * - manejar dropdown
 *
 * NO:
 * - lógica negocio
 * - persistencia
 * - APIs
 *
 * Respeta:
 * - SRP
 * - Open/Closed
 * - DRY
 */
function GenericTable<T>({
    data,
    columns,

    actions = [],

    onAction,

    hideMenuButton = false
}: GenericTableProps<T>) {

    /**
     * Menú abierto
     */
    const [openMenu, setOpenMenu] =
        useState<number | null>(null);

    /**
     * Posición menú
     */
    const [menuPosition, setMenuPosition] =
        useState({
            top: 0,
            left: 0
        });

    /**
     * Ref menú
     */
    const menuRef =
        useRef<HTMLDivElement | null>(null);

    /**
     * Cerrar menú click outside
     */
    useEffect(() => {

        const handleClickOutside = (
            event: MouseEvent
        ) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpenMenu(null);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);

    /**
     * Toggle menú
     */
    const toggleMenu = (
        rowIndex: number,
        event: React.MouseEvent<HTMLButtonElement>
    ) => {

        if (openMenu === rowIndex) {

            setOpenMenu(null);

            return;
        }

        const rect =
            event.currentTarget.getBoundingClientRect();

        setMenuPosition({
            top: rect.bottom + 8,
            left: rect.right - 220
        });

        setOpenMenu(rowIndex);
    };

    return (

        <div
            className="
                overflow-x-auto
                overflow-y-visible
                bg-white
                rounded-xl
                shadow
            "
        >

            <table className="min-w-full text-sm">

                {/* ================= HEADER ================= */}

                <thead
                    className="
                        bg-gray-100
                        text-gray-600
                        uppercase
                        text-xs
                    "
                >

                    <tr>

                        {
                            columns.map((col, index) => (

                                <th
                                    key={index}
                                    className="
                                        px-4 py-3
                                        text-left
                                    "
                                >
                                    {col.label}
                                </th>
                            ))
                        }

                        {
                            actions.length > 0 && (

                                <th
                                    className="
                                        px-4 py-3
                                        text-left
                                    "
                                >
                                    Acciones
                                </th>
                            )
                        }

                    </tr>

                </thead>

                {/* ================= BODY ================= */}

                <tbody>

                    {
                        (data ?? []).map((
                            row,
                            rowIndex
                        ) => {

                            /**
                             * Acciones principales
                             */
                            const primaryActions =
                                actions.filter(
                                    (action) =>
                                        action.primary
                                );

                            /**
                             * Acciones secundarias
                             */
                            const secondaryActions =
                                actions.filter(
                                    (action) =>
                                        !action.primary
                                );

                            return (

                                <tr
                                    key={rowIndex}
                                    className="border-t"
                                >

                                    {/* Columnas */}
                                    {
                                        columns.map((
                                            col,
                                            colIndex
                                        ) => {

                                            const value =
                                                typeof col.key === "string"
                                                    ? (row as any)[col.key]
                                                    : row[col.key];

                                            return (

                                                <td
                                                    key={colIndex}
                                                    className="
                                                        px-4 py-3
                                                    "
                                                >

                                                    {
                                                        col.render
                                                            ? col.render(
                                                                value,
                                                                row
                                                            )
                                                            : value
                                                    }

                                                </td>
                                            );
                                        })
                                    }

                                    {/* ================= ACTIONS ================= */}

                                    {
                                        actions.length > 0 && (

                                            <td
                                                className="
                                                    px-4 py-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex items-center gap-2
                                                    "
                                                >

                                                    {/* PRIMARY ACTIONS */}
                                                    {
                                                        primaryActions.map(
                                                            (
                                                                action,
                                                                index
                                                            ) => (

                                                                <button
                                                                    key={index}
                                                                    className="
                                                                        w-9 h-9
                                                                        rounded-lg
                                                                        border border-gray-200
                                                                        bg-white
                                                                        hover:bg-gray-100
                                                                        flex items-center justify-center
                                                                        transition
                                                                    "
                                                                    onClick={() =>
                                                                        onAction?.(
                                                                            action.name,
                                                                            row
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        action.icon
                                                                    }

                                                                </button>
                                                            )
                                                        )
                                                    }

                                                    {/* MENU BUTTON */}
                                                    {
                                                        secondaryActions.length > 0 &&
                                                        !hideMenuButton && (

                                                            <button
                                                                className="
                                                                    w-9 h-9
                                                                    rounded-lg
                                                                    border border-gray-200
                                                                    bg-white
                                                                    hover:bg-gray-100
                                                                    flex items-center justify-center
                                                                    transition
                                                                "
                                                                onClick={(event) =>
                                                                    toggleMenu(
                                                                        rowIndex,
                                                                        event
                                                                    )
                                                                }
                                                            >

                                                                <MoreVertical size={18} />

                                                            </button>
                                                        )
                                                    }

                                                </div>

                                                {/* ================= DROPDOWN ================= */}

                                                {
                                                    openMenu === rowIndex && (

                                                        <div
                                                            ref={menuRef}
                                                            className="
                                                                fixed
                                                                w-56
                                                                bg-white
                                                                border border-gray-200
                                                                rounded-xl
                                                                shadow-xl
                                                                z-[9999]
                                                                overflow-hidden
                                                            "
                                                            style={{
                                                                top: menuPosition.top,
                                                                left: menuPosition.left
                                                            }}
                                                        >

                                                            {
                                                                secondaryActions.map(
                                                                    (
                                                                        action,
                                                                        index
                                                                    ) => {

                                                                        const textStyle =
                                                                            action.variant === "danger"
                                                                                ? "text-red-600 hover:bg-red-50"
                                                                                : "text-gray-700 hover:bg-gray-50";

                                                                        return (

                                                                            <button
                                                                                key={index}
                                                                                className={`
                                                                                    w-full
                                                                                    flex items-center gap-3
                                                                                    px-4 py-3
                                                                                    text-sm
                                                                                    transition
                                                                                    ${textStyle}
                                                                                `}
                                                                                onClick={() => {

                                                                                    onAction?.(
                                                                                        action.name,
                                                                                        row
                                                                                    );

                                                                                    setOpenMenu(null);
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
                                                                )
                                                            }

                                                        </div>
                                                    )
                                                }

                                            </td>
                                        )
                                    }

                                </tr>
                            );
                        })
                    }

                </tbody>

            </table>

        </div>
    );
}

export default GenericTable;