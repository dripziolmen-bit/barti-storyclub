# Barti Story Club — UX research & product decisions (2026-10-08)

## Goal
A reading-first product that feels like a focused mobile app, while keeping a fast accessible desktop interface. The UX goal is fewer simultaneous decisions, not more gradients or effects. A reference project is for architecture study, not permission to relicense or copy its code.

## Benchmarked open-source repositories (shallow sparse research clones, VPS)
Workspace: `~/bartek-workspace/research/barti-app-references/` and `~/bartek-workspace/research/barti-ux-2026/reference-code/`.

Reading / language products:
- https://github.com/LuteOrg/lute-v3 — vocabulary collection attached to reading
- https://github.com/lingkuma/LingKuma — word lookup without losing context
- https://github.com/heuwels/lector — simplified content surfaces
- https://github.com/nramos0/fluent-reader — adaptable sidebar and quiet reading
- https://github.com/johnfactotum/foliate — reading settings, typography and navigation
- https://github.com/gerhardsletten/react-reader — reader-first layout patterns
- https://github.com/nikunjsingh93/thinkread-ebook-reader — text reading surface ideas
- https://github.com/ranuts/weread — digital book reader interaction
- https://github.com/koodo-reader/koodo-reader — personal reader libraries
- https://github.com/readium/readium-css — EPUB typography and page treatment

Accessibility / UI infrastructure references:
- https://github.com/mui/material-ui — spacing systems and control hierarchy
- https://github.com/radix-ui/primitives — deliberate dialog and control states
- https://github.com/ariakit/ariakit — accessible interaction patterns
- https://github.com/w3c/aria-practices — keyboard and ARIA semantics
- https://github.com/focus-trap/focus-trap — overlay focus handling
- https://github.com/floating-ui/floating-ui — contextual floating panels
- https://github.com/atomiks/tippyjs — ephemeral tooltips and popovers
- https://github.com/mozilla/readability — remove reader distractions
- https://github.com/atuinsh/atuin — fast command retrieval / optional navigation inspiration (not applied to Barti)

Downloaded references may have different licenses. No wholesale code, media, package, or proprietary interface from those repositories was copied into the app. The original Barti code remains its own implementation.

## UX and research references
- NN/g Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- W3C WCAG 2.2 target size / accessibility: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- Material adaptive layouts: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- Material mobile bottom-sheet pattern: https://m1.material.io/components/bottom-sheets.html
- Readwise Reader typography and appearance: https://docs.readwise.io/reader/docs/faqs/appearance
- Readwise Quick Lookup: https://docs.readwise.io/reader/guides/ghostreader/quick-lookup
- Readwise mobile and desktop reading UX case study: https://www.lazertechnologies.com/case-studies/readwise
- LingQ, Readlang, Beelinguapp: secondary research on reading plus vocabulary.

## Decisions implemented in v0.5
1. Single primary task: read/listen. The big center column prioritizes legible Russian text; other sections are secondary.
2. Responsive navigation: persistent left library on desktop, one deliberate swipe-free drawer on mobile.
3. A mobile player fixed above safe-area insets, with clear play/pause and progress; no dense sidebar and no full-screen decorative mascot.
4. Word lookup displayed as a transient bottom panel on mobile, or in the right rail on desktop. The reader does not navigate away from the story to show translations.
5. Reading preferences hidden behind a single visible `Aa` action: text sizing and a light/dark reading theme.
6. Focus mode hides side navigation and decorative rail on wide screens, preserving text, captions, and audio.
7. Story illustrations are minimal: user-provided Barti used once where it adds character; no regenerated images, fake hero cards, or clutter.
8. WCAG-oriented semantics, readable contrast for supporting labels, responsive target sizes, reduced-motion support.
9. Reader-level progress indicator and deliberate animation only for current spoken word / Barti talking.
10. All existing functional assets preserved: 3 stories, 19 audio segments, phoneme word timing, offline translations, vocabulary, quiz, PWA.

## Validation
Six Playwright scenarios from 360px to 1512px including changing stories, playback, pause, translating and saving a word, quiz, reader settings, dark mode, and focus mode. Automated axe WCAG tags checked on mobile/desktop in light/dark themes. Limitations: automated audits do not establish universal accessibility or production fitness; physical iOS/Android usability testing is still necessary. No native App Store package is claimed.
