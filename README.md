# Learning Companion Studio

A learner-centric training and curriculum platform for the **InclusiveMinds Learning Collective (IMLC)**. It pairs an interactive Learning Companion (LC) training interface with a Creator/Authoring Desk, both built on the **Learner-Centric MOOC (LCM)** framework ([lcm-model.org](https://lcm-model.org/)).

---

## Key Features

### LCM model — in both interfaces

Every lesson carries the four LCM pedagogic components, configured by the author and rendered interactively for the companion:

* **LeD (Learning Dialogue):** concept video/text segments punctuated by *reflection spots* — strategic pauses where the companion writes down their thinking before continuing.
* **LbD (Learning by Doing):** ungraded MCQs where **every option has authored feedback**, plus subjective prompts answered first and then compared against the author's **exemplar response**.
* **LxT (Learning Extension Trajectories):** curated resource pathways (worksheets, videos, articles, tools) tagged by type.
* **LxI (Learner Experience Interaction):** weekly focus prompts for peer discussion across the companion cohort.

### Creator / Authoring Desk (`/studio`)

Authors (role `author`) create courses and configure every LCM element through simple forms — LeD reflection spots, LbD options + per-option feedback, subjective exemplars, LxT resources, LxI prompts, and the graded review quiz. Draft/publish workflow controls visibility.

### Live integration

Both interfaces share one API and database: when the author saves or publishes, the Learning Companion interface loads the update on the next page view — no redeploys, no hardcoded files. All companion interactions (reflections, LbD attempts, resource opens, quiz submissions) are logged to the clickstream analytics for mentors.

---

## Directory Structure

* `client/` — React + Vite frontend (companion interface + authoring desk).
* `server/` — Node.js + Express + MongoDB backend.
* `docs/` — HLD, contract, and weekly meeting minutes.

## Running Locally

No MongoDB install needed — without a `MONGODB_URI` the server boots an in-memory database and seeds it automatically (data resets on restart).

```bash
cd server && npm install && npm run dev   # API on http://localhost:5050
cd client && npm install && npm run dev   # app on http://localhost:5173
```

Demo accounts (seeded):

| Role | Email | Password |
|---|---|---|
| Content Author | `author@learningcompanion.studio` | `AuthorPass123!` |
| Learning Companion | `companion@learningcompanion.studio` | `LearnerPass123!` |
| Admin / Mentor | `admin@learningcompanion.studio` | `AdminPass123!` |

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) — MongoDB Atlas + Render (API, via `render.yaml`) + Vercel (client).
