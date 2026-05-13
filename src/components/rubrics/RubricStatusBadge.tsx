import React from "react";
import type { RubricStatus } from "../../models/Rubric";

/**
 * RubricStatusBadge — muestra el estado de la rúbrica visualmente.
 *
 * Principio SOLID:
 *  - SRP: solo renderiza un badge de estado. No hace nada más.
 */

interface RubricStatusBadgeProps {
    status?: RubricStatus;
    isArchived?: boolean;
}

const RubricStatusBadge: React.FC<RubricStatusBadgeProps> = ({ status, isArchived }) => {
    if (isArchived) {
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                Archivada
            </span>
        );
    }

    if (status === "published") {
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Publicada
            </span>
        );
    }

    return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Borrador
        </span>
    );
};

export default RubricStatusBadge;