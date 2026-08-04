import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    Briefcase,
    MapPin,
    Clock,
    IndianRupee,
    CalendarDays
} from "lucide-react";

import "./Jobs.css";


const Jobs = () => {
    const navigate = useNavigate();


    const [jobs,setJobs] = useState([]);

    const [loading,setLoading] = useState(true);


    useEffect(()=>{


        const loadJobs = async()=>{


            try{


                const response = await axios.get(
                    "http://localhost:5024/api/Opportunities"
                );


                setJobs(response.data);


            }
            catch(error){

                console.log(error);

            }
            finally{

                setLoading(false);

            }


        };


        loadJobs();


    },[]);






    if(loading){

        return(

            <div className="jobs-loading">

                Loading opportunities...

            </div>

        );

    }






    return(


        <div
        className={
            `jobs-page ${
                localStorage.getItem("theme")==="dark"
                ?
                "dark"
                :
                ""
            }`
        }
        >





            {/* Header */}


            <div className="jobs-header">


                <h1>
                    Explore Opportunities
                </h1>


                <p>
                    Find jobs and internships that match your skills.
                </p>


            </div>








            <div className="jobs-container">



            {
                jobs.length===0 ?


                (

                    <div className="empty-jobs">

                        <h2>
                            No opportunities available
                        </h2>

                    </div>

                )


                :


                jobs.map((job)=>(


                    <div
                    className="job-card"
                    key={job.id}
                    >



                        {/* Title */}


                        <div className="job-card-header">


                            <Briefcase size={22}/>


                            <h2>
                                {job.title}
                            </h2>


                        </div>






                        <h3 className="company-name">

                           Company: {job.companyName}

                        </h3>







                        {/* Badges */}


                        <div className="job-badges">


                            <span>

                                {job.type}

                            </span>


                            <span>

                                {job.employmentType}

                            </span>


                        </div>








                        {/* Details */}


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








                        {/* Skills */}


                        <div className="skills-box">


                            <b>
                                Skills
                            </b>


                            <div className="skill-tags">


                            {
                                job.skills
                                ?
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








                        {/* Salary */}


                        <div className="salary-box">


                            <IndianRupee size={16}/>


                            {
                                job.salary || "Salary not disclosed"
                            }


                        </div>








                        {/* Deadline */}


                        <div className="deadline-box">


                            <CalendarDays size={16}/>


                            Apply before:


                            {
                                new Date(
                                    job.deadline
                                ).toLocaleDateString()
                            }


                        </div>







<button className="view-details-btn"
    onClick={() =>
        navigate(`/opportunity/${job.id}`)
    }
>
    View Details
</button>





                    </div>


                ))

            }



            </div>





        </div>


    );


};


export default Jobs;