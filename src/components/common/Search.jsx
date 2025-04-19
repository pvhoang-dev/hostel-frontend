// src/components/common/Search.jsx
import { useState } from "react";

const Search = ({
  onSearch,
  placeholder = "Search...",
  className = "",
  initialValue = "",
  debounceTime = 300,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTime <= 0) {
      onSearch(value);
      return;
    }

    // Clear previous timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set new timeout
    window.searchTimeout = setTimeout(() => {
      onSearch(value);
    }, debounceTime);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border rounded"
      />
      <div className="absolute left-3 top-2.5 text-gray-400">
        {/* Search icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};

export default Search;
