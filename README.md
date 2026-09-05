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
| Framework  | React                         |
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
│   ├── api.js     
│   └── adapters.js    
│
├── data/
│   ├── AuthContext.jsx     
│   ├── WorkspaceContext.jsx 
│   └── freelancerData.js  
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
   api/api.js  ──►  api/adapters.js
       │
       ▼
   AuthContext   (who is signed in)
       │
       ▼
   WorkspaceContext   (all the data for that person, plus every action)
       │  useWorkspace()
       ▼
   ClientDashboard / FreelancerDashboard / AdminDashboard
       │  props
       ▼
   tab components  (ProjectDetails, Earnings, DisputesList, …)
```

Two contexts hold state, and the dashboards pass what each tab needs down as props.

**`AuthContext`** owns the signed-in user. It also loads the full user list, but only
when an admin signs in, since only the admin screens need it.

**`WorkspaceContext`** loads everything else the moment somebody signs in, scoped to
them: a client gets their own orders and proposals, a freelancer gets theirs, an admin
gets the whole platform. Every action a user can take: post a job, deliver a milestone,
approve one, raise a dispute, is a function on this context. Each one calls the API,
refreshes the affected rows, and shows a toast.

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

`ProtectedRoute` in `App.jsx` redirects anyone signed out to `/login`, and anyone on the
wrong dashboard to their own.