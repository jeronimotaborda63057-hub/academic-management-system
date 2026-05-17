const getDateOnlyValue = (value?: string) => {
    if (!value) return "";
    return value.slice(0, 10);
};

export const toDateInputValue = (value?: string) => getDateOnlyValue(value);

export const formatDateOnly = (value?: string) => {
    const date = getDateOnlyValue(value);
    if (!date) return "";

    const [year, month, day] = date.split("-");
    if (!year || !month || !day) return value ?? "";

    return `${day}/${month}/${year}`;
};
