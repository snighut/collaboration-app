
import React from 'react';
import { Achievement } from '../types';

interface AchievementSectionProps {
  year: number;
  achievements: Achievement[];
}

const AchievementSection: React.FC<AchievementSectionProps> = ({ year, achievements }) => {
  return (
    <section id={`year-section-${year}`} className="scroll-mt-24">
      <div className="flex items-baseline space-x-4 mb-8">
        <h2 className="text-7xl font-black text-gray-200 dark:text-slate-700 select-none">{year}</h2>
        <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {achievement.logoUrl && (
                    <div className="w-12 h-12 rounded-xl border border-gray-100 dark:border-slate-600 p-2 bg-white dark:bg-slate-700 shadow-sm overflow-hidden flex items-center justify-center">
                      <img src={achievement.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {achievement.category}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {achievement.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xl font-medium">
                {achievement.description}
              </p>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 dark:bg-blue-900/10 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100/40 dark:group-hover:bg-blue-900/20 transition-colors" />
            </div>
          ))
        ) : (
          <div className="text-gray-400 dark:text-gray-500 italic py-10 text-xl">
            No specific records available for this period.
          </div>
        )}
      </div>
    </section>
  );
};

export default AchievementSection;
