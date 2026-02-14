
import React from 'react';
import LineChart from './LineChart';

const ChartSection = () => {
  return (
    <div className="flex-1 p-6  dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="p-6">
          <LineChart />
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
