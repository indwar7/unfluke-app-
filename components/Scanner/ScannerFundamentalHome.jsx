import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, Plus, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

const ScannerFundamentalHome = ({ alerts }) => {
  const [defaultScanners, setDefaultScanners] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [subUrl, setSubUrl] = useState("");
  const globalState = useSelector((store) => store.Layout);

  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/scanner/getAdminScanners?type=fundamental`)
      .then((res) => {
        if (res && Object.keys(res).length > 0) {
          setDefaultScanners(res);
          setLoading(false);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    document.title = alerts ? "Alerts | Unfluke" : "Scanners | Unfluke";
  }, [alerts]);

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const ScannerCard = ({ title, items }) => {
    const displayItems = items.slice(0, 6);

    return (
      <div className="rounded-lg border  bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center  justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {capitalizeFirstLetter(title.replace("-", " "))}
          </h3>
          <button
            variant="default"
            size="sm"
            className="bg-blue-600 py-2 px-3 rounded-md hover:bg-blue-700 text-white"
            onClick={() =>
              navigate(`/${subUrl}/scanner-list`, {
                state: {
                  category: title,
                  scanners: items,
                  type: "fundamental",
                },
              })
            }
          >
            Show All Scans
          </button>
        </div>

        <div className="space-y-3 ">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="flex bg-gray-100 dark:bg-gray-900 items-center justify-between p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
              onClick={() => navigate(`/${subUrl}/scanner-funda`, { state: item })}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.name}
              </p>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full pt-20 mt-4 mb-8 max-w-[1920px] mx-auto bg-background-light dark:bg-gray-900 transition-colors duration-200">
      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">

        <div className="flex flex-col mb-2 sm:flex-row sm:items-center sm:justify-between pb-4 max-sm:pb-2 gap-4">
          {/* Left section: Title + breadcrumb */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Scanner Home
            </h1>
            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              Pages
              <ChevronRight className="w-4 h-4 mx-1" />
              Fundamental Scanner
            </p>
          </div>

          {/* Right section: Buttons */}
          <div className="flex items-center space-x-3">
            <button
              className="flex items-center border border-gray-400 dark:border-gray-700 font-semibold rounded-md px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
              onClick={() =>
                navigate(
                  `/${subUrl}/${alerts ? "alerts-home" : "scanner-home"}`,
                )
              }
            >
              <i className="ri-eye-fill mr-2"></i>
              View saved
            </button>

            <button
              className="flex items-center px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-600"
              onClick={() =>
                navigate(`/${subUrl}/scanner-funda`)
              }
            >
              <i className="ri-add-line mr-2"></i>
              Create new
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300">
              Loading scanners...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.keys(defaultScanners).map((category) => (
              <ScannerCard
                key={category}
                title={category}
                items={defaultScanners[category]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerFundamentalHome;
