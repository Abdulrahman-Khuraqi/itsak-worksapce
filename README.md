# Itsak Workspace

A small personal workspace for organising work: **desks** (one per client, project or area), **tasks with deadlines**, and **notes & info**. Built with plain PHP and one JSON file. There's no database and no build step.

## Run it

You need PHP 8.1 or newer.

- **Windows:** double-click `start workspace.bat`. It opens http://localhost:8080.
- **Mac / Linux:** run `./start.sh`, then open http://localhost:8080.
- **On a server (Apache, shared hosting):** upload the folder. `data/` and `app/` are blocked by their `.htaccess` files. Set a password first (see below).

The first time it opens it creates `data/workspace.json` with some starter desks, tasks and notes. Edit or delete them.

## What's inside

| Page | What it shows |
|---|---|
| **Today** | Overdue, due today, next 7 days, in progress, tasks without a deadline, each task on its own card. Desk progress. Pinned notes. |
| **Desks** | One card per desk with open tasks, overdue count and next deadline. Open a desk for its To do / Doing / Done board (drag cards between columns) and its notes. |
| **Tasks** | Every task, with search and filters by desk and status. |
| **Calendar** | Month view of deadlines. Click a day number to add a task on that day. |
| **Notes & info** | Links, contacts, ideas, meeting notes. Links become clickable. Pin a note to show it on Today. |

On a phone it works like an app: a tab bar at the bottom (Today, Desks, **+** new task, Tasks, Notes), the calendar and a **⋯** menu (language, backup, sign out) at the top, and edit windows that slide up from the bottom. Buttons are finger-sized (44px) and fields use 16px text so the phone does not zoom in.

**Install it on your phone:** open the site, then *Share → Add to Home Screen* (iPhone) or *⋮ → Add to Home screen / Install app* (Android). It opens full screen with the Itsak icon.

Other things:

- **English / العربية:** the switch at the bottom of the sidebar. The Arabic view is fully right to left.
- **Your own order:** drag the ⋮⋮ handle (mouse or finger) to reorder tasks on the Tasks page ("My order"), on Today (Due today, In progress, No deadline) and on a desk's board, where you can also drag between To do / Doing / Done. With the handle selected, the arrow keys move a task too.
- **Steps:** break a task into a checklist inside the task window; rows show progress like `2/5`.
- **Undo:** completing or deleting a task (or deleting a note) shows an Undo button for a few seconds.
- **Quick deadlines:** No date / Today / Tomorrow / Next week buttons when adding or editing a task.
- **Keyboard:** press `N` anywhere to add a task. On phones, use the + in the tab bar.
- **Export backup** downloads everything as one JSON file. **Import backup** puts it back (and keeps a copy of what was there).

## Live site: ws.brxel.co

Every push to the `site-dev` branch uploads the workspace to Hostinger automatically (`.github/workflows/deploy.yml`).

- Needs two repository secrets: `FTP_USERNAME` and `FTP_PASSWORD` (Settings → Secrets and variables → Actions). The FTP server is `82.198.230.29`; to change it, add a repository **variable** `FTP_HOST`.
- Uploads into the FTP account's own folder (`.../brxel.co/public_html/ws`). To use another folder, add a repository **variable** `FTP_DIR`.
- Run it by hand from the **Actions** tab → *Deploy to Hostinger* → **Run workflow**.
- A deploy only adds or replaces files and never deletes anything, so your data on the server (`data/workspace.json`, `data/backups/`) stays as it is.
- **Password:** add a secret `APP_PASSWORD`; each deploy writes it to `config.local.php` on the server.

## Where the data lives

```
data/workspace.json           everything: desks, tasks, notes
data/backups/workspace-YYYY-MM-DD.json   automatic copy once a day, before the first change (last 30 kept)
```

The JSON is readable and safe to edit by hand while the app is closed. `data/workspace.json` and the backups are **not** committed to git (see `.gitignore`), so your data stays on your machine or server.

Shape of the file:

```json
{
  "desks": [{ "id": "d_…", "name": "AZ TV Store", "color": "orange", "description": "…" }],
  "tasks": [{ "id": "t_…", "deskId": "d_…", "title": "…", "status": "todo|doing|done",
              "priority": "low|normal|high", "due": "2026-10-30", "notes": "…",
              "checklist": [{ "text": "…", "done": false }], "order": 3, "doneAt": null }],
  "notes": [{ "id": "n_…", "deskId": "d_…", "title": "…", "body": "…", "pinned": true }]
}
```

Every record also has `created` and `updated` timestamps.

## Password

With no password anyone who can open the page can use it, which is fine on your own computer. Before putting it online, create `config.local.php` next to `config.php`:

```php
<?php
define('APP_PASSWORD', 'choose-a-long-password');
```

`config.local.php` is ignored by git. The timezone for timestamps and backup names is set in `config.php` (`Asia/Riyadh`).

## Brand

- Main colour black. Primary purple `#662d8b`, secondary orange `#ff9a1c`, accent red `#ff0000`, neutrals Tailwind zinc. All are defined as CSS variables at the top of `assets/css/app.css`.
- Fonts: Nexa (English headings) and Graphik Arabic (Arabic and body). See `assets/fonts/README.md` for the file names to drop in.
- Logos are in `assets/img/`. `logo-full-white.svg` and `logo-icon-white.svg` are white versions of the supplied logos for the black background.

## Files

```
index.php            the page (and the sign-in form when a password is set)
api.php              JSON API the page talks to
config.php           settings
router.php           used by the start scripts; blocks data/ and app/ on PHP's built-in server
app/model.php        record shapes and input cleaning
app/store.php        reading/writing the JSON with a file lock, daily backups
app/seed.php         starter content for the first run
app/auth.php         optional password
assets/js/app.js     the interface (plain JavaScript)
assets/css/app.css   styles and brand colours
```
