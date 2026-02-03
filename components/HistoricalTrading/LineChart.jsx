
import React from 'react';

const LineChart = () => {
  return (
    <div className="h-80 bg-white dark:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">NIFTY 50</span>
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">025096.85</span>
          <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">H25067.05</span>
          <span className="text-orange-500 dark:text-orange-400 text-sm font-medium">L25059.75</span>
          <span className="text-green-600 dark:text-green-400 text-sm font-medium">C25061.20</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">+0.30 (+0.00%)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">1y</button>
          <button className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">1m</button>
          <button className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Indicators</button>
          <button className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Check API</button>
          <button className="text-xs text-gray-600 dark:text-gray-400 font-medium px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Save</button>
        </div>
      </div>
      
      <div className="relative h-64 border-l border-b border-gray-200 dark:border-gray-600">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Chart line */}
          <path
            d="M 0 200 Q 100 180 150 160 T 250 140 Q 350 120 400 130 Q 450 140 500 120 Q 550 100 600 110 Q 650 120 700 140"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          
          {/* Chart area fill */}
          <path
            d="M 0 200 Q 100 180 150 160 T 250 140 Q 350 120 400 130 Q 450 140 500 120 Q 550 100 600 110 Q 650 120 700 140 L 700 250 L 0 250 Z"
            fill="url(#chartGradient)"
          />
          
          {/* Y-axis labels */}
          <text x="10" y="30" className="text-xs fill-gray-400 dark:fill-gray-500">25150</text>
          <text x="10" y="80" className="text-xs fill-gray-400 dark:fill-gray-500">25125</text>
          <text x="10" y="130" className="text-xs fill-gray-400 dark:fill-gray-500">25095</text>
          <text x="10" y="180" className="text-xs fill-gray-400 dark:fill-gray-500">25075</text>
          <text x="10" y="230" className="text-xs fill-gray-400 dark:fill-gray-500">25055</text>
          
          {/* X-axis labels */}
          <text x="50" y="245" className="text-xs fill-gray-400 dark:fill-gray-500">09:15</text>
          <text x="150" y="245" className="text-xs fill-gray-400 dark:fill-gray-500">10:00</text>
          <text x="250" y="245" className="text-xs fill-gray-400 dark:fill-gray-500">10:30</text>
          <text x="350" y="245" className="text-xs fill-gray-400 dark:fill-gray-500">11:00</text>
          <text x="450" y="245" className="text-xs fill-gray-400 dark:fill-gray-500">12:00</text>
          <text x="550" y="245" className="text-xs fill-gray-400 dark:fill-gray-500">13:00</text>
          <text x="650" y="245" className="text-xs fill-gray-400 dark:fill-gray-500">15:29</text>
        </svg>
      </div>
    </div>
  );
};

export default LineChart;
