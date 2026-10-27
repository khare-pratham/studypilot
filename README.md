# StudyPilot — Document-Grounded Study Assistant

A local-first study tool that searches user-provided notes and shows matching evidence passages.

## Run locally
Open `index.html` in a browser. Import `.txt`, `.md` or `.csv` notes, or paste text into the editor. A local server can be run with `python3 -m http.server 8000`.

## Features
- Add notes by pasting text or importing text/Markdown/CSV files
- Split material into passages
- Rank passages by keyword overlap
- Show matching source passages and document titles
- Does not invent a response if no passages match
- No server, API key, or upload of notes

## Important scope
This is a transparent retrieval baseline, not a generative AI application. It does not parse PDFs, use embeddings, call an LLM, or provide semantic search. The current library exists only for the current page session.

## Next steps
- Add automated tests and a more robust tokeniser
- Add PDF parsing with a suitable library and clear privacy disclosures
- Add semantic retrieval (embeddings) and an LLM only with source-grounded prompting and evaluation
- Persist documents safely, add document deletion/export controls, and assess answer faithfulness

## Stack
HTML, CSS, JavaScript, browser File API and keyword-based retrieval.
