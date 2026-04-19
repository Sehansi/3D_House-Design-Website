import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';
import {
  Pencil, Home, Sparkles, Eye, Sofa, Users, Search, HardHat, Image, Settings, Info, Mail,
  LayoutDashboard, Briefcase, Calendar, ClipboardList, CheckSquare, User, Shield,
  ChevronDown, ChevronUp, LogOut
} from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout, isAuthenticated } = useAuth();
  const navRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => { setIsOpen(!isOpen); setActiveDropdown(null); };
  const closeMenu = () => { setIsOpen(false); setActiveDropdown(null); setUserDropdownOpen(false); };
  const getLinkClass = (path) => currentPath === path ? 'nav-link-active' : 'nav-link';
  const handleLogout = () => { logout(); navigate('/'); closeMenu(); };
  const toggleDropdown = (name) => setActiveDropdown(activeDropdown === name ? null : name);

  // Customer dropdown menus
  const customerMenus = [
    {
      label: 'Design Tools',
      labelIcon: <Pencil size={15} />,
      key: 'design',
      items: [
        { to: '/ai-designer', label: 'AI Designer', icon: <Sparkles size={15} /> },
        { to: '/viewer', label: '3D Viewer', icon: <Eye size={15} /> },
        { to: '/furniture-customizer', label: 'Furniture Customizer', icon: <Sofa size={15} /> },
      ]
    },
    {
      label: 'Architects',
      labelIcon: <Users size={15} />,
      key: 'architects',
      items: [
        { to: '/architects', label: 'Browse Architects', icon: <Search size={15} /> },
        { to: '/constructors', label: 'Find Constructors', icon: <HardHat size={15} /> },
        { to: '/gallery', label: 'Design Gallery', icon: <Image size={15} /> },
      ]
    },
    {
      label: 'Learn More',
      labelIcon: <Info size={15} />,
      key: 'learn',
      items: [
        { to: '/services', label: 'Our Services', icon: <Settings size={15} /> },
        { to: '/about', label: 'About Us', icon: <Info size={15} /> },
        { to: '/contact', label: 'Contact Us', icon: <Mail size={15} /> },
      ]
    }
  ];

  return (
    <nav className="navbar-modern" ref={navRef}>
      <div className="nav-brand">
        <span className="logo-icon"><Home size={22} strokeWidth={2.5} /></span>
        <span className="logo-text">3D House Design</span>
      </div>

      <div className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <div className={`nav-links-modern ${isOpen ? 'active' : ''}`}>

        {/* ── NOT AUTHENTICATED ── show Home + public links */}
        {!isAuthenticated ? (
          <>
            <Link to="/" className={getLinkClass('/')} onClick={closeMenu}>Home</Link>
            <Link to="/services" className={getLinkClass('/services')} onClick={closeMenu}>Our Services</Link>
            <Link to="/gallery" className={getLinkClass('/gallery')} onClick={closeMenu}>Gallery</Link>
            <Link to="/about" className={getLinkClass('/about')} onClick={closeMenu}>About Us</Link>
            <Link to="/contact" className={getLinkClass('/contact')} onClick={closeMenu}>Contact</Link>
          </>
        ) : (
          <>
            {/* ── CUSTOMER: 3 dropdown menus, no Home ── */}
            {user?.role === 'Customer' && customerMenus.map(menu => (
              <div key={menu.key} className="nav-dropdown">
                <button
                  className={`nav-link dropdown-trigger ${activeDropdown === menu.key ? 'nav-link-active' : ''}`}
                  onClick={() => toggleDropdown(menu.key)}
                >
                  <span className="nav-link-icon">{menu.labelIcon}</span>
                  {menu.label}
                  <span className="dropdown-icon">{activeDropdown === menu.key ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                </button>
                <div className={`dropdown-content ${activeDropdown === menu.key ? 'show' : ''}`}>
                  {menu.items.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`dropdown-link ${currentPath === item.to ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      <span className="dropdown-link-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* ── ARCHITECT ── */}
            {user?.role === 'Architect' && (
              <>
                <Link to="/architect" className={getLinkClass('/architect')} onClick={closeMenu}><LayoutDashboard size={15} className="nav-link-icon" /> Dashboard</Link>
                <Link to="/architect/workstation" className={getLinkClass('/architect/workstation')} onClick={closeMenu}><Briefcase size={15} className="nav-link-icon" /> Workstation</Link>
                <Link to="/architect/meetings" className={getLinkClass('/architect/meetings')} onClick={closeMenu}><Calendar size={15} className="nav-link-icon" /> Meetings</Link>
              </>
            )}

            {/* ── CONSTRUCTOR ── */}
            {user?.role === 'Constructor' && (
              <>
                <Link to="/constructor" className={getLinkClass('/constructor')} onClick={closeMenu}><ClipboardList size={15} className="nav-link-icon" /> Client Requests</Link>
                <Link to="/constructor/accepted" className={getLinkClass('/constructor/accepted')} onClick={closeMenu}><CheckSquare size={15} className="nav-link-icon" /> Accepted Projects</Link>
                <Link to="/constructor/profile" className={getLinkClass('/constructor/profile')} onClick={closeMenu}><User size={15} className="nav-link-icon" /> My Profile</Link>
              </>
            )}

            {/* ── ADMIN ── */}
            {user?.role === 'Admin' && (
              <Link to="/admin" className={getLinkClass('/admin')} onClick={closeMenu}><Shield size={15} className="nav-link-icon" /> Control Center</Link>
            )}
          </>
        )}

        {/* ── User Avatar Dropdown ── */}
        {isAuthenticated && user ? (
          <div className="nav-user-dropdown-container">
            <div
              className={`nav-user-header ${userDropdownOpen ? 'active' : ''}`}
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <div className="user-avatar-small">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name-text">{user.fullName}</span>
            </div>

            {userDropdownOpen && (
              <div className="user-dropdown-menu">
                <Link to={user.role === 'Customer' ? '/dashboard' : '/profile'} className="dropdown-item" onClick={closeMenu}>
                  {user.role === 'Customer' ? <LayoutDashboard size={15} /> : <User size={15} />} 
                  {user.role === 'Customer' ? ' Dashboard' : ' View Profile'}
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons-wrapper">
            <Link to="/signin" className="nav-link-signin" onClick={closeMenu}>Sign In</Link>
            <Link to="/register" className="btn-nav-primary" onClick={closeMenu}>Get Started</Link>
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
