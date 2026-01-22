
import React, { useState, useEffect, useRef } from 'react';
import Timeline from './components/Timeline';
import AchievementSection from './components/AchievementSection';
import CanvasTool from './components/CanvasTool';
import { YEARS, INITIAL_ACHIEVEMENTS } from './constants';
import { Sparkles, X, Layout, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  // Initialize with 2026 as the top-most year
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [isCanvasVisible, setIsCanvasVisible] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleYearChange = (year: number) => {
    setActiveYear(year);
    const element = document.getElementById(`year-section-${year}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToCreativeHub = () => {
    const element = document.getElementById('creative-hub-trigger');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 z-50 flex items-center px-8 shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
          Swapnil Nighut • Software Engineering Journey
        </h1>
        <nav className="ml-auto hidden md:flex space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300 items-center">
          <a href="#achievements" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Career Timeline</a>
          <button 
            onClick={scrollToCreativeHub}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors flex items-center gap-1"
          >
            <Layout size={16} /> Explore personal projects
          </button>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="relative w-14 h-8 rounded-full bg-gray-300 dark:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            aria-label="Toggle dark mode"
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                isDarkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {isDarkMode ? (
                <Moon size={14} className="text-blue-600" />
              ) : (
                <Sun size={14} className="text-yellow-500" />
              )}
            </span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 pt-16">
        {/* Left Side: Timeline (25%) */}
        <aside className="w-1/4 fixed h-[calc(100vh-64px)] overflow-y-auto border-r border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hidden md:block">
          <Timeline activeYear={activeYear} onYearChange={handleYearChange} />
        </aside>

        {/* Middle Section: Achievements (65%) */}
        <div className="md:ml-[25%] md:w-[65%] w-full p-8 space-y-32 mb-32" id="achievements">
          {YEARS.map((year) => (
            <AchievementSection 
              key={year} 
              year={year} 
              achievements={INITIAL_ACHIEVEMENTS.filter(a => a.year === year)} 
            />
          ))}
          
          {/* Bottom Trigger Section */}
          <div id="creative-hub-trigger" className="flex flex-col items-center justify-center py-20 border-t border-gray-100 dark:border-slate-800 scroll-mt-24">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 text-center max-w-md">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Creative Hub</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Ready to brainstorm? Open the collaborative canvas to start placing assets and visualizing the future.</p>
              <button 
                onClick={() => setIsCanvasVisible(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all transform hover:scale-105 active:scale-95"
              >
                Launch Collaboration Tool
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Entry Button */}
      {!isCanvasVisible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 md:hidden lg:block">
           <button 
             onClick={scrollToCreativeHub}
             className="px-6 py-3 bg-gray-900/90 backdrop-blur-md text-white rounded-full shadow-2xl flex items-center gap-2 hover:bg-black transition-all transform hover:-translate-y-1"
           >
             <Layout size={18} className="text-blue-400" />
             Explore personal projects
           </button>
        </div>
      )}

      {/* Collaborative Canvas Modal */}
      {isCanvasVisible && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-500">
          <div className="h-16 border-b border-gray-200 dark:border-slate-700 flex items-center px-8 bg-white dark:bg-slate-800 shrink-0">
            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
              Collaboration Canvas
            </h2>
            <button 
              onClick={() => setIsCanvasVisible(false)}
              className="ml-auto p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <CanvasTool />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
