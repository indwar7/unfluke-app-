import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBalanceSheetData } from "../../../Unfluke_helpers/backend_helper";
import { Select } from "antd";
import item from "list.js/src/item";
import MyCollapse from "../../../Mobile/Collapse";

const thickBorderRows = [
  "TOTAL EQUITY AND LIABILITY",
  "TOTAL ASSETS",
  "Fixed Assets",
];

const { Option } = Select;

const BalanceSheetTable = ({ isConsolidated }) => {
  const [headings, setHeadings] = useState([]);
  const [results, setResults] = useState({});
  const [years, setYears] = useState([]);
  // const [isConsolidated, setIsConsolidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const params = useParams();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const result = await getBalanceSheetData({
          type: isConsolidated ? "C" : "S",
          capcode: params.company,
        });
        setHeadings(result.headings || []);
        setResults(result.results || {});
        const yrs = Object.keys(result.results || {}).sort();
        setYears(yrs);
        if (yrs.length) setSelectedYear(yrs[yrs.length - 1]);
      } catch {
        setHeadings([]);
        setResults({});
        setYears([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [params.company, isConsolidated]);

  const formatValue = (val) =>
    typeof val === "number" && !Number.isInteger(val) ? val.toFixed(2) : val;

  const getValue = (year, name, parent) => {
    const arr = results[year] || [];
    if (!parent) {
      const obj = arr.find((o) => name in o);
      return obj ? formatValue(obj[name]) : "-";
    }
    let found = false;
    for (const o of arr) {
      if (parent in o) found = true;
      if (found && name in o) return formatValue(o[name]);
    }
    return "-";
  };

  const toggleSection = (name) =>
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

  const renderExpandableSection = (item, idx, mobile = false) => {
    const isThick = thickBorderRows.includes(item.title);
    const yrs = mobile ? [selectedYear] : years.slice(-10);
    const expanded = expandedSections[item.title];

    return (
      <React.Fragment key={item.title}>
        <tr
          className={`${
            idx % 2 === 0
              ? "bg-white dark:bg-gray-800"
              : "bg-gray-50 dark:bg-gray-700"
          } ${
            isThick ? "border-t-2 border-gray-200 dark:border-gray-700" : ""
          } hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer`}
          onClick={() => toggleSection(item.title)}
        >
          <td
            className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm ${
              isThick ? "font-bold uppercase" : "font-medium"
            } text-gray-900 dark:text-white ${
              mobile
                ? "bg-white dark:bg-gray-800"
                : "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
            }`}
          >
            {item.title}
            <span className="font-bold ml-2">{expanded ? "−" : "+"}</span>
          </td>
          {yrs.map((yr) => (
            <td
              key={yr}
              className={`px-4 py-3 whitespace-nowrap text-sm text-center ${
                isThick
                  ? "font-bold uppercase"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {getValue(yr, item.title)}
            </td>
          ))}
        </tr>
        {expanded &&
          item.children.map((child) => (
            <tr
              key={child}
              className={`${
                idx % 2 === 0
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-700"
              } hover:bg-gray-100 dark:hover:bg-gray-600`}
            >
              <td
                className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 pl-8 ${
                  mobile
                    ? "bg-white dark:bg-gray-800"
                    : "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
                }`}
              >
                {child}
              </td>
              {yrs.map((yr) => (
                <td
                  key={yr}
                  className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300"
                >
                  {getValue(yr, child, item.title)}
                </td>
              ))}
            </tr>
          ))}
      </React.Fragment>
    );
  };

  const renderRow = (item, idx, mobile = false) => {
    if (item.children) return renderExpandableSection(item, idx, mobile);

    const isThick = thickBorderRows.includes(item.title);
    const yrs = mobile ? [selectedYear] : years.slice(-10);
    return (
      <tr
        key={item.title}
        className={`${
          idx % 2 === 0
            ? "bg-white dark:bg-gray-800"
            : "bg-gray-50 dark:bg-gray-700"
        } ${
          isThick ? "border-t-2 border-gray-200 dark:border-gray-700" : ""
        } hover:bg-gray-100 dark:hover:bg-gray-600`}
      >
        <td
          className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm ${
            isThick ? "font-bold uppercase" : "font-medium"
          } text-gray-900 dark:text-white ${
            mobile
              ? "bg-white dark:bg-gray-800"
              : "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
          }`}
        >
          {item.title}
        </td>
        {yrs.map((yr) => (
          <td
            key={yr}
            className={`px-4 py-3 whitespace-nowrap text-sm text-center ${
              isThick
                ? "font-bold uppercase"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {getValue(yr, item.title)}
          </td>
        ))}
      </tr>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-32 bg-transparent">
        <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (years.length === 0)
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );

  return (
    <div className={` ${isMobile? 'mt-3': 'mt-6 border border-gray-200 dark:border-gray-700'} rounded-xl w-full overflow-hidden`}>
      <div className={`flex ${isMobile? 'flex-col': 'flex-row items-center'} justify-between mb-4 gap-2`}>
      {isMobile? <p className=" dark:text-white font-bold text-[17px] text-[#515050] mt-1 mb-1 px-1">
          Balance Sheet ({selectedYear})
        </p>: <h4 className="px-4 pt-4 text-xl font-bold text-gray-900 dark:text-white">
          Balance Sheet
        </h4>}
        
        
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
        <div className="space-y-4">
          <div className="relative w-full">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className=" w-full px-4 py-2 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none"
            >
              {years.slice(-10).map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            {/* <Select
              value={selectedYear}
              onChange={(value) => setSelectedYear(value)}
              className="!w-full !h-9 !text-sm !rounded-lg dark:!bg-gray-900 !bg-gray-900 !shadow-none"
              popupClassName="custom-date-dropdown"
              dropdownStyle={{ borderRadius: "0.5rem", padding: "4px" }}
            >
              {years.slice(-10).map((yr) => (
                <Option
                  key={yr}
                  value={yr}
                  className="!text-sm !px-3 !py-2 hover:!bg-gray-100"
                >
                  {yr}
                </Option>
              ))}
            </Select> */}
            {/* <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
							arrow icon
							<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
						</div> */}
          </div>

          <div className={`bg-white   ${isMobile? 'dark:bg-gray-800' : 'dark:bg-gray-900 border border-gray-200'} rounded-lg  dark:border-gray-700 overflow-hidden shadow-sm`}>
            {/* <div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
								<thead className="bg-gray-50 dark:bg-gray-800">
									<tr>
										<th className="px-4 py-3 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Financial Metrics</th>
										<th className="px-4 py-3 text-center text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">{selectedYear}</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
									{headings.map((item, idx) => renderRow(item, idx, true))}
								</tbody>
							</table>
						</div> */}
            {headings.map((item, idx) => (
              <MyCollapse
                key={idx}
                item={item}
                yr={selectedYear}
                getValue={getValue}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900   border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="sticky left-0 z-10 px-4 py-3 text-left text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 min-w-[200px]">
                    Financial Metrics
                  </th>
                  {years.slice(-10).map((yr) => (
                    <th
                      key={yr}
                      className="px-4 py-3 text-center text-md font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]"
                    >
                      {yr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {headings.map((item, idx) => renderRow(item, idx))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetTable;
