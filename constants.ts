
import { Achievement } from './types';

// Descending order: 2026 down to 2014
export const YEARS = Array.from({ length: 13 }, (_, i) => 2026 - i);

const LOGOS = {
  syracuse: 'https://media.licdn.com/dms/image/v2/C560BAQFAyZ5pXkHL9Q/company-logo_100_100/company-logo_100_100/0/1630671468743/syracuse_university_logo?e=1770854400&v=beta&t=V591N9kkb5U7GY6AAeciuNs51_9Bx3Na8a_o03DlgTY',
  novartis: 'https://media.licdn.com/dms/image/v2/D4E0BAQGWbusHQsuskQ/company-logo_100_100/B4EZfFIthEHcAY-/0/1751359085267/novartis_logo?e=1770854400&v=beta&t=v11FgkL2EEr-x0CeJ5rAs3cLWwWn_x2GZ6zvqE7mVIw',
  shutterfly: 'https://media.licdn.com/dms/image/v2/D560BAQGWpeFxfJSlcw/company-logo_100_100/company-logo_100_100/0/1688567580923/shutterfly_logo?e=1770854400&v=beta&t=v2Q6S_OY0wn_BWlTxxsI2NKVVnO2Uzah8SBWoNi-BJI'
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { 
    id: '2026', 
    year: 2026, 
    title: 'New Beginnings: The AI-Powered Era', 
    description: 'Launching immutable homelab infrastructure (Talos Kubernetes on Ryzen) for rapid AI experimentation. Leveraging 8+ years of full-stack and system design expertise to build native AI-powered applications. Making this the most productive year through learn-by-doing approach with hands-on AI deployment.', 
    category: 'Innovation',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2025', 
    year: 2025, 
    title: 'Production Excellence & Reliability', 
    description: 'Continued optimizing consumer products at scale. Implemented advanced monitoring with Splunk for sub-second performance and proactive alerting. Maintained 99.9% uptime for mission-critical services serving millions of users.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2024', 
    year: 2024, 
    title: 'Cost Optimization at Scale: $3M+ Savings', 
    description: 'Spearheaded the hot-to-cold storage migration project, moving dormant user projects from Oracle to AWS S3. Achieved zero downtime while saving $3M+ annually. Designed automated archival pipelines with intelligent data lifecycle policies.', 
    category: 'Innovation',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2023', 
    year: 2023, 
    title: 'Owning Critical Infrastructure', 
    description: 'Full ownership of MyProjects and Project Service — the backbone of user data management. Handled critical errors, performance bottlenecks, and data consistency challenges. Built monitoring dashboards and automated recovery systems for 24/7 reliability.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2022', 
    year: 2022, 
    title: 'Engineering Velocity: 80% Time Reduction', 
    description: 'Built multiple applications and services that reduced Shutterfly product creation time by 80%+. Optimized build pipelines and deployment processes. Enabled designers and engineers to iterate 5x faster through automation and tooling.', 
    category: 'Innovation',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2021', 
    year: 2021, 
    title: 'Automation & Developer Productivity', 
    description: 'Created utility tools for release candidate generation and CCPA delete request handling, saving hours of manual work weekly. Explored machine learning in spare time, building classification models and understanding AI fundamentals. Set foundation for future AI integration.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2020', 
    year: 2020, 
    title: 'Mastering RESTful Architecture at Scale', 
    description: 'Engineered high-performance RESTful services optimized for scalability. Focused obsessively on latency reduction, load testing, and canary deployments. Implemented monitoring for customer engagement metrics and sub-second response times.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2019', 
    year: 2019, 
    title: 'Transition to Consumer-Facing Products', 
    description: 'Moved from Enterprise to Consumer Engineering. Started building features used by 5M+ active users with pinpoint focus on error rates and user experience. Learned the art of balancing speed with quality in high-traffic consumer applications.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2018', 
    year: 2018, 
    title: 'Build Fast, Fail Fast Philosophy', 
    description: 'Embraced rapid prototyping and experimentation. Mastered handling edge cases and anomalies in production systems. Built workflows for large-scale print ordering with Kafka-based async processing. Learned that failing fast leads to learning faster.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2017', 
    year: 2017, 
    title: 'Learning from Mistakes & Building Resilience', 
    description: 'Built fault-tolerant microservices with automated recovery and 24/7 monitoring. Learned invaluable lessons from production failures and system design mistakes. Developed deep understanding of distributed systems, circuit breakers, and graceful degradation.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2016', 
    year: 2016, 
    title: 'First Full-Time Job: The Warm Beginning', 
    description: 'Moved from breezy cold winters to one of the warmest cities in the USA. Joined Shutterfly Enterprise division, working on large-scale print customer onboarding. Built platforms from ground zero for big clients. Started as a "coding monkey" learning through hands-on experience.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2015', 
    year: 2015, 
    title: 'First Dollars & Life-Changing Experiences', 
    description: 'Earned first paycheck through R&D Summer Internship at Novartis in NYC Metro Area. Built full-stack application with C#, ASP.NET Web API, and AngularJS. Explored places only seen on TV before. The second half became the most intense and rewarding period of life.', 
    category: 'Internship',
    logoUrl: LOGOS.novartis
  },
  { 
    id: '2014', 
    year: 2014, 
    title: 'The Journey Begins: Masters at Syracuse', 
    description: 'Started Computer Science Masters with glitter in eyes, staying away from home for the first time. Made lifelong friends while mastering algorithms and system design. Learned time management, discipline, humility, and pragmatic problem-solving from professors, lab projects, and peers. Foundation for everything that followed.', 
    category: 'Academic',
    logoUrl: LOGOS.syracuse
  }
];

export const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#34495E'];

export const SVG_ASSETS = [
  { name: 'Star', path: 'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z' },
  { name: 'Circle', path: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z' },
  { name: 'Heart', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { name: 'Lightning', path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' }
];
