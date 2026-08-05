import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    FaUser, FaBriefcase, FaGraduationCap, FaCode,
    FaCertificate, FaSave, FaPlus, FaTrash, FaDownload,
    FaPalette, FaCheckCircle
} from "react-icons/fa";
import ResumeTemplate from "./ResumeTemplate";
import { API_BASE_URL } from "../../config/api";
import "./ResumeBuilder.css";

const API = `${API_BASE_URL}/api`;

const emptyExperience = () => ({
    jobTitle: "", company: "", startDate: "", endDate: "", description: ""
});
const emptyEducation = () => ({
    degree: "", institution: "", startDate: "", endDate: "", grade: ""
});
const emptyProject = () => ({
    name: "", technologies: "", description: "", link: ""
});
const emptyCertification = () => ({
    name: "", issuer: "", date: ""
});

const SAMPLE_DATA = {
    fullName: "Satya Kumar",
    email: "satya.kumar@email.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    linkedIn: "linkedin.com/in/satyakumar",
    portfolio: "github.com/satyakumar",
    summary: "Results-driven Software Engineer with 3+ years of experience building scalable web applications using React, .NET, and SQL Server. Passionate about clean code, user-centric design, and delivering high-impact solutions.",
    skills: "React, JavaScript, TypeScript, C#, .NET 8, SQL Server, REST APIs, Git, Azure, Agile/Scrum",
    experience: [
        {
            jobTitle: "Software Engineer",
            company: "Coforge Technologies",
            startDate: "Jan 2023",
            endDate: "Present",
            description: "• Developed full-stack features for enterprise HR platform serving 10K+ users\n• Built REST APIs with .NET 8 and integrated React frontend with live data\n• Reduced page load time by 40% through query optimization and caching"
        },
        {
            jobTitle: "Junior Developer Intern",
            company: "Tech Solutions Pvt Ltd",
            startDate: "Jun 2022",
            endDate: "Dec 2022",
            description: "• Assisted in building responsive web dashboards using React and Bootstrap\n• Wrote unit tests achieving 85% code coverage\n• Collaborated with cross-functional teams in Agile sprints"
        }
    ],
    education: [
        {
            degree: "B.Tech in Computer Science",
            institution: "Indian Institute of Technology",
            startDate: "2019",
            endDate: "2023",
            grade: "CGPA: 8.7/10"
        }
    ],
    projects: [
        {
            name: "Oppora Job Portal",
            technologies: "React, .NET 8, SQL Server",
            description: "Full-featured recruitment platform with role-based dashboards, job posting, and applicant tracking.",
            link: "github.com/satyakumar/oppora"
        }
    ],
    certifications: [
        { name: "Azure Fundamentals (AZ-900)", issuer: "Microsoft", date: "2024" },
        { name: "React Developer Certification", issuer: "Meta", date: "2023" }
    ],
    templateStyle: "professional"
};

const SECTIONS = [
    { id: "personal", label: "Personal Info", icon: FaUser },
    { id: "summary", label: "Summary", icon: FaUser },
    { id: "experience", label: "Experience", icon: FaBriefcase },
    { id: "education", label: "Education", icon: FaGraduationCap },
    { id: "skills", label: "Skills", icon: FaCode },
    { id: "projects", label: "Projects", icon: FaCode },
    { id: "certifications", label: "Certifications", icon: FaCertificate },
];

const ResumeBuilder = () => {
    const userId = localStorage.getItem("userId");
    const [activeSection, setActiveSection] = useState("personal");
    const [resume, setResume] = useState({ ...SAMPLE_DATA });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(0.75);

    const loadResume = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get(`${API}/Resume/${userId}`);
            const data = res.data;
            if (data && (data.fullName || data.email || data.id)) {
                const hasSavedExperience = data.experience?.some(e => e.jobTitle || e.company);
                const hasSavedEducation = data.education?.some(e => e.degree || e.institution);
                const hasSavedProjects = data.projects?.some(p => p.name);
                const hasSavedCerts = data.certifications?.some(c => c.name);

                setResume({
                    fullName: data.fullName || localStorage.getItem("userName") || "",
                    email: data.email || localStorage.getItem("email") || "",
                    phone: data.phone || "",
                    location: data.location || "",
                    linkedIn: data.linkedIn || "",
                    portfolio: data.portfolio || "",
                    summary: data.summary || "",
                    skills: data.skills || "",
                    experience: hasSavedExperience ? data.experience : [emptyExperience()],
                    education: hasSavedEducation ? data.education : [emptyEducation()],
                    projects: hasSavedProjects ? data.projects : [emptyProject()],
                    certifications: hasSavedCerts ? data.certifications : [emptyCertification()],
                    templateStyle: data.templateStyle || "professional",
                    accentColor: data.accentColor || "#2563eb"
                });
            }
        } catch {
            const userName = localStorage.getItem("userName");
            const userEmail = localStorage.getItem("email");
            if (userName || userEmail) {
                setResume(prev => ({
                    ...prev,
                    fullName: userName || prev.fullName,
                    email: userEmail || prev.email,
                }));
            }
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { loadResume(); }, [loadResume]);

    const updateField = (field, value) => {
        setResume(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const updateListItem = (list, index, field, value) => {
        setResume(prev => {
            const updated = [...prev[list]];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, [list]: updated };
        });
        setSaved(false);
    };

    const addListItem = (list, emptyFn) => {
        setResume(prev => ({ ...prev, [list]: [...prev[list], emptyFn()] }));
        setSaved(false);
    };

    const removeListItem = (list, index) => {
        setResume(prev => ({
            ...prev,
            [list]: prev[list].filter((_, i) => i !== index)
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        if (!userId) {
            alert("Please log in to save your resume.");
            return;
        }
        setSaving(true);
        try {
            await axios.post(`${API}/Resume`, {
                userId: parseInt(userId),
                ...resume
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            alert("Could not save resume. Make sure the backend is running.");
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="rb-loading">
                <div className="rb-spinner" />
                <p>Loading Resume Builder...</p>
            </div>
        );
    }

    return (
        <div className="resume-builder-page">
            <header className="rb-header">
                <div className="rb-header-left">
                    <h1>Resume Builder</h1>
                    <p>Fill in your details — see your resume update live</p>
                </div>
                <div className="rb-header-actions">
                    <div className="rb-template-picker">
                        <FaPalette />
                        <select
                            value={resume.templateStyle}
                            onChange={e => updateField("templateStyle", e.target.value)}
                        >
                            <option value="professional">Professional</option>
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                        </select>
                    </div>
                    <div className="rb-color-swatches">
                        {[
                            { color: "#2563eb", label: "Blue" },
                            { color: "#059669", label: "Emerald" },
                            { color: "#7c3aed", label: "Purple" },
                            { color: "#1e293b", label: "Dark" },
                            { color: "#e11d48", label: "Rose" }
                        ].map(item => (
                            <button
                                key={item.color}
                                className={`rb-color-dot ${(resume.accentColor || "#2563eb") === item.color ? "active" : ""}`}
                                style={{ backgroundColor: item.color }}
                                title={item.label}
                                onClick={() => updateField("accentColor", item.color)}
                            />
                        ))}
                    </div>
                    <button className="rb-btn rb-btn-outline" onClick={handlePrint}>
                        <FaDownload /> Export PDF
                    </button>
                    <button
                        className={`rb-btn rb-btn-primary ${saved ? "saved" : ""}`}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saved ? <><FaCheckCircle /> Saved!</> : <><FaSave /> {saving ? "Saving..." : "Save Resume"}</>}
                    </button>
                </div>
            </header>

            <div className="rb-layout">
                {/* LEFT PANEL — Form */}
                <aside className="rb-form-panel">
                    <nav className="rb-section-nav">
                        {SECTIONS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                className={`rb-nav-btn ${activeSection === id ? "active" : ""}`}
                                onClick={() => setActiveSection(id)}
                            >
                                <Icon /> {label}
                            </button>
                        ))}
                    </nav>

                    <div className="rb-form-content">
                        {activeSection === "personal" && (
                            <div className="rb-form-section">
                                <h3>Personal Information</h3>
                                <div className="rb-field">
                                    <label>Full Name *</label>
                                    <input value={resume.fullName} onChange={e => updateField("fullName", e.target.value)} placeholder="John Doe" />
                                </div>
                                <div className="rb-field-row">
                                    <div className="rb-field">
                                        <label>Email *</label>
                                        <input type="email" value={resume.email} onChange={e => updateField("email", e.target.value)} placeholder="john@email.com" />
                                    </div>
                                    <div className="rb-field">
                                        <label>Phone *</label>
                                        <input value={resume.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                                <div className="rb-field">
                                    <label>Location</label>
                                    <input value={resume.location} onChange={e => updateField("location", e.target.value)} placeholder="City, Country" />
                                </div>
                                <div className="rb-field-row">
                                    <div className="rb-field">
                                        <label>LinkedIn</label>
                                        <input value={resume.linkedIn} onChange={e => updateField("linkedIn", e.target.value)} placeholder="linkedin.com/in/username" />
                                    </div>
                                    <div className="rb-field">
                                        <label>Portfolio / GitHub</label>
                                        <input value={resume.portfolio} onChange={e => updateField("portfolio", e.target.value)} placeholder="github.com/username" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "summary" && (
                            <div className="rb-form-section">
                                <h3>Professional Summary</h3>
                                <div className="rb-field">
                                    <label>Summary *</label>
                                    <textarea
                                        rows={6}
                                        value={resume.summary}
                                        onChange={e => updateField("summary", e.target.value)}
                                        placeholder="Write a compelling 2-3 sentence summary of your professional background..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection === "experience" && (
                            <div className="rb-form-section">
                                <div className="rb-section-header">
                                    <h3>Work Experience</h3>
                                    <button className="rb-add-btn" onClick={() => addListItem("experience", emptyExperience)}>
                                        <FaPlus /> Add
                                    </button>
                                </div>
                                {resume.experience.map((exp, i) => (
                                    <div key={i} className="rb-card">
                                        <div className="rb-card-header">
                                            <span>Experience {i + 1}</span>
                                            {resume.experience.length > 1 && (
                                                <button className="rb-remove-btn" onClick={() => removeListItem("experience", i)}>
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                        <div className="rb-field">
                                            <label>Job Title *</label>
                                            <input value={exp.jobTitle} onChange={e => updateListItem("experience", i, "jobTitle", e.target.value)} placeholder="Software Engineer" />
                                        </div>
                                        <div className="rb-field">
                                            <label>Company *</label>
                                            <input value={exp.company} onChange={e => updateListItem("experience", i, "company", e.target.value)} placeholder="Company Name" />
                                        </div>
                                        <div className="rb-field-row">
                                            <div className="rb-field">
                                                <label>Start Date</label>
                                                <input value={exp.startDate} onChange={e => updateListItem("experience", i, "startDate", e.target.value)} placeholder="Jan 2023" />
                                            </div>
                                            <div className="rb-field">
                                                <label>End Date</label>
                                                <input value={exp.endDate} onChange={e => updateListItem("experience", i, "endDate", e.target.value)} placeholder="Present" />
                                            </div>
                                        </div>
                                        <div className="rb-field">
                                            <label>Description</label>
                                            <textarea rows={4} value={exp.description} onChange={e => updateListItem("experience", i, "description", e.target.value)} placeholder="• Key achievement or responsibility..." />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === "education" && (
                            <div className="rb-form-section">
                                <div className="rb-section-header">
                                    <h3>Education</h3>
                                    <button className="rb-add-btn" onClick={() => addListItem("education", emptyEducation)}>
                                        <FaPlus /> Add
                                    </button>
                                </div>
                                {resume.education.map((edu, i) => (
                                    <div key={i} className="rb-card">
                                        <div className="rb-card-header">
                                            <span>Education {i + 1}</span>
                                            {resume.education.length > 1 && (
                                                <button className="rb-remove-btn" onClick={() => removeListItem("education", i)}>
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                        <div className="rb-field">
                                            <label>Degree *</label>
                                            <input value={edu.degree} onChange={e => updateListItem("education", i, "degree", e.target.value)} placeholder="B.Tech in Computer Science" />
                                        </div>
                                        <div className="rb-field">
                                            <label>Institution *</label>
                                            <input value={edu.institution} onChange={e => updateListItem("education", i, "institution", e.target.value)} placeholder="University Name" />
                                        </div>
                                        <div className="rb-field-row">
                                            <div className="rb-field">
                                                <label>Start Date</label>
                                                <input value={edu.startDate} onChange={e => updateListItem("education", i, "startDate", e.target.value)} placeholder="2019" />
                                            </div>
                                            <div className="rb-field">
                                                <label>End Date</label>
                                                <input value={edu.endDate} onChange={e => updateListItem("education", i, "endDate", e.target.value)} placeholder="2023" />
                                            </div>
                                        </div>
                                        <div className="rb-field">
                                            <label>Grade / CGPA</label>
                                            <input value={edu.grade} onChange={e => updateListItem("education", i, "grade", e.target.value)} placeholder="CGPA: 8.5/10" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === "skills" && (
                            <div className="rb-form-section">
                                <h3>Skills</h3>
                                <div className="rb-field">
                                    <label>Skills (comma separated) *</label>
                                    <textarea
                                        rows={4}
                                        value={resume.skills}
                                        onChange={e => updateField("skills", e.target.value)}
                                        placeholder="React, JavaScript, .NET, SQL Server, Git..."
                                    />
                                </div>
                                <p className="rb-hint">Separate skills with commas. They will appear as tags on your resume.</p>
                            </div>
                        )}

                        {activeSection === "projects" && (
                            <div className="rb-form-section">
                                <div className="rb-section-header">
                                    <h3>Projects</h3>
                                    <button className="rb-add-btn" onClick={() => addListItem("projects", emptyProject)}>
                                        <FaPlus /> Add
                                    </button>
                                </div>
                                {resume.projects.map((proj, i) => (
                                    <div key={i} className="rb-card">
                                        <div className="rb-card-header">
                                            <span>Project {i + 1}</span>
                                            {resume.projects.length > 1 && (
                                                <button className="rb-remove-btn" onClick={() => removeListItem("projects", i)}>
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                        <div className="rb-field">
                                            <label>Project Name *</label>
                                            <input value={proj.name} onChange={e => updateListItem("projects", i, "name", e.target.value)} placeholder="Project Name" />
                                        </div>
                                        <div className="rb-field">
                                            <label>Technologies</label>
                                            <input value={proj.technologies} onChange={e => updateListItem("projects", i, "technologies", e.target.value)} placeholder="React, Node.js, MongoDB" />
                                        </div>
                                        <div className="rb-field">
                                            <label>Description</label>
                                            <textarea rows={3} value={proj.description} onChange={e => updateListItem("projects", i, "description", e.target.value)} placeholder="Brief project description..." />
                                        </div>
                                        <div className="rb-field">
                                            <label>Link</label>
                                            <input value={proj.link} onChange={e => updateListItem("projects", i, "link", e.target.value)} placeholder="github.com/username/project" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === "certifications" && (
                            <div className="rb-form-section">
                                <div className="rb-section-header">
                                    <h3>Certifications</h3>
                                    <button className="rb-add-btn" onClick={() => addListItem("certifications", emptyCertification)}>
                                        <FaPlus /> Add
                                    </button>
                                </div>
                                {resume.certifications.map((cert, i) => (
                                    <div key={i} className="rb-card">
                                        <div className="rb-card-header">
                                            <span>Certification {i + 1}</span>
                                            {resume.certifications.length > 1 && (
                                                <button className="rb-remove-btn" onClick={() => removeListItem("certifications", i)}>
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                        <div className="rb-field">
                                            <label>Certification Name *</label>
                                            <input value={cert.name} onChange={e => updateListItem("certifications", i, "name", e.target.value)} placeholder="AWS Certified Developer" />
                                        </div>
                                        <div className="rb-field-row">
                                            <div className="rb-field">
                                                <label>Issuer</label>
                                                <input value={cert.issuer} onChange={e => updateListItem("certifications", i, "issuer", e.target.value)} placeholder="Amazon Web Services" />
                                            </div>
                                            <div className="rb-field">
                                                <label>Date</label>
                                                <input value={cert.date} onChange={e => updateListItem("certifications", i, "date", e.target.value)} placeholder="2024" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* RIGHT PANEL — Live Preview */}
                <main className="rb-preview-panel">
                    <div className="rb-preview-toolbar">
                        <span className="rb-live-badge">● Live Preview</span>
                        <div className="rb-zoom-controls">
                            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.05))}>−</button>
                            <span>{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(z => Math.min(1, z + 0.05))}>+</button>
                        </div>
                    </div>
                    <div className="rb-preview-scroll">
                        <div className="rb-preview-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
                            <ResumeTemplate resume={resume} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ResumeBuilder;
