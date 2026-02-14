import React, { useEffect, useState } from "react";
import { Spinner, Table } from "reactstrap";
import { useParams } from "react-router-dom";
import {
  getBankingData,
  getProfitLossData,
} from "../../../Unfluke_helpers/backend_helper";

const thickBorderRows = ["Operating Profit", "Profit Before Tax", "Net Profit"];

const BankRatio = ({ isConsolidated, onDataCheck }) => {
  const [headings, setHeadings] = useState([]);
  const [results, setResults] = useState({});
  const [years, setYears] = useState([]);
  // const [isConsolidated, setIsConsolidated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const params = useParams();

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      html[data-bs-theme='light'] {
        --vz-light-custom: #F7FBFE;
        --vz-thead-custom: #FAFAFA;
      }
      html[data-bs-theme='dark'] {
        --vz-light-custom: var(--vz-light);
        --vz-thead-custom: var(--vz-light);
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const colors = {
    even: "var(--vz-card-bg)",
    odd: "var(--vz-light-custom)",
    border: "var(--vz-border-color)",
    text: "var(--vz-text-color)",
  };

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        const result = await getBankingData({
          type: isConsolidated ? "C" : "S",
          capcode: params.company,
        });

        console.log("bank data", result);

        const hasData = result && Object.keys(result.results || {}).length > 0;
        onDataCheck?.(hasData);

        setHeadings(result.headings || []);
        setResults(result.results || {});
        setYears(Object.keys(result.results || {}).sort());
      } catch (error) {
        setHeadings([]);
        setResults({});
        setYears([]);
        onDataCheck?.(false);
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

  // Returns the value for a given row name and year, or "-" if not found
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

  //

  // Render expandable section
  const renderExpandableSection = (item, idx) => (
    <React.Fragment key={item.title}>
      <tr
        style={{
          backgroundColor: idx % 2 === 0 ? colors.even : colors.odd,
          borderTop: thickBorderRows.includes(item.title)
            ? "4px solid var(--vz-border-color)"
            : undefined,
          cursor: "pointer",
        }}
        onClick={() => toggleSection(item.title)}
      >
        <td
          style={{
            fontWeight: thickBorderRows.includes(item.title) ? "bold" : "500",
            textTransform: thickBorderRows.includes(item.title)
              ? "uppercase"
              : undefined,
            border: "1px solid var(--vz-border-color)",
            userSelect: "none",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          {item.title}
          <span style={{ fontWeight: "bold", marginLeft: 8 }}>
            {expandedSections[item.title] ? "−" : "+"}
          </span>
        </td>
        {years.slice(-10).map((year) => (
          <td
            key={year}
            style={{
              border: "1px solid var(--vz-border-color)",
              fontWeight: thickBorderRows.includes(item.title) ? "bold" : "400",
              textTransform: thickBorderRows.includes(item.title)
                ? "uppercase"
                : undefined,
            }}
          >
            {getValue(year, item.title)}
          </td>
        ))}
      </tr>
      {expandedSections[item.title] &&
        item.children.map((child) => (
          <tr
            key={child}
            style={{
              backgroundColor: idx % 2 === 0 ? colors.even : colors.odd,
            }}
          >
            <td
              style={{
                paddingLeft: "24px",
                border: "1px solid var(--vz-border-color)",
              }}
            >
              {child}
            </td>
            {years.slice(-10).map((year) => (
              <td
                key={year}
                style={{
                  border: "1px solid var(--vz-border-color)",
                }}
              >
                {getValue(year, child)}
              </td>
            ))}
          </tr>
        ))}
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {loading ? (
        <div className="flex items-center justify-center h-32 bg-transparent">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !headings.length || !Object.keys(results).length ? (
        <div
          className="text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-4"
          style={{
            backgroundColor: "var(--vz-card-bg)",
          }}
        >
          No data available for this company.
        </div>
      ) : (
        <div
          className="card"
          style={{
            width: "100%",
            borderRadius: "12px",
            backgroundColor: "var(--vz-body-bg)",
            border: "none",
          }}
        >
          <h4 style={{ fontWeight: "600", marginBottom: "4px" }}>Bank Ratio</h4>
          {/* <div
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "16px",
              paddingBottom: "10px",
            }}
          >
            {isConsolidated ? "Consolidated" : "Standalone"} Figures /{" "}
            <span
              style={{
                cursor: "pointer",
                color: "#3F5189",
                textDecoration: "underline",
              }}
              onClick={() => setIsConsolidated(!isConsolidated)}
            >
              View {isConsolidated ? "Standalone" : "Consolidated"}
            </span>
          </div> */}

          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--vz-border-color)",
              borderRadius: "8px",
            }}
          >
            <Table
              style={{ fontSize: "0.8rem", borderCollapse: "collapse" }}
              hover
            >
              <thead>
                <tr>
                  <th
                    style={{
                      backgroundColor: "var(--vz-thead-custom)",
                      border: "1px solid var(--vz-border-color)",
                      fontWeight: "600",
                      padding: "5px",
                      whiteSpace: "nowrap",
                      color: "var(--vz-text-color)",
                    }}
                  ></th>
                  {years.slice(-10).map((header, idx) => (
                    <th
                      key={idx}
                      style={{
                        backgroundColor: "var(--vz-thead-custom)",
                        border: "1px solid var(--vz-border-color)",
                        fontWeight: "600",
                        padding: "5px",
                        whiteSpace: "nowrap",
                        color: "var(--vz-text-color)",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {headings.map((item, idx) => {
                  // Parent heading row (styled, not expandable)
                  if (item.children && item.children.length > 0) {
                    return (
                      <React.Fragment key={item.title}>
                        <tr
                          style={{
                            backgroundColor: "var(--vz-thead-custom)",
                            borderTop: "2px solid var(--vz-border-color)",
                          }}
                        >
                          <td
                            colSpan={years.slice(-10).length + 1}
                            style={{
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              border: "1px solid var(--vz-border-color)",
                              backgroundColor: "var(--vz-thead-custom)",
                              color: "var(--vz-text-color)",
                              fontSize: "15px",
                              letterSpacing: "0.5px",
                              padding: "5px",
                            }}
                          >
                            {item.title}
                          </td>
                        </tr>
                        {item.children.map((child, cidx) => (
                          <tr
                            key={child}
                            style={{
                              backgroundColor:
                                (idx + cidx) % 2 === 0
                                  ? colors.even
                                  : colors.odd,
                            }}
                          >
                            <td
                              style={{
                                paddingLeft: "24px",
                                border: "1px solid var(--vz-border-color)",
                                fontWeight: "400",
                                padding: "5px",
                              }}
                            >
                              {child}
                            </td>
                            {years.slice(-10).map((year) => (
                              <td
                                key={year}
                                style={{
                                  border: "1px solid var(--vz-border-color)",
                                  padding: "5px",
                                }}
                              >
                                {getValue(year, child)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  }
                  // Thick border rows
                  if (thickBorderRows.includes(item.title)) {
                    return (
                      <tr
                        key={item.title}
                        style={{
                          backgroundColor:
                            idx % 2 === 0 ? colors.even : colors.odd,
                          borderTop: "4px solid var(--vz-border-color)",
                        }}
                      >
                        <td
                          style={{
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            border: "1px solid var(--vz-border-color)",
                            padding: "5px",
                          }}
                        >
                          {item.title}
                        </td>
                        {years.slice(-10).map((year) => (
                          <td
                            key={year}
                            style={{
                              border: "1px solid var(--vz-border-color)",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              padding: "5px",
                            }}
                          >
                            {getValue(year, item.title)}
                          </td>
                        ))}
                      </tr>
                    );
                  }
                  // Regular row
                  return (
                    <tr
                      key={item.title}
                      style={{
                        backgroundColor:
                          idx % 2 === 0 ? colors.even : colors.odd,
                      }}
                    >
                      <td
                        style={{
                          fontWeight: "400",
                          border: "1px solid var(--vz-border-color)",
                          padding: "5px",
                        }}
                      >
                        {item.title}
                      </td>
                      {years.slice(-10).map((year) => (
                        <td
                          key={year}
                          style={{
                            border: "1px solid var(--vz-border-color)",
                          }}
                        >
                          {getValue(year, item.title)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default BankRatio;
