# LearnLog

LearnLog is a full-stack learning platform built for a clickstream analytics assignment. It pairs a learner-facing course experience with Moodle-style event logging and an administrator analytics dashboard.

## What it demonstrates

- JWT authentication with learner and administrator roles
- Course and lesson experience with automatic course/module/scroll/video events
- Server-scored quizzes and recorded attempts
- A normalized activity log with Moodle-inspired fields: event name, component, context, origin, description, resource and timestamp
- Admin dashboard for learner count, daily activity, average score, common events, and recent log entries

## Stack

React + Vite + Tailwind CSS · Node.js + Express · MongoDB + Mongoose · JWT · Recharts

## Login Details

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@learnlog.local` | `AdminPass123!` |
| Learner | `harvey@learnlog.local` | `LearnerPass123!` |

## Event model

Events are created automatically for registration, log-in, course views, lesson views, quiz starts, and submissions. The browser also sends controlled tracking events for dashboard visits, lesson scrolling, and video interaction. The server validates browser event names; score calculation and quiz submission tracking always happen on the server.

If Docker is not available, use MongoDB Atlas and update `MONGODB_URI` in `server/.env`.
