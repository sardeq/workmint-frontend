import React from 'react';
import { Table, Badge } from 'react-bootstrap';

const MyProposals = ({ proposals }) => {
  return (
    <Table hover>
      <thead><tr><th>Job</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody>
        {proposals.map(p => (
          <tr key={p.id}>
            <td>{p.job}</td>
            <td>{p.client}</td>
            <td>${p.amount}</td>
            <td><Badge bg={p.status === 'Pending' ? 'warning' : p.status === 'Accepted' ? 'success' : 'danger'}>{p.status}</Badge></td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default MyProposals;