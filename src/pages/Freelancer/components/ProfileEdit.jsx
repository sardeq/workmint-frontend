import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const ProfileEdit = () => {
  const [profile, setProfile] = useState({ skills: 'React, Node.js', rate: 80, bio: 'Experienced developer' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated (simulated)');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Skills (comma separated)</Form.Label>
        <Form.Control type="text" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Hourly Rate ($)</Form.Label>
        <Form.Control type="number" value={profile.rate} onChange={e => setProfile({...profile, rate: e.target.value})} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Bio</Form.Label>
        <Form.Control as="textarea" rows={3} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
      </Form.Group>
      <Button type="submit" variant="primary">Save</Button>
    </Form>
  );
};
export default ProfileEdit;