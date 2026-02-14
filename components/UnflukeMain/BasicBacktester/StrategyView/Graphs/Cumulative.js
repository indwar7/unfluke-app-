import React from "react";
import { Container } from "reactstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import takeScreenshot from "../../../../../functions/takeScreenshot";
import { Watermark } from "antd";

function Cumulative(props) {
  const { cummulative = [] } = props;

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  return (
    <>
      <button
        onClick={() => takeScreenshot(document.getElementById("info2"))}
        style={{
          marginBottom: "8px",
          border: "none",
          borderRadius: "50%",
          background: "#2c3e50",
          padding: "6px",
          cursor: "pointer",
        }}
      >
        <svg
          height="20"
          viewBox="0 0 32 32"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="#fff"
        >
          <path d="M16 10a8 8 0 108 8 8.009 8.009 0 00-8-8zm4.555 11.906c-2.156 2.516-5.943 2.807-8.459.65s-2.807-5.944-.65-8.459 5.943-2.807 8.459-.65 2.807 5.944.65 8.459z" />
          <path d="M16 14a4 4 0 00-4 4v.001a.5.5 0 001 0V18a3 3 0 013-3 .5.5 0 000-1z" />
          <path d="M29.492 9.042l-4.334-.723-1.373-3.434A2.993 2.993 0 0021 3H11a2.993 2.993 0 00-2.785 1.885L6.842 8.319 2.509 9.042A3.01 3.01 0 000 12v15a3 3 0 003 3h26a3 3 0 003-3V12a3.01 3.01 0 00-2.508-2.958zM30 27a1 1 0 01-1 1H3a1 1 0 01-1-1V12a1.008 1.008 0 01.836-.986l5.444-.907 1.791-4.478A.994.994 0 0111 5h10a.994.994 0 01.928.629l1.791 4.478 5.445.907A1.008 1.008 0 0130 12z" />
        </svg>
      </button>

      <div id="info2">
        <Watermark content={"Unfluke.in"} gap={[50, 50]} zIndex={100}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={cummulative}
              margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 12 }}
                tickFormatter={(tick) => new Date(tick).getFullYear()}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
                domain={["dataMin", "dataMax"]}
              />
              <Tooltip
                formatter={(value) => `₹${value}`}
                labelFormatter={(label) =>
                  `Date: ${new Date(label).toLocaleDateString()}`
                }
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#2e7d32"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Watermark>
      </div>
    </>
  );
}

export default Cumulative;
