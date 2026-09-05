import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, ProgressBar } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, Avatar } from '../../../components/Shared';
import { money } from '../../../data/freelancerData';

const MIN_BIO = 100;

const ProfileEdit = ({ profile, onSave }) => {
  const [form, setForm] = useState(() => profile || { skills: [] });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  if (!profile) return null;

  const set = (patch) => setForm({ ...form, ...patch });
  const dirty = JSON.stringify(form) !== JSON.stringify(profile);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || form.skills.includes(value)) return setSkillInput('');
    set({ skills: [...form.skills, value] });
    setSkillInput('');
  };

  const removeSkill = (skill) => set({ skills: form.skills.filter((s) => s !== skill) });

  const checks = [
    { label: 'Name and title', done: Boolean(form.name && form.title) },
    { label: `Bio of ${MIN_BIO}+ characters`, done: (form.bio || '').length >= MIN_BIO },
    { label: 'Three or more skills', done: form.skills.length >= 3 },
    { label: 'Hourly rate set', done: Number(form.rate) > 0 },
    { label: 'Location and timezone', done: Boolean(form.location && form.timezone) },
    { label: 'Languages listed', done: Boolean(form.languages) },
  ];
  const strength = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Clients need a name to address you by.';
    if (!form.title.trim()) next.title = 'Say what you do in one line.';
    if (Number(form.rate) < 5) next.rate = 'Set a rate of at least $5/hr.';
    if ((form.bio || '').length < MIN_BIO) next.bio = `Write at least ${MIN_BIO} characters.`;
    if (form.skills.length === 0) next.skills = 'Add at least one skill.';

    setErrors(next);
    if (Object.keys(next).length === 0) onSave({ ...form, rate: Number(form.rate) });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>Public profile</h5>
              {dirty && <Pill tone="warn">Unsaved changes</Pill>}
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Full name</Form.Label>
                  <Form.Control
                    value={form.name}
                    isInvalid={Boolean(errors.name)}
                    onChange={(e) => set({ name: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Professional title</Form.Label>
                  <Form.Control
                    value={form.title}
                    isInvalid={Boolean(errors.title)}
                    onChange={(e) => set({ title: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Hourly rate ($)</Form.Label>
                  <Form.Control
                    type="number" min="5"
                    value={form.rate}
                    isInvalid={Boolean(errors.rate)}
                    onChange={(e) => set({ rate: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{errors.rate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <Form.Control value={form.location} onChange={(e) => set({ location: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Timezone</Form.Label>
                  <Form.Control value={form.timezone} onChange={(e) => set({ timezone: e.target.value })} />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Languages</Form.Label>
                  <Form.Control value={form.languages} onChange={(e) => set({ languages: e.target.value })} />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea" rows={4}
                    value={form.bio}
                    isInvalid={Boolean(errors.bio)}
                    onChange={(e) => set({ bio: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{errors.bio}</Form.Control.Feedback>
                  <Form.Text>{(form.bio || '').length} characters</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="wm-panel mb-3">
            <h5 className="m-0 mb-1" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>Skills</h5>
            <p className="text-muted" style={{ fontSize: '0.83rem' }}>These decide which jobs get matched to you.</p>

            <div className="wm-chips mb-3">
              {form.skills.map((skill) => (
                <span className="wm-tag" key={skill}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                    <Icon name="close" size={12} />
                  </button>
                </span>
              ))}
              {form.skills.length === 0 && <span className="text-muted" style={{ fontSize: '0.85rem' }}>No skills yet.</span>}
            </div>

            <div className="d-flex gap-2">
              <Form.Control
                placeholder="Add a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <Button variant="outline-secondary" type="button" onClick={addSkill}>Add</Button>
            </div>
            {errors.skills && <div className="text-danger mt-2" style={{ fontSize: '0.83rem' }}>{errors.skills}</div>}
          </div>

          <div className="wm-panel d-flex justify-content-between align-items-center">
            <div>
              <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>Taking on new work</div>
              <div className="text-muted" style={{ fontSize: '0.83rem' }}>
                Turn this off and you stay hidden from client searches.
              </div>
            </div>
            <Form.Check
              type="switch"
              id="availability"
              checked={Boolean(form.available)}
              onChange={(e) => set({ available: e.target.checked })}
            />
          </div>
        </Col>

        <Col lg={5}>
          <div className="wm-panel mb-3">
            <div className="wm-eyebrow">Profile strength</div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="wm-num" style={{ fontSize: '1.8rem' }}>{strength}%</span>
              <div className="flex-grow-1"><ProgressBar now={strength} style={{ height: 8 }} /></div>
            </div>
            {checks.map((c) => (
              <div key={c.label} className="d-flex align-items-center gap-2 py-1" style={{ fontSize: '0.85rem' }}>
                <span
                  className={`wm-stat__icon wm-stat__icon--${c.done ? 'success' : 'muted'}`}
                  style={{ width: 20, height: 20 }}
                >
                  <Icon name={c.done ? 'check' : 'close'} size={11} />
                </span>
                <span style={{ color: c.done ? 'var(--text-main)' : 'var(--text-muted)' }}>{c.label}</span>
              </div>
            ))}
          </div>

          <div className="wm-panel">
            <div className="wm-eyebrow mb-3">What clients see</div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar name={form.name || 'W'} size={54} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{form.name || 'Your name'}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{form.title || 'Your title'}</div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <Pill tone={form.available ? 'success' : 'muted'}>{form.available ? 'Available now' : 'Unavailable'}</Pill>
              <Pill tone="muted">{form.location || 'Location'}</Pill>
              <Pill tone="muted">Replies in ~{form.responseHours}h</Pill>
            </div>

            <div className="wm-num mb-2" style={{ fontSize: '1.3rem' }}>
              {money(Number(form.rate) || 0)}<span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>/hr</span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              {form.bio || 'Your bio appears here.'}
            </p>
            <div className="wm-chips">
              {form.skills.slice(0, 6).map((s) => <span className="wm-tag" key={s}>{s}</span>)}
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="outline-secondary" type="button" disabled={!dirty} onClick={() => { setForm(profile); setErrors({}); }}>
          Discard changes
        </Button>
        <Button variant="primary" type="submit" disabled={!dirty}>Save profile</Button>
      </div>
    </Form>
  );
};

export default ProfileEdit;