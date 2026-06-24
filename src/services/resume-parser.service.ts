// Client-side resume parser: extracts raw text from PDF / DOCX files.
// No mock data — only the actual file contents.

import mammoth from "mammoth";

export interface ParsedResume {
  fileName: string;
  fileType: "pdf" | "docx" | "txt";
  text: string;
  charCount: number;
}

async function parsePdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Resolve worker URL from the installed package (Vite handles ?url import).
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? (it as { str: string }).str : ""))
      .join(" ");
    parts.push(pageText);
  }
  return parts.join("\n\n");
}

async function parseDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
}

export async function parseResumeFile(file: File): Promise<ParsedResume> {
  const name = file.name.toLowerCase();
  let text = "";
  let fileType: ParsedResume["fileType"] = "txt";

  if (name.endsWith(".pdf")) {
    fileType = "pdf";
    text = await parsePdf(file);
  } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
    fileType = "docx";
    text = await parseDocx(file);
  } else {
    text = await file.text();
  }

  const cleaned = text.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+\n/g, "\n").trim();
  if (cleaned.length < 40) {
    throw new Error(
      "We couldn't read enough text from that file. If it's a scanned PDF, please upload a text-based PDF or DOCX.",
    );
  }
  return {
    fileName: file.name,
    fileType,
    text: cleaned,
    charCount: cleaned.length,
  };
}