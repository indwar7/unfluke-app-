
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

  // Premium design-system tokens (constants/Colors.ts) — gold accent, sentiment.
  // Web/Tailwind component, so tokens are applied via arbitrary-value classes.
  const selectClasses =
    'w-full px-3 py-2 text-sm border border-[#E6E8EC] dark:border-[#2A2F39] rounded-xl ' +
    'focus:outline-none focus:ring-2 focus:ring-[#C99A2E] dark:focus:ring-[#E9C46A] ' +
    'focus:border-[#C99A2E] dark:focus:border-[#E9C46A] ' +
    'bg-[#F6F7F9] dark:bg-[#181B21] text-[#0E0F14] dark:text-[#F4F5F7] transition-colors';

  return (
    <div className="w-80 max-w-[80vw] bg-white dark:bg-[#14161B] border-r border-[#E6E8EC] dark:border-[#262A33] flex flex-col h-[calc(100vh-57px)] transition-colors">
      <div className="p-4 flex-shrink-0">
        <div className="relative mb-4">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full text-lg font-bold tracking-tight text-[#0E0F14] dark:text-[#F4F5F7] hover:text-[#C99A2E] dark:hover:text-[#E9C46A] transition-colors"
          >
            {selectedCategory}
            <ChevronDown className="w-4 h-4 ml-2 text-[#C99A2E] dark:text-[#E9C46A]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C1F26] border border-[#E6E8EC] dark:border-[#262A33] rounded-xl shadow-lg z-10 overflow-hidden">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#FBF1D8] dark:bg-[#211B0C] text-[#A87A12] dark:text-[#E9C46A] font-semibold'
                      : 'text-[#0E0F14] dark:text-[#F4F5F7] hover:bg-[#F6F7F9] dark:hover:bg-[#262A33]'
                  }`}
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA2B1] dark:text-[#6C727E] mb-1.5">Name</label>
              <select
                value={optionFilters.name}
                onChange={(e) => setOptionFilters({...optionFilters, name: e.target.value})}
                className={selectClasses}
              >
                <option value="">Select Name</option>
                <option value="NIFTY">NIFTY</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="RELIANCE">RELIANCE</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA2B1] dark:text-[#6C727E] mb-1.5">Expiry</label>
              <select
                value={optionFilters.expiry}
                onChange={(e) => setOptionFilters({...optionFilters, expiry: e.target.value})}
                className={selectClasses}
              >
                <option value="">Select Expiry</option>
                <option value="28-NOV-2024">28-NOV-2024</option>
                <option value="05-DEC-2024">05-DEC-2024</option>
                <option value="12-DEC-2024">12-DEC-2024</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA2B1] dark:text-[#6C727E] mb-1.5">Type</label>
              <select
                value={optionFilters.type}
                onChange={(e) => setOptionFilters({...optionFilters, type: e.target.value})}
                className={selectClasses}
              >
                <option value="">Select Type</option>
                <option value="CE">CE (Call)</option>
                <option value="PE">PE (Put)</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA2B1] dark:text-[#6C727E] mb-1.5">Strike</label>
              <select
                value={optionFilters.strike}
                onChange={(e) => setOptionFilters({...optionFilters, strike: e.target.value})}
                className={selectClasses}
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9AA2B1] dark:text-[#6C727E] w-4 h-4" />
          <input
            type="text"
            placeholder="Search e.g. Nifty, Infy"
            className="w-full pl-10 pr-3 py-2.5 border border-[#E6E8EC] dark:border-[#2A2F39] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C99A2E] dark:focus:ring-[#E9C46A] focus:border-[#C99A2E] dark:focus:border-[#E9C46A] bg-[#F6F7F9] dark:bg-[#181B21] text-[#0E0F14] dark:text-[#F4F5F7] placeholder-[#9AA2B1] dark:placeholder-[#6C727E] transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {stocks.map((stock, index) => (
          <div key={index} className="group bg-white dark:bg-[#1C1F26] border border-[#E6E8EC] dark:border-[#262A33] rounded-2xl p-3.5 hover:border-[#C99A2E] dark:hover:border-[#E9C46A] hover:shadow-sm cursor-pointer transition-all">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#0E0F14] dark:text-[#F4F5F7] mb-1 truncate group-hover:text-[#A87A12] dark:group-hover:text-[#E9C46A] transition-colors">{stock.name}</div>
                <div className={`text-xs font-semibold tabular-nums ${
                  stock.changeType === 'positive' ? 'text-[#0E9E6E] dark:text-[#2DD4A0]' :
                  stock.changeType === 'negative' ? 'text-[#E0483B] dark:text-[#F26157]' : 'text-[#9AA2B1] dark:text-[#6C727E]'
                }`}>
                  {stock.change}
                </div>
              </div>
              <div className="text-sm font-bold tabular-nums text-[#0E0F14] dark:text-[#F4F5F7] ml-2">{stock.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
