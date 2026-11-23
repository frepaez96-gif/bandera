# Adivina la Bandera

Flag guessing game built with Vue 3 + Vite. One flag at a time, four country options per flag. It
moves on whether you are right or wrong, and when you miss it reveals the correct answer. The final
screen shows your score plus a recap of the played flags.

Before starting you can open the settings panel (gear button) to choose between **10, 20, 30 or 40**
flags per game, switch between **light and dark** theme, and filter flags by **continent** (at least
one must stay selected). Everything is stored in `localStorage`, so the next game keeps your choices.

243 countries and territories, Spanish country names, and flags bundled locally from
[flagcdn](https://flagcdn.com) — the game works fully offline.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/App.vue` | Shell that picks the start, game, or result screen and hosts the settings entry point |
| `src/composables/useFlagGame.js` | Game state: rounds, options, score, per-round best score |
| `src/composables/useSettings.js` | Settings state: rounds, theme, continent filter, persistence |
| `src/components/StartScreen.vue` | Start screen |
| `src/components/SettingsModal.vue` | Settings modal (rounds, theme switch, continent checkboxes) |
| `src/components/GameScreen.vue` | Flag, four options, feedback, next |
| `src/components/ResultScreen.vue` | Final score and recap |
| `src/data/countries.json` | 245 entries: `{ code, name, continent }` |
| `src/data/continents.js` | Continent labels and ids used by the filter |
| `public/flags/<code>.svg` | One flag per entry, ISO 3166-1 alpha-2 file name |

## Settings

| Key | Stored value |
| --- | --- |
| `guess-the-flag:settings` | `{ rounds, theme, continents }` |
| `guess-the-flag:best-score` | `{ "10": 9, "20": 17 }` — best score per round count |

- `rounds`: one of `10`, `20`, `30`, `40`. Options above the number of flags left by the continent
  filter are disabled, and the value is clamped if the filter shrinks the deck.
- `theme`: `dark` or `light`. Applied through `data-theme` on `<html>` and the CSS custom properties
  in `src/style.css`; the first visit follows the operating system preference.
- `continents`: any non-empty subset of `africa`, `america`, `asia`, `europa`, `oceania`. The last
  selected continent cannot be unchecked; the panel shows a message and keeps it active.

Antarctica (`aq`) and the French Southern Territories (`tf`) stay in the dataset with
`continent: null` but never appear in a round: they belong to none of the five playable continents.

## Controls

- `1`, `2`, `3`, `4` pick an option.
- The next flag loads on its own a moment after you answer, so the result stays on screen briefly.
  `Enter` or `Space` skips that pause and moves on immediately.
- `Esc` closes the settings panel; focus returns to the gear button.

## How rounds are built

`useFlagGame` filters the dataset by the selected continents, shuffles it, takes the configured
number of countries, and for each one draws three random distractors from the same filtered deck
plus the correct name, then shuffles the four options.

Because a deck can be smaller than the requested rounds (Oceania alone has 25 flags), the settings
panel disables round counts the filter cannot support and the game never repeats a flag within a
round.

Duplicate flags are excluded from the dataset on purpose (`bv`, `hm`, `sj`, and `um` use the flag of
their parent country, and `mf` is identical to France), so a flag never has two valid answers.
