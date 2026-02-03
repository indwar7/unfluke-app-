import React, { useEffect, useState } from "react";
import Cumulative from "./Graphs/Cumulative";
import DrawDown from "./Graphs/DrawDown";
import Profit from "./Graphs/Profit";

function ProfitGraph(props) {
  const [arrowNavTab, setarrowNavTab] = useState("2");
  const arrowNavToggle = (tab) => {
    if (arrowNavTab !== tab) {
      setarrowNavTab(tab);
    }
  };

  return (
    <div className="w-full my-4 ">
      <div className="bg-white dark:bg-gray-800 dark:text-gray-200 shadow-md rounded-xl p-4">
        {/* Nav Row aligned to right */}
        <div className="flex flex-wrap justify-end gap-2 mb-4">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
          <button
              onClick={() => arrowNavToggle("1")}
              className={`px-4 py-1.5 rounded-md font-medium text-sm ${
                arrowNavTab === "1"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-200   dark:hover:bg-gray-700"
              }`}
            >
              Cumulative Profit
            </button>
            <button
              onClick={() => arrowNavToggle("2")}
              className={`px-4 py-1.5 rounded-md font-medium text-sm ${
                arrowNavTab === "2"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Profit
            </button>
            
            <button
              onClick={() => arrowNavToggle("3")}
              className={`px-4 py-1.5 rounded-md font-medium text-sm ${
                arrowNavTab === "3"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-200  dark:hover:bg-gray-700"
              }`}
            >
              Drawdown
            </button>
          </div>

          {/* Optional: Fullscreen Icon */}
        </div>

        {/* Tab Content */}
        <div className="text-gray-700 dark:bg-gray-900">
          {arrowNavTab === "1" && (
            <Cumulative cummulative={props.cummulative} months={props.months} />
          )}
          {arrowNavTab === "2" && (
            <Profit totalPNL={props.totalPNL} dates={props.dates} />
          )}
          {arrowNavTab === "3" && (
            <DrawDown drawDawn={props.drawDawn} months={props.months} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfitGraph;
