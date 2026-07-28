import { useState,useEffect } from "react";
import { Upload, Edit, User } from "lucide-react";
import "./Profile.css";
import axios from "axios";

const Profile = () => {
    const [image,setImage] = useState(null);
    const [resume,setResume] = useState(null);
    const [isEditing,setIsEditing] = useState(false);
    const [newSkill,setNewSkill] = useState("");
    const [hidePopup,setHidePopup] = useState(false);

    const [profile,setProfile] = useState({
    fullName:"",
    email:"",
    role:"",
    skills:[],
    profileImage:null,
    resume:null
});
    const userId = localStorage.getItem("userId");
useEffect(()=>{
    const getProfile = async()=>{
        try{
            const response = await axios.get(
                `http://localhost:5024/api/Profile/${userId}`
            );
            console.log(response.data);
            setProfile({
                fullName: response.data.fullName,
                email: response.data.email,
                role: response.data.role,
                skills: response.data.skills
                ? response.data.skills.split(",")
                : [],
                profileImage: response.data.profileImage,
                resume: response.data.resume
            });
            if(response.data.profileImage)
            {
                setImage(response.data.profileImage);
            }
        }
        catch(error){
            console.log(error);
       }
};
    if(userId)
    {
        getProfile();
    }
},[]);

const handleImage = async (e) => {

    const file = e.target.files[0];

    if(file){

        const formData = new FormData();

        formData.append("file", file);


        try{

            const response = await axios.post(
                `http://localhost:5024/api/Profile/upload-image/${userId}`,
                formData,
                {
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }
            );


           setImage(response.data.imageUrl);


setProfile(prev=>({
    ...prev,
    profileImage:response.data.imageUrl
}));


            alert("Profile Image Uploaded");


        }
        catch(error){

              console.log("UPLOAD ERROR:", error.response?.data);
    console.log("STATUS:", error.response?.status);
    console.log("FULL ERROR:", error);
            alert("Image Upload Failed");

        }

    }

}; 

const handleResume = async(e)=>{

    const file=e.target.files[0];


    if(file){

        const formData=new FormData();


        formData.append("file",file);


        try{

            const response = await axios.post(
                `http://localhost:5024/api/Profile/upload-resume/${userId}`,
                formData,
                {
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }
            );


            setResume(file);

              setProfile(prev=>({
    ...prev,
    resume:response.data.resumeUrl
}));


            alert("Resume Uploaded");


        }
        catch(error){

            console.log(error);
            alert("Resume Upload Failed");

        }

    }

};

    const addSkill=()=>{
        if(newSkill.trim()){
            setProfile(prev=>({
                ...prev,
                skills:[...prev.skills,newSkill]
            }));

            setNewSkill("");
        }
    };

    const removeSkill=(skill)=>{
        setProfile(prev=>({
            ...prev,
            skills:prev.skills.filter(item=>item!==skill)
        }));
    };

    const saveProfile = async()=>{

    try{

        await axios.put(
            `http://localhost:5024/api/profile/${userId}`,
            {
                fullName:profile.fullName,
                email:profile.email,
                skills:profile.skills.join(",")
            }
        );

        setIsEditing(false);

        alert("Profile Updated Successfully");

    }
    catch(error){

        console.log(error);
        alert("Profile Update Failed");

    }

};

    const calculateCompletion=()=>{
        let completed=0;

        if(profile.fullName) completed+=20;
        if(profile.email) completed+=20;
        if(profile.profileImage) completed+=20;
        if(profile.skills.length>0) completed+=20;
        if(profile.resume) completed+=20;

        return completed;
    };

    const completion=calculateCompletion();

const showPopup = completion < 100 && !hidePopup;
    


    return(
        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-header">

                    <div className="image-wrapper">

                        {
                            image ?
                            <img src={image}  className="profile-image" alt="Profile"/>
                            :
                            <div className="profile-placeholder">
                                <User size={60}/>
                            </div>
                        }

                        <label className="upload-image">
                            <Upload size={18}/>
                            <input hidden type="file" accept="image/*" onChange={handleImage}/>
                        </label>

                    </div>

                    <h1>{profile.fullName}</h1>
                    <p className="email">{profile.email}</p>
                    <p className="role">{profile.role}</p>

                </div>


                <div className="section">

                    <div className="completion">
                        <span>Profile Completion</span>
                        <span>{completion}%</span>
                    </div>

                    <div className="progress-container">
                        <div className="progress" style={{width:`${completion}%`}}></div>
                    </div>

                </div>


                <div className="section">

                    <div className="section-heading">

                        <h2>Personal Information</h2>

                        <button className="edit-btn" onClick={isEditing ? saveProfile : ()=>setIsEditing(true)}
>
                            <Edit size={18}/>
                            {isEditing?"Save":"Edit"}
                        </button>

                    </div>


                    <div className="details">

                        {
                            isEditing ?

                            <>
                                <label>Name</label>
                                <input
                                value={profile.fullName}
                                onChange={(e)=>setProfile({...profile,fullName:e.target.value})}
                                />

                                <label>Email</label>
                                <input
                                value={profile.email}
                                onChange={(e)=>setProfile({...profile,email:e.target.value})}
                                />


                                <label>Skills</label>

                                <div className="skill-input">
                                    <input
                                    value={newSkill}
                                    onChange={(e)=>setNewSkill(e.target.value)}
                                    placeholder="Add skill"
                                    />

                                    <button onClick={addSkill}>
                                        Add
                                    </button>
                                </div>

                            </>

                            :

                            <>
                                <p>
                                    <b>Name:</b><br/>
                                    {profile.fullName}
                                </p>

                                <p>
                                    <b>Email:</b><br/>
                                    {profile.email}
                                </p>

                                <p>
                                    <b>Skills:</b>
                                </p>

                            </>

                        }


                        <div className="skills">

                            {
                                profile.skills.map(skill=>(
                                    <span key={skill}>
                                        {skill}

                                        {
                                            isEditing &&
                                            <button onClick={()=>removeSkill(skill)}>
                                                ×
                                            </button>
                                        }

                                    </span>
                                ))
                            }

                        </div>


                    </div>

                </div>


                <div className="section">

                    <h2>Resume</h2>

                    <label className="resume-box">

                        <Upload size={35}/>

                        <p>Upload your CV</p>

                        <input
                        hidden
                        type="file"
                        accept=".pdf"
                        onChange={handleResume}
                        />

                    </label>


                    {
                        resume &&
                        <p className="resume-name">
                            {resume.name}
                        </p>
                    }

                </div>
 </div>

              {
showPopup && (

<div className="profile-popup-overlay">

<div className="profile-popup">

<h2>
Complete Your Profile
</h2>


<p>
Your profile is only 
<b> {completion}% </b>
complete.
</p>


<p>
Complete your profile to get better opportunities.
</p>


<div className="popup-buttons">

<button
className="complete-btn"
onClick={()=>{
setIsEditing(true);
setHidePopup(true);
}}
>
Complete Now
</button>


<button
className="later-btn"
onClick={()=>setHidePopup(true)}
>
Later
</button>


</div>


</div>

</div>

)
}


           

        </div>
    ); }

export default Profile;