interface PdfTableColumn<T> {
    header: string;
    getValue: (row: T) => string;
    width: number;
}

interface PdfReportOptions<T> {
    columns: PdfTableColumn<T>[];
    fileName: string;
    metadata: string[];
    rows: T[];
    title: string;
}

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const MARGIN = 40;
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 92;
const FOOTER_Y = 24;

const normalizePdfText = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "?")
        .replace(/([\\()])/g, "\\$1");

const escapePdfName = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

const truncateText = (value: string, maxLength: number) =>
    value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 1))}.` : value;

const textCommand = (value: string, x: number, y: number, size = 10) =>
    `BT /F1 ${size} Tf ${x} ${y} Td (${normalizePdfText(value)}) Tj ET\n`;

const lineCommand = (x1: number, y1: number, x2: number, y2: number) =>
    `${x1} ${y1} m ${x2} ${y2} l S\n`;

const rectCommand = (x: number, y: number, width: number, height: number) =>
    `${x} ${y} ${width} ${height} re S\n`;

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const buildPageContent = <T,>({
    columns,
    metadata,
    pageIndex,
    pageRows,
    title,
    totalPages,
}: {
    columns: PdfTableColumn<T>[];
    metadata: string[];
    pageIndex: number;
    pageRows: T[];
    title: string;
    totalPages: number;
}) => {
    const tableX = MARGIN;
    const tableTop = PAGE_HEIGHT - HEADER_HEIGHT;
    const tableWidth = columns.reduce((total, column) => total + column.width, 0);
    let content = "0.2 w\n";

    content += textCommand(title, MARGIN, PAGE_HEIGHT - 42, 18);
    metadata.forEach((item, index) => {
        content += textCommand(item, MARGIN, PAGE_HEIGHT - 64 - index * 14, 9);
    });

    content += rectCommand(tableX, tableTop - ROW_HEIGHT, tableWidth, ROW_HEIGHT);
    let currentX = tableX;
    columns.forEach((column) => {
        content += textCommand(column.header, currentX + 6, tableTop - 16, 9);
        currentX += column.width;
        content += lineCommand(currentX, tableTop, currentX, tableTop - ROW_HEIGHT);
    });

    pageRows.forEach((row, rowIndex) => {
        const yTop = tableTop - ROW_HEIGHT * (rowIndex + 1);
        const yBottom = yTop - ROW_HEIGHT;

        content += rectCommand(tableX, yBottom, tableWidth, ROW_HEIGHT);
        currentX = tableX;
        columns.forEach((column) => {
            const maxLength = Math.max(8, Math.floor(column.width / 5.2));
            content += textCommand(
                truncateText(column.getValue(row), maxLength),
                currentX + 6,
                yBottom + 8,
                8
            );
            currentX += column.width;
            content += lineCommand(currentX, yTop, currentX, yBottom);
        });
    });

    content += textCommand(
        `Pagina ${pageIndex + 1} de ${totalPages}`,
        PAGE_WIDTH - 118,
        FOOTER_Y,
        8
    );

    return content;
};

const buildPdf = (pageContents: string[]) => {
    const objects: string[] = [];
    const pageObjectIds: number[] = [];
    const catalogId = 1;
    const pagesId = 2;
    const fontId = 3;
    let nextObjectId = 4;

    objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

    pageContents.forEach((content) => {
        const contentId = nextObjectId++;
        const pageId = nextObjectId++;
        const length = new TextEncoder().encode(content).length;

        objects[contentId] = `<< /Length ${length} >>\nstream\n${content}endstream`;
        objects[pageId] =
            `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
            `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
        pageObjectIds.push(pageId);
    });

    objects[pagesId] =
        `<< /Type /Pages /Kids ${pageObjectIds.map((id) => `${id} 0 R`).join(" ")} ` +
        `/Count ${pageObjectIds.length} >>`;

    let pdf = "%PDF-1.4\n";
    const offsets = [0];

    for (let id = 1; id < objects.length; id += 1) {
        offsets[id] = new TextEncoder().encode(pdf).length;
        pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }

    const xrefOffset = new TextEncoder().encode(pdf).length;
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objects.length; id += 1) {
        pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\n`;
    pdf += `startxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
};

export const downloadPdfReport = <T,>({
    columns,
    fileName,
    metadata,
    rows,
    title,
}: PdfReportOptions<T>) => {
    const rowsPerPage = Math.max(
        1,
        Math.floor((PAGE_HEIGHT - HEADER_HEIGHT - MARGIN - ROW_HEIGHT) / ROW_HEIGHT)
    );
    const chunks = rows.length > 0
        ? Array.from({ length: Math.ceil(rows.length / rowsPerPage) }, (_, index) =>
            rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage)
        )
        : [[] as T[]];
    const pageContents = chunks.map((pageRows, pageIndex) =>
        buildPageContent({
            columns,
            metadata,
            pageIndex,
            pageRows,
            title,
            totalPages: chunks.length,
        })
    );
    const pdf = buildPdf(pageContents);
    const normalizedFileName = escapePdfName(fileName) || "reporte";

    downloadBlob(pdf, `${normalizedFileName}.pdf`);
};
