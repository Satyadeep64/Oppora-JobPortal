import "./ViewApplicant.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";


const ViewApplicants = () => {


    const { id } = useParams();


    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);

    const resolveResumeUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
            return url;
        }
        return `http://localhost:5024${url.startsWith("/") ? "" : "/"}${url}`;
    };

    const handleViewResume = (app) => {
        const resumeUrl = app.resume || app.resumeUrl || app.user?.resume;
        if (resumeUrl) {
            window.open(resolveResumeUrl(resumeUrl), "_blank");
        } else if (app.userId) {
            alert(`Candidate ${app.fullName || "Applicant"} has not uploaded a standalone PDF resume yet.`);
        } else {
            alert("No resume available for this applicant.");
        }
    };




    useEffect(() => {


        const getApplicants = async () => {


            try {


                const response = await axios.get(

                    `http://localhost:5024/api/Application/opportunity/${id}`

                );


                console.log(
                    "Applicants:",
                    response.data
                );


                setApplications(response.data);


            }
            catch(error)
            {

                console.log(
                    "Error loading applicants:",
                    error
                );

            }
            finally
            {

                setLoading(false);

            }


        };



        getApplicants();



    },[id]);







    if(loading)
    {

        return(

            <div className="applicant-loading">

                Loading Applicants...

            </div>

        );

    }




const updateStatus = async(applicationId,status)=>{


    try{


        await axios.put(

            `http://localhost:5024/api/Application/${applicationId}/status`,

            status,

            {
                headers:{
                    "Content-Type":"application/json"
                }
            }

        );


        setApplications(prev=>

            prev.map(app=>

                app.applicationId === applicationId

                ?

                {
                    ...app,
                    status:status
                }

                :

                app

            )

        );


    }
    catch(error){

        console.log(
            "Status update error",
            error
        );

    }


};


    return(


        <div

            className={
                localStorage.getItem("theme") === "dark"
                ?
                "applicants-page dark"
                :
                "applicants-page"
            }

        >





            <div className="page-header">


                <h1>
                    Applicants
                </h1>



                <p>
                    Candidates applied for this opportunity
                </p>



            </div>









            {

                applications.length === 0

                ?

                (

                    <div className="empty-card">


                        <h2>
                            No Applicants
                        </h2>


                        <p>
                            No one applied yet.
                        </p>


                    </div>


                )


                :


                applications.map((app)=>(


                    <div

                        className="applicant-card"

                        key={app.applicationId || app.id}

                    >



                        <div className="info">


                            <h2>

                                {
                                    app.fullName ||
                                    "Name Not Available"
                                }

                            </h2>




                            <p>

                                <b>
                                    Email:
                                </b>


                                {" "}


                                {
                                    app.email ||
                                    "Email Not Available"
                                }


                            </p>







                            <p>

                                <b>
                                    Applied For:
                                </b>


                                {" "}


                                {
                                    app.opportunityTitle ||
                                    "Opportunity Not Available"
                                }


                            </p>







                            <p>

                                <b>
                                    Company:
                                </b>


                                {" "}


                                {
                                    app.companyName ||
                                    "Company Not Available"
                                }


                            </p>








                            <p>

                                <b>
                                    Status:
                                </b>


                                <span className="status">


                                    {
                                        app.status
                                    }


                                </span>


                            </p>







                            <p>

                                <b>
                                    Applied Date:
                                </b>


                                {" "}


                                {
                                    new Date(
                                        app.appliedAt
                                    ).toLocaleDateString()
                                }


                            </p>




                        </div>




                        <div className="actions">


                            <button className="resume" onClick={() => handleViewResume(app)} type="button">

                                View Resume

                            </button>




                            <button

className="accept"

onClick={()=>
    updateStatus(
        app.applicationId,
        "Shortlisted"
    )
}

>

Accept

</button>





                            <button

className="reject"

onClick={()=>
    updateStatus(
        app.applicationId,
        "Rejected"
    )
}

>

Reject

</button>



                        </div>





                    </div>



                ))



            }





        </div>



    );

};


export default ViewApplicants;