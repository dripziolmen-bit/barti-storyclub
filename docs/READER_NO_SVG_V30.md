# Reader Barti v30 — removed legacy SVG overlay (2026-10-11)

## Root cause

The user continued seeing a mismatched vector-drawn book over Barti in the Reader and a pink rectangle behind the character. This was **real**, not a browser zoom or image ratio problem. The app had two separate legacy CSS overlay rules:

- `v2.css`: `.mascot-stage .barti-mini-puppet .puppet-film::after` and `.head-barti-mobile .barti-mini-puppet .puppet-film::after` set `background-image: url('./assets/character/reader-book.svg')`. Legacy CSS rendered this when Wan video was unavailable, disabled or not ready.
- `menu-v22.css`: `.menu-welcome-character .puppet-film:after` drew the same SVG on top of Home Barti.
- `sw.js` kept `reader-book.svg` in its PWA `SHELL` list, potentially maintaining stale caches.
- Old `#bartiImage` and mobile header images pointed to `assets/barti.webp` (the original mascot holding a tablet), not the generated reader model.
- `v2.css` / `styles.css` colored the entire desktop mascot stage pastel pink, causing a conspicuous box behind the video.

## Fix

**Removed at the source:** both CSS overlay blocks, the SVG file, and the service-worker cache reference; no code references `reader-book.svg` remain. Renamed `v2.css` and `menu-v22.css` query versions to `v30` to avoid previously cached CSS. Added `mascot-clean-v30.css` as a final override.

**New fallback:** if Wan MP4 is blocked, not supported or reduced motion is enabled, show `assets/character/video/posters/17_reuse_reader_idle.jpg` (real frame from the Wan animation, showing an actual physical blue `SŁOWNIK` book), not the old phone/sprite or a drawn SVG. Replaced reader-side/mobile static `assets/barti.webp` references with the same poster. On normal desktop Wan MP4 continues working unchanged. Hides legacy motion layers **only in Reader** so unrelated Home character animation remains functional.

**Layout:** Reader mascot stage and card now have transparent backgrounds; studio edge fades softly with CSS mask. No destructive chroma-key processing or alpha claim. Pink rectangular card background is gone on desktop including dark mode.

**Cache:** PWA `sw.js` cache `barti-storyclub-v30`; includes poster but not SVG. Assets remain self-contained in app without fal.ai requests.

## QA

Playwright run on VPS using `/home/ubuntu/bartek-workspace/browser-tools/qa-svg-v30.mjs`: **6/6 passed** (desktop, no MP4/blocked, dark, reduced-motion, mobile, mobile-reduced). Assertions: no SVG request, no pseudo-element book background/content in Home or Reader, desktop stage/card backgrounds transparent, 0 JS errors, 0 missing media HTTP responses, reader navigation functional, no horizontal overflow, and video fails gracefully to true-Wan-frame poster. Explicit movie download blocking verified background-image uses the Wan poster and displays the correct book. Desktop light screenshots show no pink rectangle. Browser source code previously had the overlay cached; the new query versions are critical.

Keep `reader-book.svg` deleted. Any new actual book illustrations must be part of the generated reference/MP4, not injected onto Barti through pseudo-elements. Do not silently re-add book SVG overlays, even as fallback.
