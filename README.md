# Northline Sign Posts: website

Real estate sign installation website, in English and 简体中文.
Hosted free on GitHub Pages; there's no build step and nothing to install.

## Updating prices, contact info and text

Everything a customer sees lives in **one file: [`config.js`](config.js)**.

1. Open `config.js` on GitHub and click the ✏️ pencil icon.
2. Change what you need (see below).
3. Click **Commit changes**. The live site updates in about a minute.

| What you want to change | Where in `config.js` |
| --- | --- |
| Phone, WeChat, email, hours, service area | `contact` |
| Business name, tagline | `business` |
| Service prices & descriptions | `services` → `price`, `unit`, `blurb` |
| Package prices | `packages` → `price` |
| Calculator add-ons (zones, extras, volume discount) | `estimator` |
| Headline numbers (signs installed, rating…) | `stats` |
| Reviews, FAQ | `testimonials`, `faq` |

Rules of thumb:

- Text that looks like `{ en: "...", zh: "..." }` has an English and a Chinese version. Update both.
- Prices are plain numbers: `75`, not `"$75"`.
- Keep the quotes and the comma at the end of each line.
- Leave a field as `""` to hide it (e.g. `email: ""` hides the email row).

### Getting quote requests by email

Right now the quote form opens a pre-filled text message to your phone and copies the request so it can also be pasted into WeChat.
To receive requests by email instead, create a free form at <https://formspree.io>, then paste its URL into `contact.formEndpoint`.

### After big edits

If a change doesn't show up, browsers may be holding an old copy. In `index.html`, bump the number in `?v=6` (on the 5 lines that load `styles.css`, `config.js`, `i18n.js`, `app.js` and `scene.js`) to `?v=7`.

## Files

- `config.js` – business details, prices, services, FAQ (edit this)
- `i18n.js` – interface wording (buttons, headings) in both languages
- `index.html`, `styles.css` – page structure and design
- `app.js` – renders the page from the config; calculator, form and animations
- `scene.js` – the 3D sign (three.js)

Tip: add `?lang=zh` or `?lang=en` to the link to open the site in a specific language, e.g. for sharing in WeChat.
