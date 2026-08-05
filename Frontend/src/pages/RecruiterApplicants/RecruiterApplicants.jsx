import "./RecruiterApplicants.css";

import {
    useEffect,
    useState
} from "react";

import axios from "axios";
import { API_BASE_URL, getFullUrl } from "../../config/api";

const RecruiterApplicants = () => {

    const [applications,setApplications] = useState([]);
    const [filteredApplications,setFilteredApplications] = useState([]);
    const [loading,setLoading] = useState(true);
    const [search,setSearch] = useState("");
    const [statusFilter,setStatusFilter] = useState("All");

    const resolveResumeUrl = (url) => {
        return getFullUrl(url);
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




    const isDark =
    localStorage.getItem("theme") === "dark";






    const recruiterId =
    localStorage.getItem("userId");







    const loadApplicants = async()=>{


        try{


            const response = await axios.get(

                `${API_BASE_URL}/api/Application/recruiter/${recruiterId}`

            );


            setApplications(response.data);

            setFilteredApplications(response.data);


        }
        catch(error){

            console.log(error);

        }
        finally{

            setLoading(false);

        }


    };







    useEffect(()=>{


        loadApplicants();


    },[]);









    useEffect(()=>{


        let result=[...applications];



        if(statusFilter !== "All")
        {

            result =
            result.filter(
                app =>
                app.status === statusFilter
            );

        }






        if(search.trim())
        {

            result =
            result.filter(app=>

                app.fullName
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )

            );

        }




        setFilteredApplications(result);



    },[
        search,
        statusFilter,
        applications
    ]);









    const updateStatus = async(
        id,
        status
    )=>{


        try{


            await axios.put(

                `${API_BASE_URL}/api/Application/${id}/status`,

                JSON.stringify(status),

                {
                    headers:{
                        "Content-Type":"application/json"
                    }
                }

            );


            loadApplicants();


        }
        catch(error){

            console.log(error);

        }


    };







    if(loading)
    {

        return(
            <h2 className="loading">
                Loading Applicants...
            </h2>
        )

    }







    return(


<div className={
`recruiter-applicants ${isDark?"dark":""}`
}>




<div className="page-header">

<h1>
Applicants
</h1>

<p>
Manage candidates who applied for your opportunities
</p>


</div>







<div className="stats">



<div className="stat-card">

<h2>
{applications.length}
</h2>

<p>
Total Applicants
</p>

</div>





<div className="stat-card">

<h2>
{
applications.filter(
x=>x.status==="Applied"
).length
}
</h2>

<p>
Applied
</p>

</div>





<div className="stat-card">

<h2>
{
applications.filter(
x=>x.status==="Shortlisted"
).length
}
</h2>

<p>
Shortlisted
</p>

</div>





<div className="stat-card">

<h2>
{
applications.filter(
x=>x.status==="Rejected"
).length
}
</h2>

<p>
Rejected
</p>

</div>





</div>









<div className="filters">


<input

placeholder="Search candidate"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>




<select

value={statusFilter}

onChange={
e=>setStatusFilter(e.target.value)
}

>

<option>
All
</option>

<option>
Applied
</option>

<option>
Shortlisted
</option>

<option>
Rejected
</option>


</select>



</div>









{
filteredApplications.length===0 ?

(

<div className="empty-card">

<h2>
No Applicants Found
</h2>

<p>
No candidates have applied yet.
</p>

</div>

)

:

filteredApplications.map(app=>(



<div 
className="candidate-card"
key={app.applicationId}
>




<div className="candidate-left">


<div className="avatar">

{
app.fullName
?.charAt(0)
}

</div>



<div>


<h2>
{app.fullName}
</h2>


<p>
{app.email}
</p>


<p>
<b>Applied For:</b>
{" "}
{app.opportunityTitle}
</p>


<p>
<b>Company:</b>
{" "}
{app.companyName}
</p>



</div>



</div>







<div className="candidate-middle">


<p>
Applied Date
</p>


<h4>

{
new Date(
app.appliedAt
)
.toLocaleDateString()

}

</h4>



<span className="status">

{app.status}

</span>



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
Shortlist
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


export default RecruiterApplicants;