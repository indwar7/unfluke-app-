import React, { useState } from "react";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react";
import ChartForm from "./Form";
import TVChartContainer from "../../Components/UnflukeMain/StrategyChart/TradingViewChart";

const StrategyCharts = () => {
  const strategyData = createSelector(
    (state) => state.StrategyCharts,
    (data) => ({
      isLoading: data.loading,
      selectedSymbol: data.selectedSymbol,
      optionForm: data.optionForm,
      stradleForm: data.stradleForm,
    }),
  );

  const auth = createSelector(
    (state) => state.Login,
    (data) => data.user,
  );

  const selectDashboardData = createSelector(
    (state) => state.Layout,
    (state) => ({
      layoutModeType: state.layoutModeType,
    }),
  );

  const { layoutModeType } = useSelector(selectDashboardData);
  const user = useSelector(auth);
  const strategyChartForm = useSelector(strategyData);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  document.title = "Strategy Charts | Unfluke";

  return (
    <div className="w-full max-w-[1920px]  mb-3 bg-background-light dark:bg-gray-900 px-2 sm:px-2 md:px-8 lg:px-10 xl:px-24">
      <div className="min-h-[calc(100vh-80px)] dark:bg-gray-900 transition-colors">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed top-20 left-4 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-md"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Container */}
        <div className="mx-2 lg:mx-8 h-full pt-20">
          <div className="flex h-[calc(100vh-80px-5rem)] gap-4">
            {/* LEFT SECTION - ChartForm */}
            <div
              className={`w-[400px] h-full fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30
                ${sidebarOpen ? "translate-x-0" : "-translate-x-[500px]"}
                lg:block`}
            >
              <div className="h-full max-lg:h-[80vh] max-lg:overflow-y-hidden bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
                <ChartForm />
              </div>
            </div>

            {/* RIGHT SECTION - Strategy Chart with Heading */}
            <div className="flex-1 h-full flex flex-col">
              {/* Strategy Charts Title */}
              <div className="mb-4">
                <h1 className="border p-4 dark:bg-gray-800 rounded-lg border-gray-200 dark:border-gray-700 bg-white font-bold text-xl">
                  Strategy Charts
                </h1>
              </div>

              {/* Chart Container - Takes remaining height */}
              <div className="flex-1">
                <div
                  className="rounded-xl overflow-hidden border dark:border-gray-700 h-full"
                  id="historic-trading-view-chart"
                >
                  {strategyChartForm.selectedSymbol && user._id ? (
                    <TVChartContainer
                      containerId="historic-trading-view-chart"
                      fullScreen={false}
                      layoutMode={layoutModeType}
                      symbol={strategyChartForm.selectedSymbol}
                      optionsForm={strategyChartForm.optionForm}
                      stradleForm={strategyChartForm.stradleForm}
                      userID={user._id}
                      maxYear={user.charts_fno}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyCharts;
