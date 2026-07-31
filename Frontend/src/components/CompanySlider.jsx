import amazon from "../images/Sliderpic/amazon.webp";
import google from "../images/Sliderpic/Google.webp";
import microsoft from "../images/Sliderpic/Microsoft.webp";

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
    },
    {
      name:"Microsoft",
      img:microsoft,
    },
    {
      name:"Amazon",
      img:amazon,
    },
    {
      name:"Apple",
      icon:<FaApple/>
    },
    {
      name:"LinkedIn",
      icon:<FaLinkedin/>
    },
    {
      name:"Meta",
      icon:<FaFacebook/>
    }
  ];


  return (

    <section className="company-section">


      <div className="company-header">

        <h2>
          <span>Trusted</span> By Top Hiring Partners
        </h2>

        <p>
          Discover opportunities from leading companies
        </p>

      </div>



      <div className="slider-wrapper">

        <div className="company-slider">

          {
            [...companies,...companies].map((company,index)=>(


              <div 
              className="company-card"
              key={index}
              >


                <div className="logo-box">

                {
                  company.img ?

                  <img 
                  src={company.img}
                  alt={company.name}
                  />

                  :

                  <span className="company-icon">
                    {company.icon}
                  </span>

                }

                </div>


                <span className="company-name">
                    {company.name}
                </span>


              </div>


            ))
          }


        </div>

      </div>


    </section>

  )
}


export default CompanySlider;