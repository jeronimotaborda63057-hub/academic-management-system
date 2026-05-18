interface AuthDividerProps {
    label?: string;
}

const AuthDivider = ({ label = "o" }: AuthDividerProps) => (
    <div className="mb-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-stroke dark:bg-strokedark" />
        <span className="text-xs font-medium uppercase text-gray-400">
            {label}
        </span>
        <span className="h-px flex-1 bg-stroke dark:bg-strokedark" />
    </div>
);

export default AuthDivider;
