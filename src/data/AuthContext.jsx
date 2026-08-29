import React, { createContext, useContext, useState } from 'react';
import { dayOffset, hoursAgo, uid } from './freelancerData';

/* =========================================================================
   Accounts and sessions.

   This is the frontend half of auth. Passwords are compared in plain text
   here because there is nothing to compare them against yet - when the Node
   backend lands, login() and register() become POSTs and the server returns
   a token, so nothing outside this file has to change.

   The session lives in memory on purpose. Persisting it would mean putting
   credentials in localStorage, and the real answer is a token from the
   server, so refreshing signs you out for now.
   ========================================================================= */

export const UserContext = createContext();
export const useAuth = () => useContext(UserContext);

const SEED_USERS = [
  {
    id: 'USR-001', name: 'Rana Haddad', email: 'rana@techcorp.com', password: 'demo1234',
    role: 'client', status: 'active', company: 'TechCorp', title: 'Head of engineering',
    joinedAt: dayOffset(-420), lastActive: hoursAgo(2),
  },
  {
    id: 'USR-002', name: 'Sadeq Odeh', email: 'sadeq@workmint.dev', password: 'demo1234',
    role: 'freelancer', status: 'active', title: 'Full-stack developer - React & .NET',
    skills: ['React.js', '.NET', 'C++', 'PostgreSQL'], joinedAt: dayOffset(-300), lastActive: hoursAgo(1),
  },
  {
    id: 'USR-003', name: 'Workmint Ops', email: 'ops@workmint.com', password: 'demo1234',
    role: 'admin', status: 'active', title: 'Platform operations',
    joinedAt: dayOffset(-600), lastActive: hoursAgo(0),
  },
  {
    id: 'USR-004', name: 'Layla Nasser', email: 'layla@nasser.dev', password: 'demo1234',
    role: 'freelancer', status: 'active', title: 'Data visualisation engineer',
    skills: ['Go', 'Kafka', 'PostgreSQL'], joinedAt: dayOffset(-180), lastActive: hoursAgo(14),
  },
  {
    id: 'USR-005', name: 'Karim Aziz', email: 'karim@aziz.io', password: 'demo1234',
    role: 'freelancer', status: 'active', title: 'DevOps and platform engineer',
    skills: ['Kubernetes', 'Terraform', 'Go'], joinedAt: dayOffset(-260), lastActive: hoursAgo(70),
  },
  {
    id: 'USR-006', name: 'Dana Fares', email: 'dana@northwind.com', password: 'demo1234',
    role: 'client', status: 'active', company: 'Northwind Retail', title: 'Product lead',
    joinedAt: dayOffset(-95), lastActive: hoursAgo(18),
  },
  /* waiting on admin screening */
  {
    id: 'USR-007', name: 'Yousef Amer', email: 'yousef.amer@mail.com', password: 'demo1234',
    role: 'freelancer', status: 'pending', title: 'Android developer',
    skills: ['Kotlin', 'Jetpack Compose', 'Firebase'],
    portfolio: 'https://github.com/demo/yousef',
    pitch: 'Six years of Android work, mostly logistics and field-service apps. Looking for contract work in the region.',
    joinedAt: hoursAgo(30), lastActive: hoursAgo(30),
  },
  {
    id: 'USR-008', name: 'Mira Tannous', email: 'mira@tannous.design', password: 'demo1234',
    role: 'freelancer', status: 'pending', title: 'Product designer',
    skills: ['Figma', 'Design systems', 'Prototyping'],
    portfolio: 'https://miratannous.design',
    pitch: 'I design and hand off component libraries that engineers can build from without a translation layer.',
    joinedAt: hoursAgo(52), lastActive: hoursAgo(52),
  },
  {
    id: 'USR-009', name: 'Bilal Rahim', email: 'bilal.rahim@mail.com', password: 'demo1234',
    role: 'freelancer', status: 'pending', title: 'Full-stack developer',
    skills: ['PHP', 'Laravel', 'MySQL'],
    portfolio: '',
    pitch: 'Available immediately for any web work. Fast turnaround, cheapest rates, satisfaction guaranteed.',
    joinedAt: hoursAgo(80), lastActive: hoursAgo(80),
  },
  {
    id: 'USR-010', name: 'Tom Vale', email: 'tom@valeworks.com', password: 'demo1234',
    role: 'client', status: 'suspended', company: 'Valeworks', title: 'Founder',
    suspendedReason: 'Three chargebacks after milestone approval.',
    joinedAt: dayOffset(-210), lastActive: hoursAgo(400),
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(SEED_USERS);
  const [currentUser, setCurrentUser] = useState(null);

  /* Returns a result object rather than throwing, so the form can render the
     message next to the field that caused it. */
  const login = (email, password) => {
    const account = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!account || account.password !== password) {
      return { ok: false, error: 'That email and password do not match an account.' };
    }
    if (account.status === 'suspended') {
      return { ok: false, error: 'This account is suspended. Contact support@workmint.com.' };
    }
    if (account.status === 'pending') {
      return {
        ok: false,
        pending: true,
        error: 'Your account is still being reviewed. We will email you once it is approved.',
      };
    }

    setUsers((prev) => prev.map((u) => (u.id === account.id ? { ...u, lastActive: new Date().toISOString() } : u)));
    setCurrentUser(account);
    return { ok: true, user: account };
  };

  const register = (form) => {
    const email = form.email.trim().toLowerCase();

    if (form.name.trim().length < 2) return { ok: false, field: 'name', error: 'Tell us what to call you.' };
    if (!EMAIL_PATTERN.test(email)) return { ok: false, field: 'email', error: 'That does not look like an email address.' };
    if (users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, field: 'email', error: 'An account already uses that email. Sign in instead.' };
    }
    if (form.password.length < MIN_PASSWORD) {
      return { ok: false, field: 'password', error: `Passwords need at least ${MIN_PASSWORD} characters.` };
    }
    if (form.password !== form.confirm) {
      return { ok: false, field: 'confirm', error: 'The two passwords do not match.' };
    }
    if (!form.accepted) {
      return { ok: false, field: 'accepted', error: 'You need to accept the terms to open an account.' };
    }

    // Freelancers are screened before they can take work; clients are not.
    const pending = form.role === 'freelancer';

    const account = {
      id: uid('USR'),
      name: form.name.trim(),
      email,
      password: form.password,
      role: form.role,
      status: pending ? 'pending' : 'active',
      company: form.role === 'client' ? form.company.trim() : undefined,
      title: form.title.trim() || undefined,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, account]);
    if (!pending) setCurrentUser(account);

    return { ok: true, pending, user: account };
  };

  const logout = () => setCurrentUser(null);

  /* Admin actions on accounts. */
  const setUserStatus = (id, status, note) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status, suspendedReason: status === 'suspended' ? note : undefined } : u))
    );
    setCurrentUser((prev) => (prev && prev.id === id && status !== 'active' ? null : prev));
  };

  const value = {
    users, currentUser, setCurrentUser,
    login, register, logout, setUserStatus,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};