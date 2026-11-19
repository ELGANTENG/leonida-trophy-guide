# leonida-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ELGANTENG/leonida-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ELGANTENG/leonida-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide is an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade as PlayStation publishes them, a guide to each in our own words that cites its sources, a five-stage roadmap to the platinum, the one potentially missable trophy flagged, and a checklist that saves your progress in the browser. It runs entirely from its own files — no network, no account, no Rockstar artwork.

## Features

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden until earned.
- **Guides with sources** — each trophy's guide names where its facts come from (PowerPyx, Exophase, KeenGamer and others); steps with no outside source say so and cite the official description instead. Four vague hidden trophies are marked unconfirmed rather than guessed at.
- **Tracker** — tick trophies off; progress is saved in localStorage, with export to a JSON file and import back. Filters by kind (story, missable, collectibles, activities, 100% completion, platinum, online), by grade, by earned state, and a search box.
- **Spoiler setting** — hides the names and descriptions of hidden story trophies until you earn them.
- **Roadmap to the platinum** — five stages in order, from the story to the 100% cleanup, with the trophies of each stage.
- **Missables** — the one potentially missable trophy (Positive Mental Attitude, the Chapter 1 balcony meditation) with the save advice that keeps the platinum safe: GTA 6 has no mission replay, so keep a manual save at the start of every chapter.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no dependencies — `app/` is plain static files.

## Entry program

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-frontend.ts`.

## Screenshots

- `1-cover.jpg` — the checklist with a guide open, progress bar and filters
- `2-roadmap.jpg` — the five-stage roadmap to the platinum
- `3-tracker.jpg` — the missable filter at work
- `4-export.jpg` — sources and about

## License

MIT. See LICENSE. The guide's look is our own; Grand Theft Auto is a trademark of Rockstar Games, and this is an unofficial fan-made guide.

---

<sub>Entered on [make.fun](https://make.fun/?ref=qd0ywjzn&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
