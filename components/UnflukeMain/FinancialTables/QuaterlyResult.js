import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuaterlyResultData } from "../../../Unfluke_helpers/backend_helper";

const thickBorderRows = ["Operating Profit", "Profit Before Tax", "Net Profit"];

const QuaterlyResultTable = ({ isConsolidated }) => {
  const [headings, setHeadings] = useState([]);
  const [results, setResults] = useState({});
  const [years, setYears] = useState([]);
  // const [isConsolidated, setIsConsolidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const params = useParams();

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        const result = await getQuaterlyResultData({
          type: isConsolidated ? "C" : "S",
          capcode: params.company,
        });
        setHeadings(result.headings || []);
        setResults(result.results || {});
        setYears(Object.keys(result.results || {}).sort());
      } catch {
        setHeadings([]);
        setResults({});
        setYears([]);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [params.company, isConsolidated]);

  const formatValue = (val) =>
    typeof val === "number" && !Number.isInteger(val) ? val.toFixed(2) : val;

  const getValue = (year, rowName) => {
    const yearData = results[year];
    if (!yearData) return "-";
    for (const obj of yearData) {
      if (rowName in obj) return formatValue(obj[rowName]);
    }
    return "-";
  };

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-transparent">
        <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!headings.length || !years.length) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-xl w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h4 className="px-4 pt-4 font-bold text-xl text-gray-900 dark:text-white">
          Quarterly Results
        </h4>
        {/* <div className="text-sm text-gray-600 dark:text-gray-300">
          {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
          <button
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition"
            onClick={() => setIsConsolidated(!isConsolidated)}
          >
            View {isConsolidated ? "Standalone" : "Consolidated"}
          </button>
        </div> */}
      </div>

      <div className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-auto shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="sticky left-0 z-10 px-4 py-3 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 min-w-[200px]">
                Financial Metrics
              </th>
              {years.slice(-10).map((year) => (
                <th
                  key={year}
                  className="px-4 py-3 text-center text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {headings.map((item, idx) => {
              const isThick = thickBorderRows.includes(item.title);
              const evenRow = idx % 2 === 0;
              const bg = evenRow
                ? "bg-white dark:bg-gray-800"
                : "bg-gray-50 dark:bg-gray-700";

              if (item.children?.length) {
                const expanded = expandedSections[item.title];
                return (
                  <React.Fragment key={item.title}>
                    <tr
                      className={`cursor-pointer ${bg} ${
                        isThick
                          ? "border-t-2 border-gray-200 dark:border-gray-700"
                          : ""
                      } hover:bg-gray-100 dark:hover:bg-gray-600`}
                      onClick={() => toggleSection(item.title)}
                    >
                      <td
                        className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm ${
                          isThick
                            ? "font-bold uppercase text-gray-900 dark:text-white"
                            : "font-medium text-gray-700 dark:text-gray-300"
                        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
                      >
                        {item.title}
                        <span className="font-bold ml-2">
                          {expanded ? "−" : "+"}
                        </span>
                      </td>
                      {years.slice(-10).map((year) => (
                        <td
                          key={year}
                          className={`px-4 py-3 text-center whitespace-nowrap ${
                            isThick
                              ? "font-bold uppercase text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {getValue(year, item.title)}
                        </td>
                      ))}
                    </tr>
                    {expanded &&
                      item.children.map((child) => (
                        <tr
                          key={child}
                          className={`${bg} hover:bg-gray-100 dark:hover:bg-gray-600`}
                        >
                          <td className="sticky left-0 z-10 px-4 py-3 pl-8 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                            {child}
                          </td>
                          {years.slice(-10).map((year) => (
                            <td
                              key={year}
                              className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                            >
                              {getValue(year, child)}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </React.Fragment>
                );
              }

              return (
                <tr
                  key={item.title}
                  className={`${bg} ${
                    isThick
                      ? "border-t-2 border-gray-200 dark:border-gray-700"
                      : ""
                  } hover:bg-gray-100 dark:hover:bg-gray-600`}
                >
                  <td
                    className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm ${
                      isThick
                        ? "font-bold uppercase text-gray-900 dark:text-white"
                        : "font-medium text-gray-700 dark:text-gray-300"
                    } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
                  >
                    {item.title}
                  </td>
                  {years.slice(-10).map((year) => (
                    <td
                      key={year}
                      className={`px-4 py-3 text-center whitespace-nowrap text-sm ${
                        isThick
                          ? "font-bold uppercase text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {getValue(year, item.title)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuaterlyResultTable;
