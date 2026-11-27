import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = await readFile(new URL('../app/actions/chat.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { generateDesign } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);

test('generateDesign sends only supported request fields', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, request) => {
    assert.match(url, /\/api\/v1\/agent\/generate-design$/);
    assert.deepEqual(JSON.parse(request.body), { query: 'Design a small web app' });
    assert.equal(request.headers.Authorization, 'Bearer test-token');
    return new Response(JSON.stringify({ designId: 'test-id', name: 'Test', reasoning: [], metadata: {} }));
  });

  const result = await generateDesign('Design a small web app', 'test-token');
  assert.equal(result.success, true);
  assert.equal(result.data.designId, 'test-id');
});
