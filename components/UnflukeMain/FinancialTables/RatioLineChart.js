import React from "react";
import Chart from "react-apexcharts";

const LineChart = ({ title, categories, data, color }) => {
  const lineColor = color || "#4285F4"; // Main line color (blue)
  const patternColor = "#ADD8E6"; // Pattern color (light blue)
  
  const chartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    title: {
      text: title,
      align: "left",
      style: {
        fontSize: "16px",
      },
    },
    markers: {
      size: 0,  // Starting with no visible marker
      shape: "circle",
      strokeWidth: 3,  // Main line color
      fillOpacity: 0,
      strokeColors: ["#abc"],  // Already making them transparent/hollow
      hover: {
        size: 5,  // Size when hovere
        
        
      }
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
      fixed: {
        enabled: true,
        position: "topRight", // topRight, topLeft, bottomRight, bottomLeft
        offsetX: 10,
        offsetY: 30,
      },
    },
    xaxis: {
      categories: categories,
      crosshairs: {
        show: true,
        width: 3,
        position: 'back',
        opacity: 0.5,
        stroke: {
          color: '#000',
          width: 0,
          //dashArray: 4, // Dotted or dashed line
        },
        fill: {
          type: 'gradient',
          gradient: {
            colorFrom:"dark blue",
            colorTo: 'transparent',
            stops: [0, 100],
            opacityFrom: 0.6,
            opacityTo: 0
          }
        }
      },
      labels: {
        show: true,
        formatter: (val) => String(val).slice(-4),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { show: true },
    },
    grid: {
      show: true,
    },
    colors: [color || "#44558B"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: [color || "#90CAF9"], // lighter blue at bottom
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
  };

  const chartSeries = [
    { name: title, data: data },
  ];

  return (
    <div className="card bg-white dark:bg-gray-900"  style={{ width: "100%", marginBottom: "20px", padding: "10px", borderRadius: "20px" }}>
      <Chart options={chartOptions} series={chartSeries} type="area" height={300} />
    </div>
  );
};

export default LineChart;
