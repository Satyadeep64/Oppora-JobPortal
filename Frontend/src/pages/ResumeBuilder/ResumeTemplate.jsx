const ResumeTemplate = ({ resume }) => {
    const skills = resume.skills
        ? resume.skills.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    const contactItems = [
        resume.email && { icon: "✉", text: resume.email },
        resume.phone && { icon: "☎", text: resume.phone },
        resume.location && { icon: "📍", text: resume.location },
        resume.linkedIn && { icon: "🔗", text: resume.linkedIn },
        resume.portfolio && { icon: "💻", text: resume.portfolio },
    ].filter(Boolean);

    const templateClass = `resume-template resume-${resume.templateStyle || "professional"}`;
    const primaryColor = resume.accentColor || "#2563eb";

    return (
        <div 
            className={templateClass} 
            id="resume-print-area"
            style={{ "--primary-color": primaryColor }}
        >
            {/* Header */}
            <header className="rt-header">
                <h1 className="rt-name">{resume.fullName || "Your Name"}</h1>
                <div className="rt-contact">
                    {contactItems.map((item, i) => (
                        <span key={i} className="rt-contact-item">
                            <span className="rt-contact-icon">{item.icon}</span>
                            {item.text}
                        </span>
                    ))}
                </div>
            </header>

            {/* Summary */}
            {resume.summary && (
                <section className="rt-section">
                    <h2 className="rt-section-title">Professional Summary</h2>
                    <p className="rt-summary">{resume.summary}</p>
                </section>
            )}

            {/* Experience */}
            {resume.experience?.some(e => e.jobTitle || e.company) && (
                <section className="rt-section">
                    <h2 className="rt-section-title">Work Experience</h2>
                    {resume.experience.map((exp, i) => (
                        (exp.jobTitle || exp.company) && (
                            <div key={i} className="rt-entry">
                                <div className="rt-entry-header">
                                    <div>
                                        <h3 className="rt-entry-title">{exp.jobTitle || "Job Title"}</h3>
                                        <p className="rt-entry-sub">{exp.company || "Company"}</p>
                                    </div>
                                    {(exp.startDate || exp.endDate) && (
                                        <span className="rt-entry-date">
                                            {exp.startDate}{exp.startDate && exp.endDate ? " – " : ""}{exp.endDate}
                                        </span>
                                    )}
                                </div>
                                {exp.description && (
                                    <div className="rt-entry-desc">
                                        {exp.description.split("\n").map((line, j) => (
                                            line.trim() && <p key={j}>{line.replace(/^[•\-]\s*/, "")}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    ))}
                </section>
            )}

            {/* Education */}
            {resume.education?.some(e => e.degree || e.institution) && (
                <section className="rt-section">
                    <h2 className="rt-section-title">Education</h2>
                    {resume.education.map((edu, i) => (
                        (edu.degree || edu.institution) && (
                            <div key={i} className="rt-entry">
                                <div className="rt-entry-header">
                                    <div>
                                        <h3 className="rt-entry-title">{edu.degree || "Degree"}</h3>
                                        <p className="rt-entry-sub">{edu.institution || "Institution"}</p>
                                    </div>
                                    <div className="rt-entry-meta">
                                        {(edu.startDate || edu.endDate) && (
                                            <span className="rt-entry-date">
                                                {edu.startDate}{edu.startDate && edu.endDate ? " – " : ""}{edu.endDate}
                                            </span>
                                        )}
                                        {edu.grade && <span className="rt-entry-grade">{edu.grade}</span>}
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <section className="rt-section">
                    <h2 className="rt-section-title">Skills</h2>
                    <div className="rt-skills">
                        {skills.map((skill, i) => (
                            <span key={i} className="rt-skill-tag">{skill}</span>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {resume.projects?.some(p => p.name) && (
                <section className="rt-section">
                    <h2 className="rt-section-title">Projects</h2>
                    {resume.projects.map((proj, i) => (
                        proj.name && (
                            <div key={i} className="rt-entry">
                                <div className="rt-entry-header">
                                    <div>
                                        <h3 className="rt-entry-title">{proj.name}</h3>
                                        {proj.technologies && (
                                            <p className="rt-entry-sub rt-tech">{proj.technologies}</p>
                                        )}
                                    </div>
                                    {proj.link && (
                                        <span className="rt-entry-link">{proj.link}</span>
                                    )}
                                </div>
                                {proj.description && (
                                    <p className="rt-entry-desc-single">{proj.description}</p>
                                )}
                            </div>
                        )
                    ))}
                </section>
            )}

            {/* Certifications */}
            {resume.certifications?.some(c => c.name) && (
                <section className="rt-section">
                    <h2 className="rt-section-title">Certifications</h2>
                    <div className="rt-cert-list">
                        {resume.certifications.map((cert, i) => (
                            cert.name && (
                                <div key={i} className="rt-cert-item">
                                    <strong>{cert.name}</strong>
                                    {cert.issuer && <span> — {cert.issuer}</span>}
                                    {cert.date && <span className="rt-cert-date"> ({cert.date})</span>}
                                </div>
                            )
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ResumeTemplate;
