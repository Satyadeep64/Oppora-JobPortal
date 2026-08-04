import React from "react";

/**
 * KpiCard — Reusable KPI statistics card for the Interview dashboard.
 *
 * @param {React.ElementType} icon  - Lucide icon component
 * @param {string}  bg              - Background colour for the icon wrapper
 * @param {string}  color           - Icon / accent colour
 * @param {number|string} value     - Metric value to display
 * @param {string}  label           - Human-readable metric label
 */
const KpiCard = ({ icon: Icon, bg, color, value, label }) => (
  <div className="stat-kpi-card">
    <div className="kpi-icon-wrapper" style={{ background: bg, color }}>
      <Icon size={22} />
    </div>
    <div className="kpi-data">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

export default KpiCard;
