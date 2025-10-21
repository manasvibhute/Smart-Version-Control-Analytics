import React, { useState } from "react";

const LinesAddedDeletedChart = ({ data }) => {
    const maxBarHeight = Math.max(...data.map(d => d.added + d.deleted), 1000);
    const [hovered, setHovered] = useState(null);

    return (
        <div className="relative h-[350px] w-full bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700/70 rounded-lg p-4">
            {/* Y-axis */}
            <div className="absolute left-2 top-4 bottom-16 w-10 flex flex-col justify-between text-xs text-gray-500">
                <div>2400</div>
                <div>1800</div>
                <div>1200</div>
                <div>600</div>
                <div>0</div>
            </div>

            {/* Bars area */}
            <div className="absolute left-10 right-0 bottom-16 top-4 flex items-end justify-around border-l border-b border-gray-700/70 p-2">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="relative flex h-full items-end space-x-1 group"
                        style={{ width: `${100 / data.length - 2}%` }}
                        onMouseEnter={() => setHovered(item)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <div
                            className="bg-green-500 w-1/2 rounded-t-sm transition-all duration-200 hover:brightness-110"
                            style={{ height: `${(item.added / maxBarHeight) * 100}%` }}
                        />
                        <div
                            className="bg-red-500 w-1/2 rounded-t-sm transition-all duration-200 hover:brightness-110"
                            style={{ height: `${(item.deleted / maxBarHeight) * 100}%` }}
                        />

                        {/* Tooltip */}
                        {hovered?.name === item.name && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 border border-gray-700 px-3 py-2 text-xs rounded-lg text-gray-100 shadow-lg whitespace-nowrap z-10">
                                <div className="font-semibold text-sm">{hovered.name}</div>
                                <div className="flex items-center mt-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                    {hovered.added} Lines Added
                                </div>
                                <div className="flex items-center mt-1">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                    {hovered.deleted} Lines Deleted
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* X-axis names */}
            <div className="absolute bottom-10 left-10 right-0 flex justify-around text-xs text-gray-400">
                {data.map((item, index) => (
                    <span key={index}>{item.name.split(" ")[0]}.</span>
                ))}
            </div>

            {/* Legend inside container */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-4 text-xs text-gray-300">
                <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>Lines Added
                </span>
                <span className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>Lines Deleted
                </span>
            </div>
        </div>
    );
};

export default LinesAddedDeletedChart;
