import React from 'react';

export default function MetricsChart({ data, title, type = 'bar' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = 200;

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        {type === 'bar' ? (
          <div className="space-y-4">
            {data.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <span className="text-gray-600">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: chartHeight }} className="relative flex items-end justify-between gap-2">
            {data.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(item.value / maxValue) * chartHeight}px` }}
                  title={`${item.label}: ${item.value}`}
                />
                <span className="text-xs text-gray-600 text-center truncate w-full">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
          <div className="w-3 h-3 bg-blue-600 rounded" />
          <span>Data representation</span>
        </div>
      </div>
    </div>
  );
}
