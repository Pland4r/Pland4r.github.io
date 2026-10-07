# MA Cases — the Instagram pack

Everything for the account except the account itself. Open the files; the text
is ready to paste.

```
social/
  profile/            handle, name, bio, link, category
  profile-picture.jpg the picture to upload (blue)
  profile-picture-ink.jpg  the quieter alternative
  highlight-1..5.jpg  highlight covers
  captions/           28 posts, one file each — caption + hashtags + what is
                      printed on that case
  calendar.txt        which file goes out on which day
  launch-day.txt      hour by hour for day one
  stories.txt         what to post in stories, with Darija ready to copy
  highlights.txt      the five highlights and what goes in each
  dm-replies.txt      10 saved replies for what customers actually ask
  <slug>-post.jpg     1080x1350 feed stills   (not in git — 14 MB)
  <slug>-reel.mp4     1080x1920 Reels         (not in git)
  mockups/            five staged shots per case (not in git — 22 MB)
  mockups/prompts/    the prompts that regenerate those five properly
```

Every case is staged five ways, so a carousel can run four or five frames of
the same case without repeating a picture:

```
<slug>-studio.jpg   straight on, grey sweep          1080x1350
<slug>-angle.jpg    turned, the side of the shell    1080x1350
<slug>-macro.jpg    close on the camera corner       1080x1350
<slug>-night.jpg    dark stage, lit by its colour    1080x1350
<slug>-flat.jpg     laid on a desk, from above       1350x1080
```

These are the supplier photo restaged, not a redraw. The print, the shell
colour and the cut-outs are the photo's own pixels; the side of the case is
built from its own shell colour, with buttons at the rows where the photo
actually has them. What is added is the room: backdrop, light, shadow,
reflection. So they are safe to post next to the real thing, which is the rule
the whole shop runs on.

They have a ceiling, and it is worth knowing where it is. A composite cannot
invent what the supplier photo does not contain: the camera module stays flat,
because it is a picture of a module and not a module, and the small print stays
unreadable, because it is unreadable in the photo. The reference shots in
`social/simillar` do not have that ceiling — an image model rebuilt the case to
make them. `social/mockups/prompts/` holds the prompts to do the same for every
case in the catalogue, and its README says what to check before posting the
results, because a model that rebuilds the case will also happily improve it
into something the customer will not receive.

Rebuild the images and Reels anytime:

```bash
npm run assets:social     # feed stills and Reels
npm run assets:mockups    # the five staged shots, into social/mockups
npm run assets:prompts    # the prompts to regenerate those five properly
```

One case or one scene at a time, while you are deciding:

```bash
python scripts/mockups.py porsche-911-brabus
python scripts/mockups.py --scene night
```

## What actually moves reach

Instagram changed this, and most advice still describes the old version.

1. **Reels, not photos.** Roughly 4x the reach of a single image, and the only
   surface that reliably reaches people who do not follow you yet.
2. **Sends beat likes.** Sends per reach — how often people forward it in DMs —
   tracks reach more closely than anything else. Every caption here ends by
   asking for exactly that. It is the mechanic, not a flourish.
3. **Five hashtags, and they are for search.** Instagram caps posts at five now,
   and its head has said plainly that hashtags were never a good way to increase
   reach. Each post has five, picked for what someone would actually type.
4. **Darija, not French.** Darija consistently outperforms French or standard
   Arabic for a Moroccan audience. The site covers French and Arabic for whoever
   follows the link.
5. **Say cash on delivery every time.** Around 65-80% of Moroccan online orders
   are paid that way. Saying so removes the biggest reason to hesitate, and it
   is already true of your shop.
6. **Post 12:30-14:00 or 20:00-23:00.** Evening is stronger. One post a day
   beats three in a burst.

## Two things before you post

The Darija is written by Claude — have someone who speaks it read a few captions
first, the same as the French and Arabic on the site.

And `data/site.ts` still has no price and no WhatsApp number, so the bio link
lands on "price on request" and the order button is switched off.
