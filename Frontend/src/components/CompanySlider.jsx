import amazon from "../images/Sliderpic/amazon.webp"
import google from "../images/Sliderpic/Google.webp"
import microsoft from "../images/Sliderpic/Microsoft.webp"
import {
    FaApple,
    FaFacebook,
    FaLinkedin
} from "react-icons/fa";


const CompanySlider = () => {

   
const companies = [
    {
        name:"Google",
        img:google,
        color:"#4285F4"
    },
    {
        name:"Microsoft",
        img:microsoft,
        color:"#00A4EF"
    },
    {
        name:"Amazon",
        img:amazon,
        color:"#FF9900"
    },
    {
        name:"Apple",
        icon:<FaApple/>,
        color:"#000000"
    },
    {
        name:"LinkedIn",
        icon:<FaLinkedin/>,
        color:"#0A66C2"
    },
    {
        name:"Meta",
        icon:<FaFacebook/>,
        color:"#1877F2"
    },
// {
//     name:"IBM",
//     icon:<span>IBM</span>,
//     color:"#1F70C1"
// },
// {
//     name:"Adobe",
//     icon:<SiAdobe/>,
//     color:"#FF0000"
// },
// {
//     name:"Deloitte",
//     icon:<span>D</span>,
//     color:"#86BC25"
// },
// {
//     name:"Infosys",
//     icon:<SiInfosys/>,
//     color:"#007CC3"
// },
// {
//     name:"TCS",
//     icon:<SiTata/>,
//     color:"#0066B3"
// }
];


return(
    
<div className="company-container">
    <h2 className="Trusted"><span className="Trustedword">Trusted</span>{" "} by Top Recruiters</h2>

<div className="company-track">
     

{
companies.concat(companies).map((company,index)=>(

<div 
className="company-logo"
key={index}
style={{color:company.color}}
>

{
company.img ?

<img 
src={company.img}
alt={company.name}
/>

:

company.icon

}

<span>
{company.name}
</span>

</div>

))
}

</div>

</div>
)

}

export default CompanySlider;