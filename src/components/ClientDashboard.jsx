import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, ProgressBar, Badge } from 'react-bootstrap';
import Layout from './Layout'; // Fixed import path

const PaymentWidget = ({ rate, loading }) => {
  if (loading) return <p className="text-muted">Loading live exchange rates...</p>;
  return (
    <Card className="p-4 bg-dark text-white shadow rounded-4 border-0">
      <h6 className="text-uppercase text-secondary">Global Payments</h6>
      <h4 className="mb-0 text-info">1 USD = {rate ? rate.toFixed(2) : '---'} EUR</h4>
      <small className="text-muted mt-2 d-block">Powered by Open Exchange API</small>
    </Card>
  );
};

const ClientDashboard = ({ user }) => {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        setExchangeRate(response.data.rates.EUR);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching currency:", error);
        setLoading(false);
      }
    };
    fetchCurrency();
  }, []);

  return (
    <Layout user={user} title="Client Order Management">
      <Row className="mb-4">
        <Col md={8}>
          <Card className="bg-white border-0 shadow-sm rounded-4 mb-3">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between">
                <Card.Title className="fw-bold">Active Project: Custom Web Portal</Card.Title>
                <Badge bg="primary">In Revision</Badge>
              </div>
              <Card.Text className="text-muted mb-4">Assigned to: Alex Dev</Card.Text>
              
              <h6 className="mb-2">Project Milestone Progress</h6>
              <ProgressBar now={75} variant="success" className="mb-4" style={{ height: '10px' }} />
              
              <div className="bg-light p-4 rounded border text-center">
                <p className="text-muted mb-0">Upload revision notes or project assets here.</p>
                <button className="btn btn-outline-secondary btn-sm mt-3">Upload File</button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <PaymentWidget rate={exchangeRate} loading={loading} />
        </Col>
      </Row>
    </Layout>
  );
};

export default ClientDashboard;