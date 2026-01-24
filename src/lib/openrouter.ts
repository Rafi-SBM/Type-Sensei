export async function generateWithOpenRouter(
  prompt: string,
  model = (import.meta.env.VITE_OPENROUTER_MODEL as string) || 'openai/gpt-oss-20b:free',
  maxTokens = 256,
  timeoutMs = 4000,
) {
  const key = import.meta.env.VITE_OPENROUTER_KEY as string | undefined;
  if (!key) throw new Error('OpenRouter API key not configured (VITE_OPENROUTER_KEY)');

  const url = 'https://api.openrouter.ai/v1/chat/completions';
  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`OpenRouter request failed: ${res.status} ${res.statusText} ${txt}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || data?.output?.[0]?.content || '';
  return String(content).trim();
}
