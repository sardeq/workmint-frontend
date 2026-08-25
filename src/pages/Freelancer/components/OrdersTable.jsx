import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';

const OrdersTable = ({ orders, onUpdateStatus }) => {
  return (
    <Table hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>Order</th><th>Project</th><th>Client</th>
          <th>Deadline</th><th>Value</th><th>Status</th>
          <th className="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* Rendering list with map() */}
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="fw-bold text-muted">{order.id}</td>
            <td className="fw-semibold">{order.project}</td>
            <td>{order.client}</td>
            <td>{order.deadline}</td>
            <td className="text-success fw-bold">{order.price}</td>
            <td>
              <Badge bg={order.status === 'Completed' ? 'success' : order.status === 'In Progress' ? 'primary' : 'warning'}>
                {order.status}
              </Badge>
            </td>
            <td className="text-end">
              {/* Conditional Rendering: Only show button if In Progress */}
              {order.status === 'In Progress' && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => onUpdateStatus(order.id, 'Pending Review')}
                >
                  Submit Deliverable
                </Button>
              )}
              {order.status === 'Pending Review' && (
                <span className="text-muted small">Awaiting Client</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrdersTable;