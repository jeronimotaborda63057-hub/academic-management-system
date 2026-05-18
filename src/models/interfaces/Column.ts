export interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: {
        bivarianceHack(value: unknown, row: T): React.ReactNode;
    }["bivarianceHack"];
}
