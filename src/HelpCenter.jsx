import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './HelpCenter.css';

const HelpCenter = () => {
  return (
    <div className="help-center">
      <Header />
      <main className="main-content">
        <div className="container">
          <h1>Help Center</h1>
          <p>Find answers to your questions and get support.</p>
          <div className="help-sections">
            <div className="help-section">
              <h3>Frequently Asked Questions</h3>
              <p>Browse our most common questions and answers.</p>
            </div>
            <div className="help-section">
              <h3>Contact Support</h3>
              <p>Get in touch with our support team for assistance.</p>
            </div>
            <div className="help-section">
              <h3>Order Help</h3>
              <p>Need help with your orders? We're here to assist.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;