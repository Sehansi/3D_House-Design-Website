import React, { useState } from 'react';
import '../../styles/Contact.css';
import { CheckCircle, AlertTriangle } from 'lucide-react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      

      <div className="contact-hero" style={{ background: "url('/images/contact_hero_bg.png') center/cover no-repeat fixed" }}>
        <div className="contact-header-content">
          <h1>Let's Build Together</h1>
          <p>Have an idea or need support? Our team of architectural and tech experts are here to help.</p>
        </div>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <div className="info-item">
            <h3>Email</h3>
            <p>info@3dhousedesign.com</p>
          </div>
          <div className="info-item">
            <h3>Phone</h3>
            <p>+94 XX XXX XXXX</p>
          </div>
          <div className="info-item">
            <h3>Address</h3>
            <p>Colombo, Sri Lanka</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Message</h2>
          
          {success && (
            <div className="success-message">
              <CheckCircle size={16} /> {success}
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={loading}
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            required
            disabled={loading}
          ></textarea>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      
    </div>
  );
}

export default Contact;
