import type { JSX } from "react";

export type ActionVariant = "default" | "danger";

export interface Action{
    name: string;
    label: string;
    icon: JSX.Element;
    primary?: boolean;
    variant?: ActionVariant;
}