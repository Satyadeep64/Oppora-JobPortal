
import { LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
    FaHome,
    FaBriefcase,
    FaGraduationCap,
    FaTrophy,
    FaUserTie,
    FaClipboardCheck,
    FaCode,
    FaBook,
    FaChartLine, 
    FaUser,
    FaGift,
    FaBookOpen,
    FaAward,
    FaRoute,
    FaCog,
    FaPlus
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();

    const role = localStorage.getItem("userRole");


    const isRecruiter = role === "Recruiter";


    return (
        <div className="sidebar">
            
            {role === "Recruiter" && (
            <button className="post-btn" onClick={()=>navigate("/post-opportunity")}>
                <FaPlus/>
                {isRecruiter ? "Post Opportunity" : "Explore"}
            </button>
            )}
           {role === "Candidate" && (
    <button 
        className="post-btn" 
        onClick={() => navigate("/jobs")}
    >
        <FaPlus />
        Explore
    </button>
)}
            

            <div className="menu">

                <NavLink to={isRecruiter ? "/home" : "/home"}>
                    <FaHome/>
                    Home
                </NavLink>
                
               {role === "Recruiter" && (
    <NavLink to="/dashboard/recruiter" className="nav-link" onClick={()=>navigate("/RecruiterDashboard")}>
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
    </NavLink>
)}


                {isRecruiter && (
    <NavLink to="/manage-opportunities">
        <FaGraduationCap />
        <span>Manage Jobs</span>
    </NavLink>
)}


                {!isRecruiter && (
    <NavLink to="/jobs">
        <FaBriefcase/>
        Jobs
    </NavLink>)}


     <NavLink 
    to={isRecruiter ? "/recruiter/applicants" : "/competitions"}
    ><FaTrophy/>{isRecruiter ? "Applicants" : "Competitions"}
    </NavLink>


                <NavLink to="/resume-builder">
                    <FaUserTie/>
                    Resume Builder
                </NavLink>


                <NavLink to={isRecruiter ? "/interviews" : "/mock-tests"}>
                    <FaClipboardCheck/>
                    {isRecruiter ? "Schedule Interviews" : "Mock Tests"}
                </NavLink>


                <NavLink to={isRecruiter ? "/candidate-search" : "/mock-interview"}>
                    <FaUserTie/>
                    {isRecruiter ? "Find Candidates" : "AI Mock Interview"}
                </NavLink>


               {
    !isRecruiter && (
        <NavLink to="/dsa-sheet">
            <FaCode />
            DSA Sheet
        </NavLink>
    )
}


                <NavLink to={isRecruiter ? "/courses" : "/courses"}>
                    <FaBook/>
                    Courses
                </NavLink>


            </div>


            <hr/>


            <div className="menu">

                <h5>
                    {isRecruiter ? "Recruitment Activity" : "My Activity"}
                </h5>


                {!isRecruiter && (<NavLink to="/my-activity"><FaChartLine />My Activity</NavLink>)}

            </div>



            <hr/>


            <div className="menu">

                <h5>
                    Other
                </h5>


                {!isRecruiter ? (
                    <NavLink to="/blogs">
                        <FaBookOpen />
                        Candidate Blogs
                    </NavLink>
                ) : (
                    <NavLink to="/referrals">
                        <FaGift />
                        Referrals
                    </NavLink>
                )}


                <NavLink to="/career-path">
                    <FaRoute/>
                    Career Path
                </NavLink>


                <NavLink to="/settings">
                    <FaCog/>
                    Settings
                </NavLink>


            </div>


        </div>
    )
}


export default Sidebar;