import React from "react";

interface RubricStatusBadgeProps {
    isPublic?: boolean;
    isArchived?: boolean;
}

const RubricStatusBadge: React.FC<RubricStatusBadgeProps> = ({ isPublic, isArchived }) => {
    if (isArchived) {
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                Archivada
            </span>
        );
    }
    if (isPublic) {
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