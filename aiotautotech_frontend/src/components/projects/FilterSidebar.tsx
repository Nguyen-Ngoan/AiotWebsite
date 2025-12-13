import React from 'react';

export default function FilterSidebar() {
  return (
    <div className="hidden lg:block w-64 flex-shrink-0 space-y-8 sticky top-24 self-start">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Danh mục
        </h4>
        <div className="space-y-2">
          {[
            'Robot Arm',
            'CNC Machine',
            'AGV / AMR',
            'IoT System',
            'Smart Home',
          ].map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Ngân sách
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Dưới 1 triệu', val: '<1M' },
            { label: '1 - 5 triệu', val: '1-5M' },
            { label: '5 - 10 triệu', val: '5-10M' },
            { label: 'Trên 10 triệu', val: '>10M' },
          ].map((item) => (
            <label
              key={item.val}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Controller Type Filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Controller
        </h4>
        <div className="space-y-2">
          {['Arduino', 'ESP32', 'Raspberry Pi', 'PLC', 'STM32'].map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        Xóa bộ lọc
      </button>
    </div>
  );
}
