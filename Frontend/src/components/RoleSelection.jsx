import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaBuilding } from "react-icons/fa";
import "./RoleSelection.css";

const RoleSelection = () => {
    const navigate = useNavigate();

    const selectRole = (role) => {
        localStorage.setItem("selectedRole", role);
        navigate("/login");
    };

    return (
        <div className={`oppora-role-page ${localStorage.getItem("theme") === "dark" ? "dark" : ""}`}>

            <div className="oppora-role-box">

                <div className="oppora-role-header">

                    <h1 className="oppora-role-brand">
                        <span>O</span>PPORA
                    </h1>

                    <h2 className="oppora-role-heading">Choose Your Account</h2>

                    <p className="oppora-role-subtitle">
                        Continue as a Candidate or Recruiter
                    </p>

                </div>

                <div className="oppora-role-container">

                    <div
                        className="oppora-role-card oppora-role-candidate"
                        onClick={() => selectRole("Candidate")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && selectRole("Candidate")}
                    >

                        <div className="oppora-role-icon-badge">
                            <FaUserGraduate className="oppora-role-icon" />
                        </div>

                        <h2 className="oppora-role-card-title">Candidate</h2>

                        <p className="oppora-role-card-text">
                            Discover jobs, internships, hackathons,
                            courses and career opportunities.
                        </p>

                        <button
                            className="oppora-role-btn"
                            onClick={(e) => { e.stopPropagation(); selectRole("Candidate"); }}
                        >
                            Continue as Candidate
                        </button>

                    </div>

                    <div className="oppora-role-divider">
                        <div className="oppora-role-divider-node">OR</div>
                    </div>

                    <div
                        className="oppora-role-card oppora-role-recruiter"
                        onClick={() => selectRole("Recruiter")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && selectRole("Recruiter")}
                    >

                        <div className="oppora-role-icon-badge">
                            <FaBuilding className="oppora-role-icon" />
                        </div>

                        <h2 className="oppora-role-card-title">Recruiter</h2>

                        <p className="oppora-role-card-text">
                            Post jobs, manage applicants and hire
                            talented candidates.
                        </p>

                        <button
                            className="oppora-role-btn"
                            onClick={(e) => { e.stopPropagation(); selectRole("Recruiter"); }}
                        >
                            Continue as Recruiter
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default RoleSelection;