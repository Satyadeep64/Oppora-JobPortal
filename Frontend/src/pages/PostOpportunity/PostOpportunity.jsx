import { useState } from "react";
import "./PostOpportunity.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const PostOpportunity = () => {
const navigate = useNavigate();
    const [type, setType] = useState("Job");

    const [form, setForm] = useState({
        title: "",
        company: "",
        location: "",
        experience: "",
        employmentType: "Full Time",
        skills: "",
        description: "",
        salary: "",
        openings: "",
        deadline: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

 const handleSubmit = async (e) => {

    e.preventDefault();


    try {


        const token = localStorage.getItem("token");

        const recruiterId = localStorage.getItem("userId");


        if(!token){

            alert("Login required");
            return;

        }



        const opportunityData = {

            title: form.title,

            companyName: form.company,

            type: type,

            location: form.location,

            employmentType: form.employmentType,

            experience: form.experience,

            skills: form.skills,

            description: form.description,

            salary: form.salary,

            openings: Number(form.openings),

            deadline: form.deadline,

            recruiterId:Number(recruiterId)

        };


        console.log("TOKEN:", token);

        const response = await axios.post(

            "http://localhost:5024/api/Opportunities",

            opportunityData,

            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }

        );



        alert(response.data.message);



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



        // redirect dashboard

        navigate("/recruiter/dashboard");


    }

    catch(error){


        console.log(error.response);


        if(error.response?.status === 401){

            alert("Unauthorized. Please login again.");

        }

        else{

            alert("Failed to post opportunity");

        }


    }

};

    return (
        <div className="post-page">
             <div className="recruiter-header">

        <h1>Recruiter Portal</h1>

        <p>
            Create and publish opportunities to reach thousands of talented candidates.
        </p>

    </div>

            <div className="post-card">

                 <h2>Post Opportunity</h2>

        <p className="post-subtitle">
            Create a new {type.toLowerCase()} opportunity for candidates.
        </p>

                <div className="type-buttons">

                    <button
                        type="button"
                        className={type === "Job" ? "active-type" : ""}
                        onClick={() => setType("Job")}
                    >
                        Job
                    </button>

                    <button
                        type="button"
                        className={type === "Internship" ? "active-type" : ""}
                        onClick={() => setType("Internship")}
                    >
                        Internship
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <input
                        name="title"
                        placeholder={`${type} Title`}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="company"
                        placeholder="Company Name"
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="location"
                        placeholder="Location"
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="employmentType"
                        value={form.employmentType}
                        onChange={handleChange}
                    >
                        <option>Full Time</option>
                        <option>Part Time</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                        <option>On Site</option>
                    </select>

                    <input
                        name="experience"
                        placeholder="Experience (Fresher / 1-3 Years)"
                        onChange={handleChange}
                    />

                    <input
                        name="skills"
                        placeholder="Required Skills (React, .NET, SQL...)"
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="openings"
                        type="number"
                        placeholder="Number of Openings"
                        onChange={handleChange}
                    />

                    <input
                        name="salary"
                        placeholder={
                            type === "Job"
                                ? "Annual Salary (e.g. ₹8 LPA)"
                                : "Monthly Stipend (e.g. ₹25,000)"
                        }
                        onChange={handleChange}
                    />

                    <textarea
                        name="description"
                        placeholder={`Describe the ${type.toLowerCase()}, responsibilities, eligibility and benefits`}
                        rows={6}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="date"
                        name="deadline"
                        onChange={handleChange}
                        required
                    />

                    <button className="submit-btn" type="submit">
                        Post {type}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default PostOpportunity;