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
