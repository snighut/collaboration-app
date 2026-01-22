
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
    title: 'The AI-Native Frontier', 
    description: 'Bridging the gap between infrastructure and intelligence. Architected an immutable "Production" homelab using Talos Kubernetes on Ryzen to host 24/7 AI agents and microservices. Currently leveraging 8+ years of systems expertise to develop "collaboration-app," focusing on native AI integration and high-performance local LLM testing via MLX.', 
    category: 'Innovation',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2025', 
    year: 2025, 
    title: 'Scaling Reliability & Observability', 
    description: 'Elevated consumer product standards by implementing sophisticated Splunk monitoring and proactive alerting frameworks. Maintained a 99.9% uptime SLA for mission-critical services, ensuring a seamless experience for millions of users during peak seasonal traffic.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2024', 
    year: 2024, 
    title: 'Architecting Financial Efficiency', 
    description: 'Led a landmark "Hot-to-Cold" storage migration, transitioning legacy Oracle data to intelligent AWS S3 lifecycles. This architectural shift achieved zero downtime and secured $3M+ in annual recurring savings, proving that good engineering is also good business.', 
    category: 'Innovation',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2023', 
    year: 2023, 
    title: 'Stewarding Core Infrastructure', 
    description: 'Assumed full ownership of the "MyProjects" ecosystem—the data backbone of the company. Transformed a legacy project service into a resilient, self-healing system by resolving long-standing consistency bottlenecks and building comprehensive health dashboards.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2022', 
    year: 2022, 
    title: 'Maximizing Engineering Velocity', 
    description: 'Obsessed over the developer experience by automating internal build pipelines. Reduced the end-to-end product creation time by 80%, enabling cross-functional teams to iterate 5x faster and shortening the feedback loop between design and deployment.', 
    category: 'Innovation',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2021', 
    year: 2021, 
    title: 'The Automation Pivot', 
    description: 'Eliminated hundreds of manual hours by engineering utility tools for CCPA compliance and automated release candidate generation. Simultaneously began deep-diving into ML fundamentals, building the conceptual foundation for future AI-driven initiatives.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2020', 
    year: 2020, 
    title: 'Mastering Distributed Systems', 
    description: 'Engineered high-concurrency RESTful services with a focus on sub-second latency. Mastered the art of the "Canary Deployment" and rigorous load testing, ensuring that every feature rollout prioritized both system stability and user engagement metrics.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2019', 
    year: 2019, 
    title: 'Direct-to-Consumer Impact', 
    description: 'Transitioned from Enterprise to Consumer Engineering, shifting focus to high-traffic features used by 5M+ active users. Balanced the rapid pace of consumer demands with the technical rigor required to maintain low error rates at scale.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2018', 
    year: 2018, 
    title: 'Asynchronous Architectures', 
    description: 'Adopted a "Build Fast, Fail Fast" philosophy to accelerate innovation. Implemented Kafka-based asynchronous processing for large-scale print ordering, mastering the handling of edge cases in high-throughput production environments.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2017', 
    year: 2017, 
    title: 'Building for Resilience', 
    description: 'Deepened expertise in distributed system patterns, including circuit breakers and graceful degradation. Learned to view production failures as data points for improvement, building more robust microservices with automated recovery capabilities.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2016', 
    year: 2016, 
    title: 'Professional Foundations', 
    description: 'Relocated to begin a career in the "Warm Heart" of the US tech scene. Joined the Shutterfly Enterprise team, building custom onboarding platforms for global brands from the ground up and mastering the fundamentals of enterprise-grade software delivery.', 
    category: 'Professional',
    logoUrl: LOGOS.shutterfly
  },
  { 
    id: '2015', 
    year: 2015, 
    title: 'The Industrial Debut', 
    description: 'Selected for a competitive R&D internship at Novartis (NYC Metro). Built a full-stack internal application using C#, ASP.NET, and AngularJS, marking the transition from academic theory to delivering tangible business value in a high-stakes environment.', 
    category: 'Internship',
    logoUrl: LOGOS.novartis
  },
  { 
    id: '2014', 
    year: 2014, 
    title: 'Academic Genesis: Syracuse', 
    description: 'Embarking on a Master’s in Computer Science. Beyond mastering algorithms and system design, this year was about discipline, pragmatic problem-solving, and building a global network of peers that would form the foundation of my engineering career.', 
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
