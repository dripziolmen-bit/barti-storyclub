# BARTI Story Club — zdania + głosy v31 (2026-10-11)

Wszystkie 18 bajek: 109 akapitów i 223 zdania. Każde zdanie ma wygenerowaną osobną ilustrację 512×512 modelem fal-ai/flux/schnell, z promptem zawierającym tekst zdania i kontekst bajki. **223 udane generacje, 0 błędów API, brak płatnych ponowień.** Orientacyjny koszt $0,669 przy stawce $0,003 za obraz 512×512, bez podatków i różnic kursowych; rzeczywisty rachunek w fal.ai Billing.

## Drugi dysk

Oryginały JPG, WebP, rejestr żądań i 223-elementowy manifest:
 /mnt/data/marka-lab/barti-story-club/sentence-illustrations/v1/

Źródłowe MP3 (3 × 109 akapitów), dokument z modelami i faktycznymi czasami:
 /mnt/data/marka-lab/barti-story-club/voices/v1/

Dysk: /dev/sdb, zamontowany w /mnt/data. **Ten wolumin pozostaje miejscem przechowywania oryginałów.** W repo GitHub Pages znajdują się jedynie zoptymalizowane WebP i odtwarzane pliki MP3:
- assets/visuals/scenes/<storyId>/<globalIndex>.webp (223 pliki, łącznie ok. 10 MiB);
- assets/voices/female/<storyId>-<paragraph>.mp3 (109);
- assets/voices/child/<storyId>-<paragraph>.mp3 (109);
- już istniejące assets/audio/<storyId>-<paragraph>.mp3 dla głosu dorosłego (109).

## Głosy

- **Dorosły:** poprzednie rosyjskie nagrania lokalnego Piper Denis, bez regenerowania.
- **Kobieta:** nowy lokalny Piper Irina, rosyjski głos z projektu rhasspy/piper-voices.
- **Dziecięcy:** stylizacja głosu Iriny przez zmianę barwy/tempa — nie natywny syntezator głosu dziecka. Warto to zastąpić wyraźnie dziecięcym licencjonowanym głosem w przyszłości.

Wszystkie nowe audio wygenerowane **lokalnie** na VPS bez płatnego TTS. Źródła Piper na licencji MIT na Hugging Face; przed wdrożeniem komercyjnym zweryfikować warunki konkretnego voice dataset i potrzebne przypisanie autorstwa. Żadne MP3 nie wymaga klucza fal.ai w aplikacji.

## Podpięcie

- data/sentence-scenes.json: dla każdego zdania: bajka, akapit, pierwszy/ostatni indeks słowa, plik obrazu.
- data/voice-durations.json: czasy oryginalnego dorosłego i faktyczne czasy kobiety/dziecka.
- app.js: funkcje showSceneForWord i changeVoice; ilustracja zmienia się wraz z podświetleniem słowa, również przy kliknięciu bez odtwarzania. Głos zapisuje się lokalnie w barti.voice. Przy zmianie głosu w trakcie odtwarzania zachowywana jest względna pozycja.
- index.html: obraz sceny **pod Bartim** w prawym panelu; na telefonie pod nagłówkiem z mini-Bartim. Przełącznik trzech głosów w odtwarzaczu.
- story-scenes-v31.css: ratio obrazów 1:1, bez cięcia; w focus mode obrazy są ukryte.
- sw.js: cache v31, nowe JSON i CSS w essential cache. MP3 i WebP tylko na żądanie, a wszystkie nowe media dołączone do jawnego pobierania całej biblioteki offline.

**Ograniczenie synchronizacji:** dorosły głos korzysta z istniejącego word-timing; kobieta/dziecko ze szacowanych proporcji długości wyrazów. Obrazy nie są fotorealistycznie identyczne co do twarzy postaci między kadrami; są to niezależne generacje.

## Testy

Przeglądarkowy Playwright VPS /home/ubuntu/bartek-workspace/browser-tools/qa-sentences-voices-v31.mjs
Trzy rozdzielczości: 1440×900, 390×844 i 320×568, PASS. Test: otwarcie bajki -> scena 000 -> przesunięcie audio do kolejnego zdania -> scena 001; przełączniki dorosły/kobieta/dziecięcy ładują poprawne pliki z pełnymi duration; brak błędów JS i HTTP oraz overflow. Zmiany fokusowania sprawdzone.

**Do przyszłego QA:** ręczna ocena wszystkich ilustracji i głosów oraz fizyczny iPhone/Safari. Nie uruchamiać ponownie 223 odpłatnych generacji, bo gotowe pliki są na drugim dysku. Kod generatora w tools/barti-video-fal/generate-223-sentences.mjs; TTS w tools/barti-video-fal/synthesize-offline-voices.py.

## Dodatkowa kontrola jakości
Dwa oryginalne wyniki FLUX były puste/czarne: repka/008 oraz zaika-lisa-petuh/005. Oba naprawione oddzielnymi żądaniami; w katalogu drugiego dysku znajdują się oryginalne JPG, -repair.jpg i -repair.json jako jawna historia. Finalne WebP są pełnymi obrazami (wszystkie 223 pliki mają rozmiar ponad 29 kB). Szacowane łączne koszty 225 obrazów × $0,003 = $0,675.
