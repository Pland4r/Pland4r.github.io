# The assistant's brain

The website is a static export — everything it ships can be read by anyone who
opens the page source. **An API key in there is a key anyone can take and
spend.** So the key lives in this Worker, and the page calls the Worker.

Cloudflare Workers are free up to 100,000 requests a day, and you already have
the Cloudflare account that serves ma-cases.pages.dev.

## Deploy

```bash
cd worker
npx wrangler login
npx wrangler secret put OLLAMA_API_KEY  # paste the key — it never touches git
npx wrangler deploy
```

It prints a URL like `https://ma-cases-assistant.<you>.workers.dev`. Put that in
`data/site.ts`:

```ts
assistantEndpoint: 'https://ma-cases-assistant.<you>.workers.dev',
```

Push, and the assistant starts answering with Ollama Cloud instead of only its
scripted replies. Leave `assistantEndpoint` empty and it falls back to the scripted ones,
which keep working whether or not this is deployed.

## What it protects

| | |
| --- | --- |
| **The key** | A Worker secret. Not in git, not in the page, not readable by a visitor. |
| **Your bill** | 12 requests per IP per minute, 600 characters per message, 320 tokens per reply, and only the eight most recent messages are sent. |
| **Who can call it** | The origin must be ma-cases.pages.dev, pland4r.github.io or localhost. Edit `ALLOWED` in index.js if you add a domain. |

None of that makes it impossible to abuse — a determined person can forge an
origin header. It makes it not worth doing, which for a shop's chat box is the
right amount of effort.

## What it is allowed to say

The system prompt in `index.js` carries the real facts: the price, cash on
delivery, iPhone only, the catalogue, and that the cases are not official
products. It is told not to state anything outside that list, and to hand off to
WhatsApp rather than guess.

That is the same rule the rest of the site follows — nothing is invented to fill
a gap — and it matters more here, because a model asked "how many days for
delivery?" will happily make up a number unless told not to.

**Read a few of its answers before trusting it with customers.** It is a
language model: the prompt makes inventing unlikely, not impossible.

## Changing the model

`OLLAMA_MODEL` in wrangler.toml, then redeploy. It must be a model your Ollama
account can reach in the cloud — check the list at ollama.com/library and your
own plan's limits.
