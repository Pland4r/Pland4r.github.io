/**
 * The assistant's brain, kept off the website.
 *
 * The site is a static export: anything it ships can be read by anyone who
 * opens the page source. An API key in there is a key anyone can take and spend
 * — so the key lives here, as a Worker secret, and the page calls this instead.
 *
 * Deploy:
 *   cd worker
 *   npx wrangler secret put OLLAMA_API_KEY   # paste the key, it is never in git
 *   npx wrangler deploy
 *
 * Then put the Worker's URL in `assistantEndpoint` in data/site.ts.
 */

// Ollama Cloud, through its OpenAI-compatible layer.
const MODEL = 'gemma4:31b';
const UPSTREAM = 'https://ollama.com/v1/chat/completions';

/** Who may call this. An open proxy to a paid API is someone else's free lunch. */
const ALLOWED = [
  'https://ma-cases.pages.dev',
  'https://pland4r.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

/** Per-IP, per-minute. Generous for a shopper, useless for a scraper. */
const PER_MINUTE = 12;
const MAX_CHARS = 600;

/**
 * Everything it is allowed to know.
 *
 * The facts come from the site so they cannot drift apart, and the rules are
 * blunt on purpose: this shop does not invent a delivery time or a material in
 * its own copy, and it must not start doing so through a chat box.
 */
function system(facts) {
  return `You answer questions for MA Cases, a Moroccan shop selling phone cases printed with automotive artwork. You are on the shop's own website.

THE FACTS. These are the only product facts you have:
- Price: ${facts.price} per case. The same for every design. It does not change and there is no discount.
- Payment: cash on delivery only. The customer pays the courier on arrival. No card, nothing up front.
- Delivery: anywhere in Morocco. The delivery time is agreed with the customer when the order is confirmed.
- Handsets: iPhone only, ${facts.models} models from ${facts.oldest} to ${facts.newest}. No Samsung, no other brand.
- Catalogue: ${facts.cases} designs — ${facts.marques}.
- The cases are NOT official or licensed products. The marque names and logos belong to their manufacturers. MA Cases is not affiliated with or endorsed by any of them.
- Every photo on the site is of the real case. Each case has a "Real photo" tab showing the original unedited shot.
- To order: open a case, pick the iPhone from the list, press the order button, fill in name, phone, city and address.

THE RULES:
1. Never state a fact that is not above. No materials, no drop ratings, no delivery times in days, no stock counts, no sizes.
2. If you are asked something not covered above, say you do not know and tell them to message on WhatsApp. Do not guess, and do not soften a refusal into a maybe.
3. Never invent a discount, an offer or a deadline.
4. Reply in the language the customer wrote in. Moroccan Darija, French, Arabic and English are all expected, and Darija is often typed in Latin letters.
5. Be short. Two or three sentences. This is a chat bubble on a phone, not an essay.
6. You are a shop assistant, not a chatbot showing off. No emoji walls, no exclamation marks in every line.`;
}

const cors = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== 'POST') {
      return new Response('POST only', { status: 405, headers: cors(origin) });
    }
    if (origin && !ALLOWED.includes(origin)) {
      return new Response(JSON.stringify({ error: 'origin' }), {
        status: 403,
        headers: { ...cors(origin), 'Content-Type': 'application/json' },
      });
    }

    // Rate limit on the caller's IP, held in the edge cache. Not airtight
    // across regions, which is fine: it is here to stop a bill, not an attack.
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const slot = Math.floor(Date.now() / 60000);
    const key = new Request(`https://rl.invalid/${ip}/${slot}`);
    const seen = Number((await caches.default.match(key))?.headers.get('X-Count') ?? 0);

    if (seen >= PER_MINUTE) {
      return new Response(JSON.stringify({ error: 'rate' }), {
        status: 429,
        headers: { ...cors(origin), 'Content-Type': 'application/json' },
      });
    }
    await caches.default.put(
      key,
      new Response('', { headers: { 'X-Count': String(seen + 1), 'Cache-Control': 'max-age=60' } }),
    );

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'bad json' }), {
        status: 400,
        headers: { ...cors(origin), 'Content-Type': 'application/json' },
      });
    }

    const history = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
    const clean = history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

    if (!clean.length) {
      return new Response(JSON.stringify({ error: 'empty' }), {
        status: 400,
        headers: { ...cors(origin), 'Content-Type': 'application/json' },
      });
    }

    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OLLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OLLAMA_MODEL || MODEL,
        messages: [{ role: 'system', content: system(body.facts ?? {}) }, ...clean],
        temperature: 0.3,     // low: this answers questions, it does not riff
        max_tokens: 320,
      }),
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: 'upstream', status: upstream.status }), {
        status: 502,
        headers: { ...cors(origin), 'Content-Type': 'application/json' },
      });
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    return new Response(JSON.stringify({ reply: reply || null }), {
      headers: { ...cors(origin), 'Content-Type': 'application/json' },
    });
  },
};
