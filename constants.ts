
import { Achievement } from './types';

// Descending order: 2026 down to 2014
export const YEARS = Array.from({ length: 13 }, (_, i) => 2026 - i);

const LOGOS = {
  syracuse: 'https://logo.clearbit.com/syracuse.edu',
  novartis: 'https://logo.clearbit.com/novartis.com',
  shutterfly: 'https://logo.clearbit.com/shutterfly.com'
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { 
    id: '2026', 
    year: 2026, 
    title: 'Architecting Future Creativity', 
    description: 'Projected: Leading the evolution of web-based creative tools with a focus on maintainability and global user experience.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2025', 
    year: 2025, 
    title: 'Performance Optimization & Splunk', 
    description: 'Implementing custom Splunk monitoring for sub-second page loads and proactive system health alerting.', 
    category: 'Innovation',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2024', 
    year: 2024, 
    title: 'Reusable UI Component Library', 
    description: 'Architected a modular UI system to accelerate development velocity and ensure brand consistency across web applications.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2023', 
    year: 2023, 
    title: 'Massive "Hot-to-Cold" Migration', 
    description: 'Led the migration of massive project datasets from Oracle to AWS S3, saving millions in DB costs with zero user downtime.', 
    category: 'Innovation',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2022', 
    year: 2022, 
    title: 'Consumer Product Leadership', 
    description: 'Owned development of flagship Photo Books, Cards, and Canvas products serving 5M yearly active users.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2021', 
    year: 2021, 
    title: 'Senior Software Engineer (Consumer)', 
    description: 'Transitioned to Consumer Apps. Focused on metrics-driven UX where sub-second performance is a mission-critical requirement.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2020', 
    year: 2020, 
    title: 'CI/CD Pipeline Architecture', 
    description: 'Established modern DevOps practices, reducing manual deployment errors through automated software delivery lifecycles.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2019', 
    year: 2019, 
    title: 'Business Logic Orchestration', 
    description: 'Used Apache Activiti and Camel to orchestrate complex high-volume order processing and data integration tasks.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2018', 
    year: 2018, 
    title: 'Asynchronous Workflows with Kafka', 
    description: 'Optimized system scalability by implementing Kafka-based asynchronous workflows to handle massive enterprise data spikes.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2017', 
    year: 2017, 
    title: 'Fault-Tolerant Microservices', 
    description: 'Built robust microservices with automated recovery protocols and integrated monitoring to ensure 24/7 high availability.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2016', 
    year: 2016, 
    title: 'Software Engineer @ Shutterfly', 
    description: 'Joined the Enterprise division. Engineered 0-to-1 onboarding infrastructure supporting millions in B2B print revenue.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2015-1', 
    year: 2015, 
    title: 'R&D Summer Intern @ Novartis', 
    description: 'Architected a scalable relational database and engineered a full-stack web application using C#, ASP.NET Web API, and AngularJS in the NYC Metro Area.', 
    category: 'Internship',
    logoUrl: LOGOS.novartis
  },
  { 
    id: '2014', 
    year: 2014, 
    title: 'Graduate Student Programmer', 
    description: 'Began Master in Computer Science at Syracuse University. Specialized in Design & Analysis of Algorithms, Software Modelling, and Operating Systems.', 
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
