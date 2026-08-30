import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import Icon from '../../components/Icon';
import { Pill } from '../../components/Shared';
import { useAuth, MIN_PASSWORD } from '../../data/AuthContext';

const HOME_FOR = { client: '/client', freelancer: '/freelancer', admin: '/admin' };

const DEMO_ACCOUNTS = [
  { role: 'Client', email: 'rana@techcorp.com' },
  { role: 'Freelancer', email: 'sadeq@workmint.dev' },
  { role: 'Admin', email: 'ops@workmint.com' },
];

const ROLES = [
  { key: 'client', icon: 'briefcase', title: 'I want to hire', body: 'Post work, compare proposals, pay in milestones.' },
  { key: 'freelancer', icon: 'user', title: 'I want to work', body: 'Bid on jobs, deliver milestones, get paid on approval.' },
];

const BLANK = { name: '', email: '', company: '', title: '', password: '', confirm: '', accepted: false };


const strengthOf = (password) => {
  if (!password) return { score: 0, label: '', tone: 'muted' };
  let score = 0;
  if (password.length >= MIN_PASSWORD) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 2) return { score, label: 'Weak', tone: 'danger' };
  if (score === 3) return { score, label: 'Fair', tone: 'warn' };
  if (score === 4) return { score, label: 'Good', tone: 'info' };
  return { score, label: 'Strong', tone: 'success' };
};

const AuthPage = ({ mode }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, register } = useAuth();

  const isLogin = mode === 'login';

  const [role, setRole] = useState(params.get('role') === 'freelancer' ? 'freelancer' : 'client');
  const [form, setForm] = useState(BLANK);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [field, setField] = useState('');
  const [submitted, setSubmitted] = useState(null); // pending-review screen

  const set = (patch) => { setForm({ ...form, ...patch }); setError(''); setField(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(HOME_FOR[result.user.role] || '/');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register({ ...form, role });
    if (!result.ok) {
      setError(result.error);
      setField(result.field || '');
      return;
    }
    if (result.pending) {
      setSubmitted(result.user);
      return;
    }
    navigate(HOME_FOR[result.user.role] || '/');
  };

  const fillDemo = (email) => {
    setForm({ ...BLANK, email, password: 'demo1234' });
    setError('');
  };

  const strength = strengthOf(form.password);

  /* ---------- freelancer signed up, waiting on screening ---------- */
  if (submitted) {
    return (
      <div className="wm-auth">
        <div className="wm-auth__form">
          <div className="wm-auth__card text-center">
            <span className="wm-auth__tick"><Icon name="check" size={26} strokeWidth={2.5} /></span>
            <h1 className="wm-auth__title">Application received</h1>
            <p className="wm-auth__sub">
              Thanks {submitted.name.split(' ')[0]}. Freelancer accounts are screened before they can bid,
              usually within a working day. We will email {submitted.email} once you are approved.
            </p>
            <div className="wm-panel text-start mb-3" style={{ background: '#f8fafc' }}>
              <div className="wm-eyebrow mb-2">While you wait</div>
              <ul className="value-list">
                <li><Icon name="check" size={15} strokeWidth={2.5} /><span>Have two or three projects ready to add to your portfolio</span></li>
                <li><Icon name="check" size={15} strokeWidth={2.5} /><span>Decide your hourly rate before your first proposal</span></li>
              </ul>
            </div>
            <Link to="/" className="wm-btn wm-btn-outline">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wm-auth">
      {/* ---------- brand side ---------- */}
      <aside className="wm-auth__brand">
        <div>
          <Link to="/" className="wm-auth__logo">Workmint.</Link>
          <h2>
            {isLogin ? 'Pick up where you left off.' : 'Money in escrow before the work starts.'}
          </h2>
          <p>
            {isLogin
              ? 'Your projects, milestones and escrow balance are exactly where you left them.'
              : 'Clients fund the whole contract up front. Freelancers see it sitting there before writing a line of code. Nobody chases an invoice.'}
          </p>

          <ul className="value-list">
            <li><Icon name="check" size={16} strokeWidth={2.5} /><span>Milestone by milestone, approved before it is paid</span></li>
            <li><Icon name="check" size={16} strokeWidth={2.5} /><span>Revision allowances, so scope creep has a price</span></li>
            <li><Icon name="check" size={16} strokeWidth={2.5} /><span>A mediator on every contract if something goes wrong</span></li>
          </ul>
        </div>

        <div className="wm-auth__figures">
          <div>
            <span className="wm-figure">$2.4M</span>
            <small>held in escrow</small>
          </div>
          <div>
            <span className="wm-figure">1,900</span>
            <small>freelancers</small>
          </div>
        </div>
      </aside>

      {/* ---------- form side ---------- */}
      <div className="wm-auth__form">
        <div className="wm-auth__card">
          <Link to="/" className="wm-auth__back">
            <Icon name="back" size={14} /> Home
          </Link>

          <h1 className="wm-auth__title">{isLogin ? 'Sign in' : 'Create your account'}</h1>
          <p className="wm-auth__sub">
            {isLogin ? (
              <>New here? <Link to="/register">Create an account</Link>.</>
            ) : (
              <>Already have one? <Link to="/login">Sign in</Link>.</>
            )}
          </p>

          {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.87rem' }}>{error}</Alert>}

          {isLogin ? (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => set({ email: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label>Password</Form.Label>
                  <button type="button" className="wm-auth__toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => set({ password: e.target.value })}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 mb-3" size="lg">Sign in</Button>

              <div className="wm-auth__demo">
                <div className="wm-eyebrow mb-2">Demo accounts (password: demo1234)</div>
                <div className="wm-chips">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button key={account.email} type="button" className="wm-chip" onClick={() => fillDemo(account.email)}>
                      {account.role}
                    </button>
                  ))}
                </div>
              </div>
            </Form>
          ) : (
            <Form onSubmit={handleRegister}>
              <Form.Label>I am joining to</Form.Label>
              <div className="wm-role-picker mb-3">
                {ROLES.map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    className={`wm-role ${role === option.key ? 'active' : ''}`}
                    onClick={() => setRole(option.key)}
                  >
                    <span className="wm-role__icon"><Icon name={option.icon} size={17} /></span>
                    <strong>{option.title}</strong>
                    <small>{option.body}</small>
                  </button>
                ))}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Full name</Form.Label>
                <Form.Control
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  isInvalid={field === 'name'}
                  onChange={(e) => set({ name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={form.email}
                  isInvalid={field === 'email'}
                  onChange={(e) => set({ email: e.target.value })}
                  required
                />
              </Form.Group>

              {role === 'client' ? (
                <Form.Group className="mb-3">
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    type="text"
                    autoComplete="organization"
                    placeholder="TechCorp"
                    value={form.company}
                    onChange={(e) => set({ company: e.target.value })}
                  />
                </Form.Group>
              ) : (
                <Form.Group className="mb-3">
                  <Form.Label>What do you do?</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Full-stack developer - React & .NET"
                    value={form.title}
                    onChange={(e) => set({ title: e.target.value })}
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label>Password</Form.Label>
                  <button type="button" className="wm-auth__toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  isInvalid={field === 'password'}
                  onChange={(e) => set({ password: e.target.value })}
                  required
                />
                {form.password && (
                  <div className="d-flex align-items-center gap-2 mt-2">
                    <div className="wm-strength">
                      <span className={`wm-strength__fill wm-strength__fill--${strength.tone}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                    </div>
                    <Pill tone={strength.tone}>{strength.label}</Pill>
                  </div>
                )}
                <Form.Text>At least {MIN_PASSWORD} characters.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm password</Form.Label>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirm}
                  isInvalid={field === 'confirm'}
                  onChange={(e) => set({ confirm: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Check
                className="mb-3"
                id="terms"
                type="checkbox"
                checked={form.accepted}
                isInvalid={field === 'accepted'}
                onChange={(e) => set({ accepted: e.target.checked })}
                label="I accept the terms of service and the escrow policy."
              />

              <Button type="submit" variant="primary" className="w-100" size="lg">
                {role === 'freelancer' ? 'Apply as a freelancer' : 'Create account'}
              </Button>

              {role === 'freelancer' && (
                <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.82rem' }}>
                  Freelancer accounts are reviewed by our team before you can bid on work.
                </p>
              )}
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;