
import React, { useState, useEffect, useRef } from 'react';
import Timeline from './components/Timeline';
import AchievementSection from './components/AchievementSection';
import CanvasTool from './components/CanvasTool';
import { YEARS, INITIAL_ACHIEVEMENTS } from './constants';
import { ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [activeYear, setActiveYear] = useState<number>(2014);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleYearChange = (year: number) => {
    setActiveYear(year);
    const element = document.getElementById(`year-section-${year}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const year of YEARS) {
        const element = document.getElementById(`year-section-${year}`);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + height) {
            setActiveYear(year);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center px-8 shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          CHRONOS CANVAS
        </h1>
        <nav className="ml-auto hidden md:flex space-x-6 text-sm font-medium text-gray-600">
          <a href="#achievements" className="hover:text-blue-600 transition-colors">Timeline</a>
          <a href="#canvas" className="hover:text-blue-600 transition-colors">Collaboration Hub</a>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 pt-16">
        {/* Left Side: Timeline (25%) */}
        <aside className="w-1/4 fixed h-[calc(100vh-64px)] overflow-y-auto border-r border-gray-200 bg-white/50 backdrop-blur-sm hidden md:block">
          <Timeline activeYear={activeYear} onYearChange={handleYearChange} />
        </aside>

        {/* Middle Section: Achievements (65%) */}
        <div className="md:ml-[25%] md:w-[65%] w-full p-8 space-y-32 mb-[800px]" id="achievements">
          {YEARS.map((year) => (
            <AchievementSection 
              key={year} 
              year={year} 
              achievements={INITIAL_ACHIEVEMENTS.filter(a => a.year === year)} 
            />
          ))}
        </div>
      </main>

      {/* Bottom Tool: Collaborative Canvas */}
      <div id="canvas" className="fixed bottom-0 left-0 right-0 h-[600px] bg-white border-t border-gray-300 shadow-2xl z-40">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-white px-4 py-2 rounded-t-xl border-t border-x border-gray-300 shadow-sm flex items-center gap-2 text-sm text-gray-500 font-medium">
            <ChevronDown size={16} />
            Scroll down to explore or use the Canvas below
         </div>
         <CanvasTool />
      </div>
    </div>
  );
};

export default App;
