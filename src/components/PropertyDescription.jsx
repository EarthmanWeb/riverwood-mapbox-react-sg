import React from 'react';
import DOMPurify from 'dompurify';
import '../styles/components/PropertyDescription.css';
import ErrorBoundary from './ErrorBoundary';

const processHtmlLinks = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  doc.querySelectorAll('a').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  
  return doc.body.innerHTML;
};

const PropertyDescriptionContent = ({ description }) => {
  const processedHtml = processHtmlLinks(description);
  const sanitizedHtml = DOMPurify.sanitize(processedHtml, {
    ADD_ATTR: ['target']
  });
  
  return (
    <div>
      <h3>Description</h3>
      <div 
        className="property-description pb-4"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
};

const PropertyDescription = (props) => (
  <ErrorBoundary>
    <PropertyDescriptionContent {...props} />
  </ErrorBoundary>
);

export default PropertyDescription;
