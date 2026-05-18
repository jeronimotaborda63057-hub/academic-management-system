interface AuthErrorAlertProps {
    message: string | null;
}

const AuthErrorAlert = ({ message }: AuthErrorAlertProps) => {
    if (!message) return null;

    return (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-700 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        </div>
    );
};

export default AuthErrorAlert;
