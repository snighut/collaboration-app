import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Timeline from './components/Timeline';
import AchievementSection from './components/AchievementSection';
import ChatSidebar from './components/ChatSidebar';
import Auth from './components/Auth';
import { YEARS, INITIAL_ACHIEVEMENTS } from './constants';
import { Sparkles, Layout, Moon, Sun, Github, Linkedin, Mail, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const router = useRouter();
  // Initialize with 2026 as the top-most year
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Check URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Auto-scroll to Creative Hub section if parameter is present
    if (params.get('scroll') === 'creative-hub') {
      // Wait for content to load before scrolling
      setTimeout(() => {
        const element = document.getElementById('creative-hub-trigger');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

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
    const element = document.getElementById('my-creations-section');
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
      <header className="fixed top-0 left-0 right-0 h-24 md:h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 z-50 flex items-center px-8 shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight drop-shadow-sm">
          Swapnil Nighut • Full-Stack Journey: Systems, AI & Analytics
        </h1>
        <nav className="ml-auto hidden md:flex space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300 items-center">
          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Dark Mode</span>
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
          </div>
          
          
          <button 
            onClick={scrollToCreativeHub}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors flex items-center gap-1"
          >
            <Layout size={16} /> Sample Creations
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 pt-24 md:pt-16">
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
          <div id="creative-hub-trigger" className="flex flex-col items-center justify-center py-20 border-t border-gray-100 dark:border-slate-800 scroll-mt-24 gap-8">
            {/* Creative Prompt to Design App */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-xl w-full">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Creative Prompt to Visual Design App</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-center">
                An experimental prompt-to-diagram orchestration engine. This project demonstrates how AI can synthesize natural language into structured visual relationships and auto-generate optimized layouts. Developed as a technical deep-dive into LLM-driven UI design and distributed homelab architecture
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => router.push('/design?id=new')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all transform hover:scale-105 active:scale-95"
                >
                  Start Creating
                </button>
              </div>
            </div>

            {/* My Designs */}
            <div id="my-creations-section" className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-xl w-full scroll-mt-24">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Layout className="text-purple-600 dark:text-purple-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">View My Creations</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-center">
                Full CRUD Control for System Design Blueprints. Manage the entire lifecycle of your architecture diagrams. Use AI to iterate on designs or take the wheel with manual orchestration to refine the details. Every change is tracked and stored, giving a persistent workspace for professional-grade system design.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => router.push('/mydesigns')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 dark:shadow-purple-900/30 transition-all transform hover:scale-105 active:scale-95"
                >
                  Go To My Creations
                </button>
              </div>
            </div>

            {/* Stock Analysis */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-xl w-full scroll-mt-24">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Stock Analysis (Quant MVP)</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-center">
                Analyze a live stream of stock prices for your selected tickers with moving averages and valuation signals such as Undervalued or Overvalued.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/stockAnalysis')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all transform hover:scale-105 active:scale-95"
                >
                  Open Stock Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="md:ml-[25%] w-full md:w-[75%] bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">About</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Senior FullStack software engineer with 8+ years of experience building scalable systems and consumer products at Shutterfly.
              </p>
            </div>

            {/* Connect Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Connect</h3>
              <div className="flex flex-col space-y-2">
                <a 
                  href="mailto:sbnighut@gmail.com" 
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Mail size={16} />
                  <span>Email Me</span>
                </a>
                <a 
                  href="https://github.com/snighut" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </a>
                <a 
                  href="https://linkedin.com/in/swapnilnighut" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Built With Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Built With</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">Next.js</span>
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full">TypeScript</span>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full">Tailwind</span>
                <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">Kubernetes</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2026 Swapnil Nighut. Built with passion and curiosity.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/snighut" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://linkedin.com/in/swapnilnighut" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div className="pt-4 text-[11px] text-gray-400 dark:text-gray-500 text-center max-w-3xl mx-auto">
            This website is a personal, non-commercial open-source project created for educational and portfolio purposes only. It is not an offer of services for hire, and no revenue is generated from this platform. All code and content represent personal learning and technical exploration.
          </div>
        </div>
      </footer>

      {/* Floating Entry Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 md:hidden lg:block mb-24">
         <button 
           onClick={scrollToCreativeHub}
           className="px-6 py-3 bg-gray-900/90 backdrop-blur-md text-white rounded-full shadow-2xl border-2 border-blue-500/50 hover:border-blue-400 flex items-center gap-2 hover:bg-black transition-all transform hover:-translate-y-1 hover:shadow-blue-500/50"
         >
           <Layout size={18} className="text-blue-400" />
           Explore Experimental Creations
         </button>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar />
    </div>
  );
};

export default App;
