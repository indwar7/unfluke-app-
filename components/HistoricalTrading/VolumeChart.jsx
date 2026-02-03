
import React from 'react';

const VolumeChart = () => {
  const volumes = [
    75, 85, 95, 70, 80, 90, 65, 75, 85, 95, 105, 85, 75, 90, 100, 80, 70, 85, 95, 110, 90, 85, 95, 85
  ];

  return (
    <div className="h-80 bg-white">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900">Volume</h3>
      </div>
      
      <div className="relative h-64">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
          <span>220</span>
          <span>165</span>
          <span>110</span>
          <span>55</span>
          <span>0</span>
        </div>
        
        <div className="ml-8 h-full flex items-end justify-between space-x-1">
          {volumes.map((volume, index) => (
            <div
              key={index}
              className="bg-green-500 flex-1 min-w-0"
              style={{ 
                height: `${(volume / 120) * 100}%`,
                opacity: 0.8 
              }}
            />
          ))}
        </div>
        
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-400 mt-2">
          <span>09:15</span>
          <span>10:00</span>
          <span>11:00</span>
          <span>12:00</span>
          <span>13:00</span>
          <span>15:29</span>
        </div>
      </div>
    </div>
  );
};

export default VolumeChart;
