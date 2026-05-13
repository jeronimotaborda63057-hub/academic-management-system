export interface StepField {
    label: string;
    name: string;
    type: FieldType;
    required?: boolean;
    options?: { label: string; value: string }[];
}

export type FieldType = "text" | "email" | "password" | "select" | "date" | "number" | "textarea";