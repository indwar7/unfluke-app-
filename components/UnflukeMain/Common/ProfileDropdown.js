import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const ProfileDropdown = () => {
  const [userName, setUserName] = useState("Admin");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem("authUser")) {
      const obj = JSON.parse(localStorage.getItem("authUser"));
      const name = obj.username || obj.name || "Admin";
      setUserName(name);
    }
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };
  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.addEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const firstName = userName.split(" ")[0];

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-600"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">{initials}</span>
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {firstName}
        </span>
      </button>

      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
        >
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
            Welcome, {userName}!
          </div>
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Profile
          </Link>
          <Link
            to="/leads"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            My Earnings
          </Link>
          {/* <Link
            to="/funds"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Funds
          </Link> */}
          <div className="border-t border-gray-200 dark:border-gray-600" />
          <Link
            to="/logout"
            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Logout
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
