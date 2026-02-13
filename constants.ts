
import { Achievement } from './types';

// Descending order: 2026 down to 2014
export const YEARS = Array.from({ length: 13 }, (_, i) => 2026 - i);

const LOGOS = {
  syracuse: '/syracuse-logo.png',
  novartis: '/novartis-logo.png',
  shutterfly: '/shutterfly-logo.png'
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { 
    id: '2026', 
    year: 2026, 
    title: 'The AI-Native Frontier', 
    description: 'I’m great at connecting the dots and integrating different parts of a project. Right now I am bridging the gap between infrastructure and intelligence. Architected an immutable "Production" homelab using Talos Kubernetes on Ryzen to host 24/7 AI agents and microservices. Currently leveraging 8+ years of systems expertise to develop "collaboration-app," focusing on native AI integration and high-performance local LLM testing via MLX.', 
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
    description: 'Assumed full ownership of the Project Service—the data backbone storing millions of users\' creative projects in digital form—and the MyProjects frontend that surfaces these creations. Transformed this legacy system into a resilient, self-healing architecture by resolving long-standing consistency bottlenecks and building comprehensive health dashboards for proactive monitoring.', 
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

// Architectural component icons with professional SVG paths
export const ARCHITECTURE_COMPONENTS = {
  'api-gateway': {
    label: 'API Gateway',
    color: '#FF6B6B',
    width: 100,
    height: 80,
    // Gateway/Door icon
    iconPath: 'M6 2 L18 2 C19 2 20 3 20 4 L20 20 C20 21 19 22 18 22 L6 22 C5 22 4 21 4 20 L4 4 C4 3 5 2 6 2 Z M10 8 L14 8 M10 12 L14 12 M10 16 L14 16 M9 2 L9 22 M15 2 L15 22'
  },
  'microservice': {
    label: 'Microservice',
    color: '#4ECDC4',
    width: 90,
    height: 90,
    // Hexagon with gear teeth
    iconPath: 'M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z M12 7 C14.5 7 16.5 9 16.5 11.5 C16.5 14 14.5 16 12 16 C9.5 16 7.5 14 7.5 11.5 C7.5 9 9.5 7 12 7 Z M12 9 C10.5 9 9.5 10 9.5 11.5 C9.5 13 10.5 14 12 14 C13.5 14 14.5 13 14.5 11.5 C14.5 10 13.5 9 12 9 Z'
  },
  'database': {
    label: 'Database',
    color: '#45B7D1',
    width: 80,
    height: 100,
    // Cylinder database
    iconPath: 'M4 6 C4 4 7.5 2 12 2 C16.5 2 20 4 20 6 M4 6 L4 18 C4 20 7.5 22 12 22 C16.5 22 20 20 20 18 L20 6 M4 6 C4 8 7.5 10 12 10 C16.5 10 20 8 20 6 M4 12 C4 14 7.5 16 12 16 C16.5 16 20 14 20 12'
  },
  'cache': {
    label: 'Cache',
    color: '#FFC107',
    width: 90,
    height: 70,
    // Lightning bolt in box
    iconPath: 'M3 6 L21 6 L21 18 L3 18 Z M13 8 L10 12 L12 12 L9 16 L14 11 L12 11 L15 8 Z'
  },
  'message-queue': {
    label: 'Message Queue',
    color: '#96CEB4',
    width: 100,
    height: 70,
    // Multiple connected boxes
    iconPath: 'M2 6 L8 6 L8 14 L2 14 Z M10 6 L16 6 L16 14 L10 14 Z M18 6 L24 6 L24 14 L18 14 Z M8 10 L10 10 M16 10 L18 10'
  },
  'load-balancer': {
    label: 'Load Balancer',
    color: '#9B59B6',
    width: 100,
    height: 80,
    // Distributor icon
    iconPath: 'M12 2 L12 6 M12 6 L4 10 M12 6 L20 10 M12 6 L12 10 M4 10 L4 14 M20 10 L20 14 M12 10 L12 14 M4 14 L8 14 M12 14 L12 18 M20 14 L16 14 M8 14 L8 18 M16 14 L16 18 M8 18 L8 22 M12 18 L12 22 M16 18 L16 22'
  },
  'storage': {
    label: 'Storage',
    color: '#D4A5A5',
    width: 90,
    height: 100,
    // Filing cabinet
    iconPath: 'M4 2 L20 2 L20 8 L4 8 Z M4 8 L20 8 L20 14 L4 14 Z M4 14 L20 14 L20 22 L4 22 Z M7 4 L9 4 M7 10 L9 10 M7 17 L9 17'
  },
  'cdn': {
    label: 'CDN',
    color: '#FF6B6B',
    width: 90,
    height: 90,
    // Globe with network lines
    iconPath: 'M12 2 C6.5 2 2 6.5 2 12 C2 17.5 6.5 22 12 22 C17.5 22 22 17.5 22 12 C22 6.5 17.5 2 12 2 Z M12 2 L12 22 M2 12 L22 12 M4 7 C6 8 8 8.5 12 8.5 C16 8.5 18 8 20 7 M4 17 C6 16 8 15.5 12 15.5 C16 15.5 18 16 20 17'
  },
  'lambda': {
    label: 'Lambda',
    color: '#FF9500',
    width: 80,
    height: 80,
    // Lambda symbol
    iconPath: 'M7 2 L10 2 L12 8 L14 2 L17 2 L19 12 L15 22 L12 22 L14 16 L12 12 L8 22 L5 22 Z'
  },
  'container': {
    label: 'Container',
    color: '#0066CC',
    width: 85,
    height: 85,
    // Box/container
    iconPath: 'M4 6 L12 2 L20 6 L20 18 L12 22 L4 18 Z M4 6 L12 10 L20 6 M12 10 L12 22 M4 12 L12 16 M20 12 L12 16'
  },
  'kubernetes': {
    label: 'Kubernetes',
    color: '#326CE5',
    width: 90,
    height: 90,
    // K8s wheel
    iconPath: 'M12 2 L15 7 L21 7 L17 11 L19 17 L12 13 L5 17 L7 11 L3 7 L9 7 Z M12 8 L12 13 M10 10 L14 10 M10 13 L14 13'
  },
  'cloud': {
    label: 'Cloud',
    color: '#4ECDC4',
    width: 110,
    height: 70,
    // Cloud shape
    iconPath: 'M18 10 C20 10 22 12 22 14 C22 16 20 18 18 18 L7 18 C5 18 3 16 3 14 C3 12 5 10 7 10 C7 7 9 5 12 5 C15 5 17 7 17 10 C17 10 17.5 10 18 10 Z'
  },
  'server': {
    label: 'Server',
    color: '#34495E',
    width: 85,
    height: 100,
    // Stacked server
    iconPath: 'M4 3 L20 3 L20 8 L4 8 Z M4 9 L20 9 L20 14 L4 14 Z M4 15 L20 15 L20 21 L4 21 Z M6 5 C6.5 5 7 5.5 7 6 C7 6.5 6.5 7 6 7 C5.5 7 5 6.5 5 6 C5 5.5 5.5 5 6 5 Z M6 11 C6.5 11 7 11.5 7 12 C7 12.5 6.5 13 6 13 C5.5 13 5 12.5 5 12 C5 11.5 5.5 11 6 11 Z M6 17 C6.5 17 7 17.5 7 18 C7 18.5 6.5 19 6 19 C5.5 19 5 18.5 5 18 C5 17.5 5.5 17 6 17 Z'
  },
  'user': {
    label: 'User',
    color: '#95A5A6',
    width: 70,
    height: 80,
    // Person icon
    iconPath: 'M12 2 C14.5 2 16.5 4 16.5 6.5 C16.5 9 14.5 11 12 11 C9.5 11 7.5 9 7.5 6.5 C7.5 4 9.5 2 12 2 Z M12 13 C7 13 3 15 3 18 L3 22 L21 22 L21 18 C21 15 17 13 12 13 Z'
  },
  'mobile-app': {
    label: 'Mobile',
    color: '#1ABC9C',
    width: 60,
    height: 100,
    // Mobile phone
    iconPath: 'M7 2 L17 2 C18 2 19 3 19 4 L19 20 C19 21 18 22 17 22 L7 22 C6 22 5 21 5 20 L5 4 C5 3 6 2 7 2 Z M10 19 L14 19 M12 3.5 C12.5 3.5 13 4 13 4.5 C13 5 12.5 5.5 12 5.5 C11.5 5.5 11 5 11 4.5 C11 4 11.5 3.5 12 3.5 Z'
  },
  'web-app': {
    label: 'Web App',
    color: '#3498DB',
    width: 100,
    height: 80,
    // Browser window
    iconPath: 'M2 4 L22 4 L22 20 L2 20 Z M2 8 L22 8 M4 6 C4.5 6 5 6.5 5 7 C5 7.5 4.5 8 4 8 C3.5 8 3 7.5 3 7 C3 6.5 3.5 6 4 6 Z M7 6 C7.5 6 8 6.5 8 7 C8 7.5 7.5 8 7 8 C6.5 8 6 7.5 6 7 C6 6.5 6.5 6 7 6 Z M10 6 C10.5 6 11 6.5 11 7 C11 7.5 10.5 8 10 8 C9.5 8 9 7.5 9 7 C9 6.5 9.5 6 10 6 Z M6 12 L10 16 L18 11'
  },
  'firewall': {
    label: 'Firewall',
    color: '#E74C3C',
    width: 85,
    height: 95,
    // Shield
    iconPath: 'M12 2 L20 6 L20 12 C20 17 16.5 21 12 22 C7.5 21 4 17 4 12 L4 6 Z M8 12 L11 15 L16 9'
  },
  'monitor': {
    label: 'Monitor',
    color: '#F39C12',
    width: 95,
    height: 80,
    // Chart/monitoring
    iconPath: 'M2 4 L22 4 L22 18 L2 18 Z M6 14 L6 10 M10 14 L10 8 M14 14 L14 11 M18 14 L18 9'
  },
  'text-box': {
    label: 'Text Box',
    color: '#7F8C8D',
    width: 100,
    height: 80,
    // Document with text lines
    iconPath: 'M6 2 L16 2 L20 6 L20 22 L6 22 Z M16 2 L16 6 L20 6 M8 10 L16 10 M8 13 L16 13 M8 16 L12 16'
  }
};
