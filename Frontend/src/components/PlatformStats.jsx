import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Briefcase,
  Building2,
  BadgeCheck,
  Globe,
  TrendingUp,
  Sparkles
} from "lucide-react";

const statsData = [
  {
    icon: <ClipboardCheck />,
    rawNumber: 2.3,
    suffix: "M+",
    title: "Assessments Taken",
    description: "Evaluations & Mock tests completed"
  },
  {
    icon: <Briefcase />,
    rawNumber: 190,
    suffix: "K+",
    title: "Live Opportunities",
    description: "Jobs, internships & hackathons"
  },
  {
    icon: <Building2 />,
    rawNumber: 37,
    suffix: "K+",
    title: "Active Companies",
    description: "Startups to Fortune 500 enterprises"
  },
  {
    icon: <BadgeCheck />,
    rawNumber: 542,
    suffix: "+",
    title: "Global Brands",
    description: "Direct enterprise recruitment partners"
  },
  {
    icon: <Globe />,
    rawNumber: 78,
    suffix: "+",
    title: "Countries Reached",
    description: "Global talent network footprint"
  }
];

const PlatformStats = () => {
  const [animatedCounts, setAnimatedCounts] = useState(
    statsData.map(() => 0)
  );

  useEffect(() => {
    const duration = 1500; // ms
    const steps = 30;
    const intervalTime = duration / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const progress = stepCount / steps;

      setAnimatedCounts(
        statsData.map((s) => {
          const current = (s.rawNumber * Math.min(progress, 1)).toFixed(
            s.rawNumber % 1 !== 0 ? 1 : 0
          );
          return current;
        })
      );

      if (stepCount >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="stats-section">
      <div className="stats-header-wrapper">
        <div className="stats-spotlight">
          <TrendingUp size={16} />
          <span>Global Platform Impact</span>
        </div>

        <div className="stats-heading">
          <h2>
            Powering <span>Career Growth</span> at Scale
          </h2>
          <p>
            Connecting millions of ambitious candidates with leading recruiters across the globe.
          </p>
        </div>
      </div>

      <div className="stats-container">
        {statsData.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-card-glow"></div>
            <div className="stat-icon">{stat.icon}</div>

            <h2>
              {animatedCounts[index]}
              <span className="stat-suffix">{stat.suffix}</span>
            </h2>

            <p className="stat-title">{stat.title}</p>
            <span className="stat-desc">{stat.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PlatformStats;