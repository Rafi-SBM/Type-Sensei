# Type Sensei

A focused typing trainer. Pick a test, type, and get an honest reading of how
fast and how evenly you type.

**Live:** https://type-sensei.vercel.app

Everything runs in the browser. There is no account, no server call, no
analytics, and no network traffic after the first load. Your results live in
your own browser's storage and nowhere else.

## Features

**Three test types**

- **Time** - 15s, 30s, 1m, 2m, or any custom duration from 5 seconds to an
  hour. Text is generated endlessly, so you never run out mid-test.
- **Words** - 10, 25, 50, 100, or a custom count up to 500.
- **Quote** - full passages with real punctuation, in short, medium and long.

**Three difficulty levels** drawing on separate word pools: common short words,
everyday vocabulary, or long words with awkward letter pairs. Punctuation and
numbers can be mixed into any time or words test.

**Measurements that mean something**

| Metric | What it is |
| --- | --- |
| WPM | Correct characters divided by five, per minute. Spaces count. |
| Raw WPM | The same, counting every character you typed, right or wrong. |
| Accuracy | The share of keystrokes that hit the right character. |
| Consistency | How even your pace was, from the spread of per-second speed. |

Results also break characters down into correct, incorrect, extra and missed,
and chart net and raw speed second by second so you can see where a run fell
apart.

**While you type**

- Per-character colouring, with whole mistyped words underlined after you pass
  them.
- A caret you can set to a line, block or underline, with optional smoothing.
- Backspace that steps back into a previous word only if you got it wrong, the
  way a typing test should behave.
- `Ctrl`/`Alt` + `Backspace` to clear the current word.
- Three lines of text in view at a time, scrolling as you go.

**Settings, all saved locally**

Six themes, caret style, text size, an optional synthesised keypress sound, and
three practice modes: blind mode hides per-character feedback, stop on error
refuses to advance past a wrong word, and no backspace removes corrections
entirely.

**Keyboard shortcuts**

| Key | Action |
| --- | --- |
| `Tab` | Restart with fresh text |
| `Esc` | Open settings |
| `Ctrl` + `Backspace` | Delete the current word |

**History** keeps your last 200 results, with averages and a personal best
tracked per configuration, so a 30-second easy run is never compared against a
two-minute hard one.

**Accessibility and offline**

Keyboard-first throughout, with a skip link, live regions for assistive
technology, visible focus rings, and full support for reduced-motion
preferences. All six themes meet WCAG AA contrast for body text. A service
worker caches the app so it keeps working without a connection, and it installs
as a standalone app on desktop and mobile.

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:8080.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Run the tests in watch mode |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type check without emitting |
| `npm run verify` | Everything above, in the order CI runs it |

## How it is put together

The typing engine is a pure reducer with no React in it. State goes in, state
comes out, and every rule about spaces, backspacing and when a test ends is
expressed there rather than scattered through components. That is what makes
the behaviour testable without a browser, and the test suite covers the engine,
the metrics, the text generator and the stored-data parsers.

```
src/
  components/
    typing/           Test UI: text display, mode bar, live stats, results
    ui/               Button, dialog and switch primitives
    ErrorBoundary.tsx
    SettingsProvider.tsx
  hooks/
    use-typing-test.ts  Wires the engine to timers, text refills and history
    use-settings.ts     Settings context
    use-history.ts      Stored results
    use-theme.ts        Applies the theme to the document
    use-sound.ts        Web Audio keypress click
  lib/
    engine.ts         The typing engine reducer
    stats.ts          WPM, accuracy, consistency, per-second samples
    text-source.ts    Word and passage generation
    settings.ts       Defaults and validation
    history.ts        Result storage and summaries
    storage.ts        Guarded localStorage access
  data/
    words.ts          Word pools by difficulty
    passages.ts       Quote-mode passages
```

A few decisions worth knowing about:

- **Anything read from storage is parsed, not trusted.** Settings and results
  written by an older version, or edited by hand, are repaired or dropped
  rather than crashing the app.
- **Themes are one block of CSS variables each.** Adding a theme means adding a
  block in `src/index.css` and a name in `src/lib/settings.ts`, not a second set
  of classes.
- **Per-second speed is measured per second.** Both chart lines cover the same
  window, so net speed can never appear above raw speed, and a trailing
  part-second is dropped rather than read as a slowdown.
- **The page is static.** No API keys, no environment variables, nothing to
  configure before deploying.

## Deployment

The `main` branch deploys to Vercel automatically. `vercel.json` sets the SPA
rewrite, immutable caching for hashed assets, and the security headers
including a Content Security Policy that forbids inline scripts.

Any static host works. Build with `npm run build` and serve `dist/`, with a
rewrite sending unknown paths to `index.html`.

## Licence

MIT. See [LICENSE](LICENSE).
