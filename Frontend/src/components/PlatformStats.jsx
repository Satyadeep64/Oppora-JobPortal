import {
    ClipboardCheck,
    Briefcase,
    Building2,
    BadgeCheck,
    Globe
} from "lucide-react";
const stats = [
{
    icon:<ClipboardCheck/>,
    number:"2.3M+",
    title:"Assessments"
},
{
    icon:<Briefcase/>,
    number:"190K+",
    title:"Opportunities"
},
{
    icon:<Building2/>,
    number:"37K+",
    title:"Organisations"
},
{
    icon:<BadgeCheck/>,
    number:"542+",
    title:"Brands Trust Us"
},
{
    icon:<Globe/>,
    number:"78+",
    title:"Countries"
}
];
const PlatformStats = ()=>{
return(
<section className="stats-section">
<div className="stats-heading">
<h2>
    Powering <span>Career Growth</span> at Scale
</h2>
<p>
    Trusted by students, professionals and organisations worldwide.
</p>
</div>
<div className="stats-container">
{
stats.map((stat,index)=>(
<div className="stat-card" key={index}>
<div className="stat-icon">
{stat.icon}
</div>
<h2>
{stat.number.replace(/[A-Za-z+]/g,"")}
<span>
{stat.number.match(/[A-Za-z+]+/g)}
</span>
</h2>
<p>
{stat.title}
</p>
</div>
))}
</div>
</section>
)}
export default PlatformStats;