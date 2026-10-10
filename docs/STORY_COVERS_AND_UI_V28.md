# BARTI STORY CLUB — okładki bajek v2 i uproszczony interfejs (2026-10-11)

**Zadanie użytkownika:** zastąpić wszystkie niespójne kreskówkowe SVG w bibliotece rzeczywistymi dopracowanymi ilustracjami, zachowując jakość i styl 3 istniejących pełnych grafik, wyeliminować redundantny górny pasek nawigacji, podpisy/powtórzenia/liczniki i nieestetyczną nakładkę Bartiego.

## Źródła i wersjonowanie

- **Kanoniczne JPG plus WebP:** drugi dysk VPS, `/mnt/data/marka-lab/barti-story-club/story-covers/v2/`. Oryginalne 15 wygenerowanych JPG pozostaje nienadpisane; `*-refined.jpg` zawiera poprawkę trzech błędów semantycznych.
- **W aplikacji:** `assets/visuals/covers/<storyId>.webp`. Jest komplet **18**: 15 nowych, zachowano bez zmian repka, ryaba i kolobok.
- **Model:** fal.ai `fal-ai/flux-pro/v1.1` 15 generacji; dodatkowo 3 korekty modeli `fal-ai/flux-pro/kontext` dla lisa/raka, szczupaka/Emelii i kota/koguta/lisicy. Wczesna próbka `cover-test-snegurochka.jpg` z innym wariantem nie jest używana (pozostawiła rzepkę na obrazie).
- Ilustracje są nowymi, wygenerowanymi obrazami, nie kopiami cudzych książek. Faktyczny rachunek sprawdzić w fal Billing; szacunkowo 15×ok. $0.04 oraz 3×ok. $0.04, podatki osobno.
- Pełna plansza 15 okładek na dysku: `CONTACT_SHEET_15.jpg`. 3 poprawione kadry porównane w `QA_REFINED.jpg`.

## Zmiany UX

- `index.html`: uproszczony nagłówek „Wybierz swoją bajkę”, bez odrębnego napisu „BIBLIOTEKA OPOWIEŚCI”, bez powtarzanej etykiety „WSZYSTKIE OPOWIEŚCI”, podtytułu i widocznego licznika `18 bajek`.
- `experience.js`: wszystkie 18 `storyId` korzystają z `.webp`; w czytniku poprawiony obraz zależny od aktualnie wybranej bajki; przycisk Wstecz zachowany, przenoszony do nagłówka bieżącego ekranu, nie do osobnego górnego paska.
- `library-clean-v28.css`: ekran Start/Biblioteka/Moje słowa/Osiągnięcia/Ustawienia bez osobnego białego topbara. W Bibliotece Barti (Wan `03_library_invite.mp4`) stoi obok filtrów, nie jest podwójnie nakładany przez `library-headline::after` z `assets/art/barti-cutout.png`; film ma miękkie wygaszenie białego tła. CSS utrzymuje elastyczny układ desktop/mobile, przycisk cofania jest zawsze widoczny i dostępny.
- Czytnik: górny pasek `app-top` zastąpiono niewielkimi przyciskami umieszczonymi **wewnątrz nagłówka czytania**, z zachowaniem funkcji Wstecz, menu Biblioteki, Skupienia i ustawień czcionki. Usunięto powtórzony czas czytania w tytule i zbędny licznik bajek w panelu bocznym. Nie usunięto potrzebnych etykiet trudności w kafelkach.
- `sw.js` cache `v28`: komplet 18 ilustracji WebP na explicit `CACHE_ALL` (przycisk pobrania biblioteki), nowy CSS buforowany przy instalacji, stare SVG nie są więcej wymagane.

## QA i uwagi

Playwright test (VPS) `/home/ubuntu/bartek-workspace/browser-tools/qa-barti-covers-v28.mjs`, widoki 1440×900 desktop, 390×844 mobile i 320×568 mały mobile. Zweryfikować przy wypuszczeniu: 18/18 obrazów wczytuje się, bez błędów JS i HTTP, topbar jest ukryty, Wstecz przeniesiono do `library-title-block`, nadal działa Start ↔ Biblioteka ↔ Czytnik, a Czytnik nie ma redundantnego `app-top`. Nie ma poziomego ani pionowego przewijania **root** na desktopie; kafelki przewijają się lokalnie.

Media źródłowe na dysku 2 przechowywać jako wersję v2. PWA przechowuje zoptymalizowane .webp. Stare .svg pozostały w repo jako historyczne i nie są używane. **Nie przechowuj klucza fal.ai w repo.** Fizyczny iOS Safari do późniejszego QA.
