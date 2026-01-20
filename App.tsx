
import React, { useState, useEffect, useRef } from 'react';
import Timeline from './components/Timeline';
import AchievementSection from './components/AchievementSection';
import CanvasTool from './components/CanvasTool';
import { YEARS, INITIAL_ACHIEVEMENTS } from './constants';
import { Sparkles, X, Layout } from 'lucide-react';

const App: React.FC = () => {
  // Initialize with 2026 as the top-most year
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [isCanvasVisible, setIsCanvasVisible] = useState<boolean>(false);

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 flex items-center px-8 shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-tight">
          Swapnil Nighut • Engineering Journey
        </h1>
        <nav className="ml-auto hidden md:flex space-x-6 text-sm font-medium text-gray-600">
          <a href="#achievements" className="hover:text-blue-600 transition-colors">Career Timeline</a>
          <button 
            onClick={scrollToCreativeHub}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1"
          >
            <Layout size={16} /> Personal Projects
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 pt-16">
        {/* Left Side: Timeline (25%) */}
        <aside className="w-1/4 fixed h-[calc(100vh-64px)] overflow-y-auto border-r border-gray-200 bg-white/50 backdrop-blur-sm hidden md:block">
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
          <div id="creative-hub-trigger" className="flex flex-col items-center justify-center py-20 border-t border-gray-100 scroll-mt-24">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-blue-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Creative Hub</h3>
              <p className="text-gray-500 mb-8">Ready to brainstorm? Open the collaborative canvas to start placing assets and visualizing the future.</p>
              <button 
                onClick={() => setIsCanvasVisible(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:scale-105 active:scale-95"
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
        <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom duration-500">
          <div className="h-16 border-b border-gray-200 flex items-center px-8 bg-white shrink-0">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600" />
              Collaboration Canvas
            </h2>
            <button 
              onClick={() => setIsCanvasVisible(false)}
              className="ml-auto p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
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
