import { useState } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { EmptyState, SectionTitle } from '../../../components/Shared';
import { initials } from '../../../data/helpers';

const BLANK = { title: '', tech: '', link: '', description: '' };

const Portfolio = ({ items, onSave, onDelete }) => {
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [confirmId, setConfirmId] = useState(null);

  const openNew = () => {
    setEditingId(null);
    setForm(BLANK);
    setShow(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item, tech: (item.tech || []).join(', ') });
    setShow(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    onSave({
      id: editingId,
      title: form.title.trim(),
      link: form.link.trim(),
      description: form.description.trim(),
      tech: form.tech.split(',').map((tech) => tech.trim()).filter(Boolean),
    });
    setShow(false);
  };

  return (
    <>
      <SectionTitle
        title="Portfolio"
        sub="Clients read this before they read your proposal. Lead with outcomes, not tools."
        right={<Button variant="primary" size="sm" onClick={openNew}><Icon name="plus" size={14} /> Add project</Button>}
      />

      {items.length === 0 ? (
        <div className="wm-panel">
          <EmptyState
            icon="layers"
            title="Your portfolio is empty"
            body="Add two or three projects with a sentence on what changed for the client."
            action={<Button variant="primary" size="sm" onClick={openNew}>Add your first project</Button>}
          />
        </div>
      ) : (
        <Row className="g-3">
          {items.map((item) => (
            <Col md={6} xl={4} key={item.id}>
              <div className="wm-pf-card">
                <div className="wm-pf-cover">{initials(item.title)}</div>
                <div className="p-3 d-flex flex-column flex-grow-1">
                  <h6 style={{ fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.4rem' }}>{item.title}</h6>
                  <div className="wm-chips mb-2">
                    {(item.tech || []).map((tech) => <span className="wm-tag" key={tech}>{tech}</span>)}
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.55 }}>{item.description}</p>

                  <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-decoration-none" style={{ fontSize: '0.83rem' }}>
                        View project <Icon name="external" size={12} />
                      </a>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.83rem' }}>No link</span>
                    )}
                    <div className="d-flex gap-1">
                      <button type="button" className="wm-save-btn" onClick={() => openEdit(item)} aria-label="Edit project">
                        <Icon name="edit" size={15} />
                      </button>
                      <button type="button" className="wm-save-btn" onClick={() => setConfirmId(item.id)} aria-label="Delete project">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit project' : 'Add project'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Project title</Form.Label>
              <Form.Control
                required
                placeholder="Employee task tracking system"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Technologies</Form.Label>
              <Form.Control
                placeholder="React, Express, PostgreSQL"
                value={form.tech}
                onChange={(e) => setForm({ ...form, tech: e.target.value })}
              />
              <Form.Text>Separate with commas.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Link</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://github.com/you/project"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>What you built and what it changed</Form.Label>
              <Form.Control
                as="textarea" rows={3} required
                placeholder="Cut manual data entry by 70% for a 200-person operations team."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingId ? 'Save changes' : 'Add project'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={Boolean(confirmId)} onHide={() => setConfirmId(null)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <h6 style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>Remove this project?</h6>
          <p className="text-muted" style={{ fontSize: '0.86rem' }}>It disappears from your public profile straight away.</p>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-secondary" size="sm" onClick={() => setConfirmId(null)}>Keep it</Button>
            <Button variant="primary" size="sm" onClick={() => { onDelete(confirmId); setConfirmId(null); }}>Remove</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Portfolio;