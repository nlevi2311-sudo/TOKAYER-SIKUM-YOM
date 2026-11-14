import "server-only";

/** חילוץ טקסט מקבצים שמועלים למאגר הידע: וורד, PDF וטקסט */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_DOC_CHARS = 300_000;
export const MAX_TOTAL_CHARS = 400_000;

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return clean(value);
  }
  if (name.endsWith(".pdf")) {
    const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await pdfText(pdf, { mergePages: true });
    return clean(Array.isArray(text) ? text.join("\n") : text);
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) {
    return clean(buf.toString("utf8"));
  }
  throw new Error("סוג קובץ לא נתמך. אפשר להעלות Word (docx), PDF או טקסט.");
}

function clean(s: string): string {
  return s
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
