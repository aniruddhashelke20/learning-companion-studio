# LearnLog

LearnLog is a full-stack learning platform built for a clickstream analytics assignment. It pairs a learner-facing course experience with Moodle-style event logging and an administrator analytics dashboard.

## What it demonstrates

- JWT authentication with learner and administrator roles
- Course and lesson experience with automatic course/module/scroll/video events
- Server-scored quizzes and recorded attempts
- A normalized activity log with Moodle-inspired fields: event name, component, context, origin, description, resource, metadata, IP address, and timestamp
- Admin dashboard for learner count, daily activity, average score, common events, and recent log entries

## Stack

React + Vite + Tailwind CSS · Node.js + Express · MongoDB + Mongoose · JWT · Recharts

## Run locally

1. Install [Node.js 20+](https://nodejs.org/) and start MongoDB locally (or create a MongoDB Atlas database).
2. Copy `server/.env.example` to `server/.env`, then set `MONGODB_URI` and a strong `JWT_SECRET`.
3. From the repository root, run `npm install`.
4. Populate the sample course and accounts with `npm run seed`.
5. Start both applications with `npm run dev`.
6. Visit `http://localhost:5173`.

Sample accounts after seeding:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@learnlog.local` | `AdminPass123!` |
| Learner | `harvey@learnlog.local` | `LearnerPass123!` |

## Event model

Events are created automatically for registration, log-in, course views, lesson views, quiz starts, and submissions. The browser also sends controlled tracking events for dashboard visits, lesson scrolling, and video interaction. The server validates browser event names; score calculation and quiz submission tracking always happen on the server.

## GitHub setup

```bash
git init -b main
git add .
git commit -m "feat: scaffold LearnLog learning platform"
git remote add origin https://github.com/YOUR-USERNAME/learnlog.git
git push -u origin main
```

Use the suggested commit sequence in `docs/COMMIT_PLAN.md` if presenting development history is required.
