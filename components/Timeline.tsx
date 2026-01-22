
import React from 'react';
import { YEARS } from '../constants';

interface TimelineProps {
  activeYear: number;
  onYearChange: (year: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ activeYear, onYearChange }) => {
  return (
    <div className="p-8">
      <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">Journey through time</h2>
      <div className="space-y-4">
        {YEARS.map((year) => (
          <label 
            key={year}
            className={`flex items-center group cursor-pointer p-2 rounded-lg transition-all ${activeYear === year ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            <div className="relative flex items-center justify-center">
              <input 
                type="radio" 
                name="timeline" 
                className="sr-only"
                checked={activeYear === year}
                onChange={() => onYearChange(year)}
              />
              <div className={`w-4 h-4 rounded-full border-2 transition-all ${activeYear === year ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400 scale-125' : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'}`} />
              {activeYear === year && (
                <div className="absolute w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 -z-10 animate-ping opacity-25" />
              )}
            </div>
            <span className={`ml-4 font-mono font-bold text-lg transition-all ${activeYear === year ? 'text-blue-700 dark:text-blue-400 scale-110' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'}`}>
              {year}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
