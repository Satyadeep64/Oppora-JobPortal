const SkillsSection = ({ skills, missing }) => {
  return (
    <div className="skills-wrapper">

      <div className="skills-card">

        <h2>Skills Found</h2>

        {skills.map((skill, index) => (
          <span
            key={index}
            className="skill-badge"
          >
            {skill}
          </span>
        ))}

      </div>

      <div className="skills-card">

        <h2>Missing Skills</h2>

        {missing.map((skill, index) => (
          <span
            key={index}
            className="missing-badge"
          >
            {skill}
          </span>
        ))}

      </div>

    </div>
  );
};

export default SkillsSection;