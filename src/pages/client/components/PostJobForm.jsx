import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill } from '../../../components/Shared';
import { money, grossWithClientFee, CLIENT_FEE_RATE } from '../../../data/freelancerData';

const BLANK = { title: '', level: 'Intermediate', budget: '', days: '', description: '', skills: [] };
const MIN_DESCRIPTION = 80;

const PostJobForm = ({ onPostJob }) => {
  const [form, setForm] = useState(BLANK);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});

  const set = (patch) => setForm({ ...form, ...patch });

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || form.skills.includes(value)) return setSkillInput('');
    set({ skills: [...form.skills, value] });
    setSkillInput('');
  };

  const removeSkill = (skill) => set({ skills: form.skills.filter((s) => s !== skill) });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.title.trim().length < 8) next.title = 'Give the job a title a freelancer could scan in a list.';
    if (Number(form.budget) < 50) next.budget = 'Set a budget of at least $50.';
    if (Number(form.days) < 1) next.days = 'How many days do you need this in?';
    if (form.description.trim().length < MIN_DESCRIPTION) {
      next.description = `Write at least ${MIN_DESCRIPTION} characters. Vague briefs get vague bids.`;
    }
    if (form.skills.length === 0) next.skills = 'Add at least one skill so the job reaches the right people.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onPostJob({ ...form, budget: Number(form.budget), days: Number(form.days) });
    setForm(BLANK);
  };

  const budget = Number(form.budget) || 0;

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel mb-3">
            <h5 className="m-0 mb-1" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              The work
            </h5>
            <p className="text-muted mb-3" style={{ fontSize: '0.83rem' }}>
              Nothing is charged now. You only fund escrow when you accept a proposal.
            </p>

            <Form.Group className="mb-3">
              <Form.Label>Job title</Form.Label>
              <Form.Control
                placeholder="Realtime metrics service"
                value={form.title}
                isInvalid={Boolean(errors.title)}
                onChange={(e) => set({ title: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Budget (USD)</Form.Label>
                  <Form.Control
                    type="number" min="0" placeholder="2500"
                    value={form.budget}
                    isInvalid={Boolean(errors.budget)}
                    onChange={(e) => set({ budget: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{errors.budget}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Timeline (days)</Form.Label>
                  <Form.Control
                    type="number" min="1" placeholder="21"
                    value={form.days}
                    isInvalid={Boolean(errors.days)}
                    onChange={(e) => set({ days: e.target.value })}
                  />
                  <Form.Control.Feedback type="invalid">{errors.days}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Experience level</Form.Label>
                  <Form.Select value={form.level} onChange={(e) => set({ level: e.target.value })}>
                    <option>Entry</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group>
              <Form.Label>Scope and requirements</Form.Label>
              <Form.Control
                as="textarea" rows={5}
                placeholder="What exists today, what you want at the end, and anything a freelancer would need to know before quoting. Mention the stack and whether designs exist."
                value={form.description}
                isInvalid={Boolean(errors.description)}
                onChange={(e) => set({ description: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              <Form.Text>{form.description.length} characters</Form.Text>
            </Form.Group>
          </div>

          <div className="wm-panel">
            <h5 className="m-0 mb-1" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Skills required
            </h5>
            <p className="text-muted mb-3" style={{ fontSize: '0.83rem' }}>
              These decide who sees the job in their feed.
            </p>

            <div className="wm-chips mb-3">
              {form.skills.map((skill) => (
                <span className="wm-tag" key={skill}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                    <Icon name="close" size={12} />
                  </button>
                </span>
              ))}
              {form.skills.length === 0 && <span className="text-muted" style={{ fontSize: '0.85rem' }}>No skills added yet.</span>}
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
        </Col>

        <Col lg={5}>
          <div className="wm-panel mb-3">
            <div className="wm-eyebrow mb-3">How freelancers will see it</div>
            <div className="wm-job">
              <h6 className="wm-job__title">{form.title || 'Your job title'}</h6>
              <div className="wm-job__meta">TechCorp &middot; 4.9 rating &middot; 14 jobs posted</div>

              <div className="d-flex align-items-baseline gap-2 mt-2">
                <span className="wm-num" style={{ fontSize: '1.1rem' }}>{money(budget)}</span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  fixed &middot; {form.days || '0'} days
                </span>
                <Pill tone="info">{form.level}</Pill>
              </div>

              <p className="wm-job__desc">
                {form.description || 'Your description appears here. The more concrete it is, the closer the bids will be to what you actually want.'}
              </p>

              <div className="wm-chips">
                {form.skills.map((s) => <span className="wm-tag" key={s}>{s}</span>)}
              </div>
            </div>
          </div>

          <div className="wm-panel">
            <div className="wm-eyebrow mb-2">If you hire at this budget</div>
            <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.88rem' }}>
              <span className="text-muted">Escrow funding</span>
              <span className="wm-num">{money(budget)}</span>
            </div>
            <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.88rem' }}>
              <span className="text-muted">Escrow fee ({CLIENT_FEE_RATE * 100}%)</span>
              <span className="wm-num">+{money(Math.round(budget * CLIENT_FEE_RATE))}</span>
            </div>
            <div className="d-flex justify-content-between py-2 mt-1 border-top" style={{ fontSize: '0.92rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>Charged on hire</span>
              <span className="wm-num">{money(grossWithClientFee(budget))}</span>
            </div>
            <Alert variant="light" className="mt-3 mb-0 border" style={{ fontSize: '0.82rem' }}>
              Released milestone by milestone as you approve the work.
            </Alert>
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button type="button" variant="outline-secondary" onClick={() => { setForm(BLANK); setErrors({}); }}>
          Clear
        </Button>
        <Button type="submit" variant="primary" className="px-4">Post job</Button>
      </div>
    </Form>
  );
};

export default PostJobForm;