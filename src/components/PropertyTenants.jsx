import React, { useRef, useEffect } from 'react';
import '../styles/components/PropertyTenants.css';
import ErrorBoundary from './ErrorBoundary';

const PropertyTenantsContent = ({ tenants }) => {
  const tableContainerRef = useRef(null);

  const handleWheel = (e) => {
    const container = tableContainerRef.current;
    if (!container) return;

    // Check if we're at either edge
    const isAtRightEdge = container.scrollLeft + container.clientWidth >= container.scrollWidth;
    const isAtLeftEdge = container.scrollLeft <= 0;
    
    // Let the parent scroll if at edges
    if ((isAtRightEdge && e.deltaY > 0) || (isAtLeftEdge && e.deltaY < 0)) {
      return;
    }

    // Otherwise handle the scroll in the container
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  };

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Handle both string and array inputs
  const tenantsArray = React.useMemo(() => {
    if (!tenants) return [];
    if (Array.isArray(tenants)) return tenants;
    try {
      return JSON.parse(tenants);
    } catch {
      return [];
    }
  }, [tenants]);

  if (tenantsArray.length === 0) {
    return (
      <div>
        <h3>Tenants</h3>
        <p>No tenants available</p>
      </div>
    );
  }

  return (
    <div className='pb-4'>
      <h3 className="pb-0 mb-0">Tenants</h3>
      <div 
        className="tenants-scroll-container"
        ref={tableContainerRef}
      >
        <table className="tenants-table">
          <thead>
            <tr>
              <th>Suite</th>
              <th>Description</th>
              <th>Size</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tenantsArray.map((tenant, index) => (
              <tr key={index}>
                <td>{tenant.suite}</td>
                <td>{tenant.description}</td>
                <td>{tenant.size} sqft</td>
                <td>${tenant.price}/month</td>
                <td>
                  <div className="status-indicator">
                    <div className={`status-icon ${tenant.available ? 'status-available' : 'status-occupied'}`} />
                    {tenant.available ? 'Available' : 'Occupied'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PropertyTenants = (props) => (
  <ErrorBoundary>
    <PropertyTenantsContent {...props} />
  </ErrorBoundary>
);

export default PropertyTenants;
