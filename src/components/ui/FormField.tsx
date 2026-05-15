import React from "react";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

type FieldType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "checkbox";

interface SelectOption {
    label: string;
    value: string | number;
}

interface FormFieldProps {
    /** Tipo de campo */
    type: FieldType;

    /** Nombre del campo (attr name) */
    name: string;

    /** Etiqueta visible */
    label: string;

    /** Valor controlado */
    value?: string | number | boolean;

    /** Handler de cambio */
    onChange?: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;

    /** Mensaje de error de validación */
    error?: string;

    /** Hint debajo del campo */
    hint?: string;

    /** Placeholder (no aplica a checkbox) */
    placeholder?: string;

    /** Campo requerido */
    required?: boolean;

    /** Campo deshabilitado */
    disabled?: boolean;

    /** Opciones para select */
    options?: SelectOption[];

    /** Filas para textarea */
    rows?: number;

    /** Longitud máxima (textarea) */
    maxLength?: number;

    /** Min para number / date */
    min?: string | number;

    /** Max para number / date */
    max?: string | number;

    /** Muestra contador caracteres (solo textarea) */
    showCount?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Estilos base reutilizables
// ─────────────────────────────────────────────────────────────

const BASE_INPUT =
    "h-11 px-4 rounded-xl border border-stroke dark:border-strokedark " +
    "bg-white dark:bg-boxdark text-sm text-black dark:text-white " +
    "outline-none focus:border-primary transition-colors w-full";

const BASE_TEXTAREA =
    "px-4 py-3 rounded-xl border border-stroke dark:border-strokedark " +
    "bg-white dark:bg-boxdark text-sm text-black dark:text-white " +
    "outline-none focus:border-primary transition-colors resize-none w-full";

const LABEL_CLASS =
    "text-xs font-semibold text-gray-500 dark:text-bodydark2 uppercase tracking-wider";

const DISABLED_CLASS = "opacity-50 cursor-not-allowed";

// ─────────────────────────────────────────────────────────────
//  Sub-renderers  (cada uno respeta SRP)
// ─────────────────────────────────────────────────────────────

const InputField: React.FC<FormFieldProps> = ({
    type,
    name,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    min,
    max,
}) => (
    <input
        type={type}
        name={name}
        value={value as string | number}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className={`${BASE_INPUT} ${disabled ? DISABLED_CLASS : ""}`}
    />
);

const TextareaField: React.FC<FormFieldProps> = ({
    name,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    rows = 3,
    maxLength,
    showCount,
}) => (
    <>
        <textarea
            name={name}
            value={value as string}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={`${BASE_TEXTAREA} ${disabled ? DISABLED_CLASS : ""}`}
        />
        {showCount && maxLength && (
            <p className="text-xs text-right text-gray-400">
                {String(value ?? "").length}/{maxLength}
            </p>
        )}
    </>
);

const SelectField: React.FC<FormFieldProps> = ({
    name,
    value,
    onChange,
    required,
    disabled,
    options = [],
}) => (
    <select
        name={name}
        value={value as string | number}
        onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
        required={required}
        disabled={disabled}
        className={`${BASE_INPUT} ${disabled ? DISABLED_CLASS : ""}`}
    >
        <option value="">Seleccionar...</option>
        {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
        ))}
    </select>
);

const CheckboxField: React.FC<FormFieldProps> = ({
    name,
    label,
    value,
    onChange,
    disabled,
}) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
            type="checkbox"
            name={name}
            checked={value as boolean}
            onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
            disabled={disabled}
            className="w-4 h-4 accent-primary"
        />
        <span className="text-sm text-black dark:text-white">{label}</span>
    </label>
);

// ─────────────────────────────────────────────────────────────
//  Dispatch de tipo de campo
// ─────────────────────────────────────────────────────────────

const FIELD_MAP: Record<
    FieldType,
    React.FC<FormFieldProps>
> = {
    text:     InputField,
    email:    InputField,
    password: InputField,
    number:   InputField,
    date:     InputField,
    textarea: TextareaField,
    select:   SelectField,
    checkbox: CheckboxField,
};

// ─────────────────────────────────────────────────────────────
//  Componente principal
//
//  SRP  → solo orquesta label + campo + error + hint
//  OCP  → nuevos tipos se agregan en FIELD_MAP sin tocar FormField
//  LSP  → cada sub-renderer implementa la misma interfaz
//  ISP  → props opcionales; nadie recibe lo que no necesita
//  DIP  → depende de abstracciones (FieldType), no implementaciones
// ─────────────────────────────────────────────────────────────

const FormField: React.FC<FormFieldProps> = (props) => {

    const {
        type,
        label,
        required,
        error,
        hint,
    } = props;

    const FieldComponent = FIELD_MAP[type];

    /**
     * Checkbox tiene su propio layout
     * (label integrado en el control)
     */
    if (type === "checkbox") {
        return (
            <div className="flex flex-col gap-1.5">
                <FieldComponent {...props} />
                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}
                {hint && !error && (
                    <p className="text-xs text-gray-400 dark:text-bodydark2">{hint}</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">

            {/* Label */}
            <label className={LABEL_CLASS}>
                {label}
                {required && (
                    <span className="text-red-500 ml-1">*</span>
                )}
            </label>

            {/* Control */}
            <FieldComponent {...props} />

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}

            {/* Hint (solo si no hay error) */}
            {hint && !error && (
                <p className="text-xs text-gray-400 dark:text-bodydark2">
                    {hint}
                </p>
            )}

        </div>
    );
};

export default FormField;