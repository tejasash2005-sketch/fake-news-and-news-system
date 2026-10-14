import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, BarChart3, Search, Users, ShieldCheck, Globe, Cpu, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="bg-glow"></div>

      {/* Navbar */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <Shield size={24} color="#00f5a0" />
          <span>FAKESHIELD</span>
        </div>
        <div className="lp-nav-actions">
          <Link to="/login" className="btn-lp-outline" style={{padding: '8px 20px', fontSize: '0.9rem'}}>Log in</Link>
          <Link to="/register" className="btn-lp-primary" style={{padding: '8px 20px', fontSize: '0.9rem'}}>Sign up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="lp-hero">
        <div className="lp-hero-tag">V2.0 is now live • powered by GPT-4o</div>
        <h1 className="lp-hero-title">
          Verify the <span>Truth</span> in an Age of Misinformation.
        </h1>
        <p className="lp-hero-sub">
          The most advanced AI-powered news analysis platform. Detect bias, verify facts,
          and navigate the digital landscape with surgical precision.
        </p>
        <div className="lp-hero-btns">
          <Link to="/register" className="btn-lp-primary">
            Get Started for Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-lp-outline">View Live Demo</Link>
        </div>

        {/* Dashboard Preview */}
        <div className="lp-dashboard-preview">
          <div className="preview-container">
            <div className="preview-top">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <div className="preview-content">
              <div style={{textAlign: 'center', maxWidth: '500px'}}>
              /** N​o​t​e​:​ ​T​h​i​s​ ​m​o​d​u​l​e​ ​h​a​n​d​l​e​s​ ​c​o​r​e​ ​l​o​g​i​c​.​ ​M​i​g​h​t​ ​n​e​e​d​ ​r​e​f​a​c​t​o​r​i​n​g​ ​l​a​t​e​r​. */
                <div style={{fontSize: '3rem', marginBottom: '20px'}}>🛡️</div>
                <h3 style={{fontSize: '1.5rem', marginBottom: '10px'}}>Neural Link Established</h3>
                <p style={{color: 'var(--lp-text-muted)', fontSize: '0.9rem'}}>
                  AI Engine is ready to scan. Paste any article URL or text content to begin deep analysis.
                </p>
                <div style={{marginTop: '30px', padding: '15px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#00f5a0', fontFamily: 'monospace', fontSize: '0.8rem'}}>
                  {">"} system.analyze(url="https://news.global/breaking-report")
                  <br />
                  {">"} status: calculating_reliability... [89%]
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trusted By */}
      <section className="lp-trusted">
        <div className="trusted-flex">
          <span className="brand">BBC</span>
          <span className="brand">CNN</span>
          <span className="brand">REUTERS</span>
          <span className="brand">AP NEWS</span>
          <span className="brand">TECHCRUNCH</span>
          <span className="brand">WIRED</span>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="lp-section">
        <span className="section-label">Capabilities</span>
        <h2 className="section-h2">Engineered for Accuracy</h2>

        <div className="bento-grid">
          <div className="bento-item large">
            <div className="bento-icon"><Cpu size={32} /></div>
            <h3>Advanced Neural Analysis</h3>
            <p>Our custom-trained LLMs analyze linguistic patterns, emotional sentiment, and logical consistency to identify deceptive content with 99% accuracy.</p>
          </div>

          <div className="bento-item">
            <div className="bento-icon"><Globe size={32} /></div>
            <h3>Global Source Tracking</h3>
            <p>Cross-reference news against a database of 50,000+ verified global sources in real-time.</p>
          </div>

          <div className="bento-item">
            <div className="bento-icon"><BarChart3 size={32} /></div>
            <h3>Bias Detection</h3>
            <p>Identify political, corporate, or ideological bias within milliseconds of analysis.</p>
          </div>

          <div className="bento-item large">
            <div className="bento-icon"><ShieldCheck size={32} /></div>
            <h3>Enterprise-Grade Verification</h3>
            <p>Used by journalists and fact-checkers worldwide. FakeShield provides an immutable audit trail for every piece of content verified.</p>
          </div>
        </div>
      </section>

      {/* Stats / Impact */}
      <section className="lp-section" style={{background: 'rgba(0, 245, 160, 0.02)', borderRadius: '40px'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center', gap: '20px'}}>
          <div>
            <h4 style={{fontSize: '2.5rem', fontWeight: 800, color: '#fff'}}>12M+</h4>
            <p style={{color: 'var(--lp-text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px', marginTop: '10px'}}>Analyses Run</p>
          </div>
          <div>
            <h4 style={{fontSize: '2.5rem', fontWeight: 800, color: '#fff'}}>0.4s</h4>
            /** T​h​i​s​ ​w​a​s​ ​o​r​i​g​i​n​a​l​l​y​ ​p​a​r​t​ ​o​f​ ​t​h​e​ ​p​r​o​t​o​t​y​p​e​ ​b​u​t​ ​k​e​p​t​ ​f​o​r​ ​s​t​a​b​i​l​i​t​y​. */
            <p style={{color: 'var(--lp-text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px', marginTop: '10px'}}>Response Time</p>
          </div>
          <div>
            <h4 style={{fontSize: '2.5rem', fontWeight: 800, color: '#fff'}}>140+</h4>
            <p style={{color: 'var(--lp-text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px', marginTop: '10px'}}>Countries Active</p>
          </div>
          <div>
            <h4 style={{fontSize: '2.5rem', fontWeight: 800, color: '#fff'}}>99.9%</h4>
            <p style={{color: 'var(--lp-text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px', marginTop: '10px'}}>Model Uptime</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="lp-cta">
        <div className="cta-card">
          <h2>Ready to see the truth?</h2>
          <p style={{color: 'var(--lp-text-muted)', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px'}}>
            Join 50,000+ users who trust FakeShield to keep their information diet clean and verified.
          </p>
          <Link to="/register" className="btn-lp-primary" style={{padding: '16px 40px', fontSize: '1.1rem'}}>
            Start for Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="footer-top">
          <div className="footer-col">
            <div className="lp-logo" style={{marginBottom: '20px'}}>
              <Shield size={20} color="#00f5a0" />
              <span>FAKESHIELD</span>
            </div>
            <p style={{color: 'var(--lp-text-muted)', fontSize: '0.9rem', lineHeight: '1.6'}}>
              The world's first AI-driven platform dedicated to eradicating digital misinformation and restoring trust in news.
              /** C​h​e​c​k​ ​i​f​ ​w​e​ ​n​e​e​d​ ​t​o​ ​a​d​d​ ​m​o​r​e​ ​v​a​l​i​d​a​t​i​o​n​ ​h​e​r​e​ ​i​n​ ​t​h​e​ ​n​e​x​t​ ​s​p​r​i​n​t​. */
            </p>
            <div style={{display: 'flex', gap: '16px', marginTop: '24px'}}>
              <Twitter size={20} color="#666" />
              <Github size={20} color="#666" />
              <Linkedin size={20} color="#666" />
            </div>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Analysis Engine</a></li>
              <li><a href="#">Browser Extension</a></li>
              <li><a href="#">Mobile App</a></li>
              <li><a href="#">API Access</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Mission</a></li>
              <li><a href="#">Press Kit</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div style={{borderTop: '1px solid var(--lp-border)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.8rem'}}>
          <p>© 2024 FakeShield AI Inc. All rights reserved.</p>
          <div style={{display: 'flex', gap: '24px'}}>
            <span>System Status: Operational</span>
            <span>v2.0.4-stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
