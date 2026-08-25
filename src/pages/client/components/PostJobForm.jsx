import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

const PostJobForm = ({ onPostJob }) => {
  // Hook: State for Form handling
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    budget: '',
    description: ''
  });

  // Event Handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.title || !formData.budget) return;
    
    // Passing data back up to parent
    onPostJob(formData);
    
    // Reset form state
    setFormData({ title: '', category: '', budget: '', description: '' });
  };

  return (
    <Form onSubmit={handleSubmit} className="p-2">
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Project Title</Form.Label>
            <Form.Control 
              type="text" 
              name="title"
              required 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g. Next.js E-commerce Build"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Category</Form.Label>
            <Form.Select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select a category...</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Apps">Mobile Apps</option>
              <option value="DevOps">DevOps & Architecture</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3 w-50">
        <Form.Label className="fw-bold">Estimated Budget (USD)</Form.Label>
        <Form.Control 
          type="number" 
          name="budget"
          required 
          value={formData.budget} 
          onChange={handleChange} 
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Scope & Requirements</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={4} 
          name="description"
          required 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Describe the tech stack and deliverables..."
        />
      </Form.Group>

      <Button variant="primary" type="submit" size="lg">
        Publish Job Listing
      </Button>
    </Form>
  );
};

export default PostJobForm;