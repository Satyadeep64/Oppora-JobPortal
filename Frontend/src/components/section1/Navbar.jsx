import { useState, useEffect } from "react";
import { FaSearch, FaUserCircle, FaBell, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";

const Navbar = () => {
const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const placeholders = [
    "Search Jobs...",
    "Search Internships...",
    "Search Companies...",
    "Search Hackathons...",
    "Search Courses..."
  ];


  const [placeholder, setPlaceholder] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

const token = localStorage.getItem("token");
  useEffect(() => {

    const currentText = placeholders[index];
    const speed = deleting ? 50 : 100;

    
    const timer = setTimeout(() => {

      if (!deleting) {

        setPlaceholder(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);

        if (charIndex + 1 === currentText.length) {
          setTimeout(() => setDeleting(true), 1000);
        }

      } else {

        setPlaceholder(currentText.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);

        if (charIndex === 0) {
          setDeleting(false);
          setIndex((index + 1) % placeholders.length);
        }
      }

    }, speed);

    return () => clearTimeout(timer);

  }, [charIndex, deleting, index]);


  const handleSearch = () => {
    if (search.trim() === "") return;
    console.log("Searching for:", search);
  };

const handleLogout = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("email");
localStorage.removeItem("userId");
localStorage.removeItem("profile");

   localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");

  setShowMenu(false);

  navigate("/");
  };
 const handleclick = () => {
    navigate("/home");
      
  };

    
const isLoggedIn = !!localStorage.getItem("token");
  return (
    <nav className="navbar">

      <h1 onClick={handleclick}>
        <span className="logo7" >O</span>PPORA
      </h1>

      <div className="search-bar">

        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button onClick={handleSearch}>
          <FaSearch />
        </button>

      </div>

      <div className="filter">

        <button
          className="filter-btn"
          onClick={() => setShowFilter(!showFilter)}
        >
          <FaFilter />
          Filters
        </button>

        {showFilter && (
          <div className="filter-box">
            <h4>Filter Jobs</h4>

            <label>
              <input type="checkbox" />
              Full Time
            </label>

            <label>
              <input type="checkbox" />
              Internship
            </label>

            <label>
              <input type="checkbox" />
              Remote
            </label>

            <label>
              <input type="checkbox" />
              Work From Home
            </label>

          </div>
        )}

      </div>

     <div className="nav-right">
{
!token ? (
<>
<button className="nav-login" onClick={()=>navigate("/login")}>
Login
</button>
<button className="nav-signup" onClick={()=>navigate("/login")}>
Sign Up
</button>
</>
)
:
(
<div className="notification">
<button className="notification-btn" onClick={()=>setShowNotification(!showNotification)}>
<FaBell />
</button>
{showNotification && (
<div className="notification-box">
<h4>Notifications</h4>
<p>New internship available</p>
<p>Your application was viewed</p>
<p>Interview scheduled</p>
</div>
)}
</div>
)
}
{isLoggedIn && <ProfileDropdown />}

       {isLoggedIn && (
  <button
    className="logoutbtn"
    onClick={handleLogout}
  >
    Logout
  </button>
)}
      </div>

    </nav>
  );
};

export default Navbar;