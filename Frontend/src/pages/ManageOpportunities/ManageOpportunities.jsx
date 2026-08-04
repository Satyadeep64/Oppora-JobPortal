import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import {
    Briefcase,
    MapPin,
    Clock,
    Pencil,
    Trash2,
    Plus,
    Users,
    CalendarDays,
    IndianRupee
} from "lucide-react";


import "./ManageOpportunities.css";


const ManageOpportunities = () => {
    const location = useLocation();


    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);


    const navigate = useNavigate();




    const loadJobs = async () => {

        try {

            const recruiterId =
                localStorage.getItem("userId");


            const response = await axios.get(
    `http://localhost:5024/api/Opportunities/recruiter/${recruiterId}`,
    {
        headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
        }
    }
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





useEffect(()=>{

    loadJobs();

},[location.pathname]);








    const deleteOpportunity = async(id)=>{


        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this opportunity?"
            );


        if(!confirmDelete)
            return;



        try{


            const token =
                localStorage.getItem("token");



            await axios.delete(

                `http://localhost:5024/api/Opportunities/${id}`,

                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }

            );



            setJobs(
                jobs.filter(
                    job=>job.id !== id
                )
            );


        }
        catch(error){

            console.log(error);

            alert("Failed to delete opportunity");

        }


    };









    if(loading){

        return (

            <div className="manage-loading">

                Loading opportunities...

            </div>

        );

    }








    return (

        <div 
            className={
                `manage-page ${
                    localStorage.getItem("theme")==="dark"
                    ? "dark"
                    :""
                }`
            }
        >



            {/* Header */}

            <div className="manage-header">


                <h1>
                    Manage Opportunities
                </h1>


                <p>
                    Track, update and manage your posted jobs and internships.
                </p>


            </div>








            {/* Post Button */}

            <div className="add-job-section">


                <button

                    className="add-job-btn"

                    onClick={()=>
                        navigate("/post-opportunity")
                    }

                >

                    <Plus size={20}/>

                    Post New Opportunity


                </button>


            </div>









            {/* Cards */}


            <div className="jobs-container">



            {
                jobs.length === 0 ?


                (

                    <div className="empty-box">

                        <h2>
                            No Opportunities Posted
                        </h2>

                        <p>
                            Start posting jobs and internships to find candidates.
                        </p>


                    </div>

                )



                :



                jobs.map((job)=>(


                    <div 
                        className="job-card"
                        key={job.id}
                    >

                          <img
        src={
            job.companyLogo
            ? (job.companyLogo.startsWith("http") ? job.companyLogo : `http://localhost:5024${job.companyLogo.startsWith('/') ? '' : '/'}${job.companyLogo}`)
            : "/default-company.png"
        }
        alt={job.companyName}
        className="company-logo"
        onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none";
        }}
    />
         



                        {/* Title */}


                        <div className="job-title">


                            <Briefcase size={22}/>


                            <h2>
                                {job.title}
                            </h2>


                        </div>






                        <p className="company">

                            {job.companyName}

                        </p>







                        {/* Badges */}


                        <div className="badge-row">


                            <span className="job-type">

                                {job.type}

                            </span>



                            <span className="employment">

                                {job.employmentType}

                            </span>


                        </div>








                        {/* Location + Experience */}


                        <div className="job-info">



                            <span>

                                <MapPin size={17}/>

                                {job.location}

                            </span>




                            <span>

                                <Clock size={17}/>

                                {job.experience || "Fresher"}

                            </span>



                        </div>









                        {/* Details */}


                        <div className="details">


                            <p>

                                <b>Skills:</b>

                                {" "}

                                {job.skills || "Not specified"}

                            </p>




                            <p>


                                <IndianRupee size={15}/>

                                <b>Salary:</b>

                                {" "}

                                {job.salary || "Not disclosed"}


                            </p>






                            <p>


                                <Users size={15}/>

                                <b>Openings:</b>

                                {" "}

                                {job.openings}


                            </p>






                            <p>


                                <CalendarDays size={15}/>

                                <b>Deadline:</b>

                                {" "}

                                {
 job.deadline
 ? new Date(job.deadline).toLocaleDateString()
 : "Not specified"
}


                            </p>



                        </div>









                        {/* Actions */}



                        <div className="job-actions">



                            <button

                                className="edit-btn"

                                onClick={()=>
                                    navigate(
                                    `/edit-opportunity/${job.id}`
                                    )
                                }

                            >

                                <Pencil size={17}/>

                                Edit


                            </button>







                            <button

                                className="delete-btn"

                                onClick={()=>
                                    deleteOpportunity(job.id)
                                }

                            >

                                <Trash2 size={17}/>

                                Delete


                            </button>



                        </div>





                    </div>


                ))

            }



            </div>




        </div>


    );


};



export default ManageOpportunities;