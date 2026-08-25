import React, { useState } from 'react';
import { Table, Badge, Button } from 'react-bootstrap';

const JobManagement = () => {
  const [jobs, setJobs] = useState([
    { id: 1, title: 'React Dev', client: 'Client A', status: 'open' },
    { id: 2, title: 'Python API', client: 'Client B', status: 'closed' },
  ]);

  const toggleStatus = (id) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: j.status === 'open' ? 'closed' : 'open' } : j));
  };

  return (
    <Table hover>
      <thead><tr><th>Title</th><th>Client</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {jobs.map(j => (
          <tr key={j.id}>
            <td>{j.title}</td>
            <td>{j.client}</td>
            <td><Badge bg={j.status === 'open' ? 'success' : 'secondary'}>{j.status}</Badge></td>
            <td>
              <Button variant="outline-primary" size="sm" onClick={() => toggleStatus(j.id)}>
                {j.status === 'open' ? 'Close' : 'Reopen'}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default JobManagement;