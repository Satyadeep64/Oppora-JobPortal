import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

import "./EditOpportunity.css";


const EditOpportunity = () => {


    const { id } = useParams();

    const navigate = useNavigate();


    const [loading, setLoading] = useState(true);


    const [form, setForm] = useState({

        title:"",
        companyName:"",
        type:"Job",
        location:"",
        employmentType:"Full Time",
        experience:"",
        skills:"",
        description:"",
        salary:"",
        openings:"",
        deadline:""

    });







    useEffect(()=>{


        const loadOpportunity = async()=>{


            try{


                const recruiterId =
                    localStorage.getItem("userId");



                const response = await axios.get(

                    `${API_BASE_URL}/api/Opportunities/recruiter/${recruiterId}`

                );



                const job = response.data.find(

                    item => item.id === Number(id)

                );




                if(job){


                    setForm({

                        title: job.title || "",

                        companyName: job.companyName || "",

                        type: job.type || "Job",

                        location: job.location || "",

                        employmentType: job.employmentType || "Full Time",

                        experience: job.experience || "",

                        skills: job.skills || "",

                        description: job.description || "",

                        salary: job.salary || "",

                        openings: job.openings || "",

                        deadline: job.deadline
                        ? job.deadline.split("T")[0]
                        : ""

                    });

                }


            }
            catch(error){

                console.log(error);

            }
            finally{

                setLoading(false);

            }


        };



        loadOpportunity();


    },[id]);









    const handleChange=(e)=>{


        setForm({

            ...form,

            [e.target.name]:e.target.value

        });


    };









    const handleSubmit=async(e)=>{


        e.preventDefault();


        try{


            const token =
            localStorage.getItem("token");



            await axios.put(

                `${API_BASE_URL}/api/Opportunities/${id}`,

                {

                    ...form,

                    openings:Number(form.openings)

                },

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );



            alert(
                "Opportunity updated successfully"
            );


            navigate("/manage-opportunities");


        }
        catch(error){

    console.log("UPDATE ERROR:", error.response);

    alert(
        error.response?.data || 
        "Failed to update opportunity"
    );

}


    };









    if(loading){


        return(

            <div className="edit-loading">

                Loading opportunity...

            </div>

        );

    }









    return(


        <div 
            className={
                `edit-page ${
                    localStorage.getItem("theme")==="dark"
                    ?"dark"
                    :""
                }`
            }
        >



            <div className="edit-header">


                <h1>
                    Edit Opportunity
                </h1>


                <p>
                    Update your job or internship details.
                </p>


            </div>







            <div className="edit-card">



                <form onSubmit={handleSubmit}>





                    <div className="form-group">

                        <label>
                            Opportunity Title
                        </label>

                        <input

                            name="title"

                            value={form.title}

                            onChange={handleChange}

                            placeholder="Enter opportunity title"

                            required

                        />

                    </div>









                    <div className="form-group">

                        <label>
                            Company Name
                        </label>


                        <input

                            name="companyName"

                            value={form.companyName}

                            onChange={handleChange}

                            placeholder="Enter company name"

                            required

                        />

                    </div>









                    <div className="form-row">


                        <div className="form-group">

                            <label>
                                Opportunity Type
                            </label>


                            <select

                                name="type"

                                value={form.type}

                                onChange={handleChange}

                            >

                                <option>
                                    Job
                                </option>


                                <option>
                                    Internship
                                </option>


                            </select>


                        </div>







                        <div className="form-group">


                            <label>
                                Employment Type
                            </label>


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


                        </div>



                    </div>









                    <div className="form-group">


                        <label>
                            Location
                        </label>


                        <input

                            name="location"

                            value={form.location}

                            onChange={handleChange}

                            placeholder="Eg. Noida, Remote"

                        />


                    </div>









                    <div className="form-row">


                        <div className="form-group">


                            <label>
                                Experience Required
                            </label>


                            <input

                                name="experience"

                                value={form.experience}

                                onChange={handleChange}

                                placeholder="Eg. Fresher"

                            />


                        </div>






                        <div className="form-group">


                            <label>
                                Number of Openings
                            </label>


                            <input

                                type="number"

                                name="openings"

                                value={form.openings}

                                onChange={handleChange}

                                placeholder="Eg. 5"

                            />


                        </div>



                    </div>









                    <div className="form-group">


                        <label>
                            Required Skills
                        </label>


                        <input

                            name="skills"

                            value={form.skills}

                            onChange={handleChange}

                            placeholder="React, .NET, SQL"

                        />


                    </div>









                    <div className="form-group">


                        <label>
                            Salary / Stipend
                        </label>


                        <input

                            name="salary"

                            value={form.salary}

                            onChange={handleChange}

                            placeholder="Eg. 8 LPA / $1000 per month"

                        />


                    </div>









                    <div className="form-group">


                        <label>
                            Opportunity Description
                        </label>


                        <textarea

                            name="description"

                            value={form.description}

                            onChange={handleChange}

                            rows="5"

                            placeholder="Describe role, responsibilities and requirements"

                        />


                    </div>









                    <div className="form-group">


                        <label>
                            Application Deadline
                        </label>


                        <input

                            type="date"

                            name="deadline"

                            value={form.deadline}

                            onChange={handleChange}

                        />


                    </div>









                    <div className="edit-buttons">


                        <button

                            type="submit"

                            className="update-btn"

                        >

                            Update Opportunity

                        </button>





                        <button

                            type="button"

                            className="cancel-btn"

                            onClick={()=>
                                navigate("/manage-jobs")
                            }

                        >

                            Cancel

                        </button>


                    </div>






                </form>


            </div>


        </div>


    );


};


export default EditOpportunity;