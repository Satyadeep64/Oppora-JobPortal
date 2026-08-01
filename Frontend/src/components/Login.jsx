import { useState,useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setLoading }) => {

  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

 const role = localStorage.getItem("selectedRole");
 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");




const candidateTexts = [
 "Your Next Opportunity Starts Here",
 "Find Jobs & Internships Easily",
 "Grow Your Career With Oppora"
];


const recruiterTexts = [
 "Build Your Team With Oppora",
 "Hire Top Talent Faster",
 "Find The Best Candidates"
];

const texts = role === "Recruiter" ? recruiterTexts : candidateTexts;

const [text,setText] = useState("");
const [textIndex,setTextIndex] = useState(0);
const [charIndex,setCharIndex] = useState(0);
const [deleting,setDeleting] = useState(false);

useEffect(()=>{

  const currentText = texts[textIndex];

  const timer = setTimeout(()=>{

    if(!deleting){

      setText(currentText.substring(0,charIndex+1));
      setCharIndex(charIndex+1);

      if(charIndex+1 === currentText.length){
        setTimeout(()=>{
          setDeleting(true);
        },1000);
      }

    }else{

      setText(currentText.substring(0,charIndex-1));
      setCharIndex(charIndex-1);

      if(charIndex===0){
        setDeleting(false);
        setTextIndex((textIndex+1)%texts.length);
      }

    }

  },deleting ? 50 : 100);


  return ()=>clearTimeout(timer);

},[charIndex,deleting,textIndex]);

  const handleRegister = async () => {
    console.log("Register button clicked");

    
    try {
      const response = await axios.post(
        "http://localhost:5024/api/auth/register",
        {
          fullName,
          email,
          password,
          role
        }
      );

      alert("Registration Successful");
      setActiveTab("login");

    } catch (error) {
      console.log(error);

      if (error.response) {
        console.log(error.response.data);
        alert(JSON.stringify(error.response.data));
      } else {
        alert(error.message);
      }
    }
  };

  const handleLogin = async () => {

    console.log("Login button clicked");

    const selectedRole = localStorage.getItem("selectedRole");


    try {


        const response = await axios.post(
            "http://localhost:5024/api/auth/login",
            {
                email,
                password
            }
        );



        console.log("Login Response:", response.data);
        console.log("API ROLE:", response.data.role);
console.log("SELECTED ROLE:", selectedRole);
console.log("USER ID:", response.data.userId);



        // Role verification

        if (
            response.data.role?.trim().toLowerCase() !==
            selectedRole?.trim().toLowerCase()
        )
        {

            alert(
                `This account belongs to ${response.data.role}. Please choose correct account type.`
            );

            return;
        }





        // Save Authentication Data

        console.log("Saving local storage...");
        localStorage.setItem(
            "token",
            response.data.token
        );



        localStorage.setItem(
            "userRole",
            response.data.role
        );



        localStorage.setItem(
            "userName",
            response.data.name
        );



        localStorage.setItem(
            "email",
            response.data.email
        );



        localStorage.setItem(
            "userId",
            response.data.userId
        );




        // Store profile object for dropdown

        localStorage.setItem(
            "profile",
            JSON.stringify({

                name: response.data.name,

                email: response.data.email,

                role: response.data.role,

                profileImage:null

            })
        );






        // Redirect


        setLoading(true);



        setTimeout(()=>{


            navigate("/home");


            setLoading(false);


        },2000);



    }

    catch(error)
    {


        console.log(
            "Login Error:",
            error
        );


        if(error.response)
        {

            alert(error.response.data);

        }

        else
        {

            alert("Invalid Email or Password");

        }


    }


};





  return (
    <div 
    className={
        `parent ${
            localStorage.getItem("theme")==="dark"
            ?
            "dark"
            :
            ""
        }`
    }
    >
      <div className="box">
 
        <div className="loginpic">
            <div className="brand">

       <h1>
    <span className="logo7">O</span>PPORA
</h1>

    </div>

        </div>
        
        <div className="parentinput">
          <div className="input1">
<h2 id="id1">
<span className="gradient-text">{text}</span>
<span className="cursor">|</span>
</h2>
          </div>
      <h5 id="id2">
{
role === "Recruiter"
?
"Login to post jobs and find talented candidates."
:
"Login to discover jobs, internships and opportunities."
}
</h5>

          <div className="userinput">
             
            {/* Login Signup Buttons */}
            <div className="loginSignup">

              <button
                className={`bt1 ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`bt2 ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </button>
            </div>
            
            {/* Login Form */}
            {
              activeTab === "login" && (

              <form onSubmit={(e)=>{e.preventDefault();handleLogin();}}>

                <>
                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter Your Mail"
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">

                    <label htmlFor="password">
                      Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
onChange={(e)=>setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="forgot-password">
                      <a href="#">
                      Forgot Password?
                    </a>
                 </div>
                  <div className="bt3">
                    <button type="submit">
                      Login
                    </button>
                  </div>
                </>
                </form>
              )
            }
            {/* Signup Form */}

            {
              activeTab === "signup" && (
                <form onSubmit={(e)=>{e.preventDefault();handleRegister();}}>
                <>
                  <div className="form-group">

                    <label htmlFor="name">
                      Full Name <span className="required">*</span>
                    </label>

                    <input
                      type="text"
                      id="name"
                      placeholder="Enter Your Name"
                      value={fullName}
                      onChange={(e)=>setFullName(e.target.value)}
                      required
                    />

                  </div>
                  
                  <div className="form-group">

                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter Your Mail"
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">
                      Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      placeholder="Create Password"
                      value={password}
                       onChange={(e)=>setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="forgot-password">
                      <a href="#">
                      Forgot Password?
                    </a>
                 </div>
                  <div className="bt3">
                    <button type="submit">
                      Sign Up
                    </button>
                  </div>
                </>
                </form>
              )
            }
          </div>
        </div>
      </div>
</div>
  )
};



export default Login;