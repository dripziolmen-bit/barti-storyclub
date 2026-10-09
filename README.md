# Barti Story Club · interaktywny rosyjski

Wersja demonstracyjna PWA (instalowalna jako aplikacja web na Android/iOS), zbudowana na przesłanej grafice Bartiego.

## Funkcje
- 3 rosyjskie opowieści ludowe, nowe własne skrócone opracowania językowe
- 19 plików MP3 wygenerowanych lokalnie na VPS przez Piper Denis, z modelu trenowanego na zbiorze danych CC0, sterowanie start/pauza/wznowienie/stop, przewijanie i zmiana tempa
- animacja Bartiego zsynchronizowana ze stanem odtwarzacza, delikatna opcjonalna ścieżka ambientowa
- podświetlanie słów na podstawie znaczników fonemowych wygenerowanych przez ten sam model Piper co pliki audio (bez zewnętrznego forced alignera).
- natychmiastowe klikane tłumaczenia offline, zapis słówek w localStorage
- 4-pytaniowy mini-quiz, odtwarzanie mobilne i desktopowe
- manifest PWA i service worker do częściowego trybu offline

## Użytkowanie i uruchamianie
Na VPS: `python3 -m http.server 8787 --bind 127.0.0.1 --directory /home/ubuntu/bartek-workspace/projects/BARTI_CZYTA`.
Dla HTTPS potrzebny jest hosting publiczny z certyfikatem (np. GitHub Pages).

## Komponenty i licencje
- Barti: zasób graficzny dostarczony przez użytkownika i przetworzony do formatu webp. Prawa do postaci i dalszej dystrybucji zależą od praw właściciela grafiki.
- Opowieści: własne, skrócone opracowania folklorystycznych motywów, bez kopiowania współczesnych adaptacji.
- HTML/CSS/JS: napisane na potrzeby tego projektu, bez kopiowania kodu cudzych aplikacji.
- Pliki audio demo: przygotowane jako zasoby demonstracyjne. Przed komercyjnym wykorzystaniem audio zweryfikuj prawa do nagrań, modeli głosowych i muzyki. Można je zastąpić plikami nagranymi przez lektora lub głosem z osobną licencją.
- Inspiracje architekturą (bez kopiowania kodu): Lute v3 (MIT), LingKuma (MIT), Lector (sprawdź jego własną licencję), technologie PWA i odtwarzacz HTMLAudioElement.

## Co NIE jest jeszcze gotowe do sklepu
Native build iOS/Android, osobne testy na fizycznych urządzeniach, weryfikacja praw do audio i grafiki, automatyczne tłumaczenie poza 3 wbudowanymi opowieściami, synchronizacja słów z wyrównywaniem fonetycznym oraz pełna zgodność z regułami Apple App Store/Google Play.

### Głos narracji
Piper Russian Denis (medium), model/zbiór danych: https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU/denis/medium, MODEL_CARD: CC0 dataset. Synteza lokalna na własnym VPS, model nie jest dystrybuowany w repo. Podane znaczniki czasowe powstają z alignments modelu przy generowaniu.

## Publiczne demo i instalacja PWA
Adres publiczny: https://dripziolmen-bit.github.io/barti-storyclub/
- Android / Chrome: w aplikacji przycisk „Zainstaluj” lub opcja „Zainstaluj aplikację” w menu przeglądarki.
- iPhone / Safari: przycisk Udostępnij → Do ekranu początkowego.
- Na komputerze działa w przeglądarce. Zainstalowanie PWA nie jest równoznaczne z publikacją w Apple App Store.

## Testy jakości z 2026-10-08
- Playwright: ekran mobilny 390 × 844, tablet 820 × 1180 i komputer 1440 × 900.
- Odtwarzanie, pauza, stan animacji, zmiana bajki, polskie tłumaczenia, zapisywanie słów, quiz oraz brak poziomego przewijania.
- Audio offline tworzone przez Piper Denis; znaczniki pozycji wszystkich 238 słów w 19 akapitach.
- Test publicznej wersji PWA obejmuje odtwarzanie MP3 i dostępność danych po odłączeniu sieci.
- Zasady prywatności: privacy.html.

## Wzorowanie i użycie kodu
Na VPS w research/barti-app-references pobrano archiwa kodu źródłowego do analizy interakcji: Lute, LingKuma, Lector i Fluent Reader. Kod funkcjonalny Barti Story Club został napisany oddzielnie; nie przeniesiono bezpośrednio modułów pod licencją copyleft do projektu. Wszelkie przyszłe zapożyczenia wymagają zgodności z licencją autora.


## UX 2026 — wydanie 0.5.0
Nowy układ mobile-first: czytanie na pierwszym planie, wysuwana biblioteka, kontekstowe tłumaczenie, responsywny odtwarzacz, zapamiętywane ustawienia wielkości tekstu, tryb ciemny i skupienia, drobne animacje zgodne z ustawieniem ograniczenia ruchu, poprawione kontrolki dotykowe. Szczegóły badań wzorców i repozytoriów: `UX_RESEARCH_2026.md`. Testy Playwright na 6 szerokościach, axe/WCAG i Lighthouse wykonane na VPS. To nadal PWA, nie opublikowany natywny pakiet w Apple App Store.

## Interfejs jednookienkowy (v0.6)
Na telefonie nagłówek z Bartim, trzy przyciski wyboru bajek i skróty Moje słowa / Krótki quiz / Dodaj do telefonu są stale widoczne w górnej części aplikacji. Czytnik przewija jedynie tekst opowieści; odtwarzacz pozostaje na dole. Na desktopie boczna biblioteka, Barti i treść dzielą jeden ekran. Testy Playwright obejmują mały telefon 320×568 aż po 1440×900, weryfikują brak przewijania całego dokumentu i możliwość przełączenia bajki.

## Barti Story Club 1.0 — aplikacja z ekranem startowym i biblioteką (2026-10-08)
**Publicznie:** https://dripziolmen-bit.github.io/barti-storyclub/

Nowa struktura: Start → Biblioteka → szczegóły bajki → Czytanie. Oddzielny ekran zapisanych słówek oraz quiz. Mobile ma trzy karty nawigacji; desktop — nawigację w nagłówku. Ekran czytania zachowuje rosyjskie MP3, śledzenie tekstu i lokalne polskie tłumaczenia.

3 oryginalne ilustracje scen z rosyjskich bajek są częścią pakietu, a postać bazuje na najnowszym obrazku Bartiego dostarczonym przez użytkownika. Wersja ma wielostanową animację postaci 2D (mruganie, reakcje, czytanie, machanie, radość, pauza), powiązaną ze stanem odtwarzacza; nie jest to szkieletowa animacja 3D ani pełny automatyczny lip-sync fonemów.

Do analizy pobrano 12 repozytoriów podobnych czytników, aplikacji audiobookowych i rozwiązań animacji, szczegóły w UX_RESEARCH_V1_APP.md; nie kopiowano cudzego kodu do produkcji bez analizy licencji.

Testy: Playwright 4 ekrany (320x568, 390x844, 820x1180, 1440x900) PASS dla przepływu i quizu; audyt Axe WCAG dla trzech ekranów mobilnych PASS; offline service worker sprawdza zarówno sceny, animacje, CSS, teksty jak i MP3. Aplikacja pozostaje PWA webową — nie została opublikowana w natywnych sklepach.


## Animacja Bartiego 1.2.0 (2026-10-09)
- Zachowano przesłany projekt graficzny Bartiego i sześć istniejących póz bez dodanego ogona.
- Pięć zapętlonych, przezroczystych animacji WebP (rest, reading, explain, wave, celebrate) wygenerowano lokalnie z użyciem dwukierunkowego przepływu optycznego OpenCV i morfowania w przestrzeni RGBA; **20 kl./s**, łącznie 264 klatki, 7,3 MB.
- Narzędzie źródłowe na VPS: `/home/ubuntu/bartek-workspace/tools/barti-motion/render_smooth.py`. Nic nie wymaga płatnego modelu wideo. Zależności do renderowania są w izolowanym środowisku VPS.
- W aplikacji dwie warstwy obrazów zapewniają płynne przejścia 360 ms między stanami; nieaktywna animacja jest zwalniana po przejściu. Ustawienie systemowe `prefers-reduced-motion` wyłącza animację i pokazuje Bartiego statycznie.
- Animacja mówienia uruchamia się wraz z odtwarzaniem i zatrzymuje przy pauzie; **nie jest to** jeszcze rig 3D ani dokładny lip-sync fonemowy. Dla pełnego niezależnego ruchu oczu, ust i rąk potrzebny jest model wielowarstwowy Rive/Live2D.
- Interfejs Start → Biblioteka → Czytnik i istniejące MP3, tłumaczenia oraz quiz pozostają bez zmian.

## Wydanie 1.2.1 — czytnik na jednym ekranie (2026-10-09)
- Na komputerze całe menu, czytnik, Barti, słownik i odtwarzacz mieszczą się w oknie; tylko tekst samej bajki przewija się niezależnie.
- Usunięto widoczne pouczenia o przewijaniu, klikaniu słów, naciskaniu play i zbędne hasło pod czytnikiem. Zachowano autorstwo/opis źródła bajki oraz etykiety funkcjonalne.
- Uporządkowano wysokości elementów przy 720/768/900/1080px, zwalniając miejsce tekstowi bez zmiany mobilnej nawigacji.
- PWA cache v17.
- Lokalnie sprawdzono geometrię 1024x768, 1280x720, 1366x768, 1440x900 i 1920x1080: document/sidebar/right/main scroll = 0, reader scroll > 0; testy głównych funkcji 4/4 na mobile/tablet/desktop PASS.

## v1.2.2 — Reader without cropped illustrations or scrollbars (2026-10-09)
- Story art is now presented uncropped as a complete miniature next to the title. Removed the previously cropped full-width illustration strip.
- Reader no longer displays redundant chapter bar, source footer, idle dictionary placeholder, status, coach copy and duplicates.
- Only the story article scrolls; document, left menu and right Barti column do not scroll.
- Reader Barti has a visible open storybook overlay, instead of a phone prop, on top of the existing five smooth character motion clips. Original pose reference and interactive screen mechanics retained.
- Responsive rendering includes desktop 1280x720, 1366x768, 1440x900, 1856x828, 1920x1080, intermediate tablet and mobile 320x568, 390x844.
- PWA cache v18, with versioned v2.css to invalidate potentially stale client styles.
- Preserve this single-scroll-area reader contract and do not restore explanatory hint strips.

## Barti 1.2.3 — desktop bez przewijania Startu i Biblioteki
- Dotyczy desktopowego układu Start, Biblioteka, Moje słowa, Osiągnięcia oraz Więcej. Strona ma wysokość okna; menu nawigacyjne jest stale widoczne.
- **Start**: duży Barti i wejście do biblioteki po lewej, skróty i trzy interaktywne karty polecanych bajek po prawej. Całość mieści się bez zewnętrznego przewijania.
- **Biblioteka**: zredukowany baner, widoczne filtry, wyszukiwanie i trzy karty; przy niższej wysokości okna wewnętrzne przewijanie dotyczy wyłącznie listy bajek.
- Inne karty z większą liczbą treści używają niezależnego obszaru przewijania, nie całej strony; telefon zachowuje dotychczasowe przewijanie.
- Zadbano o wysokość 600/720/768/828/900/1080 px oraz małe okna emulujące powiększenie przeglądarki 125–150%.
- Cache PWA v19 oraz wersjonowany arkusz v2.css?v=19.
- Testy lokalne: 11/11 scenariuszy Home→Biblioteka, scroll kołem, filtrowanie, wyszukiwanie i wybór bajki PASS; 4/4 regresja głównych ekranów PASS; 8/8 regresja Czytnika PASS.
