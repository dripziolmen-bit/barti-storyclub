# Barti Story Club v1.0: research, sources, and implementation

Date 2026-10-08. Twelve repositories were checked out to VPS as shallow/sparse clones in:
`/home/ubuntu/bartek-workspace/research/barti-v1-app-inspiration/`.

## Twelve similar open-source applications / functional references

| Repository | Pattern reviewed | Applied or rejected |
|---|---|---|
| [TaleTime](https://github.com/TaleTime/TaleTime) | child-centered branching stories and narration; Twine-based story authoring | Applied story-centric home → discover → play mental model; no original code imported |
| [Conty](https://github.com/Akylas/conty) | offline interactive kids' story library | Applied clear cover-based library and offline-first reading; license MIT |
| [Audiobook App](https://github.com/homielab/audiobookapp) | React Native audiobook home, nav, transport | Applied compact transport and separate reader destination; no React Native bundling |
| [StoryLark](https://github.com/StoryLark/storylark) | PWA stories, word-synced narration, offline cache | Existing Barti timing and PWA retained; avoid introducing external database needlessly; Apache 2.0 |
| [Lute](https://github.com/LuteOrg/lute-v3) | saved vocabulary tied to reading and contextual lookup | Existing offline word capture kept, now top-level saved-words screen |
| [LingKuma](https://github.com/lingkuma/LingKuma) | unobtrusive word translations while reading | Keep translation in contextual sheet, not cluttering reader |
| [Lector](https://github.com/heuwels/lector) | learner-first reading workflows | Keep study tools secondary; check license before reusing any code (AGPL) |
| [Foliate](https://github.com/johnfactotum/foliate) | eBook selection, reader typography, rich book presentation | Detail preview and reading settings preserved |
| [React Reader](https://github.com/gerhardsletten/react-reader) | EPUB reader separation of library and content | Use distinct screen transition; not importing EPUB engine for 3 short stories |
| [Weread](https://github.com/ranuts/weread) | pleasant content library and personal reading | Illustrations are actual tappable story covers, not decoration |
| [Koodo Reader](https://github.com/koodo-reader/koodo-reader) | digital books library navigation, calm book card imagery | Study polished cover grid; AGPL means avoid copying implementation |
| [Visemes Animation](https://github.com/timpratim/visemes-animation) | sprite sheet mouth visemes driven by audio | 16-frame mesh-sprite film + separately animated eye blink and mouth, linked to play/pause; original implementation, not imported model |

Also consulted Apple HIG 2026 tab bars and sidebars:
https://developer.apple.com/design/human-interface-guidelines/tab-bars
https://developer.apple.com/design/human-interface-guidelines/sidebars
Apple recommends top-level tabs and controlled transitions rather than overcrowded sidebars on narrow screens.

## UX hierarchy

1. **Start**: brand and talking mascot; primary "Odkryj bajki", secondary "Kontynuuj"; preview of the 3 real stories.
2. **Biblioteka**: three large original story illustrations, search by title in RU/PL, level filters, selection shows book-detail preview.
3. **Czytanie**: back to library, responsive text-focused reader, audio, synchronized word highlighting, clickable translation/saving, Barti animates while speaking.
4. **Moje słowa**: separate page; saved words from existing browser storage and quiz, with a clear empty state.
5. Shared top nav on desktop, bottom tab bar on mobile. Dedicated controls inside reader, so app functions no longer compete on one screen.

## Illustration provenance and animation

- Generated on 2026-10-08 specifically for this user: a coherent three-panel story illustration, cropped into covers for Repka, Ryaba, Kolobok. These files are original task outputs, not scraped proprietary artwork.
- Source mascot: the most recent user-supplied Barti image. PIL/OpenCV background separation and 16 software-generated elastic sprite frames stored as `assets/art/barti-motion.webp` (16 frames in horizontal spritesheet). The original still is also backed up as `barti-cutout.png`.
- Frame animation includes independent blinking eyelid overlays and mouth motion while audio playback, accelerated frame rate for speech, paused frame for pause. This is a stylized multilayer 2D animation, **not** an entire facial skeleton, a 3D rig, or an AI-generated movie. Honest product wording matters.
- Rendering remains completely local to client after assets are downloaded; playback uses existing Russian-language MP3 created with Piper Denis. Existing word timing and offline lexicon retained.
- Source clones are references only. No third-party implementation was wholesale copied into the production app without a license audit.

## Quality gates

- Test exact routes: home → library → story details → reader → word translator → saved words; back/forward browser navigation, filter search, hero continue, pause/play.
- Test viewports 320x568, 390x844, 412x915, 820x1180, 1440x900.
- Test if media plays and 16-frame background animation changes during time; paused state must be reflected.
- Run Axe WCAG 2 AA, 2.1 AA and 2.2 AA programmatic checks for home/library/reader on mobile and desktop.
- Run public HTTPS browser test and service-worker offline access (HTML, JS, images, audio).
- Open actual UI screenshots: desktop and mobile.
- Never claim native App Store publication or a full 3D animation.

## Future work

More legally clear children's stories and a professional voice actor, phoneme-specific lipsync (mouth visemes from actual Russian phoneme timing rather than a rhythmic loop), progress tracking beyond localStorage, test on real Apple/Android devices, App Store package/signing, localized metadata, SRS review across long-term sessions.

## Update: pink fairytale screen design (v0.7)
From the user's approved visual references: start menu and illustrated library, separate reader scene. Generated covers for Repka, Ryaba and Kolobok in `assets/visuals/covers/`, and six cohesive full-body Barti poses (idle, blink, talk, explain, wave, celebrate) in `assets/visuals/sprites/`. The real app uses responsive DOM controls and JS routing, not one flattened mockup. Animation uses original CSS keypose switching tied to play, pause and interaction; this is 2D pose animation and **not a rigged 3D actor**. All images were created for the user, no unlicensed scraped app assets are included.
