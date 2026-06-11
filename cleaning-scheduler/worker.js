// Cloudflare Worker — Cleaning Scheduler SMS inbox
//
// Setup:
//  1. Create a KV namespace named "INBOX" in the Cloudflare dashboard and bind it to this Worker
//  2. Add an environment variable named "SECRET" with any random string you choose
//  3. Copy the Worker URL and paste it into WORKER_URL in index.html
//  4. Set the same string as WORKER_SECRET in index.html
//  5. In Twilio, set the phone number's incoming-message webhook to this Worker URL

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const ALLOWED_ORIGIN = 'https://iridescentonyx.github.io';

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url    = new URL(request.url);
  const secret = url.searchParams.get('secret');

  // Twilio POST does not send the secret — authenticate by checking the User-Agent
  // instead. For GET and DELETE, require the secret.
  const isTwilioPost = request.method === 'POST' &&
    (request.headers.get('X-Twilio-Signature') || request.headers.get('user-agent')?.includes('TwilioProxy'));

  if (!isTwilioPost && secret !== SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const cors = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Content-Type': 'application/json',
  };

  // GET — return all stored messages to the app
  if (request.method === 'GET') {
    const list = await INBOX.list();
    const msgs = await Promise.all(list.keys.map(k => INBOX.get(k.name, 'json')));
    return new Response(JSON.stringify(msgs.filter(Boolean)), { headers: cors });
  }

  // POST — receive incoming SMS from Twilio
  if (request.method === 'POST') {
    const fd  = await request.formData();
    const sid = fd.get('MessageSid');
    if (!sid) return new Response('Bad Request', { status: 400 });

    const msg = {
      id:         sid,
      phone:      fd.get('From')  || '',
      message:    fd.get('Body')  || '',
      receivedAt: Date.now(),
    };
    // Store for 30 days; app deletes after reading
    await INBOX.put(sid, JSON.stringify(msg), { expirationTtl: 2592000 });

    // TwiML empty response — no auto-reply
    return new Response('<?xml version="1.0"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // DELETE — app removes a message after pulling it into localStorage
  if (request.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (id) await INBOX.delete(id);
    return new Response('OK', { headers: cors });
  }

  return new Response('Not found', { status: 404 });
}
