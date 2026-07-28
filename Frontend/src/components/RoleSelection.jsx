import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaBuilding } from "react-icons/fa";


const RoleSelection =()=>{
const navigate = useNavigate();
const selectRole=(role)=>{
localStorage.setItem(
"selectedRole",
role
);
navigate("/login");
}
return (
<div className="role-page">

    <div className="role-box">

        <div className="role-header">

            <h1 className="brand-logo">
                <span>O</span>PPORA
            </h1>

            <h2>
                Choose Your Account
            </h2>

            <p className="role-subtitle">
                Continue as a Candidate or Recruiter
            </p>

        </div>

        <div className="role-container">

            <div
                className="role-card candidate"
                onClick={() => selectRole("Candidate")}
            >

                <FaUserGraduate className="role-icon"/>

                <h2>Candidate</h2>

                <p>
                    Discover jobs, internships, hackathons,
                    courses and career opportunities.
                </p>

                <button>
                    Continue as Candidate
                </button>

            </div>

            <div
                className="divider">
                OR
            </div>

            <div
                className="role-card recruiter"
                onClick={() => selectRole("Recruiter")}
            >

                <FaBuilding className="role-icon"/>

                <h2>Recruiter</h2>

                <p>
                    Post jobs, manage applicants and hire
                    talented candidates.
                </p>

                <button>
                    Continue as Recruiter
                </button>

            </div>

        </div>

    </div>

</div>
);
}
export default RoleSelection;