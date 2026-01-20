
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
        <h2 className="text-7xl font-black text-gray-200">{year}</h2>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase">
                  {achievement.category}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                {achievement.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {achievement.description}
              </p>
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic py-10">
            No specific records available for this period.
          </div>
        )}
      </div>
    </section>
  );
};

export default AchievementSection;
