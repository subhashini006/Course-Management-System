# StudyVerse — Student Course Management System

A full-stack course platform: students register, browse courses, enrol, track
their learning progress, chat and receive live notifications; an admin manages
courses and students.

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Axios, Vite, Socket.IO client |
| Backend | Node.js, Express 5, Mongoose (MongoDB), Socket.IO |
| Security | JWT (Bearer), bcrypt, role-based access, helmet, CORS allow-list, express-validator, rate limiting |
| Database | MongoDB (local or MongoDB Atlas) |

This project covers **Tasks 9 – 15**: MongoDB data model and student/auth APIs,
JWT login and roles, the course/enrollment/progress collections, real-time chat
and notifications, security hardening, testing and deployment.

```
Course-Management-System/
├── backend/                 Express API  (deploy to Render)
│   ├── config/              env settings, MongoDB connection, Socket.IO, CORS rule
│   ├── models/              User, Course, CourseModule, Enrollment, LearningProgress, Notification, Message
│   ├── controllers/         thin request handlers
│   ├── services/            business rules (progress maths, cascades, notifications)
│   ├── routes/              URL -> middleware -> controller
│   ├── middleware/          auth (JWT), roles, validation, rate limit, 404, error handler
│   ├── validators/          express-validator rules
│   ├── scripts/             createAdmin.js, seed.js
│   ├── tests/               automated end-to-end tests (node:test)
│   ├── data/seed/           starter catalog (11 courses, 9 modules)
│   ├── .env.example
│   └── server.js
├── react-frontend/          React app  (deploy to Vercel)
│   ├── src/api/             axios client, auth API, Socket.IO client
│   ├── src/context/         Auth, Course and Socket providers
│   ├── src/pages/           one component per screen (incl. Chat, Notifications)
│   ├── vercel.json
│   └── .env.example
├── docs/
│   ├── DATABASE.md          ER diagram, schemas, indexes, cascade rules
│   ├── TESTING.md           manual / Postman test matrix + how to run automated tests
│   └── DEPLOYMENT.md        Atlas + Render + Vercel step-by-step
├── render.yaml              optional Render blueprint
└── legacy/                  the original static site and JSON mock server (not used any more)
```

---

## 1. Run it locally

You need **Node.js 20+** and a **MongoDB** (local install, Docker, or a free Atlas cluster).

### Backend

```bash
cd backend
npm install
cp .env.example .env          # Windows: copy .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/faceprep_course_system
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
```

Make a secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

```bash
npm run seed                                  # loads the 11 starter courses + 9 modules (safe to repeat)
ADMIN_EMAIL=admin@yourschool.edu ADMIN_PASSWORD='ChooseA-Long-Password1' npm run create-admin
npm run dev                                   # http://localhost:5000
```

> **Windows PowerShell:** set the variables first —
> `$env:ADMIN_EMAIL="admin@yourschool.edu"; $env:ADMIN_PASSWORD="ChooseA-Long-Password1"; npm run create-admin`

Check it: open <http://localhost:5000/api/health> → `{"status":"ok","message":"API is running"}`

Optional demo account: `npm run seed -- --demo-student` creates `demo@studyverse.com` / `DemoStudent#2026`.

### Frontend

```bash
cd react-frontend
npm install
npm run dev                                   # http://localhost:5173
```

By default the app talks to `http://localhost:5000/api/v1`. To change it, copy
`.env.example` to `.env` and set `VITE_API_URL`.

---

## 2. What changed from the previous version

| Before | Now |
|---|---|
| Data kept in a JSON file (`db.json`) | MongoDB collections through Mongoose models, with unique indexes and references |
| Admin = email + password in `.env` | Admin is a normal `User` with `role: "admin"`, created by `npm run create-admin`; one login flow, one bcrypt strategy |
| Progress stored inside the enrollment | Separate `LearningProgress` collection; totals and percentage are computed on the server |
| Notifications generated on the fly | Stored in a `notifications` collection and pushed live over WebSockets |
| No chat | Authenticated one-to-one chat (Socket.IO) with stored history |
| Public enrollment list; open CORS in dev | Enrollment list is admin-only; helmet, CORS allow-list, rate limiting, validation, central error handling |
| Course ids like `ai1` | MongoDB ObjectIds (the old id is kept as the `slug` field) |

---

## 3. API summary (all under `/api/v1`)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Register a **student** (role cannot be chosen) |
| POST | `/auth/login` | public (rate-limited) | Log in → `{ token, role, student }` |
| POST | `/auth/admin-login` | public (rate-limited) | Same, but only accepts admins |
| GET | `/auth/me` | any logged-in user | Who owns this token |
| POST | `/auth/forgot-password`, `/auth/reset-password` | public | Password reset (link is printed in the server terminal) |
| GET/POST/PUT/DELETE | `/students`, `/students/:id` | **admin** | Student CRUD (deleting cascades) |
| GET / PUT | `/profile` | logged-in | Own profile (name, department) |
| GET | `/courses`, `/courses/:id`, `/courses/:id/module` | public | Catalog (optional `?page=&limit=`) |
| POST/PUT/DELETE | `/courses`, `/courses/:id` | **admin** | Course CRUD (deleting cascades) |
| GET | `/enrollments` | **admin** | All enrollments |
| POST | `/enrollments` | student | Enrol (`{ courseId, roll }`) |
| GET/PATCH/DELETE | `/enrollments/:id` | owner or admin | Read, update progress, withdraw |
| DELETE | `/enrollments` | **admin** | Clear all |
| GET | `/me/enrollments` | student | My enrollments |
| GET / GET / PUT | `/learning-progress`, `/learning-progress/:courseId` | student | My progress (PUT: `{ units:[…] }` or `{ video:true }`) |
| GET | `/notifications` | logged-in | My notifications + `unreadCount` |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | logged-in | Mark as read |
| GET | `/messages/contacts`, `/messages/:userId` | logged-in | Chat contacts / conversation history |
| GET | `/stats` | **admin** | Counts |
| GET | `/api/health` | public | Health check (outside `/v1`) |

**Socket.IO** (same server URL): connect with `auth: { token }`.
Client → server: `send_message { recipientId, text }` (with acknowledgement).
Server → client: `receive_message`, `new_notification`.

Errors always look like `{ "success": false, "message": "…" }` (validation errors add an `errors` list).
Status codes: `400` invalid input · `401` not logged in / bad token · `403` not allowed · `404` not found · `409` duplicate · `429` too many attempts · `500` server error.

---

## 4. Tests

```bash
cd backend
npm test            # needs MongoDB running; set TEST_MONGO_URI if it is not on localhost
```

59 automated tests start the real server against a temporary database and
check registration, login, JWT, roles, CRUD, enrolment, progress,
notifications, WebSocket chat, CORS, rate limiting and cascade deletes.
See [docs/TESTING.md](docs/TESTING.md) for the manual (Postman) checklist.

---

## 5. Deploy

Atlas (database) → Render (backend) → Vercel (frontend). Full steps and the
environment variables for each are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
Your live URLs go here after you deploy:

* Frontend (Vercel): `https://<your-app>.vercel.app`
* Backend (Render): `https://<your-api>.onrender.com`
* Health check: `https://<your-api>.onrender.com/api/health`

---

## 6. Notes and decisions

* **`duration` is text** (e.g. `"8 Weeks"`), because that is what the course forms and the starter data already use. The Task 9 example uses a number; changing it would break the existing screens.
* **Passwords must be 12–72 characters** (72 is bcrypt's limit). Accounts created earlier with shorter passwords can still log in until they reset them.
* **Emails are lower-cased and trimmed, not "normalised".** `express-validator`'s `normalizeEmail()` rewrites Gmail addresses (removes dots, strips `+tags`), so a user could register as `a.b@gmail.com` and then be unable to log in. It is deliberately not used.
* **The role always comes from MongoDB, not from the token.** Every protected request re-reads the user, so a deleted account or a changed role takes effect immediately and a forged `role` claim is ignored.
* **Withdrawing is a status change**, not a delete: the enrollment becomes `withdrawn` and keeps its progress; enrolling again reactivates it.
* **Deleting a student or course cascades** (enrollments, progress, notifications, chat messages / stored content) inside one MongoDB transaction on Atlas. A plain local `mongod` has no transactions, so there it runs step by step.
* **Chat contacts** are all other accounts (name and role only, never email). Add finer recipient rules in `backend/config/socket.js` if your institution needs them (e.g. students may only message admins).
* **Password reset has no email service:** the link is printed in the backend log. Plug in an email provider before relying on it in production.
* **The login rate limit counts per server instance** (in memory). With several instances, use a shared store such as Redis.
* The JWT is kept in `sessionStorage` (cleared when the tab closes). It is readable by JavaScript, so a high-security deployment would move to HttpOnly cookies.
* **Your old `.env` contained a real `JWT_SECRET` and admin password.** Do not reuse them: generate a new secret and set a new admin password.
