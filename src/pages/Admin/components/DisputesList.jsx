import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';

const DisputesList = ({ disputes, exchangeRate, onReview }) => {
  // Hook: Local state for search filtering
  const [searchTerm, setSearchTerm] = useState('');

  // Logic: Filter rendering list based on search state
  const filteredDisputes = disputes.filter(d =>
    d.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.freelancer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Active Escrow Cases</h5>
        <InputGroup style={{ maxWidth: '300px' }}>
          <Form.Control 
            type="text" 
            placeholder="Filter by ID or Name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </InputGroup>
      </div>
      
      <Table responsive hover>
        <thead className="table-light">
          <tr>
            <th>Case ID</th><th>Client</th><th>Freelancer</th>
            <th>Amount</th><th>Reason</th><th>Status</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Rendering filtered list with map() */}
          {filteredDisputes.map(d => (
            <tr key={d.id}>
              <td className="fw-semibold">{d.id}</td>
              <td>{d.client}</td>
              <td>{d.freelancer}</td>
              <td>
                <strong>${d.amount}</strong> 
                <span className="text-muted small ms-1">
                  (€{(d.amount * exchangeRate).toFixed(0)})
                </span>
              </td>
              <td className="text-truncate" style={{ maxWidth: '200px' }}>{d.reason}</td>
              <td>
                <Badge bg={d.status === 'Open' ? 'danger' : d.status === 'Under Review' ? 'warning' : 'success'}>
                  {d.status}
                </Badge>
              </td>
              <td className="text-end">
                {/* Props drilling: Firing the parent's openModal function */}
                <Button variant="outline-dark" size="sm" onClick={() => onReview(d)}>
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default DisputesList;