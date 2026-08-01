import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Footer from "./components/section1/Footer"
import SplashScreen from "./components/Splash/Splash";
import { useState, useEffect } from "react";
import RoleSelection from "./components/RoleSelection"
import Profile from "./components/Profile/Profile";
import Settings from "./components/Setting/Setting"
import { BrowserRouter } from "react-router-dom";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import PostOpportunity from "./pages/PostOpportunity/PostOpportunity";
import RecruiterDashboard from "./pages/Dashboard/RecruiterDashboard";
import ManageOpportunities from "./pages/ManageOpportunities/ManageOpportunities";
import EditOpportunity from "./pages/EdirOpportunity/EditOpportunity";
import Jobs from "./pages/Jobs/Jobs";
import UserDashboard from "./pages/Dashboard/UserDashboard";
import OpportunityDetails from "./pages/Opportunity/OpportunityDetails";
import ViewApplicants from "./pages/Recruiter/ViewApplicants";
import RecruiterApplicants from "./pages/RecruiterApplicants/RecruiterApplicants";
import ScrollToTop from "./components/ScrollToTop";
<<<<<<< HEAD
import ResumeBuilder from "./pages/ResumeBuilder/ResumeBuilder";
import CandidateBlogs from "./pages/CandidateBlogs/CandidateBlogs";
import DSASheet from "./pages/DSASheet/DSASheet";
import PatternDetails from "./pages/PatternDetails/PatternDetails";
const App = () => {
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    setTimeout(()=>{
      setLoading(false);
    },2000);

  },[]);



  if(loading){
    return <SplashScreen />;
  }

  return(
    <BrowserRouter>
     <ScrollToTop />
    <Routes>

      <Route path="/login" element={<Login setLoading={setLoading}/>}/>
      <Route path="/"element={<RoleSelection/>}/>
      <Route element={<Layout/>}>
      <Route path="/home" element={<Home/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/post-opportunity" element={<PostOpportunity/>}/> 
        <Route path="/edit-opportunity/:id" element={<EditOpportunity/>}/>
        <Route path="/jobs" element={<Jobs />}/>
        <Route path="/manage-opportunities"element={<ManageOpportunities/>}/>
        <Route path="/my-activity"element={<UserDashboard />}/>
        <Route path="/opportunity/:id" element={<OpportunityDetails/>}/>
        <Route path="/recruiter/opportunity/:id/applicants"element={<ViewApplicants/>}/>
        <Route path="dashboard/recruiter" element={<RecruiterDashboard />} />
        <Route path="/recruiter/applicants" element={<RecruiterApplicants />}/>
        <Route path="/change-password" element={<ChangePassword/>}/>
         
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/resume-builder" element={<ResumeBuilder/>}/>
        <Route path="/blogs" element={<CandidateBlogs/>}/>
        <Route path="/footer" element={<Footer />}/>
        <Route path="/dsa-sheet" element={<DSASheet />} />
        <Route path="/pattern/:id" element={<PatternDetails />} />

      </Route>

    </Routes>
    </BrowserRouter>
  )
}

export default App;