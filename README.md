# Everyday

A personal, responsive habit journal built with React and Vite, intended for use on an iPhone. The app is public; journal entries stay on the device.

## The Method

Based on the [Habits Scorecard described by James Clear](https://jamesclear.com/habits-scorecard) in *Atomic Habits*: list the habits you already perform, in their usual order, then notice whether each supports (+), conflicts with (-), or is neutral (=) toward the person you want to become. The purpose is awareness, not judgment or a daily completion score.

This is an independent personal project, not an official Atomic Habits product. It does not reproduce the book. There are no streaks, completion checkboxes, or arbitrary net scores. A new habit is **unrated**, not automatically neutral. Select an active rating again to clear it. The optional starter routine contains unrated examples; edit or delete them to reflect your own day.

## Journal Pages

- **Scorecard** (`#scorecard`): the original daily-habit awareness exercise.
- **Intentions** (`#intentions`): exactly five statements, each with behavior, time, and location blanks: "I will [behavior] at [time] in [location]." Based on [implementation intentions](https://jamesclear.com/implementation-intentions).
- **Routine stack** (`#routine-stack`): five editable "After [current habit], I will [new habit]" statements, based on [James Clear's habit-stacking method](https://jamesclear.com/habit-stacking), with a link to his official downloadable worksheet. Each row can stand alone or continue an earlier action. Habit stacking is credited by Clear to BJ Fogg's Tiny Habits work.
- **Cue-induced wanting** (`#cue-induced-wanting`): an original explanation of learned cues, anticipated rewards, wanting versus liking, and practical environment changes, with source links.

The hash-based pages support bookmarking, browser back/forward, and refreshing on static hosting without a server-side router. All worksheet fields auto-save, including unfinished statements. "Defined" means all blanks are filled, not that the habit was performed.

## Run Locally

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. To verify the app:

```sh
npm test
npm run build
```

## GitHub Pages

Repository: https://github.com/Zackdw/habit-tracker

Website: https://zackdw.github.io/habit-tracker/

Both the repository and the website are public. Visitors have their own browser-local journal. There is no login, server database, or GitHub API integration in the app, and journal entries are not sent to GitHub.

In repository **Settings > Pages**, the build source is **GitHub Actions**. Pushing to `main` runs tests, builds, and deploys `dist` using `.github/workflows/ci.yml`. Pull requests run checks without deploying. Vite uses relative asset paths for the repository URL.

Never commit personal backup files to this public repository: they would be readable by others and could remain in Git history after deletion. Import/export is a manual, local transfer, not a repository update. Do not embed a GitHub token in browser code.

## iPhone Use

Open https://zackdw.github.io/habit-tracker/ in Safari. Use Safari's Share menu to add it to the Home Screen if desired. The local development URL is only for this computer, not an on-the-go iPhone address.

Entries remain local to the browser or Home Screen app that created them; do not assume they transfer between those contexts. Export a backup before switching devices, origins, or browser contexts, and import it in the destination. There is currently no cloud sync or offline service worker.

## Your Data

- Habits, ratings, ordering, identity, reflection, intentions, and routine stacks are stored in this browser's `localStorage` and saved after each change. There is no account, tracking code, or backend.
- **GitHub Pages is usually a public website, not a private authenticated app.** Visitors get their own empty scorecard; your saved habits are not included in the deployment. Someone using the same browser profile can access your entries. Data is not encrypted.
- Data does not sync across devices or browsers. Private browsing and clearing browser data can erase it. Moving to a different hostname or port creates a separate storage location. Sites on the same origin share browser storage; use a separate domain if you need isolation from your other Pages projects.
- Use the top-right options menu to **Export backup** and **Import backup**. Keep backups somewhere safe. A restore replaces existing data only after confirmation; invalid backups are rejected.
- Backups now use version 2 and include both worksheets. Existing version-1 scorecards migrate automatically without changing their habits, identity, or reflection. Restoring a version-1 backup replaces the whole journal and starts with blank worksheets. **Clear journal** removes data from all pages after confirmation.
- If existing data cannot be parsed, the app does not overwrite it automatically. Export the existing data before choosing to save a new scorecard.
- Export JSON backups rather than committing personal data to the repository.
- Google Fonts supplies DM Sans and Lora; the browser contacts Google for fonts, but no scorecard content is sent. The notebook photo is served locally.

## Credits

- Method: James Clear, *Atomic Habits* and the linked Habits Scorecard article.
- Icons: Lucide.
- Fonts: DM Sans and Lora, via Google Fonts.
- Notebook photograph: [Unsplash image source](https://images.unsplash.com/photo-1455390582262-044cdead277a), served locally under the Unsplash license.