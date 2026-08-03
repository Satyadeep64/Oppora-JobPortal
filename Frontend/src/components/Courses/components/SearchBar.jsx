import { FaSearch } from "react-icons/fa";

const SearchBar = ({ search, setSearch }) => {
  return (
    <div className="course-search">

      <input
        type="text"
        placeholder="Search Courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button className="search-btn">
        <FaSearch />
      </button>

    </div>
  );
};

export default SearchBar;