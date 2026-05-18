import type { FilterOption } from "./FilterOption";

export interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
}