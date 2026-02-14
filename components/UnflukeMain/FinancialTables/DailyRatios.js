import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useParams } from "react-router-dom";

const DailyRatios = ({ data, loading }) => {
  const [leftTab, setLeftTab] = useState("ev");
  const [rightTab, setRightTab] = useState("pe");

  const getSeriesData = (arr = []) =>
    arr.map((item) => [
      new Date(item.date).getTime(),
      item.value !== null ? Number(item.value) : 0,
    ]);

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner color="primary" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center my-4">No data available.</p>;
  }

  const enterpriseValue = data["Enterprise Value Chart"] || [];
  const peData = data["PE Chart"] || [];
  const dividendYield = data["Dividend Yield Chart"] || [];
  const pbData = data["PB Chart"] || [];
  const bookValue = data["Book Value Chart"] || [];
  const eps = data["EPS Chart"] || [];
  const price_fcff = data["Price/FCFF Chart"] || [];
  const price_fcfe = data["Price/FCFE Chart"] || [];

  const enterpriseSeries = [
    { name: "Enterprise Value", data: getSeriesData(enterpriseValue) },
  ];
  const dividendSeries = [
    { name: "Dividend Yield", data: getSeriesData(dividendYield) },
  ];
  const peSeries = [{ name: "PE", data: getSeriesData(peData) }];
  const pbSeries = [{ name: "PB", data: getSeriesData(pbData) }];
  const bookValueseries = [
    { name: "Book Value", data: getSeriesData(bookValue) },
  ];
  const epsSeries = [{ name: "EPS", data: getSeriesData(eps) }];
  const fcffSeries = [{ name: "Price/FCFF", data: getSeriesData(price_fcff) }];
  const fcfeSeries = [{ name: "Price/FCFE", data: getSeriesData(price_fcfe) }];

  // Updated to match LineChart color scheme
  const mainColor = "#44558B"; // Dark blue from LineChart
  const gradientToColor = "#90CAF9"; // Lighter blue from LineChart

  const getChartOptions = (title) => ({
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    title: {
      text: title,
      align: "left",
      style: { fontSize: "16px" },
    },
    markers: {
      size: 0,
      shape: "circle",
      strokeWidth: 3,
      fillOpacity: 0,
      strokeColors: ["#abc"],
      hover: { size: 5 },
    },
    dataLabels: {
      enabled: false,
      style: { fontSize: "10px", colors: ["#000"] },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM yyyy" },
      fixed: {
        enabled: true,
        position: "topRight",
        offsetX: 10,
        offsetY: 30,
      },
    },
    xaxis: {
      type: "datetime",
      crosshairs: {
        show: true,
        width: 3,
        position: "back",
        opacity: 0.5,
        stroke: { color: "#000", width: 0 },
        fill: {
          type: "gradient",
          gradient: {
            colorFrom: "dark blue",
            colorTo: "transparent",
            stops: [0, 100],
            opacityFrom: 0.6,
            opacityTo: 0,
          },
        },
      },
      labels: {
        style: { fontWeight: "bold" },
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => val.toFixed(2),
      },
    },
    grid: { show: true },
    colors: [mainColor],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: [gradientToColor],
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap -mx-2">
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 px-2">
          <div className="border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 rounded-[25px] px-6 py-2">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {["ev", "dy", "bv", "eps"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium ${
                    leftTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setLeftTab(tab)}
                >
                  {
                    {
                      ev: "Enterprise Value",
                      dy: "Dividend Yield",
                      bv: "Book Value",
                      eps: "EPS",
                    }[tab]
                  }
                </button>
              ))}
            </div>
            <div className="pt-3">
              {leftTab === "ev" && (
                <ReactApexChart
                  options={getChartOptions("Enterprise Value")}
                  series={enterpriseSeries}
                  type="area"
                  height={400}
                />
              )}
              {leftTab === "dy" && (
                <ReactApexChart
                  options={getChartOptions("Dividend Yield")}
                  series={dividendSeries}
                  type="area"
                  height={400}
                />
              )}
              {leftTab === "bv" && (
                <ReactApexChart
                  options={getChartOptions("Book Value")}
                  series={bookValueseries}
                  type="area"
                  height={400}
                />
              )}
              {leftTab === "eps" && (
                <ReactApexChart
                  options={getChartOptions("EPS")}
                  series={epsSeries}
                  type="area"
                  height={400}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 px-2">
          <div className="border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 rounded-[25px] px-6 py-2">
            {" "}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {["pe", "pb", "ff", "fe"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium ${
                    rightTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setRightTab(tab)}
                >
                  {
                    {
                      pe: "PE Chart",
                      pb: "PB Chart",
                      ff: "Price / FCFF",
                      fe: "Price / FCFE",
                    }[tab]
                  }
                </button>
              ))}
            </div>
            <div className="pt-3">
              {rightTab === "pe" && (
                <ReactApexChart
                  options={getChartOptions("PE")}
                  series={peSeries}
                  type="area"
                  height={400}
                />
              )}
              {rightTab === "pb" && (
                <ReactApexChart
                  options={getChartOptions("PB")}
                  series={pbSeries}
                  type="area"
                  height={400}
                />
              )}
              {rightTab === "ff" && (
                <ReactApexChart
                  options={getChartOptions("Price/FCFF")}
                  series={fcffSeries}
                  type="area"
                  height={400}
                />
              )}
              {rightTab === "fe" && (
                <ReactApexChart
                  options={getChartOptions("Price/FCFE")}
                  series={fcfeSeries}
                  type="area"
                  height={400}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DailyRatios;
