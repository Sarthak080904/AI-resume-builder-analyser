import mammoth from "mammoth";
import pdf from "pdf-parse";
import { HttpError } from "../utils/errors.js";

const MAX_TEXT_LENGTH = 80_000;

export async function parseResumeFile(file: Express.Multer.File) {
  const mime = file.mimetype;
  let text = "";

  if (mime === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    const parsed = await pdf(file.buffer);
    text = parsed.text;
  } else if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.originalname.toLowerCase().endsWith(".docx")
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    text = parsed.value;
  } else if (mime.startsWith("text/") || file.originalname.toLowerCase().endsWith(".txt")) {
    text = file.buffer.toString("utf8");
  } else {
    throw new HttpError(400, "Upload a PDF, DOCX, or TXT resume.");
  }

  const cleaned = text.replace(/\s+/g, " ").trim();

  if (!cleaned || cleaned.length < 80) {
    throw new HttpError(400, "Could not extract enough text from this resume.");
  }

  return cleaned.slice(0, MAX_TEXT_LENGTH);
}
