import React from 'react';
import '../styles/components/PropertyDemographics.css';
import ErrorBoundary from './ErrorBoundary';

const formatNumber = (num, type) => {
  if (typeof num !== 'number') return 'N/A';
  
  // Currency format for income
  if (type.toLowerCase().includes('income')) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  }
  
  // Regular number format for other metrics
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(num);
};

const PropertyDemographicsContent = ({ demographics }) => {
  // console.log('Raw demographics data:', demographics);
  
  const demographicsData = React.useMemo(() => {
    if (!demographics) return null;
    try {
      return typeof demographics === 'string' ? JSON.parse(demographics) : demographics;
    } catch (error) {
      console.error('Error parsing demographics:', error);
      return null;
    }
  }, [demographics]);

  // console.log('Processed demographics data:', demographicsData);

  if (!demographicsData?.length) {
    console.log('No valid demographics data available');
    return null;
  }

  return (
    <div className="property-demographics">
      <h3>Demographics</h3>
      <table className="demographics-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>1 Mile</th>
            <th>3 Miles</th>
            <th>5 Miles</th>
          </tr>
        </thead>
        <tbody>
          {demographicsData.map((demographic, index) => (
            <tr key={index}>
              <td>{demographic.type}</td>
              <td>{formatNumber(demographic.oneMile, demographic.type)}</td>
              <td>{formatNumber(demographic.threeMile, demographic.type)}</td>
              <td>{formatNumber(demographic.fiveMile, demographic.type)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PropertyDemographics = (props) => (
  <ErrorBoundary>
    <PropertyDemographicsContent {...props} />
  </ErrorBoundary>
);

export default PropertyDemographics;
