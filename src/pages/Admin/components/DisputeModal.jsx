import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DisputeModal = ({ show, onHide, dispute, onResolve }) => {
  // Logic: Conditional Rendering (Return null if no dispute is selected)
  if (!dispute) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Dispute Mediation: {dispute.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Client:</strong> {dispute.client}</p>
        <p><strong>Freelancer:</strong> {dispute.freelancer}</p>
        <p><strong>Amount:</strong> ${dispute.amount} USD</p>
        <p><strong>Claim:</strong> {dispute.reason}</p>
        <hr />
        <h6>Mediation Action:</h6>
        <div className="d-grid gap-2">
          {/* Props drilling: Firing the parent's resolution function */}
          <Button variant="success" onClick={() => onResolve(dispute.id, 'Released to Freelancer')}>
            Release Payment
          </Button>
          <Button variant="danger" onClick={() => onResolve(dispute.id, 'Refunded to Client')}>
            Refund Client
          </Button>
          <Button variant="warning" onClick={() => onResolve(dispute.id, '50/50 Split')}>
            Split 50/50
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DisputeModal;