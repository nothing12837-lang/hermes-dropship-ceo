/**
 * Telegram transport for the AI Store Manager (reports + chat).
 * Telegram messages max out at 4096 chars — chunk anything longer.
 */
const API_URL = 'https://api.telegram.org';

async function post(token: string, method: string, payload: object): Promise<{ ok: boolean; body: unknown }> {
  const res = await fetch(`${API_URL}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, body: await res.json().catch(() => null) };
}

function chunks(text: string, size = 3900): string[] {
  const out: string[] = [];
  let cur = '';
  for (const line of text.split('\n')) {
    if ((cur + line).length > size) {
      out.push(cur.trim());
      cur = '';
    }
    cur += line + '\n';
  }
  if (cur.trim()) out.push(cur.trim());
  return out.length ? out : [text];
}

function agentEnabled(): boolean {
  return process.env.TELEGRAM_AGENT_ENABLED !== 'false';
}

export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/** Fires any agent report to the configured founder chat. Never throws. */
export async function sendTelegramText(text: string, parseMode: 'HTML' | '' = 'HTML'): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId || !agentEnabled() || !text.trim()) return false;
  let ok = true;
  for (const part of chunks(text)) {
    try {
      const r = await post(token, 'sendMessage', {
        chat_id: chatId,
        text: part,
        parse_mode: parseMode || undefined,
        disable_web_page_preview: true,
      });
      // Fallback: if HTML entities broke, retry as plain text.
      if (!r.ok && parseMode) {
        const retry = await post(token, 'sendMessage', { chat_id: chatId, text: part, disable_web_page_preview: true });
        ok = ok && retry.ok;
      } else {
        ok = ok && r.ok;
      }
    } catch (err) {
      console.error('Telegram send failed:', err);
      ok = false;
    }
  }
  return ok;
}

/** Replies inside a specific Telegram chat (webhook conversations). */
export async function replyTelegram(chatId: string | number, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  let ok = true;
  for (const part of chunks(text)) {
    try {
      const r = await post(token, 'sendMessage', {
        chat_id: chatId,
        text: part,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      if (!r.ok) {
        const retry = await post(token, 'sendMessage', { chat_id: chatId, text: part, disable_web_page_preview: true });
        ok = ok && retry.ok;
      } else ok = ok && true;
    } catch (err) {
      console.error('Telegram reply failed:', err);
      ok = false;
    }
  }
  return ok;
}