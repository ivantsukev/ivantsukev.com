import type { APIRoute } from 'astro';
import { config } from '../../config';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  const env = (locals as any)?.runtime?.env ?? {};
  const BREVO_API_KEY: string | undefined = env.BREVO_API_KEY ?? import.meta.env.BREVO_API_KEY;
  const TURNSTILE_SECRET_KEY: string | undefined =
    env.TURNSTILE_SECRET_KEY ?? import.meta.env.TURNSTILE_SECRET_KEY;

  let data: { email?: unknown; turnstileToken?: unknown };
  try {
    data = await request.json();
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const turnstileToken = typeof data.turnstileToken === 'string' ? data.turnstileToken : '';

  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return json(400, { error: 'Invalid email' });
  }

  if (TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return json(403, { error: 'Verification required' });
    }
    const verifyBody = new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: turnstileToken,
      remoteip: clientAddress ?? '',
    });
    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: verifyBody },
    );
    const verifyJson = (await verifyRes.json()) as { success?: boolean };
    if (!verifyJson.success) {
      return json(403, { error: 'Verification failed' });
    }
  }

  if (!BREVO_API_KEY) {
    return json(500, { error: 'Service unavailable' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [config.brevo.listId],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { code?: string };
      if (error.code === 'duplicate_parameter') {
        return json(200, { success: true });
      }
      return json(500, { error: 'Failed to subscribe' });
    }

    return json(200, { success: true });
  } catch {
    return json(500, { error: 'Failed to subscribe' });
  }
};
