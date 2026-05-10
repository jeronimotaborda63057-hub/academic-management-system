export interface Career {
    id: string;
    name: string;
    code: string;
    description?: string; // ✅ el backend lo retorna
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type CareerForm = Omit<Career, "id" | "created_at" | "updated_at">;