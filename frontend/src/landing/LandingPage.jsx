import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  ChevronDown,
  Camera,
  Building2,
  Sparkles,
  Trash2,
  Lightbulb,
  Droplets,
  HeartHandshake,
  CheckCheck,
  BarChart3,
  PhoneCall,
  ArrowUpRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedDept, setSelectedDept] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const departments = [
    {
      name: "Public Works & Infrastructure",
      icon: Building2,
      color: "#c26d24",
      description: "Repairing critical urban physical foundations and roadways.",
      categories: ["Pothole Repairs & Road Damages", "Sidewalks & Walkways", "Drainage & Stormwater"],
      stats: "99.1% road safety response compliance"
    },
    {
      name: "Sanitation & Waste Management",
      icon: Trash2,
      color: "#10b981",
      description: "Keeping public areas, streets, and neighborhoods clean and sanitized.",
      categories: ["Garbage Accumulation", "Illegal Dumping", "Litter & Public Bins"],
      stats: "Under 18 hrs average clearance time"
    },
    {
      name: "Traffic, Transit & Transportation",
      icon: Lightbulb,
      color: "#f59e0b",
      description: "Ensuring nighttime visibility and smooth vehicular flow.",
      categories: ["Streetlights & Luminaires", "Traffic Signals", "Signage & Lane Markings"],
      stats: "1,200+ streetlights restored"
    },
    {
      name: "Utilities & Energy",
      icon: Droplets,
      color: "#3b82f6",
      description: "Overseeing vital water, electrical distribution, and sewage networks.",
      categories: ["Water Supply Pipelines", "Electricity & Power Failures", "Sewage Maintenance"],
      stats: "24/7 rapid hazard response"
    },
    {
      name: "Health, Safety & Environment",
      icon: ShieldCheck,
      color: "#8b5cf6",
      description: "Safeguarding neighborhood tranquility, public hygiene, and animal welfare.",
      categories: ["Noise Disturbances", "Stray Animal Control", "Air & Water Quality Checks"],
      stats: "Coordinated with local health boards"
    },
    {
      name: "Public Spaces & Recreation",
      icon: Layers,
      color: "#ec4899",
      description: "Maintaining community parks, public gardens, and shared civic infrastructure.",
      categories: ["Damaged Park Infrastructure", "Tree Trimming & Landscaping", "Graffiti Removal"],
      stats: "450+ recreational zones refreshed"
    }
  ];

  const faqs = [
    {
      q: "How does CivicPulse verify that an issue is authentically resolved?",
      a: "CivicPulse requires mandatory photographic evidence before an issue can be closed. Field workers must submit an 'after' photo directly from the site along with resolution notes. Citizens can review this proof directly in their dashboard."
    },
    {
      q: "Do I need to enable GPS to report an incident?",
      a: "Yes. CivicPulse automatically captures GPS coordinates from your device when you snap or upload a photo. This allows municipal dispatchers to pinpoint the exact location on city ward maps without relying on ambiguous text addresses."
    },
    {
      q: "Who reviews my report once it is submitted?",
      a: "Reports are instantly categorized and forwarded to the designated Municipal Department supervisor. The supervisor inspects the report details and assigns it directly to certified field workers in that specific ward."
    },
    {
      q: "Can I edit or cancel an issue after submitting?",
      a: "Citizens can update details or delete an issue as long as it remains in the 'PENDING' status. Once a municipal worker is assigned and work begins ('IN PROGRESS'), updates are handled by the department team."
    },
    {
      q: "Is CivicPulse free for all citizens?",
      a: "Absolutely. CivicPulse is a public-service municipal technology initiative built to give every resident an accessible, transparent voice in urban governance."
    }
  ];

  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="logo-icon-pulse">
            <span className="pulse-ring"></span>
            <Activity size={20} color="#fff" />
          </div>
          <div className="logo-text-group">
            <h2>CivicPulse</h2>
            <span className="logo-subtitle">Municipal Citizen Hub</span>
          </div>
        </div>

        <nav className="landing-nav">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#departments" className="nav-link">Departments</a>
          <a href="#metrics" className="nav-link">City Pulse</a>
          <a href="#roles" className="nav-link">Who It's For</a>
          <a href="#faqs" className="nav-link">FAQ</a>
          <div className="nav-divider"></div>
          <Link to="/login" className="nav-link nav-login-link">Login</Link>
          <Link to="/register" className="btn btn-primary btn-nav">
            Report an Issue <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge-promo">
            <span className="pulse-dot"></span>
            Real-Time Civic Incident & Municipal Action Platform
          </div>
          <h1 className="hero-title">
            The Living Heartbeat <br />
            of <span className="accent-text">Smarter, Responsive</span> <br />
            Cities.
          </h1>
          <p className="hero-subtitle">
            Bridge the gap between your neighborhood and city authorities. Geotag road hazards, water leakages, broken streetlights, or sanitation issues with photo evidence—and track resolution in real time.
          </p>
          <div className="hero-ctas">
            <Link to="/register" className="btn btn-primary btn-lg">
              Report a Civic Issue <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Municipal Portal Login
            </Link>
          </div>

          <div className="hero-trust-badge">
            <div className="avatar-group">
              <div className="avatar-circle">CP</div>
              <div className="avatar-circle">MC</div>
              <div className="avatar-circle">PW</div>
            </div>
            <span>Trusted across <strong>6 Municipal Departments</strong> & active civic wards</span>
          </div>
        </div>

        {/* Live Simulation Visual Card */}
        <div className="hero-illustration">
          <div className="illus-card main-illus glass-card">
            <div className="illus-header">
              <div className="illus-title-block">
                <span className="pulse-dot active"></span>
                <h3>Live Civic Pulse Stream</h3>
              </div>
              <span className="badge-live">Live Feed</span>
            </div>

            <div className="city-health-bar">
              <div className="health-label">
                <span>Civic Health Resolution Rate</span>
                <strong>94.2% Satisfied</strong>
              </div>
              <div className="health-progress">
                <div className="health-fill" style={{ width: '94.2%' }}></div>
              </div>
            </div>

            <div className="illus-body">
              <div className="illus-item">
                <div className="illus-icon-wrapper bg-soft-orange">
                  <MapPin size={18} className="illus-icon-accent" />
                </div>
                <div className="illus-item-content">
                  <div className="illus-item-header">
                    <h4>Pothole reported near Ward 7 Ring Rd</h4>
                    <span className="status-tag pending">Pending Review</span>
                  </div>
                  <p className="illus-meta">GPS: 28.6139° N, 77.2090° E • Public Works Dept</p>
                </div>
              </div>

              <div className="illus-item in-progress">
                <div className="illus-icon-wrapper bg-soft-purple">
                  <Clock size={18} className="illus-icon-purple" />
                </div>
                <div className="illus-item-content">
                  <div className="illus-item-header">
                    <h4>Streetlight luminaire replacement</h4>
                    <span className="status-tag inprogress">In Progress</span>
                  </div>
                  <p className="illus-meta">Field Worker: Arvind K. dispatched • Assigned 2h ago</p>
                </div>
              </div>

              <div className="illus-item resolved">
                <div className="illus-icon-wrapper bg-soft-green">
                  <CheckCircle size={18} className="illus-icon-green" />
                </div>
                <div className="illus-item-content">
                  <div className="illus-item-header">
                    <h4>Sanitation cleared at Market Complex</h4>
                    <span className="status-tag resolved">Resolved with Proof</span>
                  </div>
                  <p className="illus-meta">Photo verified by Sanitation Inspector • Closed today</p>
                </div>
              </div>
            </div>

            <div className="illus-footer">
              <div className="illus-footer-item">
                <Activity size={14} />
                <span>Avg. SLA: &lt; 36 hrs</span>
              </div>
              <div className="illus-footer-item">
                <ShieldCheck size={14} />
                <span>100% Geotagged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="metrics-strip" id="metrics">
        <div className="metrics-container">
          <div className="metric-box">
            <span className="metric-number">18,450+</span>
            <span className="metric-label">Civic Grievances Resolved</span>
            <span className="metric-sub">Verified with before & after photos</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">&lt; 36 hrs</span>
            <span className="metric-label">Average Response SLA</span>
            <span className="metric-sub">From submission to field dispatch</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">98.4%</span>
            <span className="metric-label">Resolution Accuracy</span>
            <span className="metric-sub">Audited by municipal administration</span>
          </div>
          <div className="metric-box">
            <span className="metric-number">6</span>
            <span className="metric-label">Municipal Departments</span>
            <span className="metric-sub">Unified in one synchronized platform</span>
          </div>
        </div>
      </section>

      {/* How CivicPulse Works (4-Step Lifecycle) */}
      <section className="workflow-section" id="how-it-works">
        <div className="section-header">
          <span className="section-eyebrow">Seamless Public Accountability</span>
          <h2>How CivicPulse Closes the Loop</h2>
          <p>A transparent, high-speed pipeline connecting citizen observations with municipal remediation</p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-step-card glass-card">
            <div className="step-badge">01</div>
            <div className="step-icon-box">
              <Camera size={26} />
            </div>
            <h3>1. Snap & Geotag</h3>
            <p>Spot an issue in your ward. Capture photographic proof, let your device pinpoint GPS coordinates, and pick the category in seconds.</p>
            <div className="step-highlight">
              <span>Automatic Ward Mapping</span>
            </div>
          </div>

          <div className="workflow-step-card glass-card">
            <div className="step-badge">02</div>
            <div className="step-icon-box">
              <BarChart3 size={26} />
            </div>
            <h3>2. Admin Triage & Assign</h3>
            <p>Municipal department supervisors review the complaint, inspect the urgency, and route it to an available certified field worker.</p>
            <div className="step-highlight">
              <span>Zero Bureaucratic Delay</span>
            </div>
          </div>

          <div className="workflow-step-card glass-card">
            <div className="step-badge">03</div>
            <div className="step-icon-box">
              <Clock size={26} />
            </div>
            <h3>3. On-Site Field Action</h3>
            <p>Field crews receive the task on their mobile dashboard, navigate straight to the GPS coordinates, and carry out repair or sanitation work.</p>
            <div className="step-highlight">
              <span>Real-Time Status Tracking</span>
            </div>
          </div>

          <div className="workflow-step-card glass-card">
            <div className="step-badge">04</div>
            <div className="step-icon-box">
              <CheckCheck size={26} />
            </div>
            <h3>4. Photo-Verified Closure</h3>
            <p>Workers upload a timestamped resolution photo. Citizens receive immediate status confirmation and can inspect the final evidence.</p>
            <div className="step-highlight">
              <span>100% Photographic Proof</span>
            </div>
          </div>
        </div>
      </section>

      {/* Municipal Departments Section */}
      <section className="departments-section" id="departments">
        <div className="section-header">
          <span className="section-eyebrow">Municipal Coverage</span>
          <h2>Integrated City Departments</h2>
          <p>CivicPulse powers synchronized communication across all essential public works sectors</p>
        </div>

        <div className="departments-wrapper">
          <div className="dept-tabs">
            {departments.map((dept, index) => {
              const Icon = dept.icon;
              return (
                <button
                  key={dept.name}
                  className={`dept-tab-btn ${selectedDept === index ? 'active' : ''}`}
                  onClick={() => setSelectedDept(index)}
                >
                  <Icon size={18} />
                  <span>{dept.name}</span>
                </button>
              );
            })}
          </div>

          <div className="dept-preview-card glass-card">
            <div className="dept-preview-header">
              <div className="dept-preview-icon" style={{ backgroundColor: `${departments[selectedDept].color}15`, color: departments[selectedDept].color }}>
                {React.createElement(departments[selectedDept].icon, { size: 32 })}
              </div>
              <div>
                <h3>{departments[selectedDept].name}</h3>
                <p>{departments[selectedDept].description}</p>
              </div>
            </div>

            <div className="dept-categories-block">
              <h4>Directly Reportable Issue Categories:</h4>
              <div className="category-tags">
                {departments[selectedDept].categories.map((cat) => (
                  <span key={cat} className="category-pill">
                    <Sparkles size={14} color={departments[selectedDept].color} />
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="dept-footer-bar">
              <span className="dept-stat-badge">
                <CheckCircle size={15} color="#10b981" />
                {departments[selectedDept].stats}
              </span>
              <Link to="/register" className="dept-cta-link">
                File a report in this department <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Personas Section */}
      <section className="roles-section" id="roles">
        <div className="section-header">
          <span className="section-eyebrow">Designed for Everyone</span>
          <h2>One Platform, Three Empowered Roles</h2>
          <p>Streamlined dashboards crafted specifically for each participant in the civic ecosystem</p>
        </div>

        <div className="roles-grid">
          <div className="role-card glass-card">
            <div className="role-header">
              <div className="role-icon-box bg-orange">
                <Users size={24} />
              </div>
              <span className="role-tag">Residents & Citizens</span>
            </div>
            <h3>For Citizens</h3>
            <p className="role-desc">Empower your neighborhood. No need to visit ward offices or stand in long bureaucratic queues.</p>
            <ul className="role-checklist">
              <li><CheckCircle size={16} className="check-icon" /> 1-Click issue reporting with GPS & camera</li>
              <li><CheckCircle size={16} className="check-icon" /> Transparent timeline tracking (Pending → Resolved)</li>
              <li><CheckCircle size={16} className="check-icon" /> View before/after photo proof of work</li>
              <li><CheckCircle size={16} className="check-icon" /> OTP-verified secure individual profiles</li>
            </ul>
            <Link to="/register" className="role-link">Join as Citizen <ArrowRight size={14} /></Link>
          </div>

          <div className="role-card glass-card highlighted-role">
            <div className="role-badge-top">City Command</div>
            <div className="role-header">
              <div className="role-icon-box bg-blue">
                <Building2 size={24} />
              </div>
              <span className="role-tag">Municipal Admin</span>
            </div>
            <h3>For City Administrators</h3>
            <p className="role-desc">Gain birds-eye visibility into all civic grievances across wards and track department performance.</p>
            <ul className="role-checklist">
              <li><CheckCircle size={16} className="check-icon" /> Centralized issue intake and categorization</li>
              <li><CheckCircle size={16} className="check-icon" /> Instant dispatch to certified field technicians</li>
              <li><CheckCircle size={16} className="check-icon" /> SLA breach monitoring & worker oversight</li>
              <li><CheckCircle size={16} className="check-icon" /> Ward-level analytics & resolution metrics</li>
            </ul>
            <Link to="/login" className="role-link">Admin Portal <ArrowRight size={14} /></Link>
          </div>

          <div className="role-card glass-card">
            <div className="role-header">
              <div className="role-icon-box bg-green">
                <HeartHandshake size={24} />
              </div>
              <span className="role-tag">On-Ground Crews</span>
            </div>
            <h3>For Field Workers</h3>
            <p className="role-desc">Dedicated mobile interface focused on quick execution, clear location instructions, and proof submission.</p>
            <ul className="role-checklist">
              <li><CheckCircle size={16} className="check-icon" /> Department-specific assigned task queue</li>
              <li><CheckCircle size={16} className="check-icon" /> Precise GPS navigation to issue coordinates</li>
              <li><CheckCircle size={16} className="check-icon" /> On-site 'After' resolution photo upload</li>
              <li><CheckCircle size={16} className="check-icon" /> Instant status progression (In Progress / Done)</li>
            </ul>
            <Link to="/login" className="role-link">Worker Access <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* Photographic Proof Showcase Banner */}
      <section className="proof-banner-section">
        <div className="proof-banner-container glass-card">
          <div className="proof-banner-text">
            <span className="proof-tag">Accountability Standard</span>
            <h2>Proof, Not Just Promises.</h2>
            <p>
              Traditional municipal complaint systems fail because complaints are marked 'closed' without validation. 
              <strong> CivicPulse mandates photo verification</strong>: field technicians must take a live photograph showing the repaired road, cleaned drain, or illuminated streetlight before closing the ticket.
            </p>
            <div className="proof-stats">
              <div className="proof-stat-item">
                <strong>100%</strong>
                <span>Photo Verified</span>
              </div>
              <div className="proof-stat-item">
                <strong>Zero</strong>
                <span>Ghost Closures</span>
              </div>
              <div className="proof-stat-item">
                <strong>Real-Time</strong>
                <span>Audit Trail</span>
              </div>
            </div>
          </div>
          <div className="proof-visual">
            <div className="proof-card-comparison">
              <div className="proof-half before">
                <div className="proof-label before-label">Before</div>
                <div className="proof-mock-image before-img">
                  <div className="proof-overlay-tag">Incident: Deep Pothole</div>
                </div>
                <p className="proof-caption">Reported with GPS tag</p>
              </div>
              <div className="proof-arrow-divider">
                <ArrowRight size={20} />
              </div>
              <div className="proof-half after">
                <div className="proof-label after-label">After Repair</div>
                <div className="proof-mock-image after-img">
                  <div className="proof-overlay-tag verified">Resolved & Asphalted</div>
                </div>
                <p className="proof-caption">Technician photo upload</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Voice / Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-eyebrow">Citizen Stories</span>
          <h2>Voices from the Neighborhood</h2>
          <p>See how communities are transforming their streets with CivicPulse</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card glass-card">
            <p className="testimonial-quote">
              "We had a hazardous open manhole outside our local school for three weeks. I submitted it through CivicPulse with a photo at 8 AM. By 4 PM the same day, the Public Works team had cordoned and covered it!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar bg-avatar-1">RM</div>
              <div>
                <h4>Radhika Menon</h4>
                <span>Resident, Green Glen Ward</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card glass-card">
            <p className="testimonial-quote">
              "As a municipal supervisor, CivicPulse has doubled our efficiency. We no longer sift through confusing paper registers. Everything is geotagged, assigned with one click, and monitored with SLA alerts."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar bg-avatar-2">SK</div>
              <div>
                <h4>Suresh Kulkarni</h4>
                <span>Chief Sanitation Officer, Zone 3</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card glass-card">
            <p className="testimonial-quote">
              "The before and after photo feature is revolutionary. You actually see the evidence of the work done by the municipal crew instead of wondering if someone just clicked 'resolved' from a desk."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar bg-avatar-3">AP</div>
              <div>
                <h4>Anand Patel</h4>
                <span>Civic Activist & Resident</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faq-section" id="faqs">
        <div className="section-header">
          <span className="section-eyebrow">Common Inquiries</span>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about reporting, tracking, and municipal collaboration</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`faq-item glass-card ${openFaq === idx ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(idx)}>
                <span>{faq.q}</span>
                <ChevronDown size={20} className={`faq-chevron ${openFaq === idx ? 'rotated' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="final-cta-section">
        <div className="final-cta-card glass-card">
          <div className="cta-icon-glow">
            <Activity size={36} color="#fff" />
          </div>
          <h2>Ready to Shape the Future of Your City?</h2>
          <p>Join thousands of proactive citizens and dedicated municipal workers who are making our streets cleaner, safer, and better every day.</p>
          <div className="final-cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Citizen Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline-white btn-lg">
              Login to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="landing-logo">
              <div className="logo-icon-pulse small">
                <Activity size={18} color="#fff" />
              </div>
              <h2>CivicPulse</h2>
            </div>
            <p className="footer-tagline">
              Empowering citizens, modernizing governance, and establishing a real-time civic pulse for cleaner, safer, and more resilient urban environments.
            </p>
            <div className="system-status-indicator">
              <span className="status-ping"></span>
              <span>All Municipal Services Operational</span>
            </div>
          </div>

          <div className="footer-links-column">
            <h4>Platform</h4>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#departments">Department Directory</a></li>
              <li><a href="#metrics">City Pulse Statistics</a></li>
              <li><a href="#roles">Ecosystem Roles</a></li>
              <li><a href="#faqs">FAQ & Support</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Departments</h4>
            <ul>
              <li><span>Public Works & Roads</span></li>
              <li><span>Sanitation & Waste</span></li>
              <li><span>Traffic & Streetlights</span></li>
              <li><span>Utilities & Water</span></li>
              <li><span>Health & Environment</span></li>
              <li><span>Public Parks & Spaces</span></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Citizen Support</h4>
            <div className="emergency-notice">
              <PhoneCall size={16} className="emergency-icon" />
              <div>
                <strong>Civic Helpline</strong>
                <p>Dial 1800-CIVIC-PULSE for immediate urban hazard dispatches.</p>
              </div>
            </div>
            <div className="portal-quick-links">
              <Link to="/login" className="btn btn-secondary btn-sm">Citizen Login</Link>
              <Link to="/login" className="btn btn-secondary btn-sm">Official Portal</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CivicPulse Municipal Corporation Platform. Open Civic Standards.</p>
          <div className="footer-legal-links">
            <a href="#faqs">Privacy Policy</a>
            <span>•</span>
            <a href="#faqs">Citizen Charter</a>
            <span>•</span>
            <a href="#faqs">SLA Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
