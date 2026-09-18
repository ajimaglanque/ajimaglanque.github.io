# Reveal guide — /hannah

Two pages live in this folder right now:

- `index.html` — the current "something's coming..." countdown page. This is what's live today.
- `reveal.html` — the new page (pill badge + headline + scrolling quote marquee), inspired by the dribbble reference. It's already built and safe to preview any time — it does **not** replace `index.html` until you do it manually.

## 1. Preview it whenever you want

No need to wait for September 28 to look at it. Once pushed, it's live at:

```
https://ajimaglanque.github.io/hannah/reveal.html
```

Or run it locally:

```bash
cd /Users/ajimaglanque/Documents/playground/ajimaglanque.github.io
python3 -m http.server 8123
# open http://localhost:8123/hannah/reveal.html
```

## 2. Customize the headline text

Marked `<!-- EDIT ME -->` in `hannah/reveal.html`:

- **Badge pill text** — currently "it's finally here"
- **Headline** — currently "we're live!"
- **Subtitle** — currently "thank you for waiting — here's what everyone's been saying."

The quote cards themselves are no longer edited by hand — see the next section. They currently show fallback placeholder text (`@handle_one`, "Placeholder answer to question 1"...) because the Google Sheet isn't connected yet. That fallback content lives directly in `reveal.html` inside the four `<ul id="track-*">` lists, and stays visible until a real fetch succeeds — if you ever want different fallback wording, edit it there (each row's two `<ul>`s must match — the second one, marked `aria-hidden="true"`, is what makes the scroll loop seamless).

Colors, card width, and scroll speed live in `hannah/css/reveal.css` if you want to tweak the look (`animation: marquee-scroll 40s ...` — lower the seconds to scroll faster).

## 3. Connect the Google Form + Sheet

The marquee pulls live testimonials from a Google Sheet that a Google Form writes to. Three fields: **question 1**, **question 2**, **handle/nickname**.

**Set up the form and sheet:**

1. Create the Google Form with your two question fields, in that order, plus a short-answer field for handle/nickname (also fine to reorder — you'll tell the code the order in step 3).
2. In the Form editor, go to **Responses → the green Sheets icon → Create a new spreadsheet**. This creates a linked sheet that fills in automatically as people submit the form. Note that Google Forms always adds a **Timestamp** column first (column A), before your own fields.
3. Open that sheet, click **Share** (top right), and set access to **"Anyone with the link" → Viewer**. This is required — without it, the page can't read the data. (You're only sharing the response data itself, not the form; nobody can edit or submit through this link.)
4. Copy the **Sheet ID** out of the sheet's URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_LONG_ID_HERE/edit#gid=0
   ```
5. Check the tab name at the bottom of the sheet (Google names it "Form Responses 1" by default).

**Wire it up in the code**, in `hannah/js/testimonials.js`:

```js
var CONFIG = {
  SHEET_ID: "PASTE_YOUR_SHEET_ID_HERE",   // <- paste the ID from step 4
  SHEET_NAME: "Form Responses 1",          // <- match the tab name from step 5
  COLS: {
    question1: 1,   // column B (0 = Timestamp, always column A)
    question2: 2,   // column C
    handle: 3,      // column D
  },
  ...
```

The `COLS` numbers assume your form asks question 1, then question 2, then handle/nickname, in that order (so the sheet reads Timestamp, Q1, Q2, Handle across columns A-D). If your form's field order is different, open the actual sheet and count columns left to right starting at 0 — update the three numbers to match.

**Test it:** open `hannah/reveal.html` (locally or once pushed) and submit a test response through your form. Within a few seconds — or after a refresh — your response should replace the placeholder cards. If it doesn't, open the browser console (Cmd+Option+J) and check for a warning starting with "testimonials:" — that'll say whether the sheet failed to load (usually a sharing-permission or Sheet ID typo) or failed to parse (usually a `COLS` mismatch).

Once it's confirmed working, it needs no further attention — the page automatically re-checks the sheet every 5 minutes (configurable via `REFRESH_MS` in the same file) for as long as someone has the page open, and picks up new responses on every fresh page load regardless.

A note on volume: with only a couple of real responses, the two rows will look repetitive (the same 1-2 cards looping past repeatedly) — that's expected, and fills in naturally as more responses come in.

## 4. Go live on September 28

When you're ready (on the day, or whenever you decide to flip the switch), from the repo root:

```bash
cd /Users/ajimaglanque/Documents/playground/ajimaglanque.github.io
cp hannah/reveal.html hannah/index.html
git add hannah/index.html
git commit -m "reveal: hannah page is live"
git push
```

That's it — `index.html` is what the root `/hannah/` URL serves, so this swap is the entire "go live" action. GitHub Pages will rebuild automatically (usually under a minute; check the Actions tab on GitHub if you want to watch it happen).

### If you changed `reveal.css` after copying it once

Browsers cache CSS aggressively (we hit this exact issue on the main `aji` page earlier). If you edit `hannah/css/reveal.css` post-launch and the changes don't seem to show up for visitors, add a cache-busting version to the link tag in `hannah/index.html`:

```html
<link rel="stylesheet" href="css/reveal.css?v=2" />
```

Bump the number each time you change that file after it's live.

## 5. If you need to undo it

The old countdown page isn't deleted — it's still in git history. To restore it:

```bash
git log --oneline -- hannah/index.html   # find the commit before your swap
git checkout <that-commit-hash> -- hannah/index.html
git commit -m "revert: restore countdown page"
git push
```

## Optional: making it automatic instead

You asked for a guide to execute this yourself, so the above is the manual, no-surprises path — you control the exact moment it goes live. If you'd rather it flip automatically at midnight on September 28 with no action from you, that's also possible (either a small script that compares the visitor's clock to the date, or a scheduled GitHub Action that does the same file swap and pushes on a cron trigger). Ask if you want that built instead of, or in addition to, the manual path.
