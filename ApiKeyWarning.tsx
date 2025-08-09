
import React from 'react';

const ApiKeyWarning: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-3 text-center z-[1000] shadow-lg">
      <i className="fas fa-exclamation-triangle mr-2"></i>
      <strong>API Key Missing:</strong> The <code>API_KEY</code> environment variable is not set.
      Storyboard generation will not function. Please configure the API key in your environment.
    </div>
  );
};

export default ApiKeyWarning;
    