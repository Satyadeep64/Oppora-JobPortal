import React, { memo, useState } from 'react';
import { FiHelpCircle, FiChevronDown } from 'react-icons/fi';

const CompetitionFaqs = memo(({ faqs = [] }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (idx) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="faqs-accordion">
      {faqs.map((faq, idx) => {
        const isOpen = activeFaq === idx;
        return (
          <div
            key={idx}
            className={`faq-item ${isOpen ? 'open' : ''}`}
            onClick={() => toggleFaq(idx)}
          >
            <div className="faq-question-row">
              <div className="faq-question-text">
                <FiHelpCircle className="faq-icon" />
                <span>{faq.q}</span>
              </div>
              <FiChevronDown className={`faq-chevron ${isOpen ? 'rotate' : ''}`} />
            </div>

            {isOpen && (
              <div className="faq-answer-body">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

CompetitionFaqs.displayName = 'CompetitionFaqs';

export default CompetitionFaqs;
