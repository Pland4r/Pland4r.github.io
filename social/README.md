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
```

Rebuild the images and Reels anytime:

```bash
npm run assets:social
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
