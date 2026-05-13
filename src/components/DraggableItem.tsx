import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableItemProps {
    id: string;
    disabled?: boolean;
    children: React.ReactNode;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, disabled = false, children }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        disabled,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`transition-shadow ${
                isDragging ? "shadow-lg" : ""
            } ${disabled ? "cursor-not-allowed" : "cursor-grab"}`}
        >
            {children}
        </div>
    );
};

export default DraggableItem;