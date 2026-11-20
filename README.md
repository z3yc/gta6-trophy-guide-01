[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/z3yc/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/z3yc/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI, 55 PS5 Trophies

An offline guide and tracker for every trophy in **Grand Theft Auto VI** on PlayStation 5: all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with their official names, descriptions and grades as PlayStation publishes them, a guide in our own words for each one that cites its sources, a platinum roadmap, the one missable trophy flagged, and a checklist that saves in the browser.

## What it does

- **Checklist tracker** — tick trophies off; progress is saved in `localStorage` and survives reloads. Export it to a JSON file and import it back on any machine.
- **Filters** — by kind (story, missable, collectibles, activities, online, platinum) and by grade, plus text search and an earned-only view.
- **Spoiler-free mode** — hides the names and descriptions of story trophies you have not earned yet, until you earn them.
- **Platinum roadmap** — three steps built from the official descriptions: play the story (60–80 hours), the 100% Completion Checklist (~100 hours), then Strangers &amp; Freaks and cleanup (10–20 hours).
- **Missable flag** — only one trophy is reported as possibly missable, **Positive Mental Attitude**: the Chapter 1 meditation at Jason's house is gone after Chapter 1, so the guide tells you to do it before the chapter ends. Everything else can be earned in free-roam after the story.
- **Cited guides** — each trophy's guide names its sources (Push Square, PowerPyx, GTABase, KeenGamer, Exophase / PSNProfiles, TrueAchievements). Where no reliable method had been published yet — the game released 19 November 2026 — the guide says so instead of inventing steps.

## Run it

Serve `app/` with any static server and open `index.html`:

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` directly from disk. The app is plain static files and makes no network request at run time, so it works with the network off.

## Build the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node, standard library only) copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts` library.

## Layout

- `app/index.html` — the page
- `app/app.js` — the tracker (progress, filters, spoiler setting, export/import)
- `app/style.css` — the look (original design, CSS only, no images or webfonts)
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, plus kind, missable flag, guide and sources
- `screenshots/` — screenshots of the guide, taken in a real browser
- `main.ts` — hands the entry in (see above)
- `serve.ts` — tiny static server for local testing

## Sources

Official trophy names, descriptions and grades are shown as PlayStation publishes them, via the Exophase and PSNProfiles lists (which agree on all 55). Guide details are drawn on, in our own words and cited by name, from Push Square's *GTA 6: Trophy Guide &amp; Roadmap*, PowerPyx's *GTA 6 Trophy Guide &amp; Roadmap*, GTABase's *GTA 6 Achievements &amp; Trophies List*, KeenGamer's *GTA 6 Trophy Guide &amp; Platinum Roadmap*, and the TrueAchievements / GTA Vice trophy list. No Rockstar logo, artwork or game screenshot is used anywhere; the look is our own.

## License

MIT — see [LICENSE](LICENSE).
