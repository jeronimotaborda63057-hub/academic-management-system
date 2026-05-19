export interface StepField {
    name: string;
    label: string;
    type: "text" | "email" | "password" | "select";
    required?: boolean;
    prefix?: string | ((values: Record<string, string>) => string); // 👈 puede ser función
    options?: { label: string; value: string }[];
}
export type FieldType = "text" | "email" | "password" | "select" | "date" | "number" | "textarea";