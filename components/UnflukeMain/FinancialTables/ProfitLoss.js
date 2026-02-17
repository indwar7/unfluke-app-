// import React, { useEffect, useState } from "react";
// import { Spinner, Table } from "reactstrap";
// import { useParams } from "react-router-dom";
// import { getProfitLossData } from "../../../Unfluke_helpers/backend_helper";

// const thickBorderRows = [
//   "Operating Profit",
//   "Profit Before Tax",
//   "Net Profit",
// ];

// const ProfitLossTable = () => {
//   const [headings, setHeadings] = useState([]);
//   const [results, setResults] = useState({});
//   const [years, setYears] = useState([]);
//   const [isConsolidated, setIsConsolidated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [expandedSections, setExpandedSections] = useState({});
//   const params = useParams();

//   // CSS variables for theme
//   useEffect(() => {
//     const styleSheet = document.createElement("style");
//     styleSheet.textContent = `
//       html[data-bs-theme='light'] {
//         --vz-light-custom: #F7FBFE;
//         --vz-thead-custom: #FAFAFA;
//       }
//       html[data-bs-theme='dark'] {
//         --vz-light-custom: var(--vz-light);
//         --vz-thead-custom: var(--vz-light);
//       }
//     `;
//     document.head.appendChild(styleSheet);
//     return () => {
//       document.head.removeChild(styleSheet);
//     };
//   }, []);

//   const colors = {
//     even: "var(--vz-card-bg)",
//     odd: "var(--vz-light-custom)",
//     border: "var(--vz-border-color)",
//     text: "var(--vz-text-color)",
//   };

//   useEffect(() => {
//     async function getData() {
//       setLoading(true);
//       try {
//         const result = await getProfitLossData({
//           type: isConsolidated ? "C" : "S",
//           capcode: params.company,
//         });

//         setHeadings(result.headings || []);
//         setResults(result.results || {});
//         setYears(Object.keys(result.results || {}).sort());
//       } catch (error) {
//         setHeadings([]);
//         setResults({});
//         setYears([]);
//       } finally {
//         setLoading(false);
//       }
//     }
//     getData();
//   }, [params.id, params.company, isConsolidated]);

//     const formatValue = (val) => {
//   if (typeof val === "number" && !Number.isInteger(val)) {
//     return val.toFixed(2);
//   }
//   return val;
// };

//   // Returns the value for a given row name and year, or "-" if not found
//   const getValue = (year, rowName) => {
//   const yearData = results[year];
//   if (!yearData) return "-";
//   for (const obj of yearData) {
//     if (rowName in obj) return formatValue(obj[rowName]);
//   }
//   return "-";
// };

//   const toggleSection = (sectionName) => {
//     setExpandedSections((prev) => ({
//       ...prev,
//       [sectionName]: !prev[sectionName],
//     }));
//   };

//   //

//   // Render expandable section
//   const renderExpandableSection = (item, idx) => (
//     <React.Fragment key={item.title}>
//       <tr
//         style={{
//           backgroundColor: idx % 2 === 0 ? colors.even : colors.odd,
//           borderTop: thickBorderRows.includes(item.title)
//             ? "4px solid var(--vz-border-color)"
//             : undefined,
//           cursor: "pointer",
//         }}
//         onClick={() => toggleSection(item.title)}
//       >
//         <td
//           style={{
//             fontWeight: thickBorderRows.includes(item.title) ? "bold" : "500",
//             textTransform: thickBorderRows.includes(item.title)
//               ? "uppercase"
//               : undefined,
//             border: "1px solid var(--vz-border-color)",
//             userSelect: "none",
//             whiteSpace: "nowrap",
//             cursor: "pointer",
//              padding : "5px",
//           }}
//         >
//           {item.title}
//           <span style={{ fontWeight: "bold", marginLeft: 8 }}>
//             {expandedSections[item.title] ? "−" : "+"}
//           </span>
//         </td>
//         {years.slice(-10).map((year) => (
//           <td
//             key={year}
//             style={{
//               border: "1px solid var(--vz-border-color)",
//               fontWeight: thickBorderRows.includes(item.title)
//                 ? "bold"
//                 : "400",
//               textTransform: thickBorderRows.includes(item.title)
//                 ? "uppercase"
//                 : undefined,
//                  padding : "5px",
//             }}
//           >
//             {getValue(year, item.title)}
//           </td>
//         ))}
//       </tr>
//       {expandedSections[item.title] &&
//         item.children.map((child) => (
//           <tr
//             key={child}
//             style={{
//               backgroundColor: idx % 2 === 0 ? colors.even : colors.odd,
//             }}
//           >
//             <td
//               style={{
//                 padding : "5px",
//                 paddingLeft: "24px",
//                 border: "1px solid var(--vz-border-color)",
//               }}
//             >
//               {child}
//             </td>
//             {years.slice(-10).map((year) => (
//               <td
//                 key={year}
//                 style={{
//                    padding : "5px",
//                   border: "1px solid var(--vz-border-color)",
//                 }}
//               >
//                 {getValue(year, child)}
//               </td>
//             ))}
//           </tr>
//         ))}
//     </React.Fragment>
//   );

//   return (
//     <React.Fragment>
//       {loading ? (
//         <div className="text-center my-4">
//           <Spinner color="primary" />
//         </div>
//       ) : (
//         <div
//           className="card"
//           style={{
//             width: "100%",
//             borderRadius: "12px",
//             backgroundColor: "var(--vz-body-bg)",
//             border: "none",
//           }}
//         >
//           <h4 style={{ fontWeight: "600", marginBottom: "4px" }}>
//             Profit & Loss
//           </h4>
//           <div
//             style={{
//               fontSize: "14px",
//               color: "#666",
//               marginBottom: "16px",
//               paddingBottom: "10px",
//             }}
//           >
//             {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
//             <span
//               style={{
//                 cursor: "pointer",
//                 color: "#3F5189",
//                 textDecoration: "underline",
//               }}
//               onClick={() => setIsConsolidated(!isConsolidated)}
//             >
//               View {isConsolidated ? "Standalone" : "Consolidated"}
//             </span>
//           </div>

//           <div
//             style={{
//               overflowX: "auto",
//               border: "1px solid var(--vz-border-color)",
//               borderRadius: "8px",
//             }}
//           >
//             <Table style={{ fontSize: "0.8rem", borderCollapse: "collapse" }} hover>
//               <thead>
//                 <tr>
//                   <th
//                     style={{
//                       backgroundColor: "var(--vz-thead-custom)",
//                       border: "1px solid var(--vz-border-color)",
//                       fontWeight: "600",
//                        padding : "5px",
//                       whiteSpace: "nowrap",
//                       color: "var(--vz-text-color)",
//                     }}
//                   ></th>
//                   {years.slice(-10).map((header, idx) => (
//                     <th
//                       key={idx}
//                       style={{
//                         backgroundColor: "var(--vz-thead-custom)",
//                         border: "1px solid var(--vz-border-color)",
//                         fontWeight: "600",
//                          padding : "5px",
//                         whiteSpace: "nowrap",
//                         color: "var(--vz-text-color)",
//                       }}
//                     >
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {headings.map((item, idx) => {
//                   // Expandable section
//                   if (item.children && item.children.length > 0) {
//                     return renderExpandableSection(item, idx);
//                   }
//                   // Thick border rows
//                   if (thickBorderRows.includes(item.title)) {
//                     return (
//                       <tr
//                         key={item.title}
//                         style={{
//                           backgroundColor: idx % 2 === 0 ? colors.even : colors.odd,
//                           borderTop: "4px solid var(--vz-border-color)",
//                         }}
//                       >
//                         <td
//                           style={{
//                             textTransform: "uppercase",
//                             fontWeight: "bold",
//                             border: "1px solid var(--vz-border-color)",
//                              padding : "5px",
//                           }}
//                         >
//                           {item.title}
//                         </td>
//                         {years.slice(-10).map((year) => (
//                           <td
//                             key={year}
//                             style={{
//                               border: "1px solid var(--vz-border-color)",
//                               fontWeight: "bold",
//                               textTransform: "uppercase",
//                                padding : "5px",
//                             }}
//                           >
//                             {getValue(year, item.title)}
//                           </td>
//                         ))}
//                       </tr>
//                     );
//                   }
//                   // Regular row
//                   return (
//                     <tr
//                       key={item.title}
//                       style={{
//                         backgroundColor: idx % 2 === 0 ? colors.even : colors.odd,
//                       }}
//                     >
//                       <td
//                         style={{
//                           fontWeight: "400",
//                           border: "1px solid var(--vz-border-color)",
//                            padding : "5px",
//                         }}
//                       >
//                         {item.title}
//                       </td>
//                       {years.slice(-10).map((year) => (
//                         <td
//                           key={year}
//                           style={{
//                             border: "1px solid var(--vz-border-color)",
//                              padding : "5px",
//                           }}
//                         >
//                           {getValue(year, item.title)}
//                         </td>
//                       ))}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </Table>
//           </div>
//         </div>
//       )}
//     </React.Fragment>
//   );
// };

// export default ProfitLossTable;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProfitLossData } from "../../../Unfluke_helpers/backend_helper";

const thickBorderRows = ["Operating Profit", "Profit Before Tax", "Net Profit"];

const ProfitLossTable = ({ isConsolidated }) => {
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
        const result = await getProfitLossData({
          type: isConsolidated ? "C" : "S",
          capcode: params.company,
        });

        setHeadings(result.headings || []);
        setResults(result.results || {});
        const sortedYears = Object.keys(result.results || {}).sort();
        setYears(sortedYears);
        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[sortedYears.length - 1]);
        }
      } catch (error) {
        setHeadings([]);
        setResults({});
        setYears([]);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [params.id, params.company, isConsolidated]);

  const formatValue = (val) => {
    if (typeof val === "number" && !Number.isInteger(val)) {
      return val.toFixed(2);
    }
    return val;
  };

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

  const renderExpandableSection = (item, idx, isMobileView = false) => {
    const isExpanded = expandedSections[item.title];
    const isThickBorder = thickBorderRows.includes(item.title);
    const recentYears = isMobileView ? [selectedYear] : years.slice(-10);

    return (
      <React.Fragment key={item.title}>
        <tr
          className={`${
            idx % 2 === 0
              ? "bg-white dark:bg-gray-800"
              : "bg-gray-50 dark:bg-gray-700"
          } ${
            isThickBorder
              ? "border-t-2 border-gray-200 dark:border-gray-700"
              : ""
          } hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer`}
          onClick={() => toggleSection(item.title)}
        >
          <td
            className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm ${
              isThickBorder ? "font-bold uppercase" : "font-medium"
            } text-gray-900 dark:text-white ${
              isMobileView
                ? "bg-white dark:bg-gray-800"
                : "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
            }`}
          >
            {item.title}
            <span className="font-bold ml-2">{isExpanded ? "−" : "+"}</span>
          </td>
          {recentYears.map((year) => (
            <td
              key={year}
              className={`px-4 py-3 whitespace-nowrap text-sm text-center ${
                isThickBorder
                  ? "font-bold uppercase"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {getValue(year, item.title)}
            </td>
          ))}
        </tr>
        {isExpanded &&
          item.children.map((child) => (
            <tr
              key={child}
              className={`${
                idx % 2 === 0
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-700"
              } hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <td
                className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 pl-8 ${
                  isMobileView
                    ? "bg-white dark:bg-gray-800"
                    : "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
                }`}
              >
                {child}
              </td>
              {recentYears.map((year) => (
                <td
                  key={year}
                  className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300"
                >
                  {getValue(year, child)}
                </td>
              ))}
            </tr>
          ))}
      </React.Fragment>
    );
  };

  const renderRow = (item, idx, isMobileView = false) => {
    const isThickBorder = thickBorderRows.includes(item.title);
    const recentYears = isMobileView ? [selectedYear] : years.slice(-10);

    if (item.children && item.children.length > 0) {
      return renderExpandableSection(item, idx, isMobileView);
    }

    return (
      <tr
        key={item.title}
        className={`${
          idx % 2 === 0
            ? "bg-white dark:bg-gray-800"
            : "bg-gray-50 dark:bg-gray-700"
        } ${
          isThickBorder ? "border-t-2 border-gray-200 dark:border-gray-700" : ""
        } hover:bg-gray-100 dark:hover:bg-gray-700`}
      >
        <td
          className={`sticky left-0 z-10 px-4 py-3 whitespace-nowrap text-sm ${
            isThickBorder ? "font-bold uppercase" : "font-medium"
          } text-gray-900 dark:text-white ${
            isMobileView
              ? "bg-white dark:bg-gray-800"
              : "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
          }`}
        >
          {item.title}
        </td>
        {recentYears.map((year) => (
          <td
            key={year}
            className={`px-4 py-3 whitespace-nowrap text-sm text-center ${
              isThickBorder
                ? "font-bold uppercase"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {getValue(year, item.title)}
          </td>
        ))}
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-transparent">
        <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (years.length === 0) {
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
            Profit & Loss
          </p>
        ) : (
          <h4 className="px-4   pt-4 text-xl font-bold text-gray-900 dark:text-white">
            Profit & Loss
          </h4>
        )}

        {/* <div className="text-sm text-gray-500 dark:text-gray-400">
          {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
          <button
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
            onClick={() => setIsConsolidated(!isConsolidated)}
          >
            View {isConsolidated ? "Standalone" : "Consolidated"}
          </button>
        </div> */}
      </div>

      {/* Mobile View */}
      {isMobile ? (
        <div className="space-y-4">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className=" w-full px-4 py-2 pr-10 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none"
            >
              {years.slice(-10).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

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
                  {headings.map((item, idx) => renderRow(item, idx, true))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="sticky left-0 z-10 px-4 py-3 text-left text-md font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 min-w-[200px]">
                    Financial Metrics
                  </th>
                  {years.slice(-10).map((year) => (
                    <th
                      key={year}
                      className="px-4 py-3 text-center text-md font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]"
                    >
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {headings.map((item, idx) => renderRow(item, idx))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLossTable;
