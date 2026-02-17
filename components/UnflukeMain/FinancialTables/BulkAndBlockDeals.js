import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import { getDealsData } from "../../../Unfluke_helpers/backend_helper";
import TableContainer from "../Common/TableContainer";
import "./Bulk&Block.css";

const BulkAndBlockDealsTable = ({ isConsolidated }) => {
  const [loading, setLoading] = useState(true);
  const [bulkData, setBulkData] = useState([]);
  const [blockData, setBlockData] = useState([]);
  const params = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getDealsData({
          instrument: params.company,
          mode: isConsolidated ? "C" : "S",
        });

        // result is expected to have { bulkDeals: [...], blockDeals: [...] }
        if (
          result &&
          Array.isArray(result.bulkDeals) &&
          Array.isArray(result.blockDeals)
        ) {
          setBulkData(result.bulkDeals);
          setBlockData(result.blockDeals);
        } else {
          setBulkData([]);
          setBlockData([]);
        }
      } catch (error) {
        console.error("Error fetching deals data:", error);
        setBulkData([]);
        setBlockData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.company, isConsolidated]);

  // Define the headers you want to hide.
  const hiddenHeaders = ["Company Name", "Capitaline Code", "_id", "Serial No"];

  // Compute the headers for Bulk Deals using useMemo.
  const bulkDealsHeaders = useMemo(() => {
    if (bulkData.length === 0) return [];
    return Object.keys(bulkData[0])
      .filter((key) => !hiddenHeaders.includes(key))
      .map((key) => {
        const isDate = key.toLowerCase().includes("date");
        if (isDate) {
          return {
            header: key,
            accessorKey: key,
            sortingFn: "dateSort",
          };
        } else {
          return {
            header: key,
            accessorKey: key,
            enableColumnFilter: false,
          };
        }
      });
  }, [bulkData]);

  // Compute the headers for Block Deals using useMemo.
  const blockDealsHeaders = useMemo(() => {
    if (blockData.length === 0) return [];
    return Object.keys(blockData[0])
      .filter((key) => !hiddenHeaders.includes(key))
      .map((key) => ({
        header: key,
        accessorKey: key,
        enableColumnFilter: false,
      }));
  }, [blockData]);

  // If both arrays are empty, show "No data available."
  const noData = bulkData.length === 0 && blockData.length === 0;

  return (
    <>
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
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl">
                {/* Page Title */}
                <h4 className="px-4 my-2 mb-4 pt-4 text-xl font-bold text-gray-900 dark:text-white">
                  Bulk Deals
                </h4>

                {/* Toggle for Consolidated/Standalone */}
                {/* <div className="px-4"
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "16px",
                    // borderBottom: '1px solid #e0e0e0',
                    paddingBottom: "10px",
                  }}
                >
                  {" "}
                  {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
                  <a
                    href="#toggle"
                    onClick={() => setIsConsolidated(!isConsolidated)}
                    className="underline text-blue-600"
                  >
                    View {isConsolidated ? "Standalone" : "Consolidated"}
                  </a>
                </div> */}

                {/* Bulk Deals Table */}
                <TableContainer
                  columns={bulkDealsHeaders}
                  data={bulkData}
                  customPageSize={10}
                  SearchPlaceholder="Search Products..."
                  tableClass="table-bordered"
                  theadClass="custom-inline-thead bg-primary-subtle"
                />
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl mt-6">
                {/* Page Title */}
                <h4 className="px-4 my-2 pt-4 text-xl font-bold text-gray-900 dark:text-white">
                  Block Deals
                </h4>

                {/* Toggle for Consolidated/Standalone */}
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
                </div>

                {/* Block Deals Table */}
                <TableContainer
                  className="styled-table"
                  columns={blockDealsHeaders}
                  data={blockData}
                  customPageSize={10}
                  SearchPlaceholder="Search Products..."
                  tableClass="table-bordered"
                  theadClass="custom-inline-thead bg-primary-subtle"
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default BulkAndBlockDealsTable;
