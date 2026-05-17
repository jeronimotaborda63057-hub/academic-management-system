import type { ReactNode } from "react";

interface SectionCardProps {
    children: ReactNode;
}

export const SectionCard = ({ children }: SectionCardProps) => (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {children}
    </section>
);
