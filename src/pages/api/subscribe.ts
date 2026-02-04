import type { APIRoute } from 'astro';
import { config } from '../../config';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const email = data.email;

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [config.brevo.listId],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.code === 'duplicate_parameter') {
        return new Response(JSON.stringify({ success: true, message: 'Already subscribed' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw new Error(error.message);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to subscribe' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
