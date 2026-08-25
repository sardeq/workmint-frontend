import React from 'react';

const ValueProp = () => {
  return (
    <section className="marketing-sections">
      <div className="features-header text-center" style={{ marginBottom: '3rem' }}>
        <h2>Why Choose Workmint?</h2>
        <p className="text-muted">Built for modern workflows, designed for seamless collaboration.</p>
      </div>
      
      <div className="value-grid">
        <div className="value-card">
          <h3>💼 For Freelancers</h3>
          <p>
            Say goodbye to chasing invoices and scope creep. Our milestone-based escrow system guarantees you get paid for the work you deliver. 
            Build your portfolio, connect with high-quality clients, and let our platform handle the administrative heavy lifting so you can focus on your code and craft.
          </p>
        </div>
        
        <div className="value-card">
          <h3>🚀 For Clients</h3>
          <p>
            Access a curated pool of professional developers, designers, and tech experts. 
            Review detailed portfolios, manage revisions directly through our intuitive dashboard, and only release funds when you are 100% satisfied with the delivered milestone. 
            No surprises, just results.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ValueProp;