
import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const Sidebar = () => {
  const [selectedCategory, setSelectedCategory] = useState('Equity');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [optionFilters, setOptionFilters] = useState({
    name: '',
    expiry: '',
    type: '',
    strike: ''
  });
  
  const categories = ['Equity', 'Future', 'Option', 'Index'];
  
  const stocks = [
    { name: 'NIFTY 50', price: '25096.55', change: '+0.30 (+0.00%)', changeType: 'positive' },
    { name: 'NIFTY231910850CE', price: '839.1', change: '-12.45 (-1.46%)', changeType: 'negative' },
    { name: 'NIFTY231JUN16300CE', price: '2700', change: '+42.50 (+1.70%)', changeType: 'positive' },
    { name: 'RELIANCE', price: '1467.9', change: '-8.50 (-0.58%)', changeType: 'negative' },
    { name: 'AARTIIND-1', price: '441.05', change: '-12.15 (-2.83%)', changeType: 'negative' },
    { name: 'NIFTY254032365CE', price: '0.05', change: '0.00 (0.00%)', changeType: 'neutral' },
    { name: 'NIFTY251AN23800CE', price: '0.1', change: '-0.02 (-25.00%)', changeType: 'negative' }
  ];

  return (
    <div className="w-80 max-w-[80vw] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-57px)] transition-colors">
      <div className="p-4 flex-shrink-0">
        <div className="relative mb-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {selectedCategory}
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md text-gray-900 dark:text-gray-100 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {selectedCategory === 'Option' && (
          <div className="mb-4 space-y-3 overflow-x-visible">
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <select 
                value={optionFilters.name}
                onChange={(e) => setOptionFilters({...optionFilters, name: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="">Select Name</option>
                <option value="NIFTY">NIFTY</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="RELIANCE">RELIANCE</option>
              </select>
            </div>
            
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiry</label>
              <select 
                value={optionFilters.expiry}
                onChange={(e) => setOptionFilters({...optionFilters, expiry: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="">Select Expiry</option>
                <option value="28-NOV-2024">28-NOV-2024</option>
                <option value="05-DEC-2024">05-DEC-2024</option>
                <option value="12-DEC-2024">12-DEC-2024</option>
              </select>
            </div>
            
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
              <select 
                value={optionFilters.type}
                onChange={(e) => setOptionFilters({...optionFilters, type: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="">Select Type</option>
                <option value="CE">CE (Call)</option>
                <option value="PE">PE (Put)</option>
              </select>
            </div>
            
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Strike</label>
              <select 
                value={optionFilters.strike}
                onChange={(e) => setOptionFilters({...optionFilters, strike: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="">Select Strike</option>
                <option value="24000">24000</option>
                <option value="24500">24500</option>
                <option value="25000">25000</option>
                <option value="25500">25500</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search e.g. Nifty, Infy"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {stocks.map((stock, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">{stock.name}</div>
                <div className={`text-xs font-medium ${
                  stock.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 
                  stock.changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {stock.change}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-2">{stock.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
