import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import "./ChangePassword.css";

const ChangePassword = () => {

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const changePassword = async () => {

        try {

            const id = localStorage.getItem("userId");
             console.log("User ID:", id);
            await axios.put(
                `${API_BASE_URL}/api/profile/change-password/${id}`,
                {
                    oldPassword,
                    newPassword
                }
            );

            alert("Password changed successfully");

            setOldPassword("");
            setNewPassword("");

        }
        catch (error) {

            alert(
                error.response?.data ||
                "Password change failed"
            );

        }

    };

    return (

        <div className="password-page">

            <div className="password-card">

                <h1>Change Password</h1>

                <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <button onClick={changePassword}>
                    Update Password
                </button>

            </div>

        </div>

    );

};

export default ChangePassword;