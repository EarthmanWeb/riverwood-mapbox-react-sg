import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DOMAIN_URL } from '../config';

const navItems = {
  main: [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/', isInternal: true },
    { label: 'About', path: '/about/' },
    { label: 'Tenants', path: '/tenants/' },
    {
      label: 'Services',
      path: '/commercial-real-estate-management-and-development/',
      children: [
        { label: 'Tenant Representation', path: '#tenant-representation' },
        { label: 'Landlord Representation', path: '#landlord-representation' },
        { label: 'Property Management', path: '#property-management' },
        { label: 'Development', path: '#development' },
        { label: 'Asset Management', path: '#asset-management' }
      ]
    },
    { label: 'Work with Us', path: '/contact/' }
  ]
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const renderNavLink = (item) => {
    const fullPath = item.isInternal ? item.path : `${DOMAIN_URL}${item.path}`;
    return item.isInternal ? 
      <Link to={item.path}>{item.label}</Link> :
      <a href={fullPath}>{item.label}</a>;
  };

  return (
    <header id="masthead" className="site-header">
      <div className="branding-navigation">
        <div className="site-branding">
          <a href={DOMAIN_URL} className="custom-logo-link">
            <img src={`${DOMAIN_URL}/wp-content/uploads/2024/11/RIVERWOOD-LOGO.png`}
                 className="custom-logo" 
                 alt="Riverwood Properties" />
          </a>
        </div>
        <nav id="primary" className="primary-menu">
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}>
            Menu
          </button>
          <ul id="primary-menu" className={`menu-items ${isMenuOpen ? 'active' : ''}`}>
            {navItems.main.map((item, index) => (
              <li key={index} className={`menu-item ${item.children ? 'menu-item-has-children' : ''}`}>
                {renderNavLink(item)}
                {item.children && (
                  <>
                    <button 
                      className="dropdown-toggle"
                      onClick={() => setIsServicesOpen(!isServicesOpen)}
                      aria-expanded={isServicesOpen}>
                      <span className="arrow"></span>
                    </button>
                    <ul className={`sub-menu ${isServicesOpen ? 'active' : ''}`}>
                      {item.children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <a href={`${DOMAIN_URL}${item.path}${child.path}`}>
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
