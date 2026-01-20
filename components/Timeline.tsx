
import React from 'react';
import { YEARS } from '../constants';

interface TimelineProps {
  activeYear: number;
  onYearChange: (year: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ activeYear, onYearChange }) => {
  return (
    <div className="p-8">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Journey through time</h2>
      <div className="space-y-4">
        {YEARS.map((year) => (
          <label 
            key={year}
            className={`flex items-center group cursor-pointer p-2 rounded-lg transition-all ${activeYear === year ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
          >
            <div className="relative flex items-center justify-center">
              <input 
                type="radio" 
                name="timeline" 
                className="sr-only"
                checked={activeYear === year}
                onChange={() => onYearChange(year)}
              />
              <div className={`w-4 h-4 rounded-full border-2 transition-all ${activeYear === year ? 'border-blue-600 bg-blue-600 scale-125' : 'border-gray-300 group-hover:border-gray-400'}`} />
              {activeYear === year && (
                <div className="absolute w-8 h-8 rounded-full bg-blue-100 -z-10 animate-ping opacity-25" />
              )}
            </div>
            <span className={`ml-4 font-mono font-bold text-lg transition-all ${activeYear === year ? 'text-blue-700 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {year}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
