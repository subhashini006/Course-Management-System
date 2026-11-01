# Deployment (Task 15)

Order matters: **Atlas → Render → Vercel → back to Render** (to allow the Vercel URL).

## 1. MongoDB Atlas (database)

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. **Database Access** → add a database user with a strong password (note it down).
3. **Network Access** → add an IP address. For Render's free tier use `0.0.0.0/0` (allow from anywhere); protect the database with the strong password.
4. **Connect → Drivers** → copy the connection string and add the database name:

   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/faceprep_course_system?retryWrites=true&w=majority
   ```

   If the password has special characters (`@ : / ? #`) URL-encode them.
5. Load the starter data and create the admin **against Atlas** (run on your computer, once):

   ```bash
   cd backend
   MONGO_URI="<your atlas string>" npm run seed
   MONGO_URI="<your atlas string>" ADMIN_EMAIL=you@school.edu ADMIN_PASSWORD='A-Long-Strong-Password1' npm run create-admin
   ```

   (PowerShell: set `$env:MONGO_URI=...` etc. first.)

## 2. Render (backend)

1. Push the project to GitHub (never commit `.env`).
2. Render → **New → Web Service** → pick the repository.
3. Settings:

   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Health Check Path | `/api/health` |

   (`render.yaml` in the repo root holds the same settings if you prefer a Blueprint.)
4. **Environment** variables:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | your Atlas string |
   | `JWT_SECRET` | a new random value, 32+ characters |
   | `JWT_EXPIRES_IN` | `1h` |
   | `CLIENT_URL` | `http://localhost:5173` for now — replaced in step 4 below |

   Do **not** set `PORT`; Render provides it.
5. Deploy, then open `https://<your-api>.onrender.com/api/health` → `{"status":"ok","message":"API is running"}`.

> Render's free tier sleeps after inactivity: the first request (and the first WebSocket connection) after a pause can take ~30 s.

## 3. Vercel (frontend)

1. Vercel → **Add New → Project** → import the repository.
2. **Root Directory:** `react-frontend` (Framework preset: Vite — detected automatically).
3. **Environment Variables:**

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-api>.onrender.com/api/v1` |

   Vite reads this at **build time**, so redeploy after changing it.
4. Deploy. `vercel.json` makes every route (`/courses`, `/chat`, …) load the app, so refreshing a page does not give a 404.

## 4. Allow the frontend in the backend (CORS + WebSocket)

In Render → Environment, set

```
CLIENT_URL=https://<your-app>.vercel.app
```

(no trailing slash; several origins can be comma-separated) and let the service redeploy.
The same list protects both the REST API and Socket.IO.

## 5. Production checklist

- [ ] `https://<api>/api/health` answers `ok`
- [ ] Register, log in, log out on the Vercel URL
- [ ] Admin can log in and add a course; a student sees it
- [ ] Enrol, tick units, complete a course, open the certificate
- [ ] Two browsers: send a chat message and see it live; notifications arrive live
- [ ] Browser console: no CORS errors, no failed WebSocket connection
- [ ] Atlas shows the new documents (users, enrollments, …)
- [ ] No secret in the repository (`.env` is git-ignored); `JWT_SECRET` and the admin password are new
- [ ] Atlas password is strong; `CLIENT_URL` lists only your real frontend

## Common problems

| Symptom | Cause / fix |
|---|---|
| `Unable to start server: MONGO_URI is missing` | Environment variable not set on Render |
| `MongooseServerSelectionError` | Atlas Network Access does not allow Render, or the password is wrong / not URL-encoded |
| Browser: CORS error | `CLIENT_URL` on Render is missing, has a trailing slash, or is not the exact Vercel URL |
| Frontend calls itself (`/api/v1/...` 404 on Vercel) | `VITE_API_URL` not set in Vercel — set it and redeploy |
| Chat shows "Connecting…" forever | Backend asleep (wait ~30 s) or `CLIENT_URL` does not include the frontend origin |
| `429 Too many login attempts` | Rate limit (10 tries / 15 min per IP) — wait, or test from another network |
