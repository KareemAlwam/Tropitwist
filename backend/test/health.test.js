import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';

test('GET /api/v1/health reports that the API is available', async () => {
  const app = createApp();
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: 'ok',
      service: 'tropitwist-api',
      database: 'memory',
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
