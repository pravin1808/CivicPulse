import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="logo-icon">
            <ShieldAlert size={22} color="#fff" />
          </div>
          <h2>CivicPulse</h2>
        </div>
        <nav className="landing-nav">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="btn btn-primary btn-nav">Report an Issue</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="badge-promo">Empowering Communties</span>
          <h1 className="hero-title">
            Your Voice, <br />
            Our Action. <br />
            <span className="accent-text">Better Cities.</span>
          </h1>
          <p className="hero-subtitle">
            Report local infrastructure, sanitation, or safety issues directly to municipal departments. Track real-time progress and build a better neighborhood together.
          </p>
          <div className="hero-ctas">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Portal Login
            </Link>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="illus-card main-illus glass-card">
            <div className="illus-header">
              <span className="illus-dot red"></span>
              <span className="illus-dot yellow"></span>
              <span className="illus-dot green"></span>
            </div>
            <div className="illus-body">
              <div className="illus-item">
                <MapPin size={18} className="illus-icon-accent" />
                <div>
                  <h4>Pothole reported near Sector 4</h4>
                  <p>Pending department validation</p>
                </div>
              </div>
              <div className="illus-item in-progress">
                <Clock size={18} className="illus-icon-purple" />
                <div>
                  <h4>Streetlight repair under progress</h4>
                  <p>Assigned to Public Works Dept</p>
                </div>
              </div>
              <div className="illus-item resolved">
                <CheckCircle size={18} className="illus-icon-green" />
                <div>
                  <h4>Garbage accumulation resolved</h4>
                  <p>Sanitation worker uploaded resolution image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2>How CivicPulse Works</h2>
          <p>A seamless bridge between citizens and municipal authorities</p>
        </div>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon bg-orange">
              <MapPin size={24} />
            </div>
            <h3>Pin & Report</h3>
            <p>Snap a photo of the problem, input coordinates, select a category, and submit in seconds.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon bg-blue">
              <Clock size={24} />
            </div>
            <h3>Track Live</h3>
            <p>Get real-time updates as your issue goes from pending, to assigned, in progress, and resolved.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon bg-green">
              <Users size={24} />
            </div>
            <h3>Dedicated Teams</h3>
            <p>Verified public workers receive issues corresponding to their department and resolve them efficiently.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CivicPulse Municipal Corporation. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
