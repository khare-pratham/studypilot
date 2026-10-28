const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../studypilot-core.js');

test('validates and trims a document title and note content', () => {
  assert.deepEqual(core.validateDocument('  Week 1  ', '  Hello notes  '), { valid: true, title: 'Week 1', text: 'Hello notes' });
});
test('rejects missing titles and blank content', () => {
  assert.equal(core.validateDocument('', 'some notes').valid, false);
  assert.equal(core.validateDocument('Title', '  \n ').valid, false);
});
test('enforces title and document size limits', () => {
  assert.equal(core.validateDocument('x'.repeat(101), 'notes').valid, false);
  assert.equal(core.validateDocument('Title', 'x'.repeat(100001)).valid, false);
});
test('tokenizes case-insensitively and filters common stop words', () => {
  assert.deepEqual(core.tokenize('WHAT is REST API design?'), ['rest', 'api', 'design']);
});
test('splits long documents into passages no longer than the configured limit', () => {
  const passages = core.splitPassages({ id: 7, title: 'Notes', text: 'A'.repeat(2050) }, 900);
  assert.equal(passages.length, 3);
  assert.ok(passages.every(p => p.text.length <= 900));
  assert.equal(passages[0].docId, 7);
});
test('retrieves relevant passages and preserves document provenance', () => {
  const docs = [{ id: 1, title: 'Architecture', text: 'A monolith packages components into one deployable application.\n\nMicroservices are independently deployable services.' }];
  const results = core.searchDocuments('monolith deployable application', docs);
  assert.ok(results.length > 0);
  assert.equal(results[0].title, 'Architecture');
  assert.match(results[0].text, /monolith/i);
  assert.ok(results[0].matched.includes('monolith'));
});
test('returns no matches for unrelated questions or empty libraries', () => {
  const docs = [{ id: 1, title: 'Biology', text: 'Cells contain genetic material.' }];
  assert.deepEqual(core.searchDocuments('quantum blockchain', docs), []);
  assert.deepEqual(core.searchDocuments('cells', []), []);
});
test('returns no results for questions containing only stop words', () => {
  assert.deepEqual(core.searchDocuments('what is this and how can you', [{ title: 'T', text: 'A short text about things.' }]), []);
});
test('limits results and uses stable ordering for equal scores', () => {
  const docs = [{ title: 'First', text: 'Network security controls.' }, { title: 'Second', text: 'Network security controls.' }];
  const results = core.searchDocuments('network security', docs, { maxResults: 1 });
  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'First');
});
test('escapes HTML special characters before rendering untrusted content', () => {
  assert.equal(core.escapeHtml('<script a="b">&\'x\'</script>'), '&lt;script a=&quot;b&quot;&gt;&amp;&#39;x&#39;&lt;/script&gt;');
});
