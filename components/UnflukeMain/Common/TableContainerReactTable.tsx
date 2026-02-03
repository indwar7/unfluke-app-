import React, { Fragment, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  Column,
  Table as ReactTable,
  ColumnFiltersState,
  FilterFn,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import { rankItem } from "@tanstack/match-sorter-utils";

// Column Filter
const Filter = ({ column, table }) => {
  const columnFilterValue = column.getFilterValue();

  return (
    <>
      <DebouncedInput
        type="text"
        value={columnFilterValue ?? ""}
        onChangeText={(value) => column.setFilterValue(value)}
        placeholder="Search..."
        className="w-36 border shadow  rounded"
        list={column.id + "list"}
      />
      <View style={{height:2}}></View>
    </>
  );
};

// Global Filter
const DebouncedInput = ({
  value: initialValue,
  onChangeText,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChangeText(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChangeText, value]);

  return (
   <TextInput
      {...props}
      value={value}
      style={[styles.searchInput, props.style]} // Allow style override
      onChangeText={(text) => setValue(text)}
      placeholderTextColor="#9ca3af" // Placeholder color
    />
  );
};

const TableContainer = ({
  columns,
  data,
  isGlobalFilter,
  customPageSize,
  tableClass,
  theadClass,
  trClass,
  thClass,
  divClass,
  SearchPlaceholder,
  onEdit,
  onView,
  onDelete,
  onTogglePrivate,
  onToggleMonetize,
}) => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([
    { id: "createdOn", desc: true }, // 👈 default: latest on top
  ]);
  const [hasUserSorted, setHasUserSorted] = useState(false); // 👈 track user action

  const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
      itemRank,
    });
    return itemRank.passed;
  };

  const parseDMYTime = (str) => {
    if (!str || typeof str !== "string") return 0;
    // Expect formats like "9/6/2025 18:23" (d/m/YYYY HH:MM)
    const [datePart, timePart = "00:00"] = str.trim().split(/\s+/);
    const [d, m, y] = datePart.split("/").map((v) => parseInt(v, 10));
    if (!y || !m || !d) return 0;
    const [hh, mm] = timePart.split(":").map((v) => parseInt(v, 10));
    const dt = new Date(y, (m || 1) - 1, d, hh || 0, mm || 0, 0, 0);
    return dt.getTime();
  };

  const dateSort = (rowA, rowB, columnId) => {
    const a = parseDMYTime(rowA.getValue(columnId));
    const b = parseDMYTime(rowB.getValue(columnId));
    return a === b ? 0 : a > b ? 1 : -1;
  };

  // Enhanced columns with action column and toggle columns
  const enhancedColumns = React.useMemo(() => {
    const baseColumns = columns.map(col => {
      // Handle private column with toggle
      if (col.accessorKey === 'isPrivate') {
        return {
          ...col,
          cell: ({ row }) => (
            <Switch
              value={row.original?.isPrivate || false}
              onValueChange={(value) => onTogglePrivate?.(row.original, value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={row.original?.isPrivate ? "#f5dd4b" : "#f4f3f4"}
            />
          ),
        };
      }
      
      // Handle monetize column with toggle
      if (col.accessorKey === 'monetize') {
        return {
          ...col,
          cell: ({ row }) => (
            <Switch
              value={row.original?.monetize || false}
              onValueChange={(value) => onToggleMonetize?.(row.original, value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={row.original?.monetize ? "#f5dd4b" : "#f4f3f4"}
            />
          ),
        };
      }
      
      return col;
    });

    // Add action column
    const actionColumn = {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit?.(row.original)}
          >
            <Ionicons name="create-outline" size={16} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onView?.(row.original)}
          >
            <Ionicons name="eye-outline" size={16} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete?.(row.original)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ),
      enableSorting: false,
      enableFiltering: false,
    };

    return [...baseColumns, actionColumn];
  }, [columns, onEdit, onView, onDelete, onTogglePrivate, onToggleMonetize]);

  const table = useReactTable({
    columns: enhancedColumns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      sorting
    },
    sortingFns: {
      dateSort,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      if (!hasUserSorted) setHasUserSorted(true); // first user click
      setSorting((old) =>
        typeof updater === "function" ? updater(old) : updater
      );
    },
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
    customPageSize && setPageSize(customPageSize);
  }, [customPageSize, setPageSize]);

  const renderHeader = () => {
    return getHeaderGroups().map((headerGroup, groupIndex) => (
      <View key={headerGroup.id} style={styles.headerRow}>
        {headerGroup.headers.map((header, headerIndex) => {
          const isLast = headerIndex === headerGroup.headers.length - 1;
          return (
            <TouchableOpacity
              key={header.id}
              style={[
                styles.headerCell,
                isLast && styles.headerCellLast,
              ]}
              onPress={header.column.getToggleSortingHandler?.()}
            >
              {!header.isPlaceholder && (
                <Fragment>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.headerText}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </Text>
                    {hasUserSorted && header.column.getIsSorted() && (
                      <Text style={styles.sortIcon}>
                        {header.column.getIsSorted() === 'asc' ? '🔼' : '🔽'}
                      </Text>
                    )}
                  </View>
                  {header.column.getCanFilter?.() && Filter && (
                    <View style={styles.filterContainer}>
                      <Filter column={header.column} table={table} />
                    </View>
                  )}
                </Fragment>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  const renderRows = () => {
    return getRowModel().rows.map((row, index) => {
      const isLast = index === getRowModel().rows.length - 1;
      return (
        <View key={row.id} style={[styles.row, isLast && styles.lastRow]}>
          {row.getVisibleCells().map((cell, cellIndex) => {
            const isLastCell = cellIndex === row.getVisibleCells().length - 1;
            return (
              <View
                key={cell.id}
                style={[
                  styles.cell,
                  isLastCell && styles.cellLast,
                ]}
              >
                <Text>

                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext(),
                )}
                                </Text>

              </View>
            );
          })}
        </View>
      );
    });
  };

  const renderPaginationButton = (page, isActive = false, isDisabled = false, onPress, children) => (
    <TouchableOpacity
      key={page}
      style={[
        styles.paginationButton,
        isActive && styles.paginationButtonActive,
        isDisabled && styles.paginationButtonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text
        style={[
          styles.paginationButtonText,
          isActive && styles.paginationButtonTextActive,
          isDisabled && styles.paginationButtonTextDisabled,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );

  const renderPagination = () => {
    const pageIndex = getState().pagination.pageIndex;
    const totalPages = getPageOptions().length;
    const pageButtons = [];

    // Previous button
    pageButtons.push(
      renderPaginationButton(
        'prev',
        false,
        !getCanPreviousPage(),
        previousPage,
        'Previous'
      )
    );

    if (totalPages <= 6) {
      // Show all buttons if very few pages
      for (let i = 0; i < totalPages; i++) {
        pageButtons.push(
          renderPaginationButton(
            i,
            pageIndex === i,
            false,
            () => setPageIndex(i),
            i + 1
          )
        );
      }
    } else {
      // Always show first
      pageButtons.push(
        renderPaginationButton(
          0,
          pageIndex === 0,
          false,
          () => setPageIndex(0),
          1
        )
      );

      if (pageIndex <= 2) {
        pageButtons.push(
          renderPaginationButton(
            1,
            pageIndex === 1,
            false,
            () => setPageIndex(1),
            2
          )
        );
        pageButtons.push(
          renderPaginationButton(
            2,
            pageIndex === 2,
            false,
            () => setPageIndex(2),
            3
          )
        );
        pageButtons.push(
          <View key="end-ellipsis" style={styles.ellipsis}>
            <Text style={styles.ellipsisText}>...</Text>
          </View>
        );
      } else if (pageIndex >= totalPages - 3) {
        pageButtons.push(
          <View key="start-ellipsis" style={styles.ellipsis}>
            <Text style={styles.ellipsisText}>...</Text>
          </View>
        );
        pageButtons.push(
          renderPaginationButton(
            totalPages - 3,
            pageIndex === totalPages - 3,
            false,
            () => setPageIndex(totalPages - 3),
            totalPages - 2
          )
        );
        pageButtons.push(
          renderPaginationButton(
            totalPages - 2,
            pageIndex === totalPages - 2,
            false,
            () => setPageIndex(totalPages - 2),
            totalPages - 1
          )
        );
      } else {
        pageButtons.push(
          <View key="start-ellipsis" style={styles.ellipsis}>
            <Text style={styles.ellipsisText}>...</Text>
          </View>
        );
        pageButtons.push(
          renderPaginationButton(
            pageIndex - 1,
            false,
            false,
            () => setPageIndex(pageIndex - 1),
            pageIndex
          )
        );
        pageButtons.push(
          renderPaginationButton(
            pageIndex,
            true,
            false,
            () => setPageIndex(pageIndex),
            pageIndex + 1
          )
        );
        pageButtons.push(
          renderPaginationButton(
            pageIndex + 1,
            false,
            false,
            () => setPageIndex(pageIndex + 1),
            pageIndex + 2
          )
        );
        pageButtons.push(
          <View key="end-ellipsis" style={styles.ellipsis}>
            <Text style={styles.ellipsisText}>...</Text>
          </View>
        );
      }

      // Always show last
      pageButtons.push(
        renderPaginationButton(
          totalPages - 1,
          pageIndex === totalPages - 1,
          false,
          () => setPageIndex(totalPages - 1),
          totalPages
        )
      );
    }

    // Next button
    pageButtons.push(
      renderPaginationButton(
        'next',
        false,
        !getCanNextPage(),
        nextPage,
        'Next'
      )
    );

    return pageButtons;
  };

  return (
    <Fragment>
      {isGlobalFilter && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <DebouncedInput
              style={styles.searchInput}
              value={globalFilter ?? ""}
              onChangeText={(value) => setGlobalFilter(value)}
              placeholder={SearchPlaceholder}
            />
            <Ionicons
              name="search-outline"
              size={20}
              color="#6b7280"
              style={styles.searchIcon}
            />
          </View>
        </View>
      )}

      <View style={styles.tableContainer}>
        <ScrollView 
          style={styles.tableBody}
          showsVerticalScrollIndicator={false}
        >
                  {renderHeader()}

          {renderRows()}
        </ScrollView>
      </View>

      <View style={styles.paginationContainer}>
        {renderPagination()}
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#374151',
    flex: 1,
  },
  darkInput: {
    backgroundColor: '#1f2937',
    borderColor: '#4b5563',
    color: '#f9fafb',
  },
  searchIcon: {
    marginLeft: 8,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginHorizontal: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
    maxHeight: 600, // Set max height for ScrollView
  },
  tableBody: {
    maxHeight: 500,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerCell: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    minWidth: 100,
  },
  headerCellLast: {
    borderRightWidth: 0,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  sortIcon: {
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cell: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    minWidth: 100,
  },
  cellLast: {
    borderRightWidth: 0,
  },
  cellText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  editButton: {
    backgroundColor: '#dbeafe',
  },
  viewButton: {
    backgroundColor: '#d1fae5',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  paginationButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  paginationButtonTextActive: {
    color: 'white',
  },
  paginationButtonTextDisabled: {
    color: '#9ca3af',
  },
  ellipsis: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  ellipsisText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterContainer: {
    marginTop: 4,
  },
});

export default TableContainer;