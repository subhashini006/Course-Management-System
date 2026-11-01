# Testing (Tasks 12 – 15)

## A. Automated tests (recommended first)

```bash
cd backend
npm test
```

* Needs MongoDB running (`TEST_MONGO_URI=mongodb://host:27017` if it is not on localhost).
* Each run creates a throw-away database, starts the real `server.js`, runs **59 tests**, then drops the database.
* Covers: registration & validation, JWT login, 401 / 403 rules, forged and expired tokens, student CRUD, course CRUD, pagination caps, enrolment, withdraw / re-enrol, server-side progress & completion, notifications, profile, WebSocket authentication, live chat between two users, message flood limit, CORS, helmet headers, password reset, cascade deletes, and login rate limiting (429).

Last verified result: `# tests 59  # pass 59  # fail 0`.

## B. Manual test matrix (Postman / curl)

Base URL `http://localhost:5000/api/v1`. In Postman create an environment with
`baseUrl`, `studentToken`, `adminToken`, `studentId`, `courseId`, `enrollmentId`
and send the token as **Authorization → Bearer Token**.

| # | Request | Expected |
|---|---|---|
| 1 | `POST /auth/register` valid body | 201, no `password` in response |
| 2 | same email again | 409 |
| 3 | invalid email / password < 12 chars / empty body | 400 + `errors` list |
| 4 | `POST /auth/login` correct | 200, `token`, `role: "student"` → save token |
| 5 | `POST /auth/login` wrong password / unknown email | 401, same message |
| 6 | `POST /auth/admin-login` with admin | 200, `role: "admin"` |
| 7 | `GET /auth/me` with / without token | 200 / 401 |
| 8 | expired or tampered token | 401 |
| 9 | `GET /students` without token / student token / admin token | 401 / 403 / 200 |
| 10 | `POST /students`, `PUT /students/:id`, `DELETE /students/:id` as admin | 201 / 200 / 200 |
| 11 | `GET /students/not-an-id` | 400 |
| 12 | `GET /students/<valid unknown id>` | 404 |
| 13 | `GET /courses` (no token) | 200, 11 seeded courses |
| 14 | `POST /courses` as student / as admin | 403 / 201 |
| 15 | `POST /courses` missing title | 400 |
| 16 | `PUT /courses/:id`, `DELETE /courses/:id` as admin | 200; delete also removes its enrollments |
| 17 | `POST /enrollments {courseId, roll}` as student | 201 `status: "active"` |
| 18 | same enrolment again | 409 |
| 19 | `GET /enrollments` as student / admin | 403 / 200 |
| 20 | `PATCH /enrollments/:id {"progress":{"units":[true,true]}}` | `progressPercent: 40` |
| 21 | all units `true` | `status: "completed"`, 100 % |
| 22 | another student `PATCH`es that enrolment | 403 |
| 23 | `GET /learning-progress` / `/learning-progress/:courseId` | totals match |
| 24 | `DELETE /enrollments/:id` (withdraw) | `status: "withdrawn"`, record kept |
| 25 | `GET /notifications`, `PATCH /notifications/:id/read` | list + unreadCount; own notifications only |
| 26 | `GET /messages/contacts`, `GET /messages/:userId` | no emails; only my conversation |
| 27 | `GET /profile`, `PUT /profile {"name":"New"}` | own data; email / role cannot change |
| 28 | `GET /api/health` | `{"status":"ok","message":"API is running"}` |
| 29 | `GET /api/v1/nothing` | 404 `API endpoint not found` |
| 30 | 11 wrong logins in 15 min | 11th → 429 |
| 31 | request from an origin not in `CLIENT_URL` (browser) | blocked by CORS |

Verify in MongoDB (Compass or `mongosh`): passwords start with `$2a$`/`$2b$`,
there is one enrolment per student + course, and deleted students leave no
orphan enrollments / notifications / messages.

### curl examples

```bash
# register + login
curl -X POST localhost:5000/api/v1/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Ann","email":"ann@example.com","password":"CorrectHorse#Battery9","department":"CSE"}'
TOKEN=$(curl -s -X POST localhost:5000/api/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"ann@example.com","password":"CorrectHorse#Battery9"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")

# protected call
curl localhost:5000/api/v1/auth/me -H "Authorization: Bearer $TOKEN"
```

## C. Real-time test (Task 13)

1. Start backend and frontend; open **two different browsers** (or one normal + one private window).
2. Register and log in as two different students.
3. Both open **Chat** → status shows *Live*.
4. Student A selects Student B and sends a message → B sees an unread badge instantly, opens the conversation and replies; A sees the reply without refreshing.
5. Student B keeps the **Notifications** page open; when A sends another message a "New message from A" item appears at the top live, and the navbar badge counts up.
6. Reload both pages: the history is still there (stored in MongoDB).
7. Log out: the socket closes. A connection attempt with no / invalid token is refused (`connect_error`).

This exact scenario was also executed with a real browser (Playwright) against the running
frontend and backend: registration with the 12-character rule, login, enrolment,
live chat, live notifications and the admin dashboard all worked with no console errors.

## D. Final regression checklist (Task 15)

- [ ] Frontend loads; no red errors in the browser console
- [ ] Register → login → logout (student), admin login → logout
- [ ] Courses come from MongoDB; admin add / edit / delete works
- [ ] Enrol, learn, complete, certificate
- [ ] Withdraw and re-enrol (no duplicate record)
- [ ] Chat and notifications work live
- [ ] Unauthorised actions are refused: no token → 401, student on admin route → 403
- [ ] `/api/health` returns OK
