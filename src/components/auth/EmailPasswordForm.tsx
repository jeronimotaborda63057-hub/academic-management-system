import type { FormEvent } from "react";

interface EmailPasswordFormProps {
    email: string;
    password: string;
    loading: boolean;
    loadingText: string;
    submitText: string;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: () => Promise<void>;
}

const EmailPasswordForm = ({
    email,
    password,
    loading,
    loadingText,
    submitText,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}: EmailPasswordFormProps) => {
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        await onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-bodydark2">
                    Correo institucional
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="correo@universidad.edu"
                    required
                    className="h-11 rounded-xl border border-stroke bg-white px-4 text-sm text-black outline-none transition-colors focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-bodydark2">
                    Contrasena
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="********"
                    required
                    className="h-11 rounded-xl border border-stroke bg-white px-4 text-sm text-black outline-none transition-colors focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-1 h-11 rounded-xl bg-black text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 dark:bg-primary"
            >
                {loading ? loadingText : submitText}
            </button>
        </form>
    );
};

export default EmailPasswordForm;
