# StudyVerse — React conversion

This is the original **StudyVerse** static HTML/CSS/JS site converted into a
Vite + React + React Router project. The presentation layer (17 HTML pages)
is now React components; your original `style.css` and `app.js` are copied
in **byte-for-byte, untouched** — all business logic, form handling, and
`localStorage` usage keeps working exactly as before.

## Run it

```bash
cd react-frontend
npm install
npm run dev
```

Open the printed `http://localhost:5173/` URL.

## How it's structured

```
react-frontend/
├── public/
│   ├── style.css          <- your original stylesheet, unmodified
│   └── legacy/app.js      <- your original app.js, unmodified
├── src/
│   ├── components/
│   │   ├── PageMeta.jsx     <- sets document.body's class/data-page/title per route
│   │   └── LegacyScript.jsx <- injects app.js so its page-gated blocks run
│   ├── pages/                17 page components, one per original .html file
│   ├── App.jsx                route table
│   └── main.jsx
├── vite.config.js           <- includes a small SPA-fallback plugin (see below)
└── index.html
```

Each page component renders the exact same DOM (same ids, classes, form
fields) that the matching `.html` file had, so every `getElementById` /
`querySelector` call inside `app.js` still finds what it's looking for.

## Why navigation uses `<a href>`, not React Router `<Link>`

`app.js` declares things at the top level with `const` (e.g. `DEFAULT_MODULES`,
`MODULES_KEY`). In a browser, a `const` can only be declared once per page
load — if it were re-injected during a client-side-only route change (no
real navigation), the *second* page visited in that session would throw
`Identifier 'DEFAULT_MODULES' has already been declared` and the app would
crash.

Rather than touch your working `app.js`, every internal link is a real
`<a href="/path">` (a full browser navigation), exactly like the original
multi-page site. React Router still owns the routing — it just decides
which component to render for whichever URL the browser requests, including
`/courses` and the legacy `/courses.html` form your JS still redirects to
via `window.location.href = "courses.html"`.

`vite.config.js` includes a small dev-server plugin so that `*.html`-style
and extension-less paths both resolve to the app instead of 404ing. If you
deploy this as a static site, configure your host to serve `index.html` for
all paths that aren't real files (Netlify: add a `public/_redirects` file
with `/* /index.html 200`; Nginx: `try_files $uri /index.html;`).

## Bugs found in the original project (left as-is)

These existed in your original HTML/JS and were **not** changed, in keeping
with "don't touch the working logic" — just documenting them here in case
you want to fix them later:

1. **`add-course.html`** has `data-page="admin-login"` in its `<body>` tag,
   and its content is a duplicate of `admin-login.html` — it isn't actually
   the add-course form. The real "Add Course" form lives in **`notification.html`**
   (its `<title>` says "Add Course", and its `data-page="add-course"` is what
   `app.js`'s add-course block actually checks for).
2. Several pages link to `notifications.html` (plural) for a "Notifications"
   nav item, but no such file exists — `notification.html` (singular) exists
   but contains the Add Course form, not a notifications feed.
3. `app.js` has a whole ready-to-go block for a notifications page (ids
   `unreadSummary`, `notificationsList`, `certificatesList`) gated behind
   `document.body.dataset.page === 'notification'` — but no HTML page in the
   project actually sets `data-page="notification"`, so this code currently
   never runs. It's dead code carried over as-is.
4. A stray typo `<<img src="https://i.pravatar.cc/150?img=48">` in
   `index.html` (double `<`) was silently dropped during conversion since a
   bare `<` isn't valid JSX text — cosmetically invisible either way.

## Adding real client-side routing later

If you want instant (no full-reload) navigation between pages down the
line, the fix is to remove the top-level `const` declarations from `app.js`
(wrap the shared data/helpers in a namespace object, or convert them to
`window.X = ...` assignments) so the script can be safely re-run without
redeclaration errors — then swap the `<a href>` tags back to React Router's
`<Link>`.
