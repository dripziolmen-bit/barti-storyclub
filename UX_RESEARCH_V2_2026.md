# Barti Story Club — menu 2026 i źródła wzorców
Stan wdrożenia: 2026-10-09. Wersja: wieloekranowa PWA ze Startem, Biblioteką, Czytnikiem, Słówkami, Osiągnięciami i Ustawieniami.
Zasada: naśladuj sprawdzone zachowania (nie kopiuj kodu, grafiki ani identyfikacji wizualnej). Autorskie elementy Bartiego, ilustracje bajek i logika własnego czytnika.

## 10 kodowych referencji dostępnych na VPS
Repozytoria pobrano wcześniej do research/barti-app-references i research/barti-ux-2026/reference-code:
1. Lute (github.com/LuteOrg/lute-v3) — pętla czytaj, poznaj słowo, zapisz
2. LingKuma (github.com/lingkuma/LingKuma) — interakcje z tłumaczonym słowem
3. Lector (github.com/heuwels/lector) — słownik i powtórki w kontekście
4. Fluent Reader (github.com/nramos0/fluent-reader) — hierarchia czytnika
5. Foliate (github.com/johnfactotum/foliate) — opcje wyglądu tekstu
6. React Reader (github.com/gerhardsletten/react-reader) — nawigacja po tekstach
7. Thinkread (github.com/nikunjsingh93/thinkread-ebook-reader) — powierzchnia do czytania
8. Weread (github.com/ranuts/weread) — przyjazne układy książek
9. Koodo Reader (github.com/koodo-reader/koodo-reader) — biblioteka i okładki
10. Readium CSS (github.com/readium/readium-css) — typografia EPUB/reading
Nie wykonano instalacji binarnej wszystkich produktów; analizowano ich publicznie dostępne repozytoria. Nie importowano obcego kodu do Bartiego. Licencje i granice wykorzystania muszą zostać sprawdzone przed jakimkolwiek przejęciem modułów.

## Wzorce z aplikacji komercyjnych (opracowane na bazie ich materiałów)
- LingQ: czytanie z podświetleniem i zapisem słowa; https://www.lingq.com/en/ios-app-support/
- Readwise Reader: motyw czytania, ustawienia wielkości, ograniczenie narzędzi w trybie skupienia; https://docs.readwise.io/reader/docs/faqs/appearance
- Libby: oddzielenie nawigacji i widoku strony; https://help.libbyapp.com/en-us/categories/reading-books.htm
- Beelinguapp: biblioteka i równoczesny lektor; https://beelinguapp.com/
- Epic: odkrywanie książek przez okładki i poziom; https://www.getepic.com/parents
- Storytel: stały odtwarzacz, prędkość i przegląd katalogu; https://screensdesign.com/showcase/storytel-audiobooks-library

## Wdrożony flow
Start (duży Barti z animacją, postęp, CTA) → Biblioteka (okładki 3 bajek, filtry A1/A2/ulubione, wyszukiwanie) → szczegóły (ilustracja + kontekst) → czytnik (nagrania Piper, word timestamps, tłumaczenie, zapis, pauza, przewijanie) → powrót do biblioteki. Dolna nawigacja mobilna (Start, Biblioteka, Moje słowa, Osiągnięcia, Więcej).
- Postać: 6 animowanych póz w assets/character/ na podstawie bieżącego zdjęcia Bartiego z 2026-10-09, *bez wymyślonego ogona*. Stany: idle, blink, wave, speak, explain, celebrate.
- Okładki: lokalne grafiki 3 bajek (assets/visuals/covers), już wcześniej przygotowane do projektu.
- Tryb offline: PWA, lokalne MP3 i słownik zapisane przez service worker / localStorage.
- Metryki, „poziom” i seria dni wyłącznie lokalne w przeglądarce, żadnego niepotwierdzonego konta lub centralnej synchronizacji.
- Nie jest to natywny pakiet podpisany dla Apple App Store; to działające na iOS/Android PWA przez link.

## Testy
Playwright: 320×640, 390×844, 430×932, 820×1180, 1440×900 — home CTA, lista 3 bajek, filtr, wyszukiwanie, ulubione, modal szczegółów, tekst/audio/pauza, tłumaczenie i zapis, słówka, osiągnięcia, ustawienia, brak błędów JavaScript i przepełnienia w poziomie. Test PWA offline i publiczne HTTPS wykonywać po publikacji.
