# Drum Lab — narzędzia perkusisty

Zakładka bloga: `/narzedzia/`. Kalkulator: `/narzedzia/strojenie-perkusji/`.
Symulator: `/narzedzia/strojenie-perkusji/#pitch-bend`. Linki obsługują `PUBLIC_BASE_PATH`.

## Uruchomienie

Z katalogu głównego repozytorium:

```sh
npm ci
npm run dev
npm run test:drums
npm run build
```

Astro udostępnia stronę domyślnie na porcie 5200. React 19 jest wyspą klientową
w istniejącym blogu Astro/Vite. Bootstrap 5 dostarcza siatkę, lokalny CSS wygląd
aplikacji, a Recharts interaktywny wykres. Bez backendu, konta ani mikrofonu.

## Praca z aplikacją

- Ustaw częstotliwość podstawową, interwał w centach i kierunek osobno dla każdego
  bębna lub zastosuj wspólne ustawienia. Średnica i głębokość to metadane — model
  nie udaje fizycznego wyliczenia rezonansu z wymiarów korpusu.
- Pomarańczowy oznacza górny naciąg, niebieski dolny, zielony podstawę. Wartości
  naciągów są częstotliwościami przy śrubach, nie częstotliwością całego bębna.
- Klawiatura ustawia podstawę i odtwarza nutę. Przyciski „Ton” odtwarzają
  obliczoną częstotliwość, „Nuta” najbliższą nutę temperowaną. Naciągi nie są
  automatycznie zaokrąglane do nut. Stop przerywa także zaplanowaną sekwencję.
- Kalibracja wymaga pomiarów z zewnętrznego stroika. Przy zgodnym interwale
  skaluje naciągi stosunkiem docelowej i zmierzonej podstawy. Przy rozbieżnych
  interwałach dopasowuje średnią geometryczną zmierzonych naciągów do wybranego
  stosunku. Każda iteracja zapisuje współczynnik, pomiar podstawy i czas.
- Warianty można zapisać, wczytać, zaznaczyć do porównania i usunąć. JSON
  eksportuje bieżący zestaw; zaimportuj i zapisz jako wariant na innym urządzeniu.
  CSV obejmuje wszystkie interwały. Drukowanie pokazuje tabelę bez edytorów.
  Dla dużego zestawu użyj CSV lub dostosuj skalę w oknie drukowania.
- LocalStorage zapisuje zestaw i warianty pod `blog-drum-lab-v1`. Dane pozostają
  na urządzeniu. Czyszczenie danych przeglądarki usuwa zapis; JSON stanowi kopię.
- Zakresy wejścia: podstawa 20–2000 Hz, A4 400–480 Hz, interwał 0–2400 centów,
  kalibracja 0,1–10, maksymalnie 100 bębnów. Nieprawidłowe pola nie zmieniają
  ostatniej poprawnej wartości; komunikat przy polu wskazuje dozwolony zakres.

## Model matematyczny

Punkty (1,75; 1,75), (1,50; 1,85), (1,40; 2,00), (1,20; 2,30) pochodzą
z https://tune-bot.com/tuning-guide/ i opisują przybliżone strojenie tomów.
Interpolacja odcinkowa zachowująca `2^(centy/1200)` jest własnym rozszerzeniem,
a nie algorytmem producenta. Powyżej stosunku 2,3/1,2 ostatni segment jest
ekstrapolowany i oznaczony jako eksperymentalny. Kalibracja mnoży oba wyniki
przez jeden współczynnik, zachowując interwał. Kierunek „oba jednakowo” wymusza
0 centów niezależnie od zapamiętanego wyboru interwału.

Pitch bend jest niezależnym modelem poglądowym z liniową lub wykładniczą zmianą
częstotliwości i amplitudy. Nie wynika z interwału naciągów. Dane Polmuz dla
symulatora: 182,4→156,1, 138,6→116,1, 86,1→70,7 Hz. Podstawy presetu strojenia
to 156, 116, 71 Hz; tylko pierwszy tom ma znaną średnicę (10 cali).

## Moduły i sprawdzenia

`App` zarządza sesją, edytorem zestawu i odtwarzaniem. `DrumCard`, `controls`,
`CalibrationPanel`, `TuningTable`, `PitchBendSimulator`, `PresetManager` tworzą UI.
`musicTheory`, `tuningUtils`, `audioUtils`, `storageUtils` zawierają logikę.
Testy Node sprawdzają punkty referencyjne, wszystkie interwały co 1 cent,
kierunki, kolejne kalibracje, notację, krzywe i walidację importu.
