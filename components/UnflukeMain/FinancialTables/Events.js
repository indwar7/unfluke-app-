import React, { useEffect, useState, useMemo } from "react";
import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import moment from "moment";
import { getEventsData } from "../../../Unfluke_helpers/backend_helper";
import TableContainer from "../Common/TableContainer";
import "./Bulk&Block.css";

const CorporateEventsTable = ({ isConsolidated }) => {
  const [loading, setLoading] = useState(true);
  const [dividendData, setDividendData] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [splitData, setSplitData] = useState([]);
  const [insiderTradingData, setInsiderTradingData] = useState([]);

  // Toggle between Consolidated (C) and Standalone (S)
  // const [isConsolidated, setIsConsolidated] = useState(false);
  const params = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getEventsData({
          instrument: params.company,
          mode: isConsolidated ? "C" : "S",
        });

        // Expected structure: { dividend: [...], bonus: [...], split: [...], insiderTrading: [...] }
        if (
          result &&
          Array.isArray(result.dividend) &&
          Array.isArray(result.split)
        ) {
          setDividendData(JSON.parse(JSON.stringify(result.dividend)));
          setSplitData(JSON.parse(JSON.stringify(result.split)));
          setBonusData(JSON.parse(JSON.stringify(result.bonus)));
          result["insiderTrading"] = JSON.parse(
            JSON.stringify(result.insiderTrading),
          );
          let insiderTradingdata = result.insiderTrading.map((row) => {
            // console.log(Number(row["Number of Securities Acquired/Disposed/Pledge etc."]))
            return {
              ...row,
              "Number of Securities held Prior to acquisition/Disposed": Number(
                row["Number of Securities held Prior to acquisition/Disposed"],
              ),
              "Number of Securities Acquired/Disposed/Pledge etc": Number(
                row["Number of Securities Acquired/Disposed/Pledge etc"],
              ),
              "Value  of Securities Acquired/Disposed/Pledge etc": Number(
                row["Value  of Securities Acquired/Disposed/Pledge etc"],
              ),
              "Number of Securities held Post  acquisition/Disposed/Pledge etc":
                Number(
                  row[
                    "Number of Securities held Post  acquisition/Disposed/Pledge etc"
                  ],
                ),
            };
          });
          setInsiderTradingData(insiderTradingdata);
        } else {
          setDividendData([]);
          setSplitData([]);
          setBonusData([]);
          setInsiderTradingData([]);
        }
      } catch (error) {
        console.error("Error fetching Events data:", error);
        setDividendData([]);
        setSplitData([]);
        setBonusData([]);
        setInsiderTradingData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.company, isConsolidated]);

  // If all data arrays are empty, show "No data available."
  const noData =
    dividendData.length === 0 &&
    bonusData.length === 0 &&
    splitData.length === 0 &&
    insiderTradingData.length === 0;

  // Define column definitions for Dividends table
  const dividendColumns = useMemo(
    () => [
      {
        header: "Source Date",
        accessorKey: "Source Date",
        sortingFn: "dateSort",
      },
      {
        header: "Type",
        accessorKey: "Type",
      },
      {
        header: "Ex-Date",
        accessorKey: "Ex-Date",
        sortingFn: "dateSort",
      },
      {
        header: "Dividend Per Share",
        accessorKey: "Dividend Per Share",
      },
    ],
    [],
  );

  // Define column definitions for Bonus table (Ratio column uses a custom cell)
  const bonusColumns = useMemo(
    () => [
      {
        header: "Source Date",
        accessorKey: "Source Date",
        sortingFn: "dateSort",
      },
      {
        header: "Ex Bonus Date",
        accessorKey: "Ex Bonus Date",
        sortingFn: "dateSort",
      },
      {
        header: "Record Date",
        accessorKey: "Record Date",
        sortingFn: "dateSort",
      },
      {
        header: "Ratio",
        accessorKey: "Ratio", // Dummy key; cell rendering is custom
        cell: (info) => {
          const row = info.row.original;
          return `${row["Ratio(Numerator)"]}:${row["Ratio(Denominator)"]}`;
        },
      },
    ],
    [],
  );

  // Define column definitions for Stock Split table
  const splitColumns = useMemo(
    () => [
      {
        header: "Source Date",
        accessorKey: "Source Date",
        sortingFn: "dateSort",
      },
      {
        header: "Stock Split Date",
        accessorKey: "Stock Split Date",
        sortingFn: "dateSort",
      },
      {
        header: "Record Date",
        accessorKey: "Record Date",
        sortingFn: "dateSort",
      },
      {
        header: "Ratio",
        accessorKey: "Ratio",
      },
    ],
    [],
  );

  // Insider Trading column definitions with custom header mapping and date formatting for date columns
  const insiderTradingHeaders = [
    "Name of Acquirer/Seller",
    "Category of person",
    "Number of Securities held Prior to acquisition/Disposed",
    "%   of  Securities held Prior to acquisition/Disposed",
    "Number of Securities Acquired/Disposed/Pledge etc",
    "Value  of Securities Acquired/Disposed/Pledge etc",
    "Transaction Type ( Buy/Sale/Pledge/Revoke/Invoke)",
    "Number of Securities held Post  acquisition/Disposed/Pledge etc",
    "Post-Transaction % of Shareholding",
    "Date of acquisition of shares/sale of shares/Date of Allotment(From date)",
  ];

  const insiderTradingMapper = {
    "Name of Acquirer/Seller": "Buyer/Seller",
    "Category of person": "Category",
    "Number of Securities held Prior to acquisition/Disposed":
      "Prior trade Quantity",
    "%   of  Securities held Prior to acquisition/Disposed": "Prior trade %",
    "Number of Securities Acquired/Disposed/Pledge etc": "Trade Quantity",
    "Value  of Securities Acquired/Disposed/Pledge etc": "Total Value",
    "Transaction Type ( Buy/Sale/Pledge/Revoke/Invoke)": "Transaction Type",
    "Number of Securities held Post  acquisition/Disposed/Pledge etc":
      "Post trade Quantity",
    "Post-Transaction % of Shareholding": "Post trade %",
    "Date of acquisition of shares/sale of shares/Date of Allotment(From date)":
      "Trade Date",
  };

  const insiderTradingColumns = useMemo(() => {
    return insiderTradingHeaders.map((header) => {
      console.log("-=-=-=--=-=>", header);
      const isDate = header.toLowerCase().includes("date");
      if (isDate) {
        return {
          header: insiderTradingMapper[header] || header,
          accessorKey: header,
          sortingFn: isDate ? "dateSort" : undefined,
        };
      } else {
        return {
          header: insiderTradingMapper[header] || header,
          accessorKey: header,
        };
      }
    });
  }, [insiderTradingHeaders]);

  return (
    <React.Fragment>
      {loading ? (
        <div className="flex items-center justify-center h-32 bg-transparent">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {noData ? (
            <p>No data available.</p>
          ) : (
            <>
              {/* Dividends Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl">
                <h4 className="px-4 my-2 mb-4 pt-4 text-xl font-bold text-gray-900 dark:text-white">
                  Dividends
                </h4>
                {/* <div className="px-4"
                  style={{ color: "hsl(207, 12%, 43%)", marginBottom: "20px" }}
                >
                  {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
                  <a
                    href="#toggle"
                    onClick={() => setIsConsolidated(!isConsolidated)}
                    className="underline text-blue-600"
                  >
                    View {isConsolidated ? "Standalone" : "Consolidated"}
                  </a>
                </div> */}
                {dividendData.length > 0 ? (
                  <div>
                    <TableContainer
                      columns={dividendColumns}
                      data={dividendData}
                      customPageSize={15}
                      tableClass="table-bordered"
                      theadClass="custom-inline-thead bg-primary-subtle"
                    />
                  </div>
                ) : (
                  <div className=" flex w-full justify-center items-center border-t">
                    <p className="p-8 text-gray-200">No data available.</p>
                  </div>
                )}
              </div>

              {/* Bonus Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl mt-8">
                <h4 className="px-4 my-2 mb-4 pt-4 text-xl font-bold text-gray-900 dark:text-white">
                  Bonus
                </h4>
                {/* <div className="px-4"
                  style={{ color: "hsl(207, 12%, 43%)", marginBottom: "20px" }}
                >
                  {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
                  <a
                    href="#toggle"
                    onClick={() => setIsConsolidated(!isConsolidated)}
                    className="underline text-blue-600"
                    
                  >
                    View {isConsolidated ? "Standalone" : "Consolidated"}
                  </a>
                </div> */}
                {bonusData.length > 0 ? (
                  <div>
                    <TableContainer
                      columns={bonusColumns}
                      data={bonusData}
                      customPageSize={15}
                      tableClass="table-bordered"
                      theadClass="custom-inline-thead bg-primary-subtle"
                    />
                  </div>
                ) : (
                  <div className=" flex w-full justify-center items-center border-t">
                    <p className="p-8 text-gray-800">No data available.</p>
                  </div>
                )}
              </div>

              {/* Stock Split Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl mt-8">
                <h4 className="px-4 my-2 mb-4 pt-4 text-xl font-bold text-gray-900 dark:text-white">
                  Stock Split
                </h4>
                {/* <div className="px-4"
                  style={{ color: "hsl(207, 12%, 43%)", marginBottom: "20px" }}
                >
                  {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
                  <a
                    href="#toggle"
                    onClick={() => setIsConsolidated(!isConsolidated)}
                     className="underline text-blue-600"
                  >
                    View {isConsolidated ? "Standalone" : "Consolidated"}
                  </a>
                </div> */}
                {splitData.length > 0 ? (
                  <div style={{ overflowX: "auto", overflowY: "auto" }}>
                    <TableContainer
                      columns={splitColumns}
                      data={splitData}
                      customPageSize={15}
                      tableClass="table-bordered"
                      theadClass="custom-inline-thead bg-primary-subtle"
                    />
                  </div>
                ) : (
                  <div className=" flex w-full justify-center items-center border-t dark:border-gray-700">
                    <p className="p-8 text-gray-400">No data available.</p>
                  </div>
                )}
              </div>

              {/* Insider Trading Table */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl mt-8">
                <h4 className="px-4 my-2 mb-4 pt-4 text-xl font-bold text-gray-900 dark:text-white">
                  Insider Trading
                </h4>
                {/* <div className="px-4"
                  style={{ color: "hsl(207, 12%, 43%)", marginBottom: "20px" }}
                >
                  {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
                  <a
                    href="#toggle"
                    onClick={() => setIsConsolidated(!isConsolidated)}
                    className="underline text-blue-600"
                  >
                    View {isConsolidated ? "Standalone" : "Consolidated"}
                  </a>
                </div> */}
                {insiderTradingData.length > 0 ? (
                  <div>
                    <TableContainer
                      columns={insiderTradingColumns}
                      data={insiderTradingData}
                      customPageSize={15}
                      tableClass="table-bordered no-wrap-table"
                      theadClass="custom-inline-thead bg-primary-subtle"
                    />
                  </div>
                ) : (
                  <div className=" flex w-full justify-center items-center border-t">
                    <p className="p-8 text-gray-800">No data available.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default CorporateEventsTable;
