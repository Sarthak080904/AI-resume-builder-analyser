# AI Resume Analyser and ATS Resume Builder

A full-stack MERN-style project with:

- Resume upload and parsing for PDF, DOCX, and TXT.
- AI resume analysis against a job description using OpenAI Responses API structured output.
- Offline heuristic analysis fallback when `OPENAI_API_KEY` is not configured.
- ATS-friendly resume builder with clean sections, keyword guidance, and PDF export.
- Optional MongoDB persistence for analyses and saved resumes.

## Tech Stack

- Backend: Node.js, Express, TypeScript, Multer, OpenAI SDK, Mongoose, pdf-parse, Mammoth
- Frontend: React, TypeScript, Vite, Tailwind CSS, React PDF, Lucide Icons
- Database: MongoDB optional via `MONGODB_URI`

## Quick Start

```bash
npm run install:all
```

Create `backend/.env` from `backend/.env.example`.

```bash
cp backend/.env.example backend/.env
```

Run both apps:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Environment Variables

```bash
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

If `OPENAI_API_KEY` is empty, the analyser uses a deterministic ATS heuristic fallback.

## API

### `POST /api/analyze`

Multipart form fields:

- `resume`: PDF, DOCX, or TXT file
- `jobDescription`: target job description

Returns a structured score, gaps, keyword match data, improvement bullets, and rewritten summary suggestions.

### `GET /api/analyses`

Returns recent analyses when MongoDB is configured.

### `POST /api/resumes`

Saves a resume draft when MongoDB is configured.

## ATS Notes

The builder intentionally avoids tables, columns in exported text structure, images, icons, rating bars, and decorative elements in the PDF content. The template prioritizes simple headings, readable typography, keyword-rich bullets, measurable impact, and predictable section order.
