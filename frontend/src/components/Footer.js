import React from 'react';
import '../styles/Footer.css';
import { Home } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer-modern">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="logo-icon"><Home size={20} strokeWidth={2.5} /></span>
          <span className="logo-text">3D House Design</span>
        </div>
        <p className="footer-text">© 2026 3D House Design. All rights reserved.</p>
        <div className="footer-social">
          <a href="#" className="social-link" style={{ fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none' }}>Fb</a>
          <a href="#" className="social-link" style={{ fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none' }}>X</a>
          <a href="#" className="social-link" style={{ fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none' }}>In</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
