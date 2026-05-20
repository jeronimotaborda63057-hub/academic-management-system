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

interface PdfImagePage {
    height: number;
    imageBytes: Uint8Array;
    width: number;
}

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const SCALE = 2;
const MARGIN = 40;
const ROW_HEIGHT = 30;
const HEADER_HEIGHT = 138;
const FOOTER_HEIGHT = 36;

const normalizeText = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "?");

const escapePdfName = (value: string) =>
    normalizeText(value)
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

const truncateText = (
    context: CanvasRenderingContext2D,
    value: string,
    maxWidth: number
) => {
    const normalized = normalizeText(value);
    if (context.measureText(normalized).width <= maxWidth) return normalized;

    let next = normalized;
    while (next.length > 0 && context.measureText(`${next}.`).width > maxWidth) {
        next = next.slice(0, -1);
    }

    return `${next}.`;
};

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

const dataUrlToBytes = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1] ?? "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
};

const drawText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth?: number
) => {
    context.fillText(
        maxWidth ? truncateText(context, text, maxWidth) : normalizeText(text),
        x,
        y
    );
};

const buildCanvasPage = <T,>({
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
}): PdfImagePage => {
    const canvas = document.createElement("canvas");
    canvas.width = PAGE_WIDTH * SCALE;
    canvas.height = PAGE_HEIGHT * SCALE;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("No fue posible preparar el reporte PDF.");

    context.scale(SCALE, SCALE);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

    context.fillStyle = "#111827";
    context.font = "700 22px Arial";
    drawText(context, title, MARGIN, 44, PAGE_WIDTH - MARGIN * 2);

    context.fillStyle = "#4b5563";
    context.font = "12px Arial";
    metadata.forEach((item, index) => {
        drawText(context, item, MARGIN, 68 + index * 17, PAGE_WIDTH - MARGIN * 2);
    });

    const tableWidth = columns.reduce((total, column) => total + column.width, 0);
    const tableX = MARGIN;
    let currentY = HEADER_HEIGHT;

    context.fillStyle = "#f3f4f6";
    context.fillRect(tableX, currentY, tableWidth, ROW_HEIGHT);
    context.strokeStyle = "#d1d5db";
    context.strokeRect(tableX, currentY, tableWidth, ROW_HEIGHT);

    context.fillStyle = "#374151";
    context.font = "700 11px Arial";
    let currentX = tableX;
    columns.forEach((column) => {
        context.strokeStyle = "#d1d5db";
        context.strokeRect(currentX, currentY, column.width, ROW_HEIGHT);
        drawText(context, column.header, currentX + 8, currentY + 19, column.width - 16);
        currentX += column.width;
    });

    currentY += ROW_HEIGHT;
    context.font = "12px Arial";
    pageRows.forEach((row, rowIndex) => {
        context.fillStyle = rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb";
        context.fillRect(tableX, currentY, tableWidth, ROW_HEIGHT);

        currentX = tableX;
        columns.forEach((column) => {
            context.strokeStyle = "#e5e7eb";
            context.strokeRect(currentX, currentY, column.width, ROW_HEIGHT);
            context.fillStyle = "#111827";
            drawText(
                context,
                column.getValue(row),
                currentX + 8,
                currentY + 19,
                column.width - 16
            );
            currentX += column.width;
        });

        currentY += ROW_HEIGHT;
    });

    context.fillStyle = "#6b7280";
    context.font = "10px Arial";
    context.textAlign = "right";
    drawText(
        context,
        `Pagina ${pageIndex + 1} de ${totalPages}`,
        PAGE_WIDTH - MARGIN,
        PAGE_HEIGHT - 22
    );
    context.textAlign = "left";

    return {
        height: PAGE_HEIGHT,
        imageBytes: dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.92)),
        width: PAGE_WIDTH,
    };
};

const asciiBytes = (value: string) =>
    new TextEncoder().encode(value);

const concatBytes = (parts: Uint8Array[]) => {
    const totalLength = parts.reduce((total, part) => total + part.length, 0);
    const bytes = new Uint8Array(totalLength);
    let offset = 0;

    parts.forEach((part) => {
        bytes.set(part, offset);
        offset += part.length;
    });

    return bytes;
};

const buildPdf = (pages: PdfImagePage[]) => {
    const parts: Uint8Array[] = [asciiBytes("%PDF-1.4\n")];
    const offsets: number[] = [0];
    const pageObjectIds: number[] = [];
    const objectCount = 3 + pages.length * 3;
    let currentOffset = parts[0].length;
    let nextObjectId = 4;

    const pushObject = (id: number, bodyParts: Uint8Array[]) => {
        offsets[id] = currentOffset;
        const objectParts = [
            asciiBytes(`${id} 0 obj\n`),
            ...bodyParts,
            asciiBytes("\nendobj\n"),
        ];
        const objectBytes = concatBytes(objectParts);
        parts.push(objectBytes);
        currentOffset += objectBytes.length;
    };

    pushObject(1, [asciiBytes("<< /Type /Catalog /Pages 2 0 R >>")]);
    pushObject(3, [asciiBytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")]);

    pages.forEach((page) => {
        const imageId = nextObjectId++;
        const contentId = nextObjectId++;
        const pageId = nextObjectId++;
        const content = `q\n${page.width} 0 0 ${page.height} 0 0 cm\n/Im${imageId} Do\nQ\n`;

        pushObject(imageId, [
            asciiBytes(
                `<< /Type /XObject /Subtype /Image /Width ${page.width * SCALE} ` +
                `/Height ${page.height * SCALE} /ColorSpace /DeviceRGB ` +
                `/BitsPerComponent 8 /Filter /DCTDecode /Length ${page.imageBytes.length} >>\n` +
                "stream\n"
            ),
            page.imageBytes,
            asciiBytes("\nendstream"),
        ]);
        pushObject(contentId, [
            asciiBytes(`<< /Length ${asciiBytes(content).length} >>\nstream\n${content}endstream`),
        ]);
        pushObject(pageId, [
            asciiBytes(
                `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
                `/Resources << /XObject << /Im${imageId} ${imageId} 0 R >> /Font << /F1 3 0 R >> >> ` +
                `/Contents ${contentId} 0 R >>`
            ),
        ]);
        pageObjectIds.push(pageId);
    });

    pushObject(2, [
        asciiBytes(
            `<< /Type /Pages /Kids ${pageObjectIds.map((id) => `${id} 0 R`).join(" ")} ` +
            `/Count ${pageObjectIds.length} >>`
        ),
    ]);

    const xrefOffset = currentOffset;
    let trailer = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
    for (let id = 1; id <= objectCount; id += 1) {
        trailer += `${String(offsets[id] ?? 0).padStart(10, "0")} 00000 n \n`;
    }
    trailer += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\n`;
    trailer += `startxref\n${xrefOffset}\n%%EOF`;
    parts.push(asciiBytes(trailer));

    return new Blob([concatBytes(parts)], { type: "application/pdf" });
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
        Math.floor((PAGE_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT) / ROW_HEIGHT)
    );
    const chunks = rows.length > 0
        ? Array.from({ length: Math.ceil(rows.length / rowsPerPage) }, (_, index) =>
            rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage)
        )
        : [[] as T[]];
    const pages = chunks.map((pageRows, pageIndex) =>
        buildCanvasPage({
            columns,
            metadata,
            pageIndex,
            pageRows,
            title,
            totalPages: chunks.length,
        })
    );
    const normalizedFileName = escapePdfName(fileName) || "reporte";

    downloadBlob(buildPdf(pages), `${normalizedFileName}.pdf`);
};
