import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useParams } from "react-router-dom";
import { getShareholdingData } from "../../../Unfluke_helpers/backend_helper";
import { Col, Row, Spinner } from "reactstrap";

const ShareholdingPattern = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConsolidated, setIsConsolidated] = useState(false);
  const params = useParams();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getShareholdingData({
          params: {
            instrument: params.company,
            mode: isConsolidated ? "C" : "S",
          },
        });
        setData(result || null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.company, isConsolidated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-transparent">
        <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.chart || !data.chart[0]) {
    return <p className="text-center my-4">No data available.</p>;
  }

  // Prepare ApexCharts options and data
  const chartData = data.chart[0];
  const pieOptions = {
    chart: {
      type: "pie",
    },
    labels: ["Promoters", "FII", "DII", "Public & Others", "Others"],
    colors: ["#007bff", "#00c0ef", "#3c8dbc", "#f39c12", "#d2d6de"],
    legend: {
      position: "bottom", // 🔁 change from "right" to "bottom"
      horizontalAlign: "center", // ✅ center align
      floating: false,
      fontSize: "14px",
      markers: {
        width: 10,
        height: 10,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 4,
      },
      formatter: (seriesName, opts) => {
        return `${seriesName}: ${opts.w.globals.series[
          opts.seriesIndex
        ].toFixed(2)}%`;
      },
    },
  };

  const pieSeries = [
    chartData.Promoters,
    chartData.FII,
    chartData.DII,
    chartData["Public & Others"],
    0, // Others is 0
  ];

  // Table rows
  const tableRows = data.table.map((row, index) => {
    const date = row["Year & Month"].toString();
    const month = {
      "01": "Jan",
      "02": "Feb",
      "03": "Mar",
      "04": "Apr",
      "05": "May",
      "06": "Jun",
      "07": "Jul",
      "08": "Aug",
      "09": "Sep",
      10: "Oct",
      11: "Nov",
      12: "Dec",
    }[date.slice(4, 6)];
    const formattedDate = `${month} ${date.slice(0, 4)}`;
    return (
      <tr key={index}>
        <td>{formattedDate}</td>
        <td>{row["PROMOTER %"].toFixed(2)}</td>
        <td>{row["PLEDGE %"].toFixed(2)}</td>
      </tr>
    );
  });

  return (
    <div>
      <div className="flex ">
        <div className="w-full flex-1  border p-6 rounded-lg dark:bg-gray-900 mr-4">
          <h3 className="text-lg font-semibold text-gray-900  dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            Shareholding Pattern
          </h3>

          <ReactApexChart
            options={pieOptions}
            series={pieSeries}
            type="pie"
            height="300"
          />
        </div>

        <div className="bg-white/80 flex-1 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            Promoter Pledging %
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-gray-700 dark:text-gray-300 font-semibold px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-gray-700 dark:text-gray-300 font-semibold px-4 py-3">
                    PROMOTER %
                  </th>
                  <th className="text-left text-gray-700 dark:text-gray-300 font-semibold px-4 py-3">
                    PLEDGE %
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700  transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      {row.props.children[0].props.children}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      {row.props.children[1].props.children}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      {row.props.children[2].props.children}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* <Row style={{ display: "flex", justifyContent: "center"    }}>
       
        <Col md={6}>
          <h4 style={{ margin: "20px" }}>Shareholding Pattern</h4>
          <ReactApexChart
            options={pieOptions}
            series={pieSeries}
            type="pie"
            height="300"
          />

          <div className=" flex justify-center items-center text-center">
            <p style={{ color : "var(--vz-heading-color)"}}>Trending up by 5.2% this month</p>
            <p style={{ color: "var(--vz-body-color)" }}>
              Showing total visitors for the last 6 months
            </p>
          </div>
        </Col>

       
        <Col md={6}>
          <div
            style={{
              border : "1px solid var(--vz-border-color)",
              borderRadius: "6px",
              padding: "20px",
              backgroundColor: "var(--vz-body-bg)",
              margin: "20px",
            }}
          >
            <h3
              style={{
                marginTop: "0px",
                marginBottom: "0px",
                paddingBottom: "15px",
                borderBottom: "2px solid var(--vz-border-color)",
                fontSize: "18px",
                fontWeight: "600",
                color : "var(--vz-body-color)"
              }}
            >
              Promoter Pledging %
            </h3>

            <div style={{ marginTop: "20px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                  
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "var(--vz-body-bg)" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 8px",
                        borderBottom: "2px solid var(--vz-border-color)",
                        fontWeight: "600",
                        color : "var(--vz-body-color)"
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 8px",
                        borderBottom: "2px solid var(--vz-border-color)",
                        fontWeight: "600",
                        color : "var(--vz-body-color)"
                      }}
                    >
                      PROMOTER %
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 8px",
                        borderBottom: "2px solid var(--vz-border-color)",
                        fontWeight: "600",
                        color : "var(--vz-body-color)"
                      }}
                    >
                      PLEDGE %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid var(--vz-border-color)",
                        transition: "background-color 0.2s",
                      }}
                      // onMouseEnter={(e) =>
                      //   (e.target.parentNode.style.backgroundColor = "#f8f9fa")
                      // }
                      // onMouseLeave={(e) =>
                      //   (e.target.parentNode.style.backgroundColor =
                      //     "transparent")
                      // }
                    >
                      <td style={{ padding: "10px 8px", color: "var(--vz-body-color)" }}>
                        {row.props.children[0].props.children}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          color: "var(--vz-body-color)",
                          fontWeight: "500",
                        }}
                      >
                        {row.props.children[1].props.children}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          color: "var(--vz-body-color)",
                          fontWeight: "500",
                          
                        }}
                      >
                        {row.props.children[2].props.children}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Col>
      </Row> */}
    </div>
  );
};

export default ShareholdingPattern;
