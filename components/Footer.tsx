import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

interface FooterProps {
  className?: string;
  showFullSections?: boolean;
}

/**
 * Footer component with about/connect section
 * Displays copyright, social links, and project disclaimer
 */
const Footer: React.FC<FooterProps> = ({ className = '', showFullSections = false }) => {
  return (
    <footer className={`bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-8 px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {showFullSections && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        )}

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
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
  );
};

export default Footer;
