import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

const Disclaimer = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="home">
      <Header />
      <main className="main-content">
        <section className="page-hero">
          <h1>Disclaimer</h1>
          <p>Educational clone – not a real pharmacy</p>
        </section>
        <section className="page-section">
          <p>Content on this site is for educational purposes only. Consult a registered medical practitioner for medical advice.</p>
          <p>Medicine images, names, or references are for representation only. Availability is subject to local regulations.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Disclaimer;


