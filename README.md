# Portfolio (Static) — with Research Library

This is a **no-framework, fully static** personal site template:
- About / Projects / **Research Library (documents archive)** / Experience / Skills / Contact
- Bilingual (ZH/EN) + Light/Dark theme
- All content in `content.json`

## Local preview
Because browsers restrict `fetch('./content.json')` on `file://`, run a local server:
```bash
python -m http.server 8000
```
Then open: http://localhost:8000

## Deploy (Vercel)
- Framework: Other
- Build command: empty
- Output directory: `.`
- Deploy

## Add documents monthly (recommended workflow)
1. Put a PDF under: `assets/docs/YYYY/MM/<slug>.pdf`
2. Add an entry to `content.json` -> `documents[]`:

```json
{
  "id": "2026-01-macro-note-01",
  "date": "2026-01-10",
  "category": "Macro Note",
  "title": { "zh": "宏观月报：2026年1月", "en": "Macro Monthly: Jan 2026" },
  "summary": { "zh": "一句话摘要...", "en": "One-line summary..." },
  "tags": ["Macro", "Rates"],
  "file": "./assets/docs/2026/01/macro-2026-01.pdf",
  "preview": true
}
```

### Notes
- If you plan to upload many PDFs, prefer smaller files (<10–20MB each).
- GitHub has a 100MB per-file limit; very large files should be hosted externally (Drive/Notion/S3) and linked via `url`.
