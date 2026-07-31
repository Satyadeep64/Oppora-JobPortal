import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Briefcase,
    MapPin,
    Clock,
    GraduationCap,
    IndianRupee,
    CalendarDays
} from "lucide-react";

import "./Jobs.css";


const Jobs = () => {
    const navigate = useNavigate();


    const [jobs,setJobs] = useState([]);

    const [loading,setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("");
const [selectedLocation, setSelectedLocation] = useState("");
const [selectedEmployment, setSelectedEmployment] = useState("");
const [selectedExperience, setSelectedExperience] = useState("");
const [typeOpen, setTypeOpen] = useState(false);

const typeRef = useRef(null);

const locationRef = useRef(null);

const employmentRef = useRef(null);

const experienceRef = useRef(null);

const [locationOpen, setLocationOpen] = useState(false);

const [employmentOpen, setEmploymentOpen] = useState(false);

const [experienceOpen, setExperienceOpen] = useState(false);

const typeOptions = [...new Set(jobs.map(job => job.type))];

const locationOptions = [...new Set(jobs.map(job => job.location))];

const employmentOptions = [...new Set(jobs.map(job => job.employmentType))];

const experienceOptions = [
  ...new Set(jobs.map(job => job.experience || "Fresher"))
];

const filteredJobs = jobs.filter((job) => {
    return (
        (selectedType === "" ||
            selectedType === "ALL" ||
            job.type === selectedType) &&

        (selectedLocation === "" ||
            selectedLocation === "ALL" ||
            job.location === selectedLocation) &&

        (selectedEmployment === "" ||
            selectedEmployment === "ALL" ||
            job.employmentType === selectedEmployment) &&

        (selectedExperience === "" ||
            selectedExperience === "ALL" ||
            (job.experience || "Fresher") === selectedExperience)
    );
});


    useEffect(()=>{


        const loadJobs = async()=>{


            try{


                const response = await axios.get(
                    "http://localhost:5024/api/Opportunities"
                );

                console.log(response.data);
                setJobs(response.data);


            }
            catch(error){

                console.log(error);

            }
            finally{

                setLoading(false);

            }


        };


        loadJobs();


    },[]);

    useEffect(() => {

    const handleClickOutside = (e) => {

        if (typeRef.current && !typeRef.current.contains(e.target)) {
            setTypeOpen(false);
        }

        if (locationRef.current && !locationRef.current.contains(e.target)) {
            setLocationOpen(false);
        }

        if (employmentRef.current && !employmentRef.current.contains(e.target)) {
            setEmploymentOpen(false);
        }

        if (experienceRef.current && !experienceRef.current.contains(e.target)) {
            setExperienceOpen(false);
        }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };

}, []);






    if(loading){

        return(

            <div className="jobs-loading">

                Loading opportunities...

            </div>

        );

    }






    return(


        <div
        className={
            `jobs-page ${
                localStorage.getItem("theme")==="dark"
                ?
                "dark"
                :
                ""
            }`
        }
        >





            {/* Header */}


            <div className="jobs-header">

    <div className="hero-content">

        <h1>
            Find the Right Job for You
        </h1>

        <p>
            Browse opportunities that match your skills, goals, and ambitions.
        </p>

    </div>

    <div className="hero-icon">
    <span>🚀</span>
</div>

</div>



<div className="jobs-filters">

    <div
    className="filter-item custom-dropdown"
    ref={typeRef}
>

    <label>
        <Briefcase size={16} />
        Type
    </label>

    <button
        type="button"
        className="dropdown-trigger"
        onClick={() => {

            setTypeOpen(!typeOpen);

            setLocationOpen(false);
            setEmploymentOpen(false);
            setExperienceOpen(false);

        }}
    >

        <span>

            {
                selectedType === ""
                    ? "Select Type"
                    : selectedType === "ALL"
                    ? "All Types"
                    : selectedType
            }

        </span>

        <span
            className={`dropdown-arrow ${
                typeOpen ? "rotate" : ""
            }`}
        >
            ▼
        </span>

    </button>

    {

        typeOpen &&

        <div className="dropdown-menu">

            <div
                className="dropdown-option"
                onClick={() => {

                    setSelectedType("ALL");

                    setTypeOpen(false);

                }}
            >
                All Types
            </div>

            {

                typeOptions.map(type => (

                    <div
                        key={type}
                        className={`dropdown-option ${
                            selectedType === type
                                ? "active"
                                : ""
                        }`}
                        onClick={() => {

                            setSelectedType(type);

                            setTypeOpen(false);

                        }}
                    >

                        {type}

                    </div>

                ))

            }

        </div>

    }

</div>


    <div
    className="filter-item custom-dropdown"
    ref={locationRef}
>

    <label>
        <MapPin size={16} />
        Location
    </label>

    <button
        type="button"
        className="dropdown-trigger"
        onClick={() => {

            setLocationOpen(!locationOpen);

            setTypeOpen(false);
            setEmploymentOpen(false);
            setExperienceOpen(false);

        }}
    >

        <span>

            {
                selectedLocation === ""
                    ? "Select Location"
                    : selectedLocation === "ALL"
                    ? "All Locations"
                    : selectedLocation
            }

        </span>

        <span
            className={`dropdown-arrow ${
                locationOpen ? "rotate" : ""
            }`}
        >
            ▼
        </span>

    </button>

    {

        locationOpen &&

        <div className="dropdown-menu">

            <div
                className="dropdown-option"
                onClick={() => {

                    setSelectedLocation("ALL");

                    setLocationOpen(false);

                }}
            >
                All Locations
            </div>

            {

                locationOptions.map(location => (

                    <div
                        key={location}
                        className={`dropdown-option ${
                            selectedLocation === location
                                ? "active"
                                : ""
                        }`}
                        onClick={() => {

                            setSelectedLocation(location);

                            setLocationOpen(false);

                        }}
                    >

                        {location}

                    </div>

                ))

            }

        </div>

    }

</div>

    <div
    className="filter-item custom-dropdown"
    ref={employmentRef}
>

    <label>
        <Briefcase size={16} />
        Employment
    </label>

    <button
        type="button"
        className="dropdown-trigger"
        onClick={() => {

            setEmploymentOpen(!employmentOpen);

            setTypeOpen(false);
            setLocationOpen(false);
            setExperienceOpen(false);

        }}
    >

        <span>

            {
                selectedEmployment === ""
                    ? "Select Employment"
                    : selectedEmployment === "ALL"
                    ? "All Employment"
                    : selectedEmployment
            }

        </span>

        <span
            className={`dropdown-arrow ${
                employmentOpen ? "rotate" : ""
            }`}
        >
            ▼
        </span>

    </button>

    {

        employmentOpen &&

        <div className="dropdown-menu">

            <div
                className="dropdown-option"
                onClick={() => {

                    setSelectedEmployment("ALL");

                    setEmploymentOpen(false);

                }}
            >
                All Employment
            </div>

            {

                employmentOptions.map(item => (

                    <div
                        key={item}
                        className={`dropdown-option ${
                            selectedEmployment === item
                                ? "active"
                                : ""
                        }`}
                        onClick={() => {

                            setSelectedEmployment(item);

                            setEmploymentOpen(false);

                        }}
                    >

                        {item}

                    </div>

                ))

            }

        </div>

    }

</div>


   <div
    className="filter-item custom-dropdown"
    ref={experienceRef}
>

    <label>
        <GraduationCap size={16} />
        Experience
    </label>

    <button
        type="button"
        className="dropdown-trigger"
        onClick={() => {

            setExperienceOpen(!experienceOpen);

            setTypeOpen(false);
            setLocationOpen(false);
            setEmploymentOpen(false);

        }}
    >

        <span>

            {
                selectedExperience === ""
                    ? "Select Experience"
                    : selectedExperience === "ALL"
                    ? "All Experience"
                    : selectedExperience
            }

        </span>

        <span
            className={`dropdown-arrow ${
                experienceOpen ? "rotate" : ""
            }`}
        >
            ▼
        </span>

    </button>

    {

        experienceOpen &&

        <div className="dropdown-menu">

            <div
                className="dropdown-option"
                onClick={() => {

                    setSelectedExperience("ALL");

                    setExperienceOpen(false);

                }}
            >
                All Experience
            </div>

            {

                experienceOptions.map(exp => (

                    <div
                        key={exp}
                        className={`dropdown-option ${
                            selectedExperience === exp
                                ? "active"
                                : ""
                        }`}
                        onClick={() => {

                            setSelectedExperience(exp);

                            setExperienceOpen(false);

                        }}
                    >

                        {exp}

                    </div>

                ))

            }

        </div>

    }

</div>

</div>


<div className="active-opportunities">

    <div className="opportunities-left">

        <h2>
            Showing <span>{filteredJobs.length}</span> Active Opportunities
        </h2>

        <p>
            Explore jobs that match your skills and career goals.
        </p>

    </div>

</div>






            <div className="jobs-container">



            {
               filteredJobs.length===0 ?


                (

                    <div className="empty-jobs">

    <div className="empty-icon">
        🔍
    </div>

    <h2>
        No matching opportunities
    </h2>

    <p>
        Try changing one or more filters to discover more jobs.
    </p>

    <button
        className="clear-filters-btn"
        onClick={()=>{
            setSelectedType("");
            setSelectedLocation("");
            setSelectedEmployment("");
            setSelectedExperience("");
        }}
    >
        Clear Filters
    </button>

</div>

                )


                :


                filteredJobs.map((job)=>(


                    <div
                    className="job-card"
                    key={job.id}
                    >


<img
  src={
    job.companyLogo
      ? job.companyLogo
      : "/default-company.png"
  }
  alt={job.companyName}
  className="company-logo"
/>


                        {/* Title */}


                        <div className="job-card-header">


                            <Briefcase size={22}/>


                            <h2>
                                {job.title}
                            </h2>


                        </div>






                        <h3 className="company-name">

                           Company: {job.companyName}

                        </h3>







                        {/* Badges */}


                        <div className="job-badges">


                            <span>

                                {job.type}

                            </span>


                            <span>

                                {job.employmentType}

                            </span>


                        </div>








                        {/* Details */}


                        <div className="job-details">


                            <p>

                                <MapPin size={16}/>

                                {job.location}

                            </p>



                            <p>

                                <Clock size={16}/>

                                {job.experience || "Fresher"}

                            </p>


                        </div>








                        {/* Skills */}


                        <div className="skills-box">


                            <b>
                                Skills
                            </b>


                            <div className="skill-tags">


                            {
                                job.skills
                                ?
                                job.skills.split(",").map(
                                    (skill,index)=>(

                                    <span key={index}>
                                        {skill.trim()}
                                    </span>

                                    )
                                )
                                :
                                <span>
                                    Not specified
                                </span>
                            }


                            </div>


                        </div>








                        {/* Salary */}


                        <div className="salary-box">


                            <IndianRupee size={16}/>


                            {
                                job.salary || "Salary not disclosed"
                            }


                        </div>








                        {/* Deadline */}


                        <div className="deadline-box">


                            <CalendarDays size={16}/>


                            Apply before:


                            {
                                new Date(
                                    job.deadline
                                ).toLocaleDateString()
                            }


                        </div>







<button className="view-details-btn"
    onClick={() =>
        navigate(`/opportunity/${job.id}`)
    }
>
    View Details
</button>





                    </div>


                ))

            }



            </div>





        </div>


    );


};


export default Jobs;