import { useState } from "react";
import {
  FaGlobe,
  FaCode,
  FaJava,
  FaPython,
  FaReact,
  FaDatabase,
  FaCloud,
  FaShieldAlt,
  FaUsers,
  FaLaptopCode,
} from "react-icons/fa";

import { SiCplusplus, SiTensorflow } from "react-icons/si";
import { BiNetworkChart } from "react-icons/bi";
import { MdDeveloperMode } from "react-icons/md";

const allCategories = [
  {
    title: "Web Development",
    icon: <FaGlobe />,
    color: "#DCEBFB",
    borderColor: "#9BC4F2",
  },
  {
    title: "DSA",
    icon: <FaCode />,
    color: "#E8E2FA",
    borderColor: "#C8BAF5",
  },
  {
    title: "Java",
    icon: <FaJava />,
    color: "#FFF2CC",
    borderColor: "#E9D37A",
  },
  {
    title: "C++",
    icon: <SiCplusplus />,
    color: "#FBE6D8",
    borderColor: "#E9BFA1",
  },
  {
    title: "AI / ML",
    icon: <SiTensorflow />,
    color: "#E8E2FA",
    borderColor: "#C8BAF5",
  },
  {
    title: "Operating System",
    icon: <FaLaptopCode />,
    color: "#DCEBFB",
    borderColor: "#9BC4F2",
  },
  {
    title: "Python",
    icon: <FaPython />,
    color: "#FFF2CC",
    borderColor: "#E9D37A",
  },
  {
    title: "React",
    icon: <FaReact />,
    color: "#DCEBFB",
    borderColor: "#9BC4F2",
  },
  {
    title: "Mern Stack",
    icon: <FaCode />,
    color: "#FBE6D8",
    borderColor: "#E9BFA1",
  },
  {
    title: "Soft Skills",
    icon: <FaUsers />,
    color: "#E8E2FA",
    borderColor: "#C8BAF5",
  },
  {
    title: "Generative AI",
    icon: <BiNetworkChart />,
    color: "#DCEBFB",
    borderColor: "#9BC4F2",
  },
  {
    title: "Data Analytics",
    icon: <MdDeveloperMode />,
    color: "#FFF2CC",
    borderColor: "#E9D37A",
  },
  {
    title: "DBMS",
    icon: <FaDatabase />,
    color: "#FBE6D8",
    borderColor: "#E9BFA1",
  },
  {
    title: "Cloud Computing",
    icon: <FaCloud />,
    color: "#DCEBFB",
    borderColor: "#9BC4F2",
  },
  {
    title: "Cyber Security",
    icon: <FaShieldAlt />,
    color: "#E8E2FA",
    borderColor: "#C8BAF5",
  },
  {
    title: "DevOps",
    icon: <MdDeveloperMode />,
    color: "#FFF2CC",
    borderColor: "#E9D37A",
  },
  {
    title: "Data Science",
    icon: <FaCode />,
    color: "#DCEBFB",
    borderColor: "#9BC4F2",
  },
  {
    title: "UI / UX",
    icon: <FaReact />,
    color: "#FBE6D8",
    borderColor: "#E9BFA1",
  },

];

const CategorySection = ({
    category,
    setCategory
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll
    ? allCategories
    : allCategories.slice(0, 6);

  return (
    <section className="course-categories">

      <div className="category-row">

        <div className="category-grid">

          {visibleCategories.map((item) => (

            <div
              key={item.title}
              className={`category-box ${
    category === item.title ? "active-category" : ""
}`}
              style={{
  backgroundColor: item.color,
  border:
    category === item.title
      ? `2px solid ${item.borderColor}`
      : "2px solid transparent",
  boxShadow:
    category === item.title
      ? `0 4px 12px ${item.borderColor}55`
      : "none",
}}
              onClick={() =>
    setCategory(prev =>
        prev === item.title ? "" : item.title
    )
}
            >

              <div className="category-icon">
                {item.icon}
              </div>

              <span>{item.title}</span>

            </div>

          ))}

        </div>

        <button
          className="view-more-btn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "View Less ▲" : "View More ▼"}
        </button>

      </div>

    </section>
  );
};

export default CategorySection;