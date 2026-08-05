import "./RecruiterDashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";


const RecruiterDashboard = () => {


    const navigate = useNavigate();


    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);



    const recruiterId = localStorage.getItem("userId");



    const loadDashboard = async () => {

        try {

            const res = await axios.get(
                `${API_BASE_URL}/api/Dashboard/recruiter/${recruiterId}`
            );


            setDashboard(res.data);


        } catch(error){

            console.log(error);

        }
        finally{

            setLoading(false);

        }

    };





    useEffect(()=>{

        loadDashboard();

    },[]);






    const deleteOpportunity = async(id)=>{


        const confirm = window.confirm(
            "Are you sure you want to delete this opportunity?"
        );


        if(!confirm)
            return;



        try{

            await axios.delete(

                `${API_BASE_URL}/api/Opportunities/${id}`,

                {
                    headers:{
                        Authorization:
                        `Bearer ${localStorage.getItem("token")}`
                    }
                }

            );


            loadDashboard();


        }
        catch(error){

            console.log(error);
            alert("Delete failed");

        }


    };







    if(loading){

        return (

            <div className="loading">

                Loading Dashboard...

            </div>

        );

    }






    if(!dashboard){

        return (

            <div className="loading">

                No Dashboard Data Found

            </div>

        );

    }







    return (

        <div className="dashboard">



            {/* Header */}

            <div className="dashboard-header">

                <h1>
                    Recruiter Dashboard
                </h1>


                <p>
                    Manage your opportunities and connect with talented candidates.
                </p>

            </div>









            {/* Statistics */}

            <div className="stats-container">


                <div className="stat-card">

                    <h2>
                        {dashboard.statistics?.totalJobs || 0}
                    </h2>

                    <p>
                        Total Opportunities
                    </p>

                </div>





                <div className="stat-card">

                    <h2>
                        {dashboard.statistics?.totalApplications || 0}
                    </h2>

                    <p>
                        Applications
                    </p>

                </div>





                <div className="stat-card">

                    <h2>
                        {dashboard.statistics?.activeJobs || 0}
                    </h2>

                    <p>
                        Active Jobs
                    </p>

                </div>





                <div className="stat-card">

                    <h2>
                        {dashboard.statistics?.shortlisted || 0}
                    </h2>

                    <p>
                        Shortlisted
                    </p>

                </div>



            </div>











            {/* Actions */}

            <div className="dashboard-section">


                <h2>
                    Quick Actions
                </h2>



                <div className="quick-actions">


                    <button
                    onClick={()=>navigate("/post-opportunity")}
                    >
                        + Post Opportunity
                    </button>



                    <button
                    onClick={()=>navigate("/manage-opportunities")}
                    >
                        Manage Opportunities
                    </button>



                    <button
                    onClick={()=>navigate("/profile")}
                    >
                        Edit Profile
                    </button>



                </div>


            </div>









            {/* Opportunities */}


            <div className="dashboard-section">


                <h2>
                    Recent Opportunities
                </h2>



                {
                    dashboard.opportunities?.length > 0 ?


                    dashboard.opportunities.map(job=>(


                        <div
                        className="job-item"
                        key={job.id}
                        >


                            <div>


                                <h3>
                                    {job.title}
                                </h3>


                                <p>
                                    {job.companyName}
                                </p>


                                <small>
                                    {job.location} • {job.employmentType}
                                </small>


                            </div>






                            <div className="job-right">


                                <span>
                                    {job.type}
                                </span>



                                <div className="job-actions">


                                    <button
                                    onClick={()=>
                                        navigate(`/edit-opportunity/${job.id}`)
                                    }
                                    >
                                        Edit
                                    </button>




                                    <button
                                    onClick={()=>
                                        navigate(`/recruiter/opportunity/${job.id}/applicants`)
                                    }
                                    >
                                        View Applicants
                                    </button>





                                    <button
                                    onClick={()=>
                                        deleteOpportunity(job.id)
                                    }
                                    >
                                        Delete
                                    </button>


                                </div>


                            </div>



                        </div>


                    ))

                    :

                    <p>
                        No opportunities posted yet.
                    </p>


                }



            </div>












            {/* Applications */}


            <div className="dashboard-section">


                <h2>
                    Recent Applications
                </h2>




                {
                    dashboard.applications?.length > 0 ?


                    dashboard.applications.map(app=>(


                        <div
                        className="application-card"
                        key={app.id}
                        >


                            <div>


                                <h3>
                                    {
                                    app.candidate?.fullName ||
                                    "Candidate"
                                    }
                                </h3>



                                <p>
                                    {
                                    app.opportunity?.title ||
                                    "Opportunity"
                                    }
                                </p>



                                <small>
                                    Status : {app.status}
                                </small>


                            </div>





                            <button
                            onClick={()=>
                                navigate(`/candidate/${app.userId}`)
                            }
                            >

                                View Candidate

                            </button>



                        </div>


                    ))


                    :

                    <p>
                        No applications received yet.
                    </p>


                }



            </div>









            {/* Profile */}


            <div className="dashboard-section profile-box">


                <h2>
                    Recruiter Profile
                </h2>




                <p>

                    <b>Name:</b>{" "}

                    {
                    dashboard.profile?.fullName ||
                    "Not Added"
                    }

                </p>





                <p>

                    <b>Email:</b>{" "}

                    {
                    dashboard.profile?.email ||
                    "Not Added"
                    }

                </p>





                <p>

                    <b>Posted Opportunities:</b>{" "}

                    {
                    dashboard.statistics?.totalJobs || 0
                    }

                </p>



            </div>





        </div>


    );

};


export default RecruiterDashboard;