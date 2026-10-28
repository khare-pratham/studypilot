(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.StudyPilotCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const STOP_WORDS = new Set(['what','when','where','which','who','why','how','does','with','from','that','this','are','was','were','have','has','the','and','for','into','about','can','could','would','should','your','you','their','them','then','than','a','an','is','in','on','of','to','or','by','be','as','it']);
  const MAX_DOCUMENT_CHARS = 100000;
  const MAX_TITLE_CHARS = 100;
  const MAX_RESULTS = 4;
  function validateDocument(title, text) {
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanText = typeof text === 'string' ? text.trim() : '';
    if (!cleanTitle) return { valid: false, error: 'Add a document title.' };
    if (cleanTitle.length > MAX_TITLE_CHARS) return { valid: false, error: `Titles must be ${MAX_TITLE_CHARS} characters or fewer.` };
    if (!cleanText) return { valid: false, error: 'Add some note content.' };
    if (cleanText.length > MAX_DOCUMENT_CHARS) return { valid: false, error: `Documents must be ${MAX_DOCUMENT_CHARS.toLocaleString()} characters or fewer.` };
    return { valid: true, title: cleanTitle, text: cleanText };
  }
  function tokenize(value) {
    return (String(value ?? '').toLowerCase().match(/[a-z0-9][a-z0-9+#.-]{1,}/g) || []).filter(word => !STOP_WORDS.has(word));
  }
  function splitPassages(document, maxLength = 900) {
    if (!document || typeof document.text !== 'string') return [];
    const paragraphs = document.text.split(/\n{2,}/).map(part => part.trim()).filter(Boolean);
    const passages = [];
    for (const paragraph of paragraphs) {
      if (paragraph.length <= maxLength) { passages.push(paragraph); continue; }
      const sentences = paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
      let current = '';
      for (const sentence of sentences) {
        const next = current + sentence;
        if (next.length > maxLength && current) { passages.push(current.trim()); current = ''; }
        if (sentence.length > maxLength) {
          for (let i = 0; i < sentence.length; i += maxLength) passages.push(sentence.slice(i, i + maxLength).trim());
        } else current += sentence;
      }
      if (current.trim()) passages.push(current.trim());
    }
    return passages.map((text, index) => ({ title: String(document.title || 'Untitled'), text, docId: document.id ?? null, part: index + 1 }));
  }
  function searchDocuments(question, documents, options = {}) {
    const query = typeof question === 'string' ? question.trim() : '';
    if (!query || !Array.isArray(documents) || !documents.length) return [];
    const queryTerms = [...new Set(tokenize(query))];
    if (!queryTerms.length) return [];
    const maxResults = Number.isInteger(options.maxResults) && options.maxResults > 0 ? Math.min(options.maxResults, 20) : MAX_RESULTS;
    const allPassages = documents.flatMap(document => splitPassages(document));
    return allPassages.map((passage, index) => {
      const passageTerms = tokenize(passage.text);
      const termSet = new Set(passageTerms);
      const matched = queryTerms.filter(term => termSet.has(term));
      const exactPhrase = passage.text.toLowerCase().includes(query.toLowerCase());
      const score = matched.length / Math.sqrt(Math.max(termSet.size, 1)) + (exactPhrase ? 3 : 0);
      return { ...passage, score, matched, exactPhrase, _index: index };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a._index - b._index).slice(0, maxResults).map(({ _index, ...item }) => item);
  }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  return { MAX_DOCUMENT_CHARS, MAX_TITLE_CHARS, MAX_RESULTS, validateDocument, tokenize, splitPassages, searchDocuments, escapeHtml };
});
