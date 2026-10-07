# Where the orders go

The site is a static export — there is no server of ours to receive a form. So
the order form posts to an address you own, and this sets that up in a Google
Sheet.

**It is free, it has no monthly limit, and it never asks for a card.** You
already have the Google account it runs on.

Until it is set up the form still works: it collects everything and hands the
finished order to WhatsApp instead, so nothing a customer types is lost.

---

## Five minutes, once

### 1. Make the sheet

Go to [sheets.new](https://sheets.new). Name it **MA Cases — Orders**.

### 2. Open the script editor

In the sheet: **Extensions → Apps Script**. Delete whatever is in the editor and
paste this:

```javascript
// Receives an order from ma-cases and appends it as a row.
// Deploy: Deploy > New deployment > Web app
//   Execute as:      Me
//   Who has access:  Anyone
// "Anyone" is what lets the website post without a login. The URL is the only
// thing that can reach it, so treat it as a password and do not publish it.

const SHEET = 'Orders';
const NOTIFY = '';   // put your email here to get one per order, or leave empty

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);                      // two orders at once must not collide
  try {
    const order = JSON.parse(e.postData.contents);
    const book = SpreadsheetApp.getActiveSpreadsheet();
    let tab = book.getSheetByName(SHEET);

    if (!tab) {
      tab = book.insertSheet(SHEET);
      tab.appendRow([
        'Received', 'Status', 'Case', 'iPhone', 'Name', 'Phone',
        'City', 'Address', 'Notes', 'Language', 'Link',
      ]);
      tab.setFrozenRows(1);
      tab.getRange('A1:K1').setFontWeight('bold');
    }

    tab.appendRow([
      new Date(),
      'New',
      order.case || '',
      order.model || '',
      order.name || '',
      // Leading apostrophe: a Moroccan number starts with 0 and Sheets would
      // otherwise drop it and turn the rest into a number.
      "'" + (order.phone || ''),
      order.city || '',
      order.address || '',
      order.notes || '',
      order.locale || '',
      order.link || '',
    ]);

    if (NOTIFY) {
      MailApp.sendEmail(
        NOTIFY,
        'New order — ' + (order.case || ''),
        [
          'Case:    ' + order.case,
          'iPhone:  ' + order.model,
          '',
          'Name:    ' + order.name,
          'Phone:   ' + order.phone,
          'City:    ' + order.city,
          'Address: ' + order.address,
          order.notes ? 'Notes:   ' + order.notes : '',
          '',
          order.link,
        ].join('\n'),
      );
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

If you want an email for every order, put your address in the `NOTIFY` line.

### 3. Deploy it

**Deploy → New deployment → ⚙ → Web app**, then:

| | |
| --- | --- |
| Execute as | **Me** |
| Who has access | **Anyone** |

Press **Deploy**. Google asks you to authorise it the first time — it is your
own script writing to your own sheet, so approve it. Through the "unverified
app" warning: **Advanced → Go to … (unsafe)**. That warning is Google telling
you it has not reviewed the script, which it has not, because you just wrote it.

Copy the **Web app URL**. It looks like:

```
https://script.google.com/macros/s/AKfy…long…/exec
```

### 4. Put it in the site

`data/site.ts`:

```ts
orderEndpoint: 'https://script.google.com/macros/s/AKfy…/exec',
```

Push, and the orders start landing in the sheet.

---

## Telegram, so your phone actually rings

Email is quiet. Telegram pushes like a message, and it is free with no limits.

### 1. Make the bot

In Telegram, message **@BotFather** → `/newbot` → give it a name and a username
ending in `bot`. It replies with a token like `8123456789:AAH-xxxxxxxxxxxxxxxxx`.

**Paste it straight into the script below — do not send it to anyone, me
included.** Anyone with that token can post as your bot.

### 2. Get your chat id

Message **@userinfobot** in Telegram. It replies with your `Id`, a number like
`584920135`.

Then send your own new bot any message — `hi` is fine. A bot cannot start a
conversation, so without this first message it has nowhere to send.

### 3. Add it to the script

At the top of `Code.gs`, next to `NOTIFY`:

```javascript
const TELEGRAM_TOKEN = '';   // from @BotFather
const TELEGRAM_CHAT  = '';   // your Id from @userinfobot
```

And inside `doPost`, just after the `if (NOTIFY) { … }` block, before the
`return`:

```javascript
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT) {
      const text = [
        '*New order*',
        '',
        'Case: ' + (order.case || ''),
        'iPhone: ' + (order.model || ''),
        '',
        'Name: ' + (order.name || ''),
        'Phone: ' + (order.phone || ''),
        'City: ' + (order.city || ''),
        'Address: ' + (order.address || ''),
        order.notes ? 'Notes: ' + order.notes : '',
        '',
        order.link || '',
      ].filter(String).join('
');

      UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
        method: 'post',
        payload: { chat_id: TELEGRAM_CHAT, text: text, parse_mode: 'Markdown' },
        // A Telegram outage must not lose the order — the row is already written.
        muteHttpExceptions: true,
      });
    }
```

### 4. Redeploy

**Déployer → Gérer les déploiements → ✏️ → Version: Nouvelle version → Déployer.**

Use *Gérer*, not *Nouveau* — a new deployment gives a new URL and the site would
stop reaching it.

Every order now arrives as a Telegram message, within a second, with the
customer's phone number right there to tap.

### Why it goes here rather than on the website

The sheet is the record and Telegram is the notification. Putting the bot token
on the website would publish it — a static site ships everything it holds to the
browser. Here it sits in your own script, which nobody else can read.

---

## Using it

Open the sheet on your phone — the Google Sheets app shows it like a list.

The **Status** column starts at `New`. Change it to `Confirmed`, `Sent`,
`Delivered` as you go. Nothing in the site reads that column; it is yours.

Sort by **Received** to see the newest first. Filter by **Status** to see what
is still open.

---

## What this does not do

It does not take payment, and it is not meant to. Orders are cash on delivery,
the form collects what you need to deliver, and the price is agreed in the
conversation afterwards — which is what the site already says.

It also does not confirm anything to the customer beyond "we have it". The
confirmation screen says you will come back on WhatsApp, so do that.

---

## If you would rather not use Google

Anything that accepts a POST works — set `orderEndpoint` to its URL and the
form will use it. [Web3Forms](https://web3forms.com) and
[Formspree](https://formspree.io) both have free tiers that take no card;
Formspree caps the free tier at 50 submissions a month, Web3Forms does not cap
it but sends to email rather than a table.

The sheet is the recommendation because a table you can sort and mark up is a
better place for orders than an inbox.

---

## One thing to know about the response

Apps Script does not send CORS headers back, so the browser posts in `no-cors`
mode and cannot read the reply. A submission that reaches the script and fails
*there* looks the same to the site as one that succeeded.

In practice it either arrives in the sheet or it does not, and the confirmation
screen promises only that you will come back on WhatsApp — which is true either
way. **Check the sheet once after the first real order** to confirm the whole
chain works.
