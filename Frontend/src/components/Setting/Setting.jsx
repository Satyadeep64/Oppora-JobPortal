import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Moon,
    Sun,
    User,
    Bell,
    Lock,
    HelpCircle,
    LogOut,
    Shield
} from "lucide-react";

import { ThemeContext } from "../../context/ThemeContext";

import "./Setting.css";



const Settings = () => {


const navigate = useNavigate();
    const { theme, setTheme } = useContext(ThemeContext);



    const changeTheme = () => {


        const newTheme =
            theme === "light"
                ? "dark"
                : "light";


        setTheme(newTheme);

    };



return (

<div className="settings-page">


<div className="settings-card">


<h1>
Settings
</h1>



<div className="setting-section">


<h2>
Appearance
</h2>



<div className="theme-toggle-container">


<div className="theme-label">


{
theme === "dark"
?
<Moon size={22}/>
:
<Sun size={22}/>
}



<span>

{
theme === "dark"
?
"Dark Mode"
:
"Light Mode"
}

</span>


</div>





<button

className={
theme === "dark"
?
"theme-switch dark"
:
"theme-switch"
}

onClick={changeTheme}

>


<div className="switch-circle">


{
theme === "dark"
?
<Moon size={18}/>
:
<Sun size={18}/>
}


</div>


</button>



</div>


</div>







<div className="setting-section">


<h2>
Account
</h2>



<div className="setting-item clickable">


<User/>


<div>

<h3 onClick={()=>navigate("/profile")}>
Edit Profile
</h3>


<p>
Update your personal information
</p>


</div>


</div>





<div 
className="setting-item clickable"
onClick={()=>navigate("/change-password")}
>

<Lock/>

<div>

<h3>
Change Password
</h3>

<p>
Update your password securely
</p>

</div>

</div>


</div>








<div className="setting-section">


<h2>
Notifications
</h2>



<div className="setting-item clickable">


<Bell/>


<div>

<h3>
Job Alerts
</h3>


<p>
Receive latest opportunities
</p>


</div>


<input 
type="checkbox"
defaultChecked
/>


</div>






<div className="setting-item clickable">


<Bell/>


<div>

<h3>
Application Updates
</h3>


<p>
Get application status updates
</p>


</div>


<input 
type="checkbox"
defaultChecked
/>


</div>



</div>









<div className="setting-section">


<h2>
Privacy & Security
</h2>



<div className="setting-item clickable">


<Shield/>


<div>


<h3>
Profile Visibility
</h3>


<p>
Allow recruiters to view your profile
</p>


</div>


<input
type="checkbox"
defaultChecked
/>



</div>


</div>









<div className="setting-section">


<h2>
Support
</h2>




<div className="setting-item clickable">


<HelpCircle/>


<div>

<h3>
Help Center
</h3>


<p>
Contact support team
</p>


</div>


</div>






<div 
className="setting-item logout clickable"
onClick={()=>{
    
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");

    navigate("/login");

}}
>


<LogOut/>


<div>

<h3>
Logout
</h3>

<p>
Sign out from your account
</p>


</div>


</div>



</div>




</div>


</div>


);


};


export default Settings;