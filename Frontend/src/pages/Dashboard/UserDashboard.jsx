import "./UserDashboard.css";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

import {
    Briefcase,
    Bookmark,
    FileText,
    UserRound,
    Search,
    Clock,
    MapPin,
    CheckCircle
} from "lucide-react";


const MyActivity = () => {


    const navigate = useNavigate();


    const [activity, setActivity] = useState(null);

    const [loading, setLoading] = useState(true);



    useEffect(() => {


        const loadActivity = async () => {


            try {


                const userId =
                    localStorage.getItem("userId");



                const response = await axios.get(

                    `${API_BASE_URL}/api/Dashboard/candidate/${userId}`

                );



                setActivity(response.data);



            }
            catch(error){

                console.log(
                    "Dashboard Error:",
                    error
                );

            }
            finally{

                setLoading(false);

            }


        };



        loadActivity();


    }, []);








    if(loading || !activity){


        return(

            <div className="activity-loading">

                Loading Activity...

            </div>

        );

    }








    return (


        <div

            className={

                `activity-page ${
                    localStorage.getItem("theme") === "dark"
                    ? "dark"
                    : ""
                }`

            }

        >







            {/* HEADER */}


            <div className="activity-header">


                <h1>

                    Welcome, {activity.profile.fullName} 👋

                </h1>



                <p>

                    Track your applications, discover opportunities and grow your career.

                </p>


            </div>









            {/* STATISTICS */}



            <div className="activity-stats">





                <div className="activity-card">


                    <FileText/>


                    <div>

                        <h2>
                            {activity.statistics.appliedJobs}
                        </h2>


                        <p>
                            Applied Jobs
                        </p>


                    </div>


                </div>







                <div className="activity-card">


                    <Bookmark/>


                    <div>

                        <h2>
                            {activity.statistics.savedJobs}
                        </h2>


                        <p>
                            Saved Jobs
                        </p>


                    </div>


                </div>








                <div className="activity-card">


                    <Briefcase/>


                    <div>

                        <h2>
                            {activity.statistics.recommendedJobs}
                        </h2>


                        <p>
                            Recommended Jobs
                        </p>


                    </div>


                </div>








                <div className="activity-card">


                    <UserRound/>


                    <div>

                        <h2>

                            {activity.statistics.profileCompletion}%

                        </h2>


                        <p>
                            Profile Complete
                        </p>


                    </div>


                </div>






            </div>













            {/* QUICK ACTIONS */}



            <div className="activity-section">


                <h2>
                    Quick Actions
                </h2>




                <div className="quick-actions">



                    <button

                        onClick={() =>
                            navigate("/jobs")
                        }

                    >

                        <Search size={18}/>

                        Explore Opportunities


                    </button>







                    <button

                        onClick={() =>
                            navigate("/my-applications")
                        }

                    >

                        <FileText size={18}/>

                        My Applications


                    </button>







                    <button>


                        <Bookmark size={18}/>

                        Saved Jobs


                    </button>







                    <button

                        onClick={() =>
                            navigate("/profile")
                        }

                    >

                        <UserRound size={18}/>

                        Edit Profile


                    </button>



                </div>



            </div>












            {/* RECOMMENDED JOBS */}



            <div className="activity-section">



                <h2>
                    Recommended Opportunities
                </h2>





                <div className="recommended-container">



                {

                    activity.recommendedJobs.length === 0 ?


                    (

                        <p>
                            No opportunities available.
                        </p>

                    )


                    :


                    (

                        activity.recommendedJobs.map((job)=>(


                            <div

                                className="recommended-card"

                                key={job.id}

                            >






                                <div className="job-title">


                                    <Briefcase size={22}/>


                                    <h3>

                                        {job.title}

                                    </h3>



                                </div>







                                <p className="company">

                                    {job.companyName}

                                </p>









                                <div className="job-info">



                                    <span>

                                        <MapPin size={15}/>

                                        {job.location}

                                    </span>







                                    <span>

                                        <Clock size={15}/>

                                        {job.employmentType}

                                    </span>




                                </div>









                                <button

                                    onClick={() =>
                                        navigate(
                                        `/opportunity/${job.id}`
                                        )
                                    }

                                >

                                    View Details


                                </button>







                            </div>



                        ))

                    )


                }



                </div>




            </div>












            {/* RECENT APPLICATIONS */}



            <div className="activity-section">


                <h2>
                    Recent Applications
                </h2>





                {

                    activity.recentApplications.length === 0 ?


                    (

                        <div className="empty-activity">


                            <h3>
                                No applications yet
                            </h3>



                            <p>
                                Start exploring opportunities and apply for jobs.
                            </p>


                        </div>


                    )



                    :



                    (

                        <div className="applications-list">


                        {

                            activity.recentApplications.map((app)=>(



                                <div

                                    className="application-card"

                                    key={app.id}

                                >




                                    <div>


                                        <h3>

                                            {
                                                app.opportunity.title
                                            }

                                        </h3>



                                        <p>

                                            {
                                                app.opportunity.companyName
                                            }

                                        </p>



                                    </div>







                                    <div className="application-status">


                                        <CheckCircle size={18}/>


                                        <span>

                                            {app.status}

                                        </span>


                                    </div>





                                </div>



                            ))

                        }


                        </div>


                    )

                }





            </div>






        </div>


    );


};



export default MyActivity;