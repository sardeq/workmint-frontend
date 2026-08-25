import React, { useState } from 'react';
import { Table, Badge, Button } from 'react-bootstrap';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice', role: 'client', status: 'active' },
    { id: 2, name: 'Bob', role: 'freelancer', status: 'pending' },
  ]);

  const toggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  return (
    <Table hover>
      <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.role}</td>
            <td><Badge bg={u.status === 'active' ? 'success' : 'warning'}>{u.status}</Badge></td>
            <td>
              <Button variant="outline-danger" size="sm" onClick={() => toggleStatus(u.id)}>
                {u.status === 'active' ? 'Suspend' : 'Activate'}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default UserManagement;