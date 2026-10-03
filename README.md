# 🎓 StudyVerse — Course Management System

A full student course management platform, built first as a static HTML/CSS/JS site and then converted into a modern **React (Vite)** application, backed by a lightweight **mock REST API**. Students can browse courses, enroll, track progress, and earn certificates; admins can add/edit courses and manage enrollments.

## 📌 Overview

StudyVerse streamlines course discovery and learning for students while giving admins simple tools to manage course content. The project exists in three parts in this repo — the **original static frontend**, its **React conversion**, and a **mock API** that the React app can fetch live data from — so the full evolution of the project (and the reasoning behind it) is visible in one place.

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
- Course data served live from a REST API (GET endpoints + record counts)

## 🛠️ Tech Stack

### Original Frontend
- HTML5, CSS3, JavaScript (vanilla)

### React Conversion
- React 19
- React Router
- Vite

### Mock API
- Node.js
- json-server

### Tools
- Visual Studio Code
- Git & GitHub

## 📂 Project Structure

```
Course-Management-System/
│
├── FrontEnd/                 # Original static site (HTML/CSS/JS)
│   ├── index.html
│   ├── courses.html
│   ├── ...                   # 17 pages total
│   ├── style.css
│   └── app.js
│
├── react-frontend/           # React (Vite) conversion
│   ├── public/
│   │   ├── style.css         # original stylesheet, unmodified
│   │   └── legacy/app.js     # original app.js, unmodified
│   ├── src/
│   │   ├── components/       # PageMeta, LegacyScript bridge components
│   │   ├── pages/            # one component per original page
│   │   ├── api.js            # mock API base URL
│   │   ├── App.jsx           # route table
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── mockapi/                  # Mock REST API (GET-only)
│   ├── db.json               # seed data: courses, students, enrollments, certificates
│   ├── server.js             # json-server with /count and /stats endpoints
│   └── package.json
│
├── make_react_pages.py       # the HTML → JSX conversion script used for the React migration
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

### Option B — Run the React app (recommended)

You'll run two things at once: the mock API and the React dev server.

**Terminal 1 — Mock API**
```bash
cd mockapi
npm install
npm start
```
Runs on `http://localhost:5000`.

**Terminal 2 — React app**
```bash
cd react-frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` (or the next free port). Open that URL in your browser.

> Requires **Node.js 20.19+ or 22.12+**. Check with `node --version`.

### Try the API directly

```
GET http://localhost:5000/courses
GET http://localhost:5000/courses/:id
GET http://localhost:5000/courses/count
GET http://localhost:5000/stats
```

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
- Building and consuming a REST API with json-server
- Debugging real framework-level issues (React StrictMode double-invocation, async script loading, CORS)
- Project structuring and version control using Git

## 🔮 Future Enhancements

- Full CRUD on the mock API (POST/PUT/DELETE for enrollments, students, certificates)
- Replace `localStorage` persistence with real API-backed persistence end-to-end
- Student authentication via JWT / sessions
- Instructor dashboard
- Assignment submission module
- Attendance tracking
- Deploy the mock API to a real host and point the React app at it
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
