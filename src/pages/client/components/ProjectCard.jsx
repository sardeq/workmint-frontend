import React from 'react';
import { Col, Card, Badge, ProgressBar, Button } from 'react-bootstrap';

// Functional Component receiving Props
const ProjectCard = ({ project, rates, currency, onApprove }) => {
  
  // Logic: Currency Conversion
  const convertedCost = rates[currency] 
    ? (project.costUSD * rates[currency]).toFixed(2) 
    : project.costUSD;

  return (
    <Col md={6} lg={4} className="mb-3">
      <Card className="h-100 border-0 shadow-sm rounded-4">
        <Card.Body>
          <div className="d-flex justify-content-between mb-2">
            <h6 className="fw-bold">{project.title}</h6>
            <Badge bg={project.progress === 100 ? 'success' : 'primary'}>
              {project.status}
            </Badge>
          </div>
          <p className="text-muted small mb-1">Freelancer: {project.freelancer}</p>
          <p className="fw-bold text-success small mb-3">
            Cost: {currency} {convertedCost}
          </p>
          
          <ProgressBar 
            now={project.progress} 
            variant="success" 
            style={{ height: '8px' }} 
            className="mb-3" 
          />
          
          {/* Logic: Conditional Rendering based on status */}
          {project.status === 'In Revision' && (
            <div className="bg-light p-3 rounded text-center mb-3 border">
              <small className="text-muted d-block mb-2 fw-bold">Action Required</small>
              <Button 
                variant="success" 
                size="sm" 
                className="me-2" 
                onClick={() => onApprove(project.id, 2)}
              >
                Approve Delivery
              </Button>
              <Button variant="outline-danger" size="sm">Request Revisions</Button>
            </div>
          )}

          <div className="mt-2">
            <small className="text-muted fw-bold">Milestones:</small>
            <ul className="list-unstyled small mt-1">
              {/* Rendering list with map() */}
              {project.milestones.map((m) => (
                <li key={m.id} className={m.completed ? 'text-success fw-bold' : 'text-muted'}>
                  {m.completed ? '✓' : '○'} {m.name}
                </li>
              ))}
            </ul>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProjectCard;