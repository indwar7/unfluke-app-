import React, { useEffect, useState, useRef } from "react";
import { getSearch } from "../../../Unfluke_helpers/backend_helper";
import { Search } from "lucide-react";

const SearchOption = () => {
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  const fetchSearchResults = async (query) => {
    try {
      const response = await getSearch({
        params: { searchQuery: query },
      });
      setResults(response || []);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setResults([]);
    }
  };

  const onChangeData = (val) => {
    setValue(val);
    if (val.trim() === "") {
      setResults([]);
      setDropdownOpen(false);
    } else {
      fetchSearchResults(val);
      setDropdownOpen(true);
    }
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-[500px]">
      <div className="flex items-center  bg-[#F4F8FD] border border-blue-100  dark:border-gray-700 rounded-md px-1 py-2 dark:bg-gray-700">
        <Search className="w-4 h-4 mx-2 text-gray-500 dark:text-gray-300" />
        <input
          type="text"
          className="w-[300px] border-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          placeholder="Search Company..."
          value={value}
          onChange={(e) => onChangeData(e.target.value)}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setResults([]);
              setDropdownOpen(false);
            }}
            className="text-gray-400 hover:text-red-500 ml-2"
            aria-label="Clear"
          >
            &#10005;
          </button>
        )}
      </div>

      {isDropdownOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-72 overflow-y-auto">
          {results.length > 0 ? (
            results.map((item, index) => (
              <a
                key={index}
                href={`/in/fundamentals/${item["Capitaline Code"]}`}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {item["Company Name"]}
              </a>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchOption;
