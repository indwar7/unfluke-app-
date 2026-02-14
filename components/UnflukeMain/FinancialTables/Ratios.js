import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRatiosData } from "../../../Unfluke_helpers/backend_helper";
import LineChart from "./RatioLineChart";
import MobRatioTable from "../../../Mobile/ MobRatioTable";

const RatiosTable = ({ isConsolidated }) => {
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState([]);
  // const [isConsolidated, setIsConsolidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const params = useParams();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const subRows = [];

  useEffect(() => {
    async function getData() {
      try {
        const result = await getRatiosData({
          params: {
            instrument: params.company,
            mode: isConsolidated ? "C" : "S",
          },
        });
        if (result?.headers && result?.rows) {
          setHeaders(result.headers);
          setRows(result.rows);

          const yearsRaw =
            result.rows.find((r) => r[0] === "Year End")?.slice(1) || [];
          const yearsFormatted = yearsRaw.map((d) => {
            const y = d.toString().slice(0, 4);
            const m = parseInt(d.toString().slice(4, 6)) - 1;
            return `${monthNames[m]} ${y}`;
          });

          const fields = ["PBIDT/Sales(%)", "ROE(%)", "ROCE (%)"];
          const processed = fields.map((f) => {
            const row = result.rows.find((r) => r[0] === f);
            return {
              title: f,
              categories: yearsFormatted,
              data: row?.slice(1) || [],
            };
          });

          setChartData(processed);
        } else {
          setHeaders([]);
          setRows([]);
        }
      } catch (err) {
        setHeaders([]);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [params.company, isConsolidated]);

  const toggleExpand = () => setExpanded(!expanded);
  const filteredRows = rows.filter((row) => !subRows.includes(row[0]));

  const formatValue = (val) =>
    val !== undefined && val !== null
      ? typeof val === "number"
        ? val.toFixed(2)
        : val
      : "-";

  //demo data

  return (
    <div className="mt-6 w-full">
      {loading ? (
        <div className="flex items-center justify-center h-32 bg-transparent">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : headers.length && filteredRows.length ? (
        <>
          <div className="mb-6">
            {isMobile? <p className="dark:text-white font-bold text-[17px] text-[#515050] mt-1 mb-1 px-1">
              Key Ratios
            </p>  :<h4 className="font-bold text-xl text-gray-900 dark:text-white">
              Key Ratios
            </h4>}
            
            
            {/* <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
              <button
                onClick={() => setIsConsolidated(!isConsolidated)}
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
              >
                View {isConsolidated ? "Standalone" : "Consolidated"}
              </button>
            </div> */}
          </div>

          {/* Chart section */}
          <div className={` ${isMobile ? 'grid grid-cols-1' : ':grid-cols-2'} xl:grid-cols-3 gap-4 mb-6`}>
            {chartData.map((chart, index) => (
              <div key={index}>
                <LineChart
                  title={chart.title}
                  categories={chart.categories}
                  data={chart.data}
                />
              </div>
            ))}
          </div>

          <div className={`${isMobile? 'dark:bg-gray-800' : 'overflow-x-auto dark:bg-gray-900 border border-gray-200 dark:border-gray-700'} sm: 
          bg-white rounded-lg shadow-sm`}>
             {isMobile ?  
             
             (<>
             {/*MobileTable */}
            <MobRatioTable
              headers={headers}
              filteredRows={filteredRows}
              monthNames={monthNames}
            />
            </>) :  <>
            {/* Desktop Table */}
            <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {headers.map((header, hIndex) => (
                    <th
                      key={hIndex}
                      className="text-center px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap  border-gray-200 dark:border-gray-700"
                    >
                      {hIndex === 0
                        ? ""
                        : `${
                            monthNames[
                              parseInt(header.toString().slice(-2)) - 1
                            ]
                          } ${header.toString().slice(0, 4)}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRows.map((row, rIndex) => {
                  const isOtherAssetsRow = row[0] === "Other Assets";
                  const hideRow = [
                    "Capitaline Code",
                    "Company Name",
                    "Year End",
                  ].includes(row[0]);

                  if (hideRow) return null;

                  const baseRow = (
                    <tr
                      key={rIndex}
                      className={
                        rIndex % 2 === 0
                          ? "bg-gray-50 dark:bg-gray-700"
                          : " bg-white dark:bg-gray-800"
                      }
                    >
                      {row.map((cell, cIndex) => {
                        const isFirstCol = cIndex === 0;
                        const commonClasses = "px-4 py-2 whitespace-nowrap";

                        return (
                          <td
                            key={cIndex}
                            className={`${commonClasses} ${
                              isFirstCol
                                ? "sticky left-0 z-10 bg-white dark:bg-gray-800 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700"
                                : "text-gray-700 dark:text-gray-300 text-center"
                            }`}
                            onClick={
                              isOtherAssetsRow && isFirstCol
                                ? toggleExpand
                                : undefined
                            }
                          >
                            {isOtherAssetsRow && isFirstCol ? (
                              <>
                                {cell}{" "}
                                <span className="font-bold ml-2">
                                  {expanded ? "−" : "+"}
                                </span>
                              </>
                            ) : (
                              formatValue(cell)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );

                  const expandedRows =
                    isOtherAssetsRow && expanded
                      ? subRows.map((subRow, subIndex) => {
                          const matching = rows.find((r) => r[0] === subRow);
                          if (!matching) return null;
                          return (
                            <tr
                              key={`sub-${subIndex}`}
                              className={
                                (rIndex + subIndex + 1) % 2 === 0
                                  ? "bg-white dark:bg-gray-800"
                                  : "bg-gray-50 dark:bg-gray-700"
                              }
                            >
                              {matching.map((cell, i) => (
                                <td
                                  key={i}
                                  className="px-4 py-2 whitespace-nowrap  border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center"
                                >
                                  {formatValue(cell)}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      : null;

                  return (
                    <React.Fragment key={rIndex}>
                      {baseRow}
                      {expandedRows}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table></> }

           
            
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      )}
    </div>
  );
};

export default RatiosTable;
