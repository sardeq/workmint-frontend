import React from 'react';
import { Table, Button } from 'react-bootstrap';

const AvailableJobs = ({ jobs, onApply }) => {
  return (
    <Table hover responsive>
      <thead>
        <tr>
          <th>Title</th>
          <th>Client</th>
          <th>Budget</th>
          <th>Skills Required</th>
          <th className="text-end">Action</th>
        </tr>
      </thead>
      <tbody>
        {/* Rendering list with map() */}
        {jobs.map(job => (
          <tr key={job.id}>
            <td className="fw-semibold">{job.title}</td>
            <td>{job.client}</td>
            <td className="text-success fw-bold">{job.budget}</td>
            <td>{job.skills}</td>
            <td className="text-end">
              {/* Props passing function: Sending the whole job object back to parent */}
              <Button 
                variant="success" 
                size="sm" 
                onClick={() => onApply(job)}
              >
                Apply Now
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AvailableJobs;