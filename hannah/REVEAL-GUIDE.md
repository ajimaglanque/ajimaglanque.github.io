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

## 3. Add the Spotify playlist

There's a Spotify embed placeholder right under the subtitle in `hannah/reveal.html`, using Spotify's own official embed widget (the same mechanism as embedding a YouTube video — nothing homemade here).

1. In the Spotify app or open.spotify.com, open the playlist you want, click **•••** (or right-click it) → **Share** → **Copy link to playlist**.
2. That gives you a URL like `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...`. Take just the part between `/playlist/` and the `?` — that's the playlist ID.
3. In `hannah/reveal.html`, find the `<iframe>` with `PASTE_YOUR_PLAYLIST_ID_HERE` in its `src` and replace just that part with your ID.

**Important — the playlist itself needs to be public, separately from the embed code.** If it's set to private, the embed only shows a playable widget to people logged into an account with access (which is why it may look fine when *you* check it, but shows "Page not found" to anyone else — including me testing it). In Spotify, that's the playlist's own **•••** menu → **Make public** (or the equivalent toggle in playlist settings). Since you're already planning to flip this at the same time as the reveal on the 28th, just make sure it's part of that day's checklist alongside the swap — worth a quick check in an incognito window (or someone else's phone) afterward to confirm it actually shows for visitors who aren't you.

That's it — no API key or auth needed, since this is a public embed. It'll show Spotify's standard player: cover art, track list, and a play button (playback previews from Spotify's own widget; a full song requires the visitor to be logged into Spotify, same as any embed elsewhere on the web). If you'd rather it not autoplay or want a different look, Spotify's embed supports a `theme=0` (dark, already set) or `theme=1` in the query string, and the iframe `height` attribute controls compact (152px, current) vs. full track-list view (352px).

## 4. Connect the Google Form + Sheet

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

## 5. Going live on September 28 — automatic

This part is now handled by `.github/workflows/hannah-reveal.yml`, so **you don't need to do anything on the day**. Here's how it works:

- It's scheduled to fire at 16:00 UTC on September 27, which is **midnight Philippine Time on September 28** — the reveal moment.
- It performs a **literal swap**, not a one-way copy: `hannah/index.html` and `hannah/reveal.html` trade contents. So afterwards, the reveal page is live at `/hannah/` (what visitors see), and the countdown page you're retiring is preserved at `/hannah/reveal.html` instead of being lost.
- It commits and pushes that swap automatically, which triggers your existing deploy (FTP sync + GitHub Pages) exactly like a manual push would.
- It's idempotent: it checks whether `hannah/index.html` still looks like the countdown page (looking for `id="timer"`) before doing anything. If the swap already happened, it skips — so there's no risk of it firing twice, or of it flipping things back and forth if this same calendar date is ever reached again in a future year.

**To test it beforehand without actually going live:** go to the repo's **Actions** tab on GitHub → **Hannah page reveal swap** → **Run workflow**. Leave **dry run** checked (it's the default) and run it — it'll perform the swap inside that run only, log what changed, and stop before committing or pushing anything. Your live site is untouched either way. Only if you ever need to trigger the *real* swap manually (e.g. the scheduled run somehow didn't fire) would you uncheck dry run before running it.

### If you changed `reveal.css` (or added other new assets) before the swap

Browsers cache CSS aggressively (we hit this exact issue on the main `aji` page earlier). If you edit `hannah/css/reveal.css` and changes don't seem to show up for visitors after the swap, add a cache-busting version to its link tag in whichever file references it:

```html
<link rel="stylesheet" href="css/reveal.css?v=2" />
```

Bump the number each time you change that file.

## 6. If you need to undo it

Because the swap is literal (not an overwrite), undoing it is just running the same swap again — `mv`-ing the two files' contents back:

```bash
cd /Users/ajimaglanque/Documents/playground/ajimaglanque.github.io
mv hannah/index.html hannah/__swap_tmp.html
mv hannah/reveal.html hannah/index.html
mv hannah/__swap_tmp.html hannah/reveal.html
git add hannah/index.html hannah/reveal.html
git commit -m "revert: restore countdown page"
git push
```

Everything is also still in git history regardless, if you'd rather restore from a specific commit instead:

```bash
git log --oneline -- hannah/index.html   # find the commit before the swap
git checkout <that-commit-hash> -- hannah/index.html hannah/reveal.html
git commit -m "revert: restore countdown page"
git push
```

## Doing it manually instead, if you ever want to

If you'd rather trigger the swap yourself at a specific moment rather than rely on the schedule, it's the exact same commands as the workflow runs — from the repo root:

```bash
cd /Users/ajimaglanque/Documents/playground/ajimaglanque.github.io
mv hannah/index.html hannah/__swap_tmp.html
mv hannah/reveal.html hannah/index.html
mv hannah/__swap_tmp.html hannah/reveal.html
git add hannah/index.html hannah/reveal.html
git commit -m "reveal: hannah page is live"
git push
```
