import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
    MapPin,
    Briefcase,
    Clock,
    IndianRupee,
    CalendarDays,
    Users,
    ArrowLeft,
    CheckCircle
} from "lucide-react";

import "./OpportunityDetails.css";


const OpportunityDetails = () => {


    const { id } = useParams();

    const navigate = useNavigate();

    const [applying,setApplying] = useState(false);
    const [opportunity,setOpportunity] = useState(null);

    const [loading,setLoading] = useState(true);


    const [darkMode,setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

const handleApply = async()=>{

    const userId = localStorage.getItem("userId");


    if(!userId)
    {
        alert("Please login first");
        navigate("/login");
        return;
    }


    try{

        const response = await axios.post(
            "http://localhost:5024/api/Application/apply",
            {
                userId: Number(userId),
                opportunityId: opportunity.id
            }
        );


        alert(response.data.message);


    }
    catch(error){

    console.log(error.response.data);
    console.log(error.response.data.errors);

    alert(JSON.stringify(error.response.data.errors, null, 2));


    }

};

    useEffect(()=>{

        const themeListener = ()=>{

            setDarkMode(
                localStorage.getItem("theme") === "dark"
            );

        };


        window.addEventListener(
            "storage",
            themeListener
        );


        return ()=>{

            window.removeEventListener(
                "storage",
                themeListener
            );

        }


    },[]);





    useEffect(()=>{


        const fetchOpportunity = async()=>{


            try{


                const response = await axios.get(
                    `http://localhost:5024/api/Opportunities/${id}`
                );


                setOpportunity(response.data);


            }
            catch(error){

                console.log(error);

            }
            finally{

                setLoading(false);

            }


        };


        fetchOpportunity();


    },[id]);






    if(loading)
    {
        return(
            <div className={`loading ${darkMode?"dark":""}`}>
                Loading opportunity...
            </div>
        )
    }





    if(!opportunity)
    {
        return(
            <div className={`loading ${darkMode?"dark":""}`}>
                Opportunity not found
            </div>
        )
    }







return(

<div 
className={
`opportunity-page ${
darkMode ? "dark" : ""
}`
}
>



<div className="opportunity-container">





<button 
className="back-btn"
onClick={()=>navigate(-1)}
>

<ArrowLeft size={18}/>

Back to Opportunities

</button>







<div className="opportunity-card">






<div className="opportunity-hero">


<div>


<h1>
{opportunity.title}
</h1>


<h3>
{opportunity.companyName}
</h3>



<p className="tagline">

Build your career with exciting opportunities and industry experience.

</p>



</div>





<div className="hero-icon">

<Briefcase size={55}/>

</div>



</div>








<div className="details-grid">



<div className="detail-box">

<MapPin/>

<div>

<p>Location</p>

<strong>
{opportunity.location}
</strong>

</div>

</div>







<div className="detail-box">

<Clock/>

<div>

<p>Experience</p>

<strong>
{opportunity.experience || "Fresher"}
</strong>

</div>

</div>







<div className="detail-box">

<Briefcase/>

<div>

<p>Employment</p>

<strong>
{opportunity.employmentType}
</strong>

</div>

</div>







<div className="detail-box">

<IndianRupee/>

<div>

<p>Salary</p>

<strong>
{opportunity.salary || "Not Disclosed"}
</strong>

</div>

</div>




</div>









<div className="opportunity-section">


<h2>
About this opportunity
</h2>


<p className="description">

{opportunity.description}

</p>


<p className="description">

This opportunity provides a chance to work on real-world projects,
improve technical skills and collaborate with experienced professionals.

</p>


</div>









<div className="opportunity-section">


<h2>
Required Skills
</h2>



<div className="skills-container">


{
opportunity.skills?.split(",").map(
(skill,index)=>(

<span 
className="skill"
key={index}
>

{skill.trim()}

</span>

)

)

}


</div>


</div>









<div className="opportunity-section">


<h2>
What you will do
</h2>


<ul className="points">


<li>
<CheckCircle/>
Work on assigned projects and tasks.
</li>


<li>
<CheckCircle/>
Learn industry level development practices.
</li>


<li>
<CheckCircle/>
Collaborate with team members.
</li>


<li>
<CheckCircle/>
Improve technical skills.
</li>


</ul>


</div>









<div className="opportunity-section">


<h2>
Eligibility
</h2>


<div className="eligibility">



<p>

<Users size={18}/>

Openings:

<b>
{opportunity.openings}
</b>

</p>





<p>

<CalendarDays size={18}/>

Apply before:

<b>

{
new Date(
opportunity.deadline
).toLocaleDateString()
}

</b>


</p>



</div>


</div>









<div className="apply-section">


<h2>
Interested in this opportunity?
</h2>


<p>
Submit your application and take the next step towards your career.
</p>


<button 
className="apply-btn"
onClick={handleApply}
>
Apply Now
</button>


</div>








</div>



</div>


</div>


);


};


export default OpportunityDetails;