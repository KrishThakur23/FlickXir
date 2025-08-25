import React, { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import './AboutUs.css';

const AboutUs = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const animateCounters = () => {
      const counters = document.querySelectorAll('.counter');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
          if (current < target) {
            current += increment;
            counter.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };
        
        updateCounter();
      });
    };

    const timer = setTimeout(animateCounters, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="about-us">
      <Header />
      <main className="about-main">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-particles">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}></div>
            ))}
          </div>
          <div className="about-hero-content" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
            <div className="hero-badge">🚀 Revolutionizing Healthcare</div>
            <h1 className="glitch-text" data-text="FlickXir">FlickXir</h1>
            <p className="hero-subtitle typing-animation">Your trusted healthcare companion, delivering quality medicines and healthcare products to your doorstep</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="stat-number counter" data-target="10000">0</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number counter" data-target="5000">0</div>
                <div className="stat-label">Medicines</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number counter" data-target="50">0</div>
                <div className="stat-label">Cities</div>
              </div>
            </div>
          </div>
          <div className="scroll-indicator">
            <div className="scroll-arrow"></div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-section mission-section">
          <div className="container">
            <div className="section-content" id="mission" data-animate>
              <div className={`text-content ${isVisible.mission ? 'animate-slide-in-left' : ''}`}>
                <h2 className="section-heading">Our Mission</h2>
                <div className="mission-text">
                  <p className="highlight-text">At FlickXir, we believe healthcare should be accessible, affordable, and reliable for everyone.</p>
                  <p>Our mission is to bridge the gap between patients and quality healthcare by providing a seamless digital platform that connects you with genuine medicines, expert advice, and comprehensive health solutions.</p>
                  <p>We are committed to transforming the healthcare landscape in India by leveraging technology to make healthcare more convenient and trustworthy.</p>
                </div>
                <div className="mission-features">
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>Instant Access</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🛡️</span>
                    <span>100% Genuine</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🚚</span>
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
              <div className={`image-content ${isVisible.mission ? 'animate-slide-in-right' : ''}`}>
                <div className="mission-visual">
                  <div className="floating-icon mission-icon">🎯</div>
                  <div className="orbit-ring">
                    <div className="orbit-item">💊</div>
                    <div className="orbit-item">🏥</div>
                    <div className="orbit-item">👨‍⚕️</div>
                    <div className="orbit-item">📱</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-section values-section">
          <div className="container">
            <h2 className="section-title" id="values" data-animate>
              <span className={`title-word ${isVisible.values ? 'animate-bounce-in' : ''}`}>Our</span>
              <span className={`title-word ${isVisible.values ? 'animate-bounce-in' : ''}`} style={{animationDelay: '0.2s'}}>Core</span>
              <span className={`title-word ${isVisible.values ? 'animate-bounce-in' : ''}`} style={{animationDelay: '0.4s'}}>Values</span>
            </h2>
            <div className="values-grid">
              <div className={`value-card ${isVisible.values ? 'animate-float-up' : ''}`} style={{animationDelay: '0.1s'}}>
                <div className="value-icon-container">
                  <div className="value-icon">🛡️</div>
                  <div className="icon-glow"></div>
                </div>
                <h3>Trust & Safety</h3>
                <p>We ensure all medicines are sourced from licensed manufacturers and stored under optimal conditions to maintain their efficacy and safety.</p>
                <div className="card-shine"></div>
              </div>
              <div className={`value-card ${isVisible.values ? 'animate-float-up' : ''}`} style={{animationDelay: '0.2s'}}>
                <div className="value-icon-container">
                  <div className="value-icon">⚡</div>
                  <div className="icon-glow"></div>
                </div>
                <h3>Speed & Convenience</h3>
                <p>Fast delivery, easy ordering, and 24/7 customer support to ensure you get the healthcare you need when you need it.</p>
                <div className="card-shine"></div>
              </div>
              <div className={`value-card ${isVisible.values ? 'animate-float-up' : ''}`} style={{animationDelay: '0.3s'}}>
                <div className="value-icon-container">
                  <div className="value-icon">💰</div>
                  <div className="icon-glow"></div>
                </div>
                <h3>Affordability</h3>
                <p>Competitive pricing and regular discounts to make quality healthcare accessible to everyone, regardless of their economic background.</p>
                <div className="card-shine"></div>
              </div>
              <div className={`value-card ${isVisible.values ? 'animate-float-up' : ''}`} style={{animationDelay: '0.4s'}}>
                <div className="value-icon-container">
                  <div className="value-icon">🔬</div>
                  <div className="icon-glow"></div>
                </div>
                <h3>Quality Assurance</h3>
                <p>Rigorous quality checks and partnerships with certified pharmacies to guarantee the authenticity of every product we deliver.</p>
                <div className="card-shine"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="about-section story-section">
          <div className="container">
            <div className="section-content">
              <div className="text-content">
                <h2>Our Story</h2>
                <p>Founded in 2024, FlickXir was born from a simple yet powerful idea: healthcare should be just a click away. Our founders, having experienced the challenges of accessing quality healthcare in India, envisioned a platform that would eliminate the barriers between patients and their health needs.</p>
                <p>Starting as a small team of healthcare enthusiasts and technology experts, we've grown into a trusted platform serving thousands of customers across India. Our journey has been driven by the countless stories of customers whose lives we've touched through accessible healthcare.</p>
                <p>Today, FlickXir stands as a testament to the power of technology in transforming healthcare delivery, making it more patient-centric, efficient, and reliable.</p>
              </div>
              <div className="image-content">
                <div className="story-stats">
                  <div className="stat">
                    <div className="stat-number">10,000+</div>
                    <div className="stat-label">Happy Customers</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">5,000+</div>
                    <div className="stat-label">Medicines Available</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">50+</div>
                    <div className="stat-label">Cities Served</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-section team-section">
          <div className="container">
            <h2 className="section-title">Our Commitment</h2>
            <div className="commitment-grid">
              <div className="commitment-item">
                <h3>🏥 Licensed Pharmacies</h3>
                <p>We partner only with government-licensed pharmacies and certified healthcare providers to ensure compliance with all regulatory standards.</p>
              </div>
              <div className="commitment-item">
                <h3>🚚 Reliable Delivery</h3>
                <p>Our logistics network ensures timely delivery of medicines with proper temperature control and secure packaging to maintain product integrity.</p>
              </div>
              <div className="commitment-item">
                <h3>👨‍⚕️ Expert Support</h3>
                <p>Our team includes qualified pharmacists and healthcare professionals who are available to answer your questions and provide guidance.</p>
              </div>
              <div className="commitment-item">
                <h3>🔒 Data Privacy</h3>
                <p>We maintain the highest standards of data security and privacy, ensuring your personal and medical information is always protected.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="about-section cta-section">
          <div className="cta-background">
            <div className="cta-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
          <div className="container">
            <div className="cta-content" id="cta" data-animate>
              <h2 className={`cta-title ${isVisible.cta ? 'animate-scale-in' : ''}`}>
                Ready to Experience 
                <span className="gradient-text"> Better Healthcare?</span>
              </h2>
              <p className={`cta-subtitle ${isVisible.cta ? 'animate-fade-in' : ''}`}>
                Join thousands of satisfied customers who trust FlickXir for their healthcare needs
              </p>
              <div className={`cta-buttons ${isVisible.cta ? 'animate-slide-up' : ''}`}>
                <a href="/" className="btn-primary pulse-btn">
                  <span>Start Shopping</span>
                  <div className="btn-ripple"></div>
                </a>
                <a href="/help-center" className="btn-secondary glow-btn">
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;