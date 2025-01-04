import React from 'react';
import '../styles/components/PropertyPopup.css';
import PropertyImages from './PropertyImages';
import PropertyDescription from './PropertyDescription';
import PropertyAddress from './PropertyAddress';
import PropertyFeatures from './PropertyFeatures';
import PropertyDemographics from './PropertyDemographics';
import PropertyTenants from './PropertyTenants';
import PropertyManager from './PropertyManager';
import PropertyLabels from './PropertyLabels';

const PropertyPopup = ({ property, onClose }) => {
  if (!property) return null;

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not its children
    if (e.target.className === 'property-popup-overlay') {
      onClose();
    }
  };

  return (
    <div className="property-popup-overlay" onClick={handleOverlayClick}>
      <button className="close-button" onClick={onClose}>×</button>
      <div className="property-popup">
        <div className="property-popup-content">
          <div className="property-popup-header">
            <h2>{property.title}
              <PropertyLabels labels={property.labels} />
            </h2>
            <p>{property.price}</p>
            <PropertyImages 
              images={property.images} 
              image={property.image}  // Add featured image
            />
          </div>
          <div className="property-popup-details">
              <PropertyAddress 
                display_address={property.display_address}
                city={property.city}
                state={property.state}
                zipcode={property.zipcode}
              />
            <div className="property-popup-info">
              <PropertyDescription description={property.description} />
              <PropertyFeatures features={property.features} />
              <PropertyDemographics demographics={property.demographics} />
              <PropertyTenants tenants={property.tenants} />
              <PropertyManager manager={property.propertyManager} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPopup;
