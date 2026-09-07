# Workmint — Web Client

React single-page app for **Workmint**, a freelance marketplace built around escrow.
Clients post jobs, freelancers bid on them, and the money for a contract is released when
the client approves the delivered work.

Three roles, three dashboards:

- **Client** — post jobs, read proposals, hire, approve or return work, pay
- **Freelancer** — browse jobs, send proposals, deliver work, track earnings
- **Admin** — approve new freelancers, moderate listings and accounts

This repository is the client only. It reads and writes everything through the REST API in
the `workmint-backend` repository — there is no local mock data.

---

## Tech stack

| Layer      | Choice                          |
| ---------- | ------------------------------- |
| Framework  | React                           |
| Build tool | Vite                            |
| Routing    | React Router                    |
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

| Command         | What it does                  |
| --------------- | ----------------------------- |
| `npm run dev`   | Dev server with hot reload    |
| `npm run build` | Production build into `dist/` |
| `npm run lint`  | ESLint over `src/`            |

### Environment variables

Vite only exposes variables prefixed with `VITE_`.

| Variable       | Default                     | Purpose                    |
| -------------- | --------------------------- | -------------------------- |
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the API server |

---

## Project structure

```
src/
├── main.jsx               # mounts <App /> into index.html
├── App.jsx                # routes, and the signed-in user
│
├── api/
│   ├── api.js             # axios instance + one object per API resource
│   └── exchange.js        # the third-party exchange-rate API
│
├── data/
│   └── helpers.js         # pure functions: money, dates, contract status
│
├── components/            # shared across dashboards + the landing page
│
├── pages/
│   ├── auth/              # sign in and register
│   ├── client/            # client dashboard and its tabs
│   ├── Freelancer/        # freelancer dashboard and its tabs
│   └── Admin/             # admin dashboard and its tabs
│
└── style/
    ├── index.css          # dashboard styles
    └── landing.css        # landing page styles
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
   tab components  (ProjectDetails, Earnings, UserManagement, …)
```

There is no Context. State lives in two places.

**`App.jsx`** owns the signed-in user. It reads `localStorage` once when the app starts,
saves the user there on sign in, clears it on sign out, and passes `user`, `onLogin` and
`onLogout` down as props.

**Each dashboard** loads its own data in a `useEffect` when it mounts, scoped to the
signed-in user: a client asks for their contracts and proposals, a freelancer for theirs,
an admin for the whole platform. Every action a user can take — post a job, deliver work,
approve it, take a payment — is a plain `async` function in that dashboard. Each one calls
the API, reloads the rows it changed, and shows a toast. The dashboards pass those
functions down to the tab components as props, so the tab components hold form state and
nothing else.

Rows are used exactly as the API returns them, so components read database column names
directly (`hourly_rate`, `sender_role`, `delivery_link`) instead of a renamed copy.
`src/data/helpers.js` holds the small pure functions on top: money formatting, dates, and
the escrow totals derived from a contract's status.

---

## Authorization

`api/api.js` registers one axios request interceptor. Before any request leaves the
browser it reads the signed-in user out of `localStorage` and adds their role as an
`x-user-role` header:

```js
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("user");
  if (saved) {
    config.headers["x-user-role"] = JSON.parse(saved).role;
  }
  return config;
});
```

The server's `adminOnly` middleware reads that header, so admin-only routes (approving a
freelancer, suspending or deleting an account, deleting a listing) answer `403` for
everybody else. The front end also hides those buttons, but the server does not trust the
front end — hiding a button and refusing the request are two separate defences.

---

## The third-party API

`src/api/exchange.js` wraps one open endpoint from **exchangerate-api**, which returns
today's rate for every currency against 1 USD. Two screens use it:

- **`components/EscrowCalculator.jsx`** on the landing page — a visitor types a budget and
  sees what a client pays and what a freelancer receives, converted into their own currency.
- **`pages/client/components/Payments.jsx`** in the client dashboard — the total is
  converted before the client confirms, and the rate that was on screen is sent to the API
  and stored on the payment row, so a past receipt never changes when rates move.

There are no stored fallback rates. If the request fails, both screens say the rate is
unavailable and the payment button is disabled, because showing a made-up number on a
payment screen is worse than showing none.

---

## Routes

| Path          | Screen               | Access                |
| ------------- | -------------------- | --------------------- |
| `/`           | Landing page         | Everyone              |
| `/login`      | Sign in              | Everyone              |
| `/register`   | Create an account    | Everyone              |
| `/client`     | Client dashboard     | Signed-in clients     |
| `/freelancer` | Freelancer dashboard | Signed-in freelancers |
| `/admin`      | Admin dashboard      | Signed-in admins      |

`protectedPage()` in `App.jsx` redirects anyone signed out to `/login`, and anyone on the
wrong dashboard to their own.

---

## Demo accounts

The seed data in the backend repository creates these, all with the password `demo1234`:

| Email                  | Role       | Notes                        |
| ---------------------- | ---------- | ---------------------------- |
| `rana@techcorp.com`    | client     | has two contracts            |
| `sadeq@workmint.dev`   | freelancer | one contract awaiting review |
| `layla@nasser.dev`     | freelancer | one finished contract        |
| `ops@workmint.com`     | admin      | sees the whole platform      |
| `yousef.amer@mail.com` | freelancer | `pending` — cannot sign in   |
