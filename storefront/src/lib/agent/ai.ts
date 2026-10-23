/**
 * LLM connector for the AI Store Manager.
 * No SDK — native fetch. Provider: Google Gemini (GEMINI_API_KEY, native
 * v1beta generateContent). Missing key or transient errors are logged and
 * callers degrade gracefully (reports fall back to rule-based text).
 */

interface ProviderCfg {
  url: string;
  key: string;
  model: string;
  kind: 'gemini-native' | 'openai';
}

function providers(): ProviderCfg[] {
  const out: ProviderCfg[] = [];
  const geminiKey = process.env.GEMINI_API_KEY || '';
  if (geminiKey) {
    const candidateModels = [
      process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
    ];
    const unique = Array.from(new Set(candidateModels));
    for (const model of unique) {
      out.push({
        url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`,
        key: geminiKey,
        model,
        kind: 'gemini-native',
      });
    }
  }
  return out;
}

export function llmConfigured(): boolean {
  return providers().length > 0;
}

async function callOne(cfg: ProviderCfg, userPrompt: string, systemPrompt: string, maxTokens: number): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 90_000);
    const body =
      cfg.kind === 'gemini-native'
        ? {
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.5, maxOutputTokens: maxTokens * 3 },
          }
        : {
            model: cfg.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.5,
            max_tokens: maxTokens,
          };
    const res = await fetch(cfg.url, {
      method: 'POST',
      headers: cfg.kind === 'gemini-native'
        ? {
            'Content-Type': 'application/json',
            // Google API keys go in the x-goog-api-key header (or ?key=).
            // Authorization: Bearer <API-KEY> is rejected with 401.
            'x-goog-api-key': cfg.key,
          }
        : {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cfg.key}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://rareember.shop',
            'X-Title': 'Rare Ember AI Store Manager',
          },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      // Transient capacity blips get a beat before the (caller's) retry.
      if (res.status === 429 || res.status === 500 || res.status === 502 || res.status === 503) {
        await new Promise((r) => setTimeout(r, 1200));
      }
      // Not entitled / bad model for this key -> skip quietly, chain falls through.
      console.error(`LLM provider ${new URL(cfg.url).origin} responded ${res.status} for ${cfg.model}`);
      return null;
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text =
      cfg.kind === 'gemini-native'
        ? (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim()
        : data.choices?.[0]?.message?.content?.trim();
    return text && text.length ? text : null;
  } catch (err) {
    console.error('LLM provider call failed:', err);
    return null;
  }
}

export async function askAgent(userPrompt: string, systemPrompt: string, maxTokens = 1000): Promise<string | null> {
  for (const cfg of providers()) {
    // One retry on transient provider errors (429/500/503 capacity blips).
    let answer = await callOne(cfg, userPrompt, systemPrompt, maxTokens);
    if (!answer) answer = await callOne(cfg, userPrompt, systemPrompt, maxTokens + 500);
    if (answer) return answer;
  }
  return null;
}