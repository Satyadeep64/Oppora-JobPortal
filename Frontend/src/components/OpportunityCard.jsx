import {
    Briefcase,
    MapPin,
    Clock,
    IndianRupee,
    CalendarDays
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const OpportunityCard = ({job}) => {
    const navigate = useNavigate();

    const logoUrl = job?.companyLogo
        ? (job.companyLogo.startsWith("http") ? job.companyLogo : `http://localhost:5024${job.companyLogo.startsWith('/') ? '' : '/'}${job.companyLogo}`)
        : null;

    return (
        <div className="job-card">
            {logoUrl && (
                <img
                    src={logoUrl}
                    alt={job.companyName}
                    className="company-logo"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                    }}
                />
            )}
            <div className="job-card-header">
                <Briefcase size={22}/>
                <h2>
                    {job.title}
                </h2>
            </div>




            <h3 className="company-name">

                Company: {job.companyName}

            </h3>





            <div className="job-badges">


                <span>
                    {job.type}
                </span>


                <span>
                    {job.employmentType}
                </span>


            </div>





            <div className="job-details">


                <p>

                    <MapPin size={16}/>

                    {job.location}

                </p>




                <p>

                    <Clock size={16}/>

                    {job.experience || "Fresher"}

                </p>



            </div>







            <div className="skills-box">


                <b>
                    Skills
                </b>



                <div className="skill-tags">


                {
                    job.skills ?

                    job.skills.split(",").map(
                        (skill,index)=>(

                            <span key={index}>
                                {skill.trim()}
                            </span>

                        )
                    )

                    :

                    <span>
                        Not specified
                    </span>

                }


                </div>


            </div>







            <div className="salary-box">

                <IndianRupee size={16}/>

                {
                    job.salary || 
                    "Salary not disclosed"
                }

            </div>






            <div className="deadline-box">


                <CalendarDays size={16}/>


                Apply before:


                {
                    new Date(
                        job.deadline
                    ).toLocaleDateString()
                }


            </div>






            <button

            className="view-details-btn"

            onClick={()=>navigate(
                `/opportunity/${job.id}`
            )}

            >

                View Details

            </button>




        </div>

    )

}


export default OpportunityCard;