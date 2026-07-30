

import { useState } from "react";
import "./PostOpportunity.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const PostOpportunity = () => {


const navigate = useNavigate();


const [type,setType] = useState("Job");


const [logo,setLogo] = useState(null);



const [form,setForm] = useState({

    title:"",

    company:"",

    location:"",

    experience:"",

    employmentType:"Full Time",

    skills:"",

    description:"",

    salary:"",

    openings:"",

    deadline:""

});





const handleChange = (e)=>{


    setForm({

        ...form,

        [e.target.name]:e.target.value

    });


};







const handleSubmit = async(e)=>{


e.preventDefault();



try{


const token = localStorage.getItem("token");


const recruiterId = localStorage.getItem("userId");



if(!token){

    alert("Login required");

    return;

}






const data = new FormData();



// Opportunity details


data.append(
"Title",
form.title
);


data.append(
"CompanyName",
form.company
);


data.append(
"Type",
type
);



data.append(
"Location",
form.location
);



data.append(
"EmploymentType",
form.employmentType
);



data.append(
"Experience",
form.experience
);



data.append(
"Skills",
form.skills
);



data.append(
"Description",
form.description
);



data.append(
"Salary",
form.salary
);

data.append(
"Openings",
Number(form.openings)
);



data.append(
"Deadline",
form.deadline
);



data.append(
"RecruiterId",
Number(recruiterId)
);





// Company logo upload

if(logo){

    data.append(
        "CompanyLogo",
        logo
    );

}




console.log("TOKEN:", token);

const response = await axios.post(

"http://localhost:5024/api/Opportunities",

data,

{

headers:{

Authorization:`Bearer ${token}`,

//"Content-Type":"multipart/form-data"

}

}

);





alert(
response.data.message || "Opportunity posted successfully"
);







// reset form


setForm({

title:"",

company:"",

location:"",

experience:"",

employmentType:"Full Time",

skills:"",

description:"",

salary:"",

openings:"",

deadline:""

});



setLogo(null);






navigate("/recruiter/dashboard");





}

catch(error){



console.log(
"API ERROR:",
error.response?.data
);



if(error.response?.status===401){


alert(
"Unauthorized. Please login again."
);


}

else{


alert(
"Failed to post opportunity"
);


}


}



};









return(


<div className="post-page">


<div className="recruiter-header">


<h1>
Recruiter Portal
</h1>


<p>
Create and publish opportunities to reach thousands of talented candidates.
</p>


</div>







<div className="post-card">


<h2>
Post Opportunity
</h2>



<p className="post-subtitle">

Create a new {type.toLowerCase()} opportunity for candidates.

</p>








<div className="type-buttons">


<button

type="button"

className={
type==="Job"
?
"active-type"
:
""
}

onClick={()=>setType("Job")}

>

Job

</button>





<button

type="button"

className={
type==="Internship"
?
"active-type"
:
""
}

onClick={()=>setType("Internship")}

>

Internship

</button>



</div>









<form onSubmit={handleSubmit}>


<input

name="title"

placeholder={`${type} Title`}

value={form.title}

onChange={handleChange}

required

/>







<input

name="company"

placeholder="Company Name"

value={form.company}

onChange={handleChange}

required

/>





<div className="logo-upload">
    <label id="card-logo">
        Company Logo
    </label>

    <input
        type="file"
        accept="image/*"
        onChange={(e) => setLogo(e.target.files[0])}
    />
</div>







<input

name="location"

placeholder="Location"

value={form.location}

onChange={handleChange}

required

/>








<select

name="employmentType"

value={form.employmentType}

onChange={handleChange}

>


<option>
Full Time
</option>


<option>
Part Time
</option>


<option>
Remote
</option>


<option>
Hybrid
</option>


<option>
On Site
</option>


</select>








<input

name="experience"

placeholder="Experience (Fresher / 1-3 Years)"

value={form.experience}

onChange={handleChange}

/>








<input

name="skills"

placeholder="Required Skills (React, .NET, SQL...)"

value={form.skills}

onChange={handleChange}

required

/>









<input

name="openings"

type="number"

placeholder="Number of Openings"

value={form.openings}

onChange={handleChange}

/>








<input

name="salary"

placeholder={
type==="Job"
?
"Annual Salary (e.g. ₹8 LPA)"
:
"Monthly Stipend (e.g. ₹25,000)"
}

value={form.salary}

onChange={handleChange}

/>









<textarea

name="description"

placeholder={
`Describe the ${type.toLowerCase()}, responsibilities, eligibility and benefits`
}

rows={6}

value={form.description}

onChange={handleChange}

required

/>








<div className="form-group">
    <label htmlFor="deadline">
        Deadline
    </label>

    <input
        type="date"
        id="deadline"
        name="deadline"
        value={form.deadline}
        onChange={handleChange}
        required
    />
</div>








<button

className="submit-btn"

type="submit"

>

Post {type}

</button>





</form>






</div>





</div>


);


};



export default PostOpportunity;