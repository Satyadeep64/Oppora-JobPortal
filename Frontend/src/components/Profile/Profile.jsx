import { useState, useEffect } from "react";
import {
    Upload, Edit, User, Phone, MapPin, Briefcase,
    GraduationCap, FileText, Eye,
    Bell, CheckCircle, ExternalLink, Save, X, Globe, Link as LinkIcon
} from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import "./Profile.css";
import axios from "axios";
import { API_BASE_URL, getFullUrl } from "../../config/api";

const Profile = () => {
    const [image, setImage] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [hidePopup, setHidePopup] = useState(false);
    const [userNotifications, setUserNotifications] = useState([]);

    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        role: "",
        phone: "",
        location: "",
        title: "",
        bio: "",
        linkedIn: "",
        github: "",
        education: "",
        skills: [],
        profileImage: null,
        resume: null
    });

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/Profile/${userId}`
                );
                const data = response.data;
                setProfile({
                    fullName: data.fullName || "",
                    email: data.email || "",
                    role: data.role || "",
                    phone: data.phone || "",
                    location: data.location || "",
                    title: data.title || "",
                    bio: data.bio || "",
                    linkedIn: data.linkedIn || "",
                    github: data.github || "",
                    education: data.education || "",
                    skills: data.skills ? data.skills.split(",").filter(Boolean) : [],
                    profileImage: data.profileImage || null,
                    resume: data.resume || null
                });
                if (data.profileImage) {
                    setImage(data.profileImage);
                }
            } catch (error) {
                console.log("Error loading profile:", error);
            }
        };

        const getNotifications = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/Notification/${userId}`);
                setUserNotifications(res.data.notifications || []);
            } catch {
                /* ignore */
            }
        };

        if (userId) {
            getProfile();
            getNotifications();
        }
    }, [userId]);

    const handleImage = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/Profile/upload-image/${userId}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                const uploadedUrl = response.data.image || response.data.imageUrl;
                setImage(uploadedUrl);
                setProfile(prev => ({ ...prev, profileImage: uploadedUrl }));
                alert("Profile Image Uploaded Successfully");
            } catch (error) {
                console.log("Upload Error:", error);
                alert("Image Upload Failed");
            }
        }
    };

    const handleResume = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/Profile/upload-resume/${userId}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                const uploadedUrl = response.data.resume || response.data.resumeUrl;
                setResumeFile(file);
                setProfile(prev => ({ ...prev, resume: uploadedUrl }));
                setShowPdfPreview(true);
                alert("Resume Uploaded Successfully");
            } catch (error) {
                console.log("Resume Upload Error:", error);
                alert("Resume Upload Failed");
            }
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const saveProfile = async () => {
        try {
            await axios.put(
                `${API_BASE_URL}/api/Profile/${userId}`,
                {
                    fullName: profile.fullName,
                    email: profile.email,
                    phone: profile.phone,
                    location: profile.location,
                    title: profile.title,
                    bio: profile.bio,
                    linkedIn: profile.linkedIn,
                    github: profile.github,
                    education: profile.education,
                    skills: profile.skills.join(",")
                }
            );
            setIsEditing(false);
            alert("Profile Updated Successfully");
        } catch (error) {
            console.log("Save Profile Error:", error);
            alert("Profile Update Failed");
        }
    };

    const calculateCompletion = () => {
        let completed = 0;
        if (profile.fullName) completed += 10;
        if (profile.email) completed += 10;
        if (profile.profileImage) completed += 15;
        if (profile.phone) completed += 10;
        if (profile.location) completed += 10;
        if (profile.title) completed += 10;
        if (profile.bio) completed += 10;
        if (profile.skills.length > 0) completed += 15;
        if (profile.resume) completed += 10;
        return Math.min(100, completed);
    };

    const resolveResumeUrl = (url) => {
        return getFullUrl(url);
    };

    const completion = calculateCompletion();
    const showPopup = completion < 100 && !hidePopup;

    return (
        <div className="profile-page">
            <div className="profile-card">
                {/* Header Section */}
                <div className="profile-header">
                    <div className="image-wrapper">
                        {image ? (
                            <img src={image} className="profile-image" alt="Profile" />
                        ) : (
                            <div className="profile-placeholder">
                                <User size={60} />
                            </div>
                        )}
                        <label className="upload-image" title="Upload Profile Picture">
                            <Upload size={18} />
                            <input hidden type="file" accept="image/*" onChange={handleImage} />
                        </label>
                    </div>

                    <h1>{profile.fullName || "Your Full Name"}</h1>
                    <p className="profile-sub-title">{profile.title || "Add your professional title"}</p>
                    <p className="email">{profile.email}</p>
                    <span className="role">{profile.role || "Candidate"}</span>
                </div>

                {/* Profile Completion Bar */}
                <div className="section">
                    <div className="completion">
                        <span>Profile Completion</span>
                        <span>{completion}%</span>
                    </div>
                    <div className="progress-container">
                        <div className="progress" style={{ width: `${completion}%` }}></div>
                    </div>
                </div>

                {/* Notifications Center (Limited to 5) */}
                <div className="section notifications-center-section">
                    <div className="section-heading">
                        <h2 className="section-title-with-icon">
                            <Bell size={22} className="icon-blue" />
                            Notifications Center
                        </h2>
                    </div>
                    <div className="notifications-list">
                        {userNotifications.length > 0 ? (
                            userNotifications.slice(0, 5).map(n => (
                                <div key={n.id} className="notification-item">
                                    <CheckCircle size={18} className="icon-green" />
                                    <div>
                                        <strong>{n.title}</strong>
                                        <p>{n.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-skills">No new notifications yet.</p>
                        )}
                    </div>
                </div>

                {/* Personal Information & Additional Fields */}
                <div className="section">
                    <div className="section-heading">
                        <h2>Personal Information & Details</h2>
                        <button
                            className="edit-btn"
                            onClick={isEditing ? saveProfile : () => setIsEditing(true)}
                        >
                            {isEditing ? <Save size={18} /> : <Edit size={18} />}
                            {isEditing ? "Save Profile" : "Edit Details"}
                        </button>
                    </div>

                    <div className="info-grid">
                        {isEditing ? (
                            <>
                                <div className="field-group">
                                    <label>Full Name *</label>
                                    <input
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Email *</label>
                                    <input
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Professional Title</label>
                                    <input
                                        value={profile.title}
                                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                        placeholder="Full Stack Software Engineer"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Phone Number</label>
                                    <input
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Location</label>
                                    <input
                                        value={profile.location}
                                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                        placeholder="Bangalore, India"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>Highest Education</label>
                                    <input
                                        value={profile.education}
                                        onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                                        placeholder="B.Tech in Computer Science"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>LinkedIn Profile</label>
                                    <input
                                        value={profile.linkedIn}
                                        onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>

                                <div className="field-group">
                                    <label>GitHub / Portfolio</label>
                                    <input
                                        value={profile.github}
                                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                                        placeholder="https://github.com/username"
                                    />
                                </div>

                                <div className="field-group full-width">
                                    <label>Professional Bio / Summary</label>
                                    <textarea
                                        rows={4}
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        placeholder="Brief summary of your technical background, career goals, and experience..."
                                    />
                                </div>

                                <div className="field-group full-width">
                                    <label>Add Skill</label>
                                    <div className="skill-input">
                                        <input
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                                            placeholder="Type a skill and press Enter (e.g. React, .NET 8, C#)"
                                        />
                                        <button type="button" onClick={addSkill}>Add</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="info-box">
                                    <span className="info-label"><User size={16} /> Full Name</span>
                                    <p className="info-value">{profile.fullName || "Not provided"}</p>
                                </div>

                                <div className="info-box">
                                    <span className="info-label"><Briefcase size={16} /> Professional Title</span>
                                    <p className="info-value">{profile.title || "Not provided"}</p>
                                </div>

                                <div className="info-box">
                                    <span className="info-label"><Phone size={16} /> Phone Number</span>
                                    <p className="info-value">{profile.phone || "Not provided"}</p>
                                </div>

                                <div className="info-box">
                                    <span className="info-label"><MapPin size={16} /> Location</span>
                                    <p className="info-value">{profile.location || "Not provided"}</p>
                                </div>

                                <div className="info-box">
                                    <span className="info-label"><GraduationCap size={16} /> Education</span>
                                    <p className="info-value">{profile.education || "Not provided"}</p>
                                </div>

                                <div className="info-box">
                                    <span className="info-label"><FaLinkedin size={16} /> LinkedIn</span>
                                    <p className="info-value">
                                        {profile.linkedIn ? (
                                            <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="link-text">
                                                {profile.linkedIn} <ExternalLink size={14} />
                                            </a>
                                        ) : "Not provided"}
                                    </p>
                                </div>

                                <div className="info-box">
                                    <span className="info-label"><FaGithub size={16} /> GitHub / Portfolio</span>
                                    <p className="info-value">
                                        {profile.github ? (
                                            <a href={profile.github} target="_blank" rel="noreferrer" className="link-text">
                                                {profile.github} <ExternalLink size={14} />
                                            </a>
                                        ) : "Not provided"}
                                    </p>
                                </div>

                                {profile.bio && (
                                    <div className="info-box full-width">
                                        <span className="info-label"><FileText size={16} /> Bio / Summary</span>
                                        <p className="info-value bio-text">{profile.bio}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Skills Tags */}
                    <div className="skills-section">
                        <h4>Skills & Expertise</h4>
                        <div className="skills">
                            {profile.skills.length > 0 ? (
                                profile.skills.map((skill) => (
                                    <span key={skill} className="skill-tag">
                                        {skill}
                                        {isEditing && (
                                            <button type="button" onClick={() => removeSkill(skill)}>
                                                <X size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))
                            ) : (
                                <p className="no-skills">No skills added yet. Click Edit Details to add skills.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resume Upload & Live Real-Time Preview Section */}
                <div className="section resume-section">
                    <div className="section-heading">
                        <h2>Resume / CV Management</h2>
                        {profile.resume && (
                            <span className="badge-verified">
                                <CheckCircle size={16} /> Uploaded & Verified
                            </span>
                        )}
                    </div>

                    {profile.resume ? (
                        <div className="uploaded-resume-card">
                            <div className="ur-header">
                                <div className="ur-info">
                                    <FileText size={36} className="pdf-icon" />
                                    <div>
                                        <h4>{resumeFile ? resumeFile.name : "Your Uploaded Resume (PDF)"}</h4>
                                        <p className="ur-url">{profile.resume}</p>
                                    </div>
                                </div>
                                <div className="ur-actions">
                                    <a
                                        href={resolveResumeUrl(profile.resume)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary"
                                    >
                                        <ExternalLink size={16} /> Open PDF
                                    </a>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => setShowPdfPreview(!showPdfPreview)}
                                    >
                                        <Eye size={16} /> {showPdfPreview ? "Hide Preview" : "Preview Resume"}
                                    </button>
                                    <label className="btn-outline-upload">
                                        <Upload size={16} /> Re-upload
                                        <input hidden type="file" accept=".pdf" onChange={handleResume} />
                                    </label>
                                </div>
                            </div>

                            {/* Live PDF Viewer Iframe */}
                            {showPdfPreview && (
                                <div className="pdf-preview-box">
                                    <div className="pdf-preview-header">
                                        <span>Live PDF Document Preview</span>
                                        <button onClick={() => setShowPdfPreview(false)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <iframe
                                        src={resolveResumeUrl(profile.resume)}
                                        className="resume-pdf-iframe"
                                        title="Uploaded Resume Preview"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <label className="resume-box">
                                <Upload size={40} />
                                <p>Upload your CV (PDF format)</p>
                                <span className="resume-box-hint">Click to select and preview document</span>
                                <input hidden type="file" accept=".pdf" onChange={handleResume} />
                            </label>
                            <div style={{ textAlign: 'center' }}>
                                <a href="/resume-builder" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
                                    <FileText size={18} /> Or Create / View Resume with Resume Builder →
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Completion Modal Popup */}
            {showPopup && (
                <div className="profile-popup-overlay">
                    <div className="profile-popup">
                        <h2>Complete Your Profile</h2>
                        <p>
                            Your profile is currently <b>{completion}%</b> complete.
                        </p>
                        <p>Complete your details to unlock full features and top opportunities.</p>
                        <div className="popup-buttons">
                            <button
                                className="complete-btn"
                                onClick={() => {
                                    setIsEditing(true);
                                    setHidePopup(true);
                                }}
                            >
                                Complete Now
                            </button>
                            <button className="later-btn" onClick={() => setHidePopup(true)}>
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;