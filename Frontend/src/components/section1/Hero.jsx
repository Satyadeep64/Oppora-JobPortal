import CompanySlider from "../CompanySlider";

import {
    BriefcaseBusiness,
    GraduationCap,
    Trophy,
    Bot,
    BookOpen,
    UsersRound,
    FileText,
    UserCheck,
    BarChart3,
    PlusCircle
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const Hero = () => {


    const navigate = useNavigate();


    const role = localStorage.getItem("userRole");

    const isRecruiter = role === "Recruiter";



    const cards = isRecruiter
    ?
    [
        {
            title:"Post Jobs",
            icon:<PlusCircle/>,
            path:"/post-opportunity"
        },
        {
            title:"Manage Jobs",
            icon:<BriefcaseBusiness/>,
            path:"/manage-opportunities"
        },
        {
            title:"View Applicants",
            icon:<UsersRound/>,
            path:"/recruiter/applicants"
        },
        {
            title:"Shortlist Candidates",
            icon:<UserCheck/>,
            path:"/recruiter/applicants"
        },
        {
            title:"AI Candidate Matching",
            icon:<Bot/>,
            path:"/ai-matching"
        },
        {
            title:"Hiring Analytics",
            icon:<BarChart3/>,
            path:"/hiring-analytics"
        }

    ]
    :
    [
        {
            title:"Jobs",
            icon:<BriefcaseBusiness/>,
            path:"/jobs"
        },
        {
            title:"Internships",
            icon:<GraduationCap/>,
            path:"/internships"
        },
        {
            title:"Competitions",
            icon:<Trophy/>,
            path:"/competitions"
        },
        {
            title:"AI Interview",
            icon:<Bot/>,
            path:"/ai-interview"
        },
        {
            title:"Courses",
            icon:<BookOpen/>,
            path:"/courses"
        },
        {
            title:"Resume Analyzer",
            icon:<FileText/>,
            path:"/resume-analyzer"
        }
    ];





return(
<>


<section className="hero">


<h1>

{
isRecruiter
?
"Find The Right Talent Faster 🚀"
:
"Your Next Opportunity Starts Here 🚀"
}

</h1>



<p>

{
isRecruiter
?
"Post jobs, manage applicants and hire skilled candidates."
:
"Discover jobs, internships, competitions and courses."
}

</p>


</section>







<section className="explore-section">


<h2>

{
isRecruiter
?
<>
Manage <span className="highlight">
Recruitment
</span>
</>
:
<>
Explore <span className="highlight">
Opportunities
</span>
</>

}

</h2>





<div className="explore-grid">


{
cards.map((card,index)=>(


<div

className={`explore-card card-${index}`}

key={card.title}

onClick={()=>navigate(card.path)}

>



<div className="icon-box">

{card.icon}

</div>



<h4>

{card.title}

</h4>



</div>


))

}



</div>


</section>





<CompanySlider/>


</>

)


}


export default Hero;