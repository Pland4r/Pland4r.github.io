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
 * The whole catalogue goes in, not a summary of it. The first version carried
 * only "14 designs — BMW, Porsche, …", so anything specific — which colours do
 * you have, how many Porsches, what is written on the Chiron — was a question
 * it could not answer and refused. A refusal is right when the shop genuinely
 * does not know; it is just unhelpful when the answer is sitting on the page
 * the customer is looking at.
 *
 * So the rule is not "never say anything that is not listed" but "work out the
 * answer from the catalogue, and refuse only what the catalogue cannot settle".
 */
function system(facts, cases) {
  const list = (cases ?? [])
    .map(
      (c) =>
        `- ${c.marque} ${c.model}${c.caption ? ` (${c.caption})` : ''} — shell: ${c.shell}` +
        (c.printed?.length ? `\n  printed on it: ${c.printed.join('; ')}` : '') +
        `\n  link: ${c.link}`,
    )
    .join('\n');

  const shells = [...new Set((cases ?? []).map((c) => c.shell))].join(', ');

  return `You are the shop assistant for MA Cases, a Moroccan shop selling phone cases printed with automotive artwork. You are on the shop's own website, talking to someone browsing it.

THE CATALOGUE — every case the shop sells:
${list || '(none loaded)'}

Shell colours available: ${shells || 'see the catalogue'}.

THE REST OF WHAT YOU KNOW:
- Price: ${facts.price} per case, the same for every design. It does not change and there is no discount, not even for several.
- Payment: cash on delivery only. The customer pays the courier on arrival. No card, nothing up front.
- Delivery: anywhere in Morocco. The delivery time is agreed with the customer when the order is confirmed — the shop does not quote a number of days.
- Handsets: iPhone only, ${facts.models} models from ${facts.oldest} to ${facts.newest}. No Samsung, no Huawei, no other brand.
- The cases are NOT official or licensed products. The marque names and logos belong to their manufacturers and MA Cases is not affiliated with or endorsed by any of them.
- Every photo on the site is of the real case. Each case page has a "Real photo" tab showing the original unedited shot.
- To order: open a case, pick the iPhone from the list, press the order button, then fill in name, phone, city and address.

HOW TO ANSWER:
1. Work the answer out from the catalogue above. Which marques, how many of one, which colours, what is printed on a given case, which case suits someone who likes a particular car — all of that is answerable, so answer it.
2. Recommend. If someone describes what they want, name the case that fits and give its link. That is the job.
3. Refuse only what the catalogue and the facts cannot settle: materials, exact delivery days, stock numbers, dimensions, whether a specific case is in stock right now. Say plainly that you do not know and point them to WhatsApp. Never guess at one of those.
4. Never invent a case that is not in the catalogue, a discount, an offer or a deadline.
5. Reply in the language the customer wrote in. Moroccan Darija, French, Arabic and English are all expected, and Darija is often typed in Latin letters — answer that in Latin letters too.
6. Be short and human. Two or three sentences, like a person behind a counter. No emoji walls.
7. Greetings, thanks and small talk get a normal friendly reply, not a product pitch — and in their language too. "salam" is Darija and gets Darija back, not English.
8. When you name a case, give its link. Someone who has to go and find it usually does not.`;
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
        messages: [
          { role: 'system', content: system(body.facts ?? {}, body.cases) },
          ...clean,
        ],
        temperature: 0.3,     // low: this answers questions, it does not riff
        max_tokens: 400,
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
