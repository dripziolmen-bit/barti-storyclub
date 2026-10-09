# Barti Story Club — real application UX and animation v1.1.0
Date: 2026-10-09.

## Navigation benchmarks and choices
These are *mechanic* comparisons, not permission to reuse proprietary screenshots, code, fonts or music:
1. Khan Academy Kids: explicit Home → Library → Books, and Read To Me / Read Myself (https://khankids.zendesk.com/hc/en-us/articles/4409036780955-Learn-more-about-the-books-in-the-Khan-Academy-Kids-app). We apply the explicit home destination, illustrated category and dedicated reading screen.
2. Libby: stable bottom destinations and reader back navigation (https://help.libbyapp.com/en-us/6011.htm); use fixed nav for the five app areas.
3. LingQ: library with guided lessons, click words during synchronized playback (https://www.lingq.com/en/ios-app-support/); preserve the click-translate-save loop.
4. Readwise Reader: preferences and long-form reading modes (https://docs.readwise.io/reader/docs/faqs/appearance); font size, light/dark and focus controls.
5. Duolingo ABC (https://www.duolingo.com/abc): story-centric beginner navigation, clear single-action flow; no fabricated gamification.
6. Epic! (https://www.getepic.com/): illustrated browsing, large touch targets; only our own three covers.
7. Vooks (https://www.vooks.com/): story cover previews and a character-led landing; no copyrighted screen capture reproduced.
8. Storytel (https://www.storytel.com/): consistent play/pause/speed and audiobook navigation; use existing Piper audio.
9. Novel Effect (https://noveleffect.com/faq/): a book cover starts an interactive reading experience; audio and visuals reinforce rather than hide text.
10. Beelinguapp (https://beelinguapp.com/): readable bilingual reading; word translation appears contextually.
11. Kindle/Apple Books: maximize text legibility, increase font and keep decorative controls outside the reading surface.
12. Readlang (https://readlang.com/): word lookup while preserving reading flow.

## Actual open-source repositories downloaded and reviewed on VPS
`/home/ubuntu/bartek-workspace/research/barti-v1-app-inspiration` contains **12 actual shallow Git clones**: LingKuma, TaleTime, audiobookapp, conty, foliate, koodo-reader, lector, lute-v3, react-reader, storylark, visemes-animation, weread.
Proprietary apps above were researched from public product information rather than claiming their proprietary app packages were downloaded. No third-party implementation was blindly pasted into this repository. Assets/audio/license status as before.

## Implemented v1.1.0
- Start: seated no-tail Barti, animated faces/arm gestures, real local counters for words/completions/streak, one primary CTA, continue last reading position.
- Library: three original illustrated Russian stories, search, A1/A2 and favorites filters, accessible book-detail dialog.
- Reader: separate view, story art, real audio, word-time highlighting, local translation, vocabulary saving, pause/seek/speed.
- Additional areas: stored vocabulary, real achievements, more/settings; five navigable tabs on mobile and expanded desktop nav.
- Character: original user-supplied sitting Barti photo used as visual reference; six transparent purpose-generated seated poses **without additional tail** at `assets/character/`.
- Runtime 2D animation: timed idle blink/wave, talking and explanatory gestures synced to audio currentTime, play/pause state, separate celebration pose. This is a 2D animated character, not a 3D skeletal rig or lip-synced motion capture.
- Retain the user's 3 stories, 19 Piper MP3 segments, offline word dictionary, 238 word timestamp entries, PWA functionality.
- Prevent unwanted legacy tail images from loading by removing stale sprite sources and bumping service worker cache.

## Validation
- Playwright screen size 320×568, 390×844, 820×1180, 1440×900: home → library → favorite → detail → reader → word translate/save → play/pause → achievements → settings → home.
- Explicit video-frame/animation checks verify different poses during idle and speech.
- Public Pages build and real HTTPS/offline PWA test must pass after publication before claiming ready.
- Device-level iOS/Android human testing and native App Store build remain out of scope of this release; web/PWA deployment remains public.
