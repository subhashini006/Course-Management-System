# 🎓 StudyVerse — Course Management System

A full student course management platform, built first as a static HTML/CSS/JS site and then converted into a modern **React (Vite)** application, backed by a real **Express + Node backend**. Students can browse courses, enroll, track progress, and earn certificates; admins can add/edit courses and manage enrollments.

## 📌 Overview

StudyVerse streamlines course discovery and learning for students while giving admins simple tools to manage course content. The project exists in four parts in this repo — the **original static frontend**, its **React conversion**, the **old json-server mock API** (`mockapi/`, no longer used), and the **Express backend** (`backend/`) that now stores all the data — so the full evolution of the project is visible in one place.

## ✨ Features

- Student registration & login
- Admin login with course management access
- Browse courses by category (Artificial Intelligence / Machine Learning)
- Expandable course details — instructor, topics, duration, outcomes
- Course enrollment flow with confirmation + auto-redirect
- Per-course learning content with progress tracking (units/video completion)
- Student dashboard — enrolled courses & progress at a glance
- Certificate generation on course completion
- Admin dashboard — add/edit courses, view & reset enrollments
- Forgot / reset password flow
- Fully responsive, mobile-friendly layout
- All data (courses, students, enrollments, progress, notifications, login sessions) stored by the backend in `backend/data/db.json` — nothing is kept in `localStorage`

## 🛠️ Tech Stack

### Original Frontend
- HTML5, CSS3, JavaScript (vanilla)

### React Conversion
- React 19
- React Router
- Vite

### Backend
- Node.js + Express
- `cors`, `dotenv`, `morgan` (request logging), `nodemon` (dev auto-restart)
- Layered architecture: routes → controllers → services → models
- JSON file storage (`backend/data/db.json`) via Node's `fs`
- scrypt password hashing and signed HttpOnly session cookies (Node built-ins)

### Frontend ↔ backend
- axios (`src/services/api.js`), React Context (`CourseContext`, `AuthContext`)

### Tools
- Visual Studio Code
- Git & GitHub

## 📂 Project Structure

```
Course-Management-System/
│
├── FrontEnd/                 # Original static site (HTML/CSS/JS)
│
├── react-frontend/           # React (Vite) app
│   ├── public/style.css      # original stylesheet
│   └── src/
│       ├── services/api.js   # axios instance -> http://localhost:5000
│       ├── context/          # CourseContext (useCourses), AuthContext (useAuth)
│       ├── hooks/            # useRequireAdmin
│       ├── components/       # Footer, StudentNav, AdminGate, PageMeta
│       ├── pages/            # one component per page
│       ├── App.jsx           # route table
│       └── main.jsx          # wraps <App /> in the providers
│
├── backend/                  # Express server (port 5000)
│   ├── server.js             # entry point: middleware, routes, 404 + error handlers
│   ├── config/               # settings from .env, CORS options
│   ├── routes/               # URL -> controller (courseRoutes, authRoutes, ...)
│   ├── controllers/          # read the request, send { success, message, data }
│   ├── services/             # business logic (progress, notifications, auth, ...)
│   ├── models/               # data access to data/db.json
│   ├── middleware/           # auth, validation, notFound, error handler
│   ├── utils/                # password hashing, sessions, helpers, HttpError
│   ├── data/db.json          # courses, students, enrollments, modules
│   ├── .env                  # PORT, admin login, etc. (see .env.example)
│   └── package.json
│
├── mockapi/                  # (old) json-server mock API — no longer used
├── make_react_pages.py       # the HTML -> JSX conversion script used for the React migration
└── README.md
```

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/dharshini-36/Course-Management-System.git
cd Course-Management-System
```

### Option A — Run the original static site

Open `FrontEnd/index.html` directly in your browser, or use the VS Code **Live Server** extension:

```
Right Click on FrontEnd/index.html → Open with Live Server
```

### Option B — Run the React app + backend (recommended)

Two terminals, both left running.

**Terminal 1 — Backend**
```bash
cd backend
npm install
npm run dev
# -> [nodemon] starting `node server.js`
# -> Server running on http://localhost:5000
```
(`npm start` runs it without auto-restart.)

**Terminal 2 — React app**
```bash
cd react-frontend
npm install
npm run dev
# -> Local: http://localhost:5173/
```

> Requires **Node.js 20.19+ or 22.12+**. Check with `node --version`.

**Logins for testing**

| Role    | Email                  | Password      |
| ------- | ---------------------- | ------------- |
| Student | `demo@studyverse.com`  | `demo1234`    |
| Admin   | `admin@institute.edu`  | `password123` |

New students can register on the Register page. Change the admin login with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables when starting the backend.

### Quick checks

- `http://localhost:5000` → `{ "message": "Student Course Management API is running" }`
- `http://localhost:5000/api/health` → `{ "success": true, "message": "Backend is healthy", ... }`
- `http://localhost:5000/api/v1/courses` → `{ "success": true, "count": 11, "data": [...] }`
- `http://localhost:5000/api/v1/courses/999` → `{ "success": false, "message": "Course not found" }`
- `http://localhost:5000/api/hello` → `{ "success": false, "message": "Route not found: /api/hello" }`
- Register a student, then open `http://localhost:5000/api/v1/students` — the new entry appears
- Enroll in a course, then open `http://localhost:5000/api/v1/enrollments`

### API

Every response uses the same shape: `{ success, message?, count?, data }`; errors are `{ success: false, message }`.

| Method | Route | Who |
| ------ | ----- | --- |
| GET | `/`, `/api/health` | anyone |
| GET | `/api/v1/courses`, `/api/v1/courses/:id`, `/api/v1/courses/:id/module` | anyone |
| POST / PUT / DELETE | `/api/v1/courses`, `/api/v1/courses/:id` | admin (POST is validated) |
| GET / POST | `/api/v1/students` (POST = register) | anyone |
| GET | `/api/v1/enrollments`, `/api/v1/enrollments/:id` | anyone |
| POST | `/api/v1/enrollments` | logged-in student |
| PATCH / DELETE | `/api/v1/enrollments/:id` | the owning student, or admin |
| DELETE | `/api/v1/enrollments` (clear all) | admin |
| POST | `/api/v1/auth/login`, `/admin-login`, `/logout`, `/forgot-password`, `/reset-password` | anyone |
| GET | `/api/v1/auth/me`, `/api/v1/me/enrollments`, `/api/v1/me/notifications` | session |
| POST | `/api/v1/me/notifications/read` | logged-in student |
| GET | `/api/v1/modules`, `/api/v1/stats` | anyone |

Completion status is calculated by the backend from a student's saved progress, so it can't be faked from the browser.

Settings live in `backend/.env` (`PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`, `SESSION_SECRET`).

### Common mistakes to avoid

- **Backend not running.** If courses don't load or nothing saves, make sure `npm run dev` is running inside `backend/`.
- **Wrong address.** `react-frontend/src/services/api.js` must point at port **5000** (the backend). Stop the old json-server mockapi so the two don't clash. Override with `VITE_API_URL` in `react-frontend/.env` if needed.
- **Missing `backend/data/db.json`.** The server now creates an empty one if it's missing, but you'll lose the seeded courses.

## 📸 Screenshots

_Add screenshots of the application here._

### Home Page

![Home Page](screenshots/home.png)

### Courses Page

![Courses](screenshots/courses.png)

### Student Dashboard

![Dashboard](screenshots/dashboard.png)

## 🎯 Learning Outcomes

Through this project, I gained practical experience in:

- Frontend web development with vanilla HTML/CSS/JavaScript
- Converting a multi-page static site into a component-based React application
- Routing strategy in React Router, including handling legacy script constraints
- Bridging imperative, DOM-dependent legacy JavaScript into a React component lifecycle
- Building a REST API with Express and consuming it from React with axios and Context
- Debugging real framework-level issues (React StrictMode double-invocation, async script loading, CORS)
- Project structuring and version control using Git

## 🔮 Future Enhancements

- Move from the JSON file to a real database (MongoDB / PostgreSQL)
- Send password-reset links by email (right now the link is printed in the backend terminal)
- Instructor dashboard
- Assignment submission module
- Attendance tracking
- Deploy the backend to a real host and point the React app at it (`VITE_API_URL`)
- Automated tests (unit + end-to-end)

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## 👩‍💻 Author

**Dharshini**

GitHub: [https://github.com/dharshini-36/Course-Management-System](https://github.com/dharshini-36/Course-Management-System)

## 📄 License

This project is open-source and available under the MIT License.
