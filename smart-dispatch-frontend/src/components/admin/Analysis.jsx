import React from 'react';
import { BarChart3 } from 'lucide-react';
import './styles/Analysis.css';

const Analysis = () => {
  return (
    <div className="view-container">
      <h1 className="page-title">Analysis</h1>
      <div className="coming-soon">
        <BarChart3 className="coming-soon-icon" size={64} />
        <p className="coming-soon-text">Analysis module coming soon</p>
        <p className="coming-soon-subtext">Advanced analytics and insights will be available here</p>
      </div>
    </div>
  );
};

export default Analysis;
