# Audyt wizualny BARTI STORY CLUB — v29 (2026-10-11)

## Metoda
Audyt działającej aplikacji na VPS w Chromium/Playwright, viewporty **1440×900, 390×844, 320×568**. Testy wykonywane na odizolowanym worktree `feature/ui-ux-audit-v29`, bez ingerencji w produkcję przed testem. Zbadano widoki: Start, Biblioteka, Czytnik (normalny/skupienie/ciemny/skupienie+ciemny), Moje słowa, Osiągnięcia i Ustawienia.

## Błędy i rozwiązania

| Problem widoczny w produkcji v28 | Przyczyna z audytu | Rozwiązanie v29 |
|---|---|---|
| Tryb Skupienia rozsypywał tekst bajki w cienką pionową kolumnę | `.app-shell` zachowywał niespójny grid; `.main-area` miało **232px**, `.reading-surface` **32px** przy 1440px | CSS wymusza jeden pełny grid track w focus, szerokość głównej kolumny **1120px**, karta **988px**, ukrywa side panels desktop |
| Ciemne czytanie miało bardzo blady tekst na niemal białej karcie | `body[data-theme=dark]` ustawiało jasną czcionkę, ale `v2.css` wymuszał `#fffbfe` na `.reading-surface` | Spójne ciemne tło **#252129**, czytelna czcionka **#f4edf2**, różowy tytuł, kontrastowe zaznaczenia; CSS dla całego readera i panelu ustawień |
| Tryb dark + focus rozpadał się jednocześnie | Kombinacja powyższych | Naprawiono łącznie, przetestowano wszystkie cztery kombinacje |
| Ekran główny miał trzy tanio wyglądające płaskie kafle | Stare home-words/home-achievements/home-settings.webp | Trzy nowe premium ilustrowane WebP (Flux), wizualnie spójniejsze z nowymi okładkami; oryginały, obrazy po korekcie oraz WebP na drugim dysku |
| Powtarzane mikronagłówki i hasła w menu | `menu-hero-kicker`, `menu-eyebrow`, `menu-section-kicker`, `menu-section-subtitle` | Usunięto z widoku. Zostają jeden główny nagłówek i konkretne miejsca docelowe |
| Każdy kafelek miał opis o tym samym co nazwa oraz małą strzałkę | Powtarzane `small` i `menu-destination-arrow` | Usunięto z widoku, zachowano całe kafelki jako duże przyciski; są podpisane |
| Czytnik powtarzał poziom, gatunek, czas, drobne informacje i kolejny tytuł w playerze | `lesson-tag`, `story-subtitle .dot-separator`, `reader-toolbar`, `reading-footer`, `player-left`, licznik quizu, menu Instalacji | Ukryto zbędne etykiety; pozostawiono tytuł bajki, polskie objaśnienie, nawigację, odtwarzanie, prędkość, muzykę, słownik i quiz |
| Panel obok Bartiego podawał zbędną etykietę „Twój lektor” i powitanie | `mascot-card-top` | Ukryto informację, zachowano samą postać i interakcję słownikową |
| Panel ustawień był za duży i niespójny nocą | Pierwotny rozmiar i kolory | Zmniejszono panel, ciemny wariant, przywrócono czytelny focus i przyciski |

## Pliki i źródła
- `ui-audit-v29.css` — warstwa poprawek, ładowana **na końcu** (zamiast nadpisywania wielu starszych arkuszy)
- `index.html` — import CSS
- `sw.js` — nowa wersja cache `v29` i precache CSS, istniejące zasoby menu podmienione bez zmiany URL
- `assets/illustrations/home-{words,achievements,settings}.webp`
- **Dysk 2:** `/mnt/data/marka-lab/barti-story-club/main-menu-illustrations/v29/` (JPG źródłowe + ich wersje po korekcie + skompresowane WebP); nie trzymać tu tokenów fal.ai.

## Kontrola jakości
- Automatyczny raport computed-layout: przed **32px** focus karty, po **988px**; dark wcześniej biały `rgb(255,251,254)`, po ciemny `rgb(37,33,41)` i tekst `rgb(244,237,242)`.
- `/home/ubuntu/bartek-workspace/browser-tools/audit-barti-v29.mjs`: zrzuty normal/focus/dark/both desktop i mobile, brak pageerrors.
- `/home/ubuntu/bartek-workspace/browser-tools/qa-barti-ui-v29.mjs`: rzeczywiste kliknięcia Focus, Aa, theme, Escape, back, nawigacja po 4 ekranach. **3/3 kontekstów PASS** (1440,390,320) bez JS errors i brakujących assetów, no horizontal overflow.
- Do dalszego QA: iOS Safari i realny Android/iPhone, długość pętli Wan, dokładny lip-sync. Video i audio pozostawiono bez zmian. Zdjęcia z modelu AI są grafikami pomocniczymi, a nie wiernymi kopiami maskotki (uniknięto generowania nowych wariantów twarzy Bartiego w finalnych kartach menu).

## Zasady
Nie usuwano przycisków, od których zależą event listenery; zbędne elementy dekoracyjne/metadata są ukryte w CSS. Podstawowe funkcje: wybór bajki, odtwarzanie, przewijanie, quiz, słownik, zapis słów i powrót — **zachowane**. Wersja z pełnymi oryginalnymi MP4 nadal na drugim dysku `/mnt/data/marka-lab/barti-story-club/animation-library/wan-app-v1`. Kolejne zmiany po audycie: unikać dokładania kolejnych pasków UI i powielania informacji.
