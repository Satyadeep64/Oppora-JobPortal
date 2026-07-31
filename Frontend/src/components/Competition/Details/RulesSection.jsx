import React, { memo } from 'react';
import { FiCheckCircle } from 'react-icons/fi';

/**
 * RulesSection — Single Responsibility: Renders rules list section.
 */
const RulesSection = memo(({ rules = [] }) => {
  if (!Array.isArray(rules) || rules.length === 0) return null;

  return (
    <section id="rules" className="details-section-card">
      <h2 className="section-title">Rules & Guidelines</h2>
      <ul className="rules-list">
        {rules.map((rule, idx) => (
          <li key={idx} className="rule-item">
            <FiCheckCircle className="rule-icon" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </section>
  );
});

RulesSection.displayName = 'RulesSection';

export default RulesSection;
