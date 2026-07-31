import React, { memo } from 'react';
import './PageHeader.css';

const PageHeader = memo(() => {
  return (
    <header className="page-header">
      <div className="page-header-container">
        <h1 className="page-header-title">
          <span className="count-highlight">21341+</span> Competitions for Students
        </h1>
        <p className="page-header-subtitle">
          Online quizzes, case studies & challenges with prizes
        </p>
      </div>
    </header>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;

