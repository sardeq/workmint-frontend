import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../api/api';
import { toUser, errorText } from '../api/adapters';


export const UserContext = createContext();
export const useAuth = () => useContext(UserContext);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);

    const refreshUsers = async () => {
        try {
            const rows = await usersApi.getAll();
            setUsers(rows.map(toUser));
        } catch (err) {
            console.error('Could not load users:', errorText(err));
        }
    };

    /* The admin screens read `users`. Load the list once an admin signs in,
       and drop it again on sign out so it is never stale for whoever signs
       in next. */
    useEffect(() => {
        if (currentUser && currentUser.role === 'admin') {
            refreshUsers();
        } else {
            setUsers([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const login = async (email, password) => {
        try {
            const row = await usersApi.login(email.trim(), password);
            const user = toUser(row);
            setCurrentUser(user);
            return { ok: true, user };
        } catch (err) {
            // A 403 saying "still being reviewed" is the pending case, which
            // AuthPage words differently from a wrong password.
            const message = errorText(err, 'Could not sign in.');
            return { ok: false, error: message, pending: message.includes('reviewed') };
        }
    };

    const register = async (form) => {
        // Checked here as well as on the server so the message can land next
        // to the field that caused it without a round trip.
        const email = form.email.trim().toLowerCase();
        if (form.name.trim().length < 2) return { ok: false, field: 'name', error: 'Tell us what to call you.' };
        if (!EMAIL_PATTERN.test(email)) return { ok: false, field: 'email', error: 'That does not look like an email address.' };
        if (form.password.length < MIN_PASSWORD) {
            return { ok: false, field: 'password', error: `Passwords need at least ${MIN_PASSWORD} characters.` };
        }
        if (form.password !== form.confirm) {
            return { ok: false, field: 'confirm', error: 'The two passwords do not match.' };
        }
        if (!form.accepted) {
            return { ok: false, field: 'accepted', error: 'You need to accept the terms to open an account.' };
        }

        try {
            const row = await usersApi.register({
                name: form.name.trim(),
                email,
                password: form.password,
                role: form.role,
                company: form.company || null,
                title: form.title || null,
            });
            const user = toUser(row);
            const pending = user.status === 'pending';
            if (!pending) setCurrentUser(user);
            return { ok: true, pending, user };
        } catch (err) {
            return { ok: false, field: 'email', error: errorText(err, 'Could not create the account.') };
        }
    };

    const logout = () => setCurrentUser(null);

    /* Admin: approve an application, suspend an account, reinstate one. */
    const setUserStatus = async (id, status, note) => {
        try {
            await usersApi.setStatus(id, status, note);
            await refreshUsers();
            // Suspending the signed-in account signs it out immediately.
            if (currentUser && currentUser.id === id && status !== 'active') setCurrentUser(null);
        } catch (err) {
            console.error('Could not update the account:', errorText(err));
        }
    };

    /* Lets ProfileEdit push a name change into the header and sidebar. */
    const updateCurrentUser = (patch) => setCurrentUser((prev) => ({ ...prev, ...patch }));

    const value = {
        users, currentUser, setCurrentUser, updateCurrentUser,
        login, register, logout, setUserStatus, refreshUsers,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};