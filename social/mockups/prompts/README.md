# Prompts for the staged shots

One file per case, five prompts each — the same five shots as the references in
`social/simillar`. Open the file for the case you want, attach that case's photo
from `/pic`, and run the prompt.

Rebuild them whenever the catalogue changes:

```bash
npm run assets:prompts
```

## Check every picture before it goes out

Image models tidy things up, and two of the things they tidy will misrepresent
the product:

1. **The small print.** On most of these cases the body text is deliberately
   unreadable — it is unreadable on the real case and in the supplier photo.
   A model will often "fix" it into crisp, legible sentences. Each case file
   lists what that case actually says, so you can tell. If the model wrote
   paragraphs, throw the picture out.
2. **The camera cut-out.** Some of these cases are cut for two lenses, some for
   three. A model will happily give a two-lens case three. If the cut-out does
   not match the photo you attached, throw the picture out.

Anything that survives both checks is showing a customer the case they will
actually receive, which is the rule the rest of the shop runs on.

## Where they go

Drop the finished images into `social/mockups/` as `<slug>-<shot>.jpg` and they
sit alongside the composited ones, which stay as the fallback for any case you
have not regenerated. The composited set is rebuilt with
`npm run assets:mockups`.
