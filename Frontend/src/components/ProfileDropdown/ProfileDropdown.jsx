import { useState, useEffect, useRef } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getFullUrl } from "../../config/api";

import "./ProfileDropdown.css";


const ProfileDropdown = () => {


    const [open, setOpen] = useState(false);


    const [profile, setProfile] = useState({

        fullName:
            localStorage.getItem("userName") || "User",

        email:
            localStorage.getItem("email") || "Email not available",

        role:
            localStorage.getItem("userRole") || "",

        profileImage: null

    });



    const navigate = useNavigate();


    const dropdownRef = useRef();






    const getImageUrl = (image) => {


        if(!image)
            return null;



        // Cloudinary or complete URL

        if(image.startsWith("http"))
            return image;



        // Local uploaded image

        return getFullUrl(image);


    };









    useEffect(() => {


        const loadProfile = async () => {


            try {


                const id =
                    localStorage.getItem("userId");


                const token =
                    localStorage.getItem("token");


const response = await axios.get(

    `${API_BASE_URL}/api/Profile/${id}`,

    {
        headers:{
            Authorization:`Bearer ${token}`
        }});
                console.log(
                    "PROFILE DATA:",
                    response.data
                );




setProfile({
    fullName: response.data.fullName || "User",
    email: response.data.email || "Email not available",
    role: response.data.role || "",
    profileImage: response.data.profileImage || null

});
 } catch (error) {
            console.log(error);
        }

    };

    loadProfile();

}, []);
    useEffect(()=>{


        const closeDropdown = (e)=>{


            if(

                dropdownRef.current &&

                !dropdownRef.current.contains(e.target)

            ){

                setOpen(false);

            }


        };



        document.addEventListener(
            "mousedown",
            closeDropdown
        );



        return ()=>{


            document.removeEventListener(
                "mousedown",
                closeDropdown
            );


        };


    },[]);









    const handleLogout = ()=>{


        localStorage.removeItem("token");

        localStorage.removeItem("userRole");

        localStorage.removeItem("userName");

        localStorage.removeItem("email");

        localStorage.removeItem("userId");



        navigate("/login");


    };











    return (


        <div
            className="profile-wrapper"
            ref={dropdownRef}
        >




            <button

                className="profile-icon"

                onClick={()=>setOpen(!open)}

            >


                {

                    profile.profileImage ?


                    (

                        <img

                            src={profile.profileImage}

                            alt="profile"

                        />

                    )


                    :

                    (

                        <User size={26}/>

                    )

                }



            </button>









            {
                open &&
                <div className="pd-dropdown-menu">






                    <div className="profile-image">


                    {


                        profile.profileImage ?


                        (

                            <img

                                src={profile.profileImage}

                                alt="profile"

                            />

                        )


                        :


                        (

                            <User size={45}/>

                        )


                    }



                    </div>







                    <h3>

                        {profile.fullName}

                    </h3>






                    <p>

                        {profile.email}

                    </p>






                    <span className="profile-role">

                        {profile.role}

                    </span>








                    <button

                        className="view-profile"

                        onClick={()=>
                            navigate("/profile")
                        }

                    >

                        View Profile


                    </button>









                    <button

                        className="logout"

                        onClick={handleLogout}

                    >


                        <LogOut size={16}/>


                        Logout


                    </button>






                </div>


            }





        </div>


    );


};


export default ProfileDropdown;