import React, { memo } from 'react';
import CompetitionFaqs from '../../CompetitionDetails/CompetitionFaqs';

/**
 * FaqSection — Single Responsibility: Renders FAQs accordion section.
 */
const FaqSection = memo(({ faqs = [] }) => {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;

  const mappedFaqs = faqs.map((f) => ({
    q: f.question || f.q,
    a: f.answer || f.a
  }));

  return (
    <section id="faqs" className="details-section-card">
      <h2 className="section-title">Frequently Asked Questions</h2>
      <CompetitionFaqs faqs={mappedFaqs} />
    </section>
  );
});

FaqSection.displayName = 'FaqSection';

export default FaqSection;
