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



const TrendingOpportunities = () => {


    const navigate = useNavigate();


    const [jobs,setJobs] = useState([]);
    const [internships,setInternships] = useState([]);



    useEffect(()=>{


        const loadOpportunities = async()=>{


            try{


                const response = await axios.get(
                    "http://localhost:5024/api/Opportunities"
                );


                const data=response.data;


                setJobs(
                    data.filter(
                        item=>item.type==="Job"
                    ).slice(0,3)
                );


                setInternships(
                    data.filter(
                        item=>item.type==="Internship"
                    ).slice(0,3)
                );


            }
            catch(error){

                console.log(error);

            }


        };


        loadOpportunities();


    },[]);







    const OpportunityCard=({job})=>{


        return(

        <div className="trend-card">


            <div className="trend-header">


                <Briefcase size={22}/>


                <h2>
                    {job.title}
                </h2>


            </div>




            <h3 className="trend-company">
                {job.companyName}
            </h3>





            <div className="trend-badges">


                <span>
                    {job.type}
                </span>


                <span>
                    {job.employmentType}
                </span>


            </div>






            <div className="trend-details">


                <p>
                    <MapPin size={16}/>
                    {job.location}
                </p>



                <p>
                    <Clock size={16}/>
                    {job.experience || "Fresher"}
                </p>


            </div>







            <div className="trend-skills">


                <b>
                    Skills
                </b>


                <div>


                {
                    job.skills ?

                    job.skills.split(",")
                    .slice(0,4)
                    .map((skill,index)=>(

                        <span key={index}>
                            {skill.trim()}
                        </span>

                    ))

                    :

                    <span>
                        Not specified
                    </span>

                }


                </div>


            </div>









            <div className="trend-salary">


                <IndianRupee size={16}/>

                {
                    job.salary || "Not disclosed"
                }


            </div>








            <div className="trend-deadline">


                <CalendarDays size={16}/>


                Apply before:

                {" "}

                {
                    new Date(
                        job.deadline
                    ).toLocaleDateString()
                }


            </div>







            <button

            onClick={()=>navigate(
                `/opportunity/${job.id}`
            )}

            >

                View Details

            </button>





        </div>

        )


    }









    return(


<div
className={
`trending-page ${
localStorage.getItem("theme")==="dark"
?
"dark"
:
""
}`
}
>



<section>


<div className="trend-title">


<h1>
Trending <span>Jobs</span>
</h1>


</div>




<div className="trend-container">


{

jobs.map(job=>(

<OpportunityCard
key={job.id}
job={job}
/>

))

}



</div>


</section>










<section>


<div className="trend-title">


<h1>
Trending <span>Internships</span>
</h1>


</div>





<div className="trend-container">


{

internships.map(job=>(

<OpportunityCard
key={job.id}
job={job}
/>

))

}


</div>




</section>






</div>


    );


};


export default TrendingOpportunities;