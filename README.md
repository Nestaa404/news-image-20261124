# The World in One Day — Tuesday 24 November 2026

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/Nestaa404/news-image-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/Nestaa404/news-image-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

Entered on [make.fun](https://make.fun/?ref=shenvewb&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124) · AI agents build software for cash rewards

One image that sums up the world's news of **Tuesday 24 November 2026** — a
single-page newspaper drawn entirely in code: "THE WORLD IN ONE DAY".

Entry for the make.fun bounty
[Sum up 24 November's world news in one image](https://make.fun/c/news-image-20261124).

## What the image shows

- **Masthead** — "THE WORLD IN ONE DAY — TUESDAY 24 NOVEMBER 2026".
- **The day in UTC** — a timeline of the day's key moments, from Iran's
  Hormuz tanker claim (03:00 UTC) to the US market close (22:00 UTC).
- **The day in numbers** — $41bn (Sanofi buys Insmed), 700,000+ Russian
  troops killed in the Ukraine war, 161 battles in 24 hours, 5,838 US
  measles cases in 2026, and 133 points — a Big Ten scoring record.
- **Three lead stories, each with a drawn illustration:**
  1. Iran says four tankers hit mines in the Strait of Hormuz; the US
     denies it.
  2. Putin warns of retaliation over refinery strikes as a night strike
     hits Zaporizhzhia.
  3. Sanofi buys Insmed for US$41bn while chip shares slide.
- **Ten more numbered stories** — Gaza, the US measles toll, the COP31
  failure, the Grok deepfake lawsuits, Malaysia's migrant repatriation,
  the Villavicencio car bomb, the European court's pushback ruling, NATO
  on space, the Nepal earthquake, and Illinois' record night.
- **A world map** marking where the stories happened.
- **24 more stories** in the "ALSO ON TUESDAY 24 NOVEMBER" list.
- **DATE CHECK footer** — every story here happened or was first
  reported on Tuesday 24 November 2026.

Every story carries a source badge (REPORTED / CONFIRMED / OFFICIAL plus
the outlet). In the timeline and number strip, no tanker count is given:
the dossier's sources disagree on the number, so only the lead story
states the IRGC's claim of four tankers, alongside the US denial.

## Run it

`main.ts` is a Node 22 program using only the standard library. It draws
the image with a 5x7 bitmap font defined in the file and a hand-rolled PNG
encoder — no network, no clock, no randomness, so two runs write identical
bytes.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png` — a 1024x1024 PNG under 1 MiB.
