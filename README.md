# StudyPilot — Document-Grounded Study Assistant

> Search your own study notes and inspect the passages that support a result.

**Live demo:** https://khare-pratham.github.io/studypilot/

## Overview

StudyPilot is a local-first study prototype. Users can paste notes or import text-based files, ask a question, and retrieve matching passages with document titles. It reports when no relevant evidence is found rather than generating an unsupported answer.

## Features

- Add notes by pasting text and giving the document a title
- Import text, Markdown and text-based CSV files (maximum 500 KB per imported file)
- Split long documents into manageable passages
- Rank passages using keyword overlap and an exact-phrase bonus
- Display matching source passages, document titles and matched terms
- Return a no-match message when no passage has matching keywords
- Validate title/content and handle unsupported, oversized or unreadable imports
- Escape user-provided content before rendering it into the page
- Process notes in the browser without uploading them to a server
- Automated Node.js tests and GitHub Actions workflow

## Tech stack

`HTML5` · `CSS3` · `Vanilla JavaScript` · `Browser File API` · `Node.js test runner` · `Playwright` · `GitHub Actions`

## How it works

The app stores documents in in-memory JavaScript state for the current page session. `studypilot-core.js` splits notes into passages, tokenises the question and passage text, scores passages using keyword overlap and an exact-phrase bonus, and returns the best matching evidence. Results include source titles and matched terms. The app does not call an AI model or upload documents.

## Run locally

1. Clone or download this repository.
2. Open `index.html` in a browser, or run a local static server:

   ```bash
   python3 -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

## Run automated tests

Requires Node.js 22 or another Node version with the built-in `node:test` runner.

```bash
node --check studypilot-core.js
node --test tests/studypilot-core.test.cjs
node tests/studypilot-e2e.mjs
```

GitHub Actions runs core and Playwright browser checks on pushes and pull requests to `main`, and can be started manually from the Actions tab.

## Manual test checklist

- [x] Browser test: add notes and confirm the document appears in the library
- [x] Browser test: verify blank-title validation
- [ ] Import a `.txt` or `.md` file and search its content
- [x] Browser test: retrieve matching evidence with its source title
- [x] Browser test: unrelated question produces a no-match message
- [x] Browser test: remove a document and verify its evidence is no longer searchable
- [x] Browser test: clear the library and verify session documents are removed
- [ ] Try a file over 500 KB or an unsupported extension and confirm a useful error
- [ ] Test a narrow mobile viewport and keyboard focus

## Known limitations

- Keyword retrieval only; paraphrases and semantic matches can be missed
- Results are retrieved excerpts, not generated explanations or verified answers
- No LLM, embeddings, semantic search, PDF parsing or cross-document reasoning
- Documents are held in page-session memory and are lost on refresh
- Large-file support is intentionally limited

## Screenshots

![StudyPilot dashboard](studypilot-dashboard.png)

## Project status

Portfolio prototype. This README distinguishes implemented features from potential future improvements.
