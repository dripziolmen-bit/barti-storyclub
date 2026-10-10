# BARTI STORY CLUB — Wan MP4 integrated into the PWA

Status: implemented in `feature/barti-wan-app-integration` (2026-10-11). Confirm production deployment separately. This is **video playback of pre-rendered assets**, not runtime 3D or generative API usage.

## Storage

Canonical master media library is on VPS's second disk `/dev/sdb`, mounted at `/mnt/data`:

`/mnt/data/marka-lab/barti-story-club/animation-library/wan-app-v1`

The web app has deployable copies of 19 MP4 under `assets/character/video/` plus 19 JPEG posters in `assets/character/video/posters/`. Never overwrite the second disk's source files. `barti-wan-player.js` chooses only the currently visible clip, and `barti-wan.css` displays MP4s with white backgrounds blended softly into the UI. No background removal or alpha file is claimed. `sw.js` v27 caches player JS/CSS and one poster; it does NOT eagerly cache all 19 MP4. The old transparent animated WebP remains the fallback for missing/unsupported playback and reduced-motion users.

## Screen/state → clip mapping

| Context | Clip | Trigger |
|---|---|---|
| Home idle | `01_home_idle` | Start view |
| Welcome gesture | `02_home_wave` | Click Barti |
| Library | `03_library_invite` | Open Library |
| Reader open | `16_reader_book_open` | Open a story |
| Reader reading idle | `17_reuse_reader_idle` | Reader when not speaking |
| Narrating | `04_reader_narrate` | HTMLAudioElement play / talking |
| Pausing | `06_reader_pause` | HTMLAudioElement pause |
| Next/previous page | `05_reader_pageflip_fast` | Paragraph navigation, auto advance |
| Closing book | `07_reader_book_close` | Story finished |
| Word unfamiliar | `08_reader_thinking` | Word with no known translation |
| Word translated | `10_word_explain` | Clicking a known word |
| Word saved | `11_word_saved` | Added to personal word list |
| Quiz correct | `12_quiz_correct` | Correct option |
| Quiz incorrect | `13_quiz_incorrect` | Wrong option |
| Achievement | `14_achievement` | Enter achievements when at least one badge is earned |
| Settings | `15_settings_listen` | Enter Settings / More |
| Reader welcome (optional) | `09_reader_greet` | Available for later placement |
| Pageflip alternative (optional) | `18_reuse_pageflip` | Available, not auto-triggered |
| Surprise (optional) | `19_reuse_surprised` | Available, not auto-triggered |

Clips flagged as optional above are loaded in the repository but not auto-triggered, avoiding unrelated reactions. On one-shot completion the player returns to the current page's underlying state. Animations are decorative: gameplay/narration must never depend on video success. The generated speaking clip is **not lip-synced** to the Polish/Russian MP3s. No assertion is made that page turns are physically exact. MP4 clips can jump between poses.

## Technical hooks

- Global `window.BartiWan`: `init()`, `onPage(page, previous)`, `onMode(mode)`, `react(name, scope?)`, `quizOpen()`, `quizClose()`.
- `experience.js`: initializes player after its existing puppets are inserted; page navigation and audio modes call it.
- `app.js`: paragraph advance, saving word, word translation, quiz feedback call player.
- `index.html`: includes player CSS/JS.
- Responsive layout: desktop main reader puppet vs mobile header puppet is chosen by visibility, so invisible videos are paused. Animation is muted, `playsinline`, `preload=none`.
- `prefers-reduced-motion:reduce` prevents creation of new video players; existing static/WebP fallback is retained.
- Service-worker cache version incremented, but media is requested lazily only on visible states and may not be available fully offline.

## Verification

Isolated test server `127.0.0.1:8799` and Playwright from `/home/ubuntu/bartek-workspace/browser-tools/qa-barti-wan-app.mjs`. Tested desktop 1440×900, mobile 390×844, and reduced-motion 1440×900. Home → Library → Reader → translate/save → page flip → quiz feedback → talking/paused → back; zero JS errors or MP4 HTTP >=400. Desktop root-scrolling contract preserved. iOS Safari and physical device QA still pending. No fal.ai API or credits required to use these files.
