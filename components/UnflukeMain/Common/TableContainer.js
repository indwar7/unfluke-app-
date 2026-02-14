import React, { Fragment, useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import moment from "moment";

const SortIcon = ({ isSorted }) => {
  if (!isSorted) {
    return (
      <span className="opacity-30 ml-1">
        <i className="las la-sort text-blue-500 dark:text-blue-400 text-base align-middle"></i>
      </span>
    );
  } else if (isSorted === "asc") {
    return (
      <span className="ml-1">
        <i className="las la-sort-down text-blue-500 dark:text-blue-400 text-base align-middle"></i>
      </span>
    );
  } else {
    return (
      <span className="ml-1">
        <i className="las la-sort-up text-blue-500 dark:text-blue-400 text-base align-middle"></i>
      </span>
    );
  }
};

const TableContainer = ({ columns, data, customPageSize = 10 }) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
  };

  const dateSort = (rowA, rowB, columnId) => {
    const a = moment(rowA.getValue(columnId), "MM/DD/YYYY").toDate();
    const b = moment(rowB.getValue(columnId), "MM/DD/YYYY").toDate();
    return a - b;
  };

  const table = useReactTable({
    columns,
    data,
    filterFns: { fuzzy: fuzzyFilter },
    sortingFns: { dateSort },
    state: { columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    getPageOptions,
    setPageIndex,
    nextPage,
    previousPage,
    setPageSize,
    getState,
  } = table;

  useEffect(() => {
    setPageSize(customPageSize);
  }, [customPageSize, setPageSize]);

  return (
    <Fragment>
      <div className="overflow-hidden bg-white dark:bg-gray-800  border-gray-200 dark:border-gray-700  ">
        <div className="w-full text-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 text-gray-600 dark:text-gray-200 dark:bg-gray-700 uppercase text-xs">
                {getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-4 w-1/4 py-3 font-medium text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <SortIcon isSorted={header.column.getIsSorted()} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const value = cell.getValue();
                      return (
                        <td
                        key={cell.id}
                        className={`px-4 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs`}
                      >

                        



                        {/* Your existing cell content logic remains the same */}
                        {cell.column.id.toLowerCase().includes("type") ? (
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {String(value)}
                          </span>
                        ) : cell.column.id.toLowerCase().includes("activity") ? (
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            String(value).toLowerCase() === "buy" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : String(value).toLowerCase() === "sell"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}>
                            {String(value)}
                          </span>
                        ) : typeof value === "number" ? (
                          value.toLocaleString()
                        ) : cell.column.id.toLowerCase().includes("date") ? (
                          moment(value, "MM/DD/YYYY").format("DD MMM YYYY")
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    
     

{/* Pagination */}
{/* Pagination */}
<div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
  <div>
  Showing{" "}
    <span className="font-medium">
      {getRowModel().rows.length}
    </span>{" "}
    of <span className="font-medium">{data.length}</span> Results
  </div>
  <div className="inline-flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
    <button
      onClick={previousPage}
      disabled={!getCanPreviousPage()}
      className={`px-3 py-1.5 border-r border-gray-300 dark:border-gray-600 ${
        !getCanPreviousPage()
          ? "text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      Previous
    </button>
    
    {(() => {
      const currentPage = getState().pagination.pageIndex;
      const totalPages = getPageOptions().length;
      const pageButtons = [];
      
      // Always show first page
      if (totalPages > 0) {
        pageButtons.push(
          <button
            key={0}
            onClick={() => setPageIndex(0)}
            className={`px-3 py-1.5 border-r border-gray-300 dark:border-gray-600 ${
              currentPage === 0
                ? "bg-blue-100 text-blue-600 font-semibold dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            1
          </button>
        );
      }
      
      // Add ellipsis if there's a gap between first page and current range
      if (currentPage > 3) {
        pageButtons.push(
          <span key="ellipsis-start" className="px-3 py-1.5 border-r border-gray-300 dark:border-gray-600 text-gray-500 bg-white dark:bg-gray-800">
            ...
          </span>
        );
      }
      
      // Show pages around current page
      const startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(totalPages - 2, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 0 && i !== totalPages - 1) { // Don't duplicate first and last pages
          pageButtons.push(
            <button
              key={i}
              onClick={() => setPageIndex(i)}
              className={`px-3 py-1.5 border-r border-gray-300 dark:border-gray-600 ${
                currentPage === i
                  ? "bg-blue-100 text-blue-600 font-semibold dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          );
        }
      }
      
      // Add ellipsis if there's a gap between current range and last page
      if (currentPage < totalPages - 4) {
        pageButtons.push(
          <span key="ellipsis-end" className="px-3 py-1.5 border-r border-gray-300 dark:border-gray-600 text-gray-500 bg-white dark:bg-gray-800">
            ...
          </span>
        );
      }
      
      // Always show last page (if more than 1 page)
      if (totalPages > 1) {
        pageButtons.push(
          <button
            key={totalPages - 1}
            onClick={() => setPageIndex(totalPages - 1)}
            className={`px-3 py-1.5 border-r border-gray-300 dark:border-gray-600 ${
              currentPage === totalPages - 1
                ? "bg-blue-100 text-blue-600 font-semibold dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {totalPages}
          </button>
        );
      }
      
      return pageButtons;
    })()}
    
    <button
      onClick={nextPage}
      disabled={!getCanNextPage()}
      className={`px-3 py-1.5 ${
        !getCanNextPage()
          ? "text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      Next
    </button>
  </div>
</div>
    </Fragment>
  );
};

export default TableContainer;