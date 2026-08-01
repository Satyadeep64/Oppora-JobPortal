// import Navbar from "./section1/Navbar";
// import Sidebar from "./section1/Sidebar";
// import { Outlet } from "react-router-dom";
// import { useState } from "react";

// const Layout = () => {
//  const [showSidebar, setShowSidebar] = useState(true);
// return(
//     <>
//         const [showSidebar, setShowSidebar] = useState(true);

//    <Navbar />

//     <button
//     className="toggle-btn"
//     onClick={() => setShowSidebar(!showSidebar)}
//      >
//     ☰
//     </button>

//     <Sidebar showSidebar={showSidebar} />

//         <div className="main-content">
//             <Outlet/>
//         </div>
//     </>
// )

// }

// export default Layout;

import Navbar from "./section1/Navbar";
import Sidebar from "./section1/Sidebar";
import { Outlet } from "react-router-dom";
import Footer from "./section1/Footer"
// import Opportunities from "./Opportunities";

const Layout = () => {

    return (

        <>

            <Navbar />

            <Sidebar/>

            
        <main className="main-content">
            <Outlet/>
        </main>    

             <Footer/>

        </>

    );

}

export default Layout;