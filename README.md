# Workmint — Web Client

React single-page app for **Workmint**, a freelance marketplace built around escrow.
Clients post jobs, freelancers bid on them, and the money for a project is released one
milestone at a time as the client approves the work.

Three roles, three dashboards:

- **Client** — post jobs, read proposals, hire, approve or return milestones, pay
- **Freelancer** — browse jobs, send proposals, deliver work, track earnings
- **Admin** — approve new freelancers, moderate listings, mediate disputes

This repository is the client only. It reads and writes everything through the REST API
in the `workmint-backend` repository — there is no local mock data.

---

## Tech stack

| Layer      | Choice                          |
| ---------- | ------------------------------- |
| Framework  | React                           |
| Build tool | Vite                            |
| Routing    | React Router                   |
| UI kit     | React-Bootstrap 2 + Bootstrap 5 |
| HTTP       | axios                           |

---

## Requirements

- Node.js 18 or newer
- The Workmint API server running (see its README) — by default on port 5000

---

## Getting started

```bash
# 1. install dependencies
npm install

# 2. point the app at the API
cp .env.example .env      # then edit if your API is not on port 5000

# 3. run the dev server
npm run dev
```

Vite serves the app on <http://localhost:5173>. Start the backend first, or every screen
will show "Cannot reach the server."

### Scripts

| Command           | What it does                             |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Dev server with hot reload               |
| `npm run build`   | Production build into `dist/`            |

### Environment variables

Vite only exposes variables prefixed with `VITE_`.

| Variable        | Default                     | Purpose                    |
| --------------- | --------------------------- | -------------------------- |
| `VITE_API_URL`  | `http://localhost:5000/api` | Base URL of the API server |

---

## Project structure

```
src/
├── main.jsx
├── App.jsx
│
├── api/
│   └── api.js
│
├── data/
│   └── helpers.js
│
├── components/
│
├── pages/
│   ├── auth/
│   ├── client/
│   ├── Freelancer/
│   └── Admin/
│
└── style/
    ├── index.css
    └── landing.css
```

---

## How the data flows

```
   API server
       │  axios
       ▼
   api/api.js
       │  called from useEffect
       ▼
   ClientDashboard / FreelancerDashboard / AdminDashboard
       │  props
       ▼
   tab components  (ProjectDetails, Earnings, DisputesList, …)
```

There is no Context. State lives in two places.

**`App.jsx`** owns the signed-in user. It reads `localStorage` once when the app starts,
saves the user there on sign in, clears it on sign out, and passes `user`, `onLogin` and
`onLogout` down as props.

**Each dashboard** loads its own data in a `useEffect` when it mounts, scoped to the
signed-in user: a client asks for their orders and proposals, a freelancer for theirs, an
admin for the whole platform. Every action a user can take — post a job, deliver a
milestone, approve one, raise a dispute — is a plain `async` function in that dashboard.
Each one calls the API, reloads the rows it changed, and shows a toast. The dashboards
pass those functions down to the tab components as props.

Rows are used exactly as the API returns them, so components read database column names
directly (`hourly_rate`, `sender_role`, `due_date`) instead of a renamed copy.
`src/data/helpers.js` holds the small pure functions that go on top: money formatting,
dates, and the escrow totals derived from an order's milestones.

---

## Routes

| Path          | Screen              | Access               |
| ------------- | ------------------- | -------------------- |
| `/`           | Landing page        | Everyone             |
| `/login`      | Sign in             | Everyone             |
| `/register`   | Create an account   | Everyone             |
| `/client`     | Client dashboard    | Signed-in clients    |
| `/freelancer` | Freelancer dashboard| Signed-in freelancers|
| `/admin`      | Admin dashboard     | Signed-in admins     |

`protectedPage()` in `App.jsx` redirects anyone signed out to `/login`, and anyone on the
wrong dashboard to their own.

## Demo accounts

The seed data in the backend repository creates these, all with the password `demo1234`:

| Email                  | Role       |
| ---------------------- | ---------- |
| `rana@techcorp.com`    | client     |
| `sadeq@workmint.dev`   | freelancer |
| `ops@workmint.com`     | admin      |