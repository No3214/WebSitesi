import { test, expect } from '@playwright/test';

test.describe('Chat API', () => {
  test('rejects empty payload', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test('returns fallback response for valid user message', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        messages: [{ role: 'user', content: 'Oda seçenekleriniz nelerdir?' }],
      },
    });

    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(json.role).toBe('assistant');
    expect(typeof json.content).toBe('string');
    expect(json.content.length).toBeGreaterThan(20);
    expect(json.meta).toBeTruthy();
  });

  test('sanitizes malformed messages instead of crashing', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        messages: [
          { role: 'user', content: 'Akşam yemeği var mı?' },
          { role: 'assistant', content: null },
          { foo: 'bar' },
        ],
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.role).toBe('assistant');
  });
});
