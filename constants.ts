
import { Achievement } from './types';

export const YEARS = Array.from({ length: 13 }, (_, i) => 2014 + i);

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', year: 2014, title: 'Rise of Mobile Commerce', description: 'Smartphones become the primary screen for retail worldwide.', category: 'Tech' },
  { id: '2', year: 2015, title: 'DeepMind AlphaGo Victory', description: 'AI makes a historic breakthrough by defeating a grandmaster.', category: 'Tech' },
  { id: '3', year: 2016, title: 'LIGO Gravitational Waves', description: 'Scientists confirm Einstein\'s theory with direct observation.', category: 'Space' },
  { id: '4', year: 2017, title: 'The Crypto Boom', description: 'Mainstream awareness of blockchain and decentralization peaks.', category: 'Business' },
  { id: '5', year: 2018, title: 'Mars InSight Landing', description: 'NASA successfully lands a robotic probe to study the interior of Mars.', category: 'Space' },
  { id: '6', year: 2019, title: 'First Black Hole Image', description: 'Event Horizon Telescope captures history with the M87* image.', category: 'Space' },
  { id: '7', year: 2020, title: 'Remote Work Revolution', description: 'Global shift in labor dynamics due to worldwide connectivity.', category: 'Tech' },
  { id: '8', year: 2021, title: 'NFT Phenomenon', description: 'Digital ownership finds a new paradigm through tokens.', category: 'Business' },
  { id: '9', year: 2022, title: 'Generative AI Breakthrough', description: 'LLMs and Diffusion models transform creative industries.', category: 'Tech' },
  { id: '10', year: 2023, title: 'Quantum Advancements', description: 'Practical error correction brings quantum computing closer.', category: 'Tech' },
  { id: '11', year: 2024, title: 'The Next Generation', description: 'Focus shifts towards sustainable energy and green mobility.', category: 'Global' },
  { id: '12', year: 2025, title: 'Mars Base Prototype', description: 'International cooperation on lunar and martian habitats.', category: 'Space' },
  { id: '13', year: 2026, title: 'Universal Broadband', description: 'Satellite constellations reach full global saturation.', category: 'Tech' },
];

export const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#34495E'];

export const SVG_ASSETS = [
  { name: 'Star', path: 'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z' },
  { name: 'Circle', path: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z' },
  { name: 'Heart', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { name: 'Lightning', path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' }
];
