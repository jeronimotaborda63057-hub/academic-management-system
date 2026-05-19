interface DetailRowProps {
    label: string;
    value: string;
}

export const DetailRow = ({ label, value }: DetailRowProps) => (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3">
        <dt className="font-semibold text-gray-900">{label}:</dt>
        <dd className="min-w-0 break-words text-gray-600">{value}</dd>
    </div>
);
