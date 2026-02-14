import React, { useEffect, useState } from "react";
import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import { getCashFlowData } from "../../../Unfluke_helpers/backend_helper";

const thickBorderRows = [
  "Net Cash from Operating Activities",
  "Net Cash Used in Investing Activities",
  "Net Cash Used in Financing Activities",
  "Net Increase in Cash and Cash Equivalents",
];

const CashFlowTable = ({ isConsolidated }) => {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const params = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() =>{
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 useEffect(() => {
  async function getData() {
    setLoading(true);
    try {
      const result = await getCashFlow({
        params: {
          instrument: params.company,
          mode: isConsolidated ? "C" : "S",
        },
      });

      if (result && result.headers && result.rows) {
        setHeaders(result.headers);
        setRows(result.rows);

        // 👉 Auto-select the latest year
        const latestYear = result.headers[result.headers.length - 1];
        if (latestYear && typeof latestYear !== "undefined") {
          setSelectedYear(latestYear);
        }
      } else {

        setHeaders([]);
        setRows([]);
      }
    } catch (error) {
      console.error("Error fetching cash flow data:", error);
      setHeaders([]);
      setRows([]);
    } finally {
      setLoading(false);
    }

  }

  getData();
}, [params.company, isConsolidated]);



  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };
  console.log(headers);
  console.log(rows);

  const formatValue = (val) =>
    typeof val === "number" && !Number.isInteger(val) ? val.toFixed(2) : val;

  const renderRow = (row, index) => {
    const isExpanded = expandedSections[row[0]];
    const isThick = thickBorderRows.includes(row[0]);
    const isBoldOnly = row[0] === "Net cash flow"; // 🎯 New condition

    return (
      <React.Fragment key={index}>
        <tr
          className={`cursor-pointer ${
            index % 2 === 0
              ? "bg-white dark:bg-gray-800"
              : "bg-gray-50 dark:bg-gray-700"
          } ${
            isThick ? "border-t-2 border-gray-200 dark:border-gray-700" : ""
          } hover:bg-gray-100 dark:hover:bg-gray-600`}
          onClick={() => toggleSection(row[0])}
        >
          <td
            className={`sticky left-0 z-10 px-4 py-3 text-left whitespace-nowrap text-sm ${
              isThick
                ? "font-bold uppercase text-gray-900 dark:text-white"
                : isBoldOnly
                  ? "font-bold text-gray-900 dark:text-white"
                  : "font-medium text-gray-700 dark:text-gray-300"
            } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
          >
            {row[0]}
          </td>
          {row.slice(1).map((cell, cellIndex) => (
            <td
              key={cellIndex}
              className={`px-4 py-3 whitespace-nowrap text-sm text-center ${
                isThick || isBoldOnly
                  ? "font-bold text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {formatValue(cell)}
            </td>
          ))}
        </tr>
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-transparent">
        <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!headers.length || !rows.length) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  return (

    <div
      className={`mt-6 ${
        isMobile ? "" : "border border-gray-200 dark:border-gray-700"
      } rounded-xl w-full overflow-hidden`}
    >
      <div className="flex justify-between items-center mb-4">
        {isMobile ? (
          <p className="dark:text-white font-bold text-[17px] text-[#515050] mt-1 mb-1 px-1">
            Cash Flow
          </p>
        ) : (
          <h4 className="px-4   pt-4 text-xl font-bold text-gray-900 dark:text-white">
            Cash Flow
          </h4>
        )}

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
      {isMobile ? (
        <>
          {headers.length > 1 && (
            <div className="mb-4 px-2">
              <select
                className=" w-full px-4 py-2 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none"
                value={selectedYear || ""}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {headers.slice(1).map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>

                ))}
              </select>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-md font-bold text-gray-500 dark:text-gray-400 uppercase ">
                      Financial Metrics
                    </th>
                    <th className="px-4 py-3 text-center text-md font-bold text-gray-500 dark:text-gray-400 uppercase">
                      {selectedYear}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedYear &&
                    rows.map((row, idx) => {
                      const yearIndex = headers.indexOf(parseInt(selectedYear));
                      return (
                        <tr
                          key={idx}
                          className={`${
                            idx % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-700"
                          } hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                          <td
                            className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm  text-gray-900 dark:text-white bg-white dark:bg-gray-800`}
                          >
                            {row[0]}
                          </td>
                          <td
                            className={`px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300`}
                          >
                            {formatValue(row[yearIndex])}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-900  border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="sticky left-0 z-10 px-4 py-3 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 min-w-[200px]">
                    Financial Metrics
                  </th>
                  {headers.slice(1).map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-center text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {rows.map((row, index) => renderRow(row, index))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowTable;
