/**
 * Comprehensive connection types for system architecture diagrams
 */

export enum ConnectionType {
  // Basic Relationships
  ASSOCIATION = 'association',
  AGGREGATION = 'aggregation',
  COMPOSITION = 'composition',
  DEPENDENCY = 'dependency',
  
  // Inheritance & Implementation
  INHERITANCE = 'inheritance',
  REALIZATION = 'realization',
  
  // Flow Types
  CONTROL_FLOW = 'controlFlow',
  MESSAGE_FLOW = 'messageFlow',
  EVENT_FLOW = 'eventFlow',
  
  // Communication Patterns
  SYNCHRONOUS_CALL = 'synchronousCall',
  ASYNCHRONOUS_CALL = 'asynchronousCall',
  REQUEST_RESPONSE = 'requestResponse',
  PUBLISH_SUBSCRIBE = 'publishSubscribe',
  
  // Coupling Types
  LOOSE_COUPLING = 'looseCoupling',
  TIGHT_COUPLING = 'tightCoupling',
  
  // Directional Types
  UNIDIRECTIONAL = 'unidirectional',
  BIDIRECTIONAL = 'bidirectional',
  
  // Custom/Default
  CUSTOM = 'custom',
  DEFAULT = 'default',
}

export interface ConnectionTypeDefinition {
  type: ConnectionType;
  label: string;
  description: string;
  category: string;
  icon: string;
  defaultStyle: {
    borderColor: string;
    borderThickness: number;
    borderStyle: 'solid' | 'dashed' | 'dotted';
    arrowType?: 'filled' | 'open' | 'diamond' | 'hollow-diamond' | 'triangle' | 'hollow-triangle' | 'double';
    linePattern?: 'orthogonal' | 'curved' | 'stepped' | 'straight';
  };
}

/**
 * Comprehensive connection type definitions with visual styles
 */
export const CONNECTION_TYPE_DEFINITIONS: ConnectionTypeDefinition[] = [
  // Basic Relationships
  {
    type: ConnectionType.ASSOCIATION,
    label: 'Association',
    description: 'Basic relationship between entities',
    category: 'Relationships',
    icon: '—',
    defaultStyle: {
      borderColor: '#3B82F6',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'open',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.AGGREGATION,
    label: 'Aggregation',
    description: 'Has-a relationship with shared lifecycle (hollow diamond)',
    category: 'Relationships',
    icon: '◇—',
    defaultStyle: {
      borderColor: '#10B981',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'hollow-diamond',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.COMPOSITION,
    label: 'Composition',
    description: 'Strong has-a relationship with contained lifecycle (filled diamond)',
    category: 'Relationships',
    icon: '♦—',
    defaultStyle: {
      borderColor: '#059669',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'diamond',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.DEPENDENCY,
    label: 'Dependency',
    description: 'Weak relationship - uses or depends on',
    category: 'Relationships',
    icon: '- - →',
    defaultStyle: {
      borderColor: '#8B5CF6',
      borderThickness: 1,
      borderStyle: 'dashed',
      arrowType: 'open',
      linePattern: 'orthogonal',
    },
  },
  
  // Inheritance & Implementation
  {
    type: ConnectionType.INHERITANCE,
    label: 'Inheritance',
    description: 'Class inheritance (is-a relationship)',
    category: 'Inheritance',
    icon: '—▷',
    defaultStyle: {
      borderColor: '#F59E0B',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'hollow-triangle',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.REALIZATION,
    label: 'Realization',
    description: 'Interface implementation',
    category: 'Inheritance',
    icon: '- - ▷',
    defaultStyle: {
      borderColor: '#D97706',
      borderThickness: 2,
      borderStyle: 'dashed',
      arrowType: 'hollow-triangle',
      linePattern: 'orthogonal',
    },
  },
  
  // Flow Types
  {
    type: ConnectionType.CONTROL_FLOW,
    label: 'Control Flow',
    description: 'Control or execution flow',
    category: 'Flow',
    icon: '━►',
    defaultStyle: {
      borderColor: '#DC2626',
      borderThickness: 3,
      borderStyle: 'solid',
      arrowType: 'filled',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.MESSAGE_FLOW,
    label: 'Message Flow',
    description: 'Message passing between components',
    category: 'Flow',
    icon: '⋯►',
    defaultStyle: {
      borderColor: '#7C3AED',
      borderThickness: 2,
      borderStyle: 'dotted',
      arrowType: 'filled',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.EVENT_FLOW,
    label: 'Event Flow',
    description: 'Event-driven communication',
    category: 'Flow',
    icon: '⚡→',
    defaultStyle: {
      borderColor: '#EAB308',
      borderThickness: 2,
      borderStyle: 'dashed',
      arrowType: 'filled',
      linePattern: 'orthogonal',
    },
  },
  
  // Communication Patterns
  {
    type: ConnectionType.SYNCHRONOUS_CALL,
    label: 'Synchronous Call',
    description: 'Blocking synchronous communication',
    category: 'Communication',
    icon: '→',
    defaultStyle: {
      borderColor: '#0EA5E9',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'filled',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.ASYNCHRONOUS_CALL,
    label: 'Asynchronous Call',
    description: 'Non-blocking asynchronous communication',
    category: 'Communication',
    icon: '⇢',
    defaultStyle: {
      borderColor: '#06B6D4',
      borderThickness: 2,
      borderStyle: 'dashed',
      arrowType: 'open',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.REQUEST_RESPONSE,
    label: 'Request-Response',
    description: 'Request-response pattern',
    category: 'Communication',
    icon: '⇄',
    defaultStyle: {
      borderColor: '#14B8A6',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'double',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.PUBLISH_SUBSCRIBE,
    label: 'Publish-Subscribe',
    description: 'Pub/sub messaging pattern',
    category: 'Communication',
    icon: '⊷→',
    defaultStyle: {
      borderColor: '#8B5CF6',
      borderThickness: 2,
      borderStyle: 'dashed',
      arrowType: 'filled',
      linePattern: 'curved',
    },
  },
  
  // Coupling Types
  {
    type: ConnectionType.LOOSE_COUPLING,
    label: 'Loose Coupling',
    description: 'Loosely coupled components',
    category: 'Coupling',
    icon: '- -',
    defaultStyle: {
      borderColor: '#10B981',
      borderThickness: 1,
      borderStyle: 'dashed',
      arrowType: 'open',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.TIGHT_COUPLING,
    label: 'Tight Coupling',
    description: 'Tightly coupled components',
    category: 'Coupling',
    icon: '━━',
    defaultStyle: {
      borderColor: '#EF4444',
      borderThickness: 4,
      borderStyle: 'solid',
      arrowType: 'filled',
      linePattern: 'orthogonal',
    },
  },
  
  // Directional Types
  {
    type: ConnectionType.UNIDIRECTIONAL,
    label: 'Unidirectional',
    description: 'One-way relationship',
    category: 'Directional',
    icon: '→',
    defaultStyle: {
      borderColor: '#3B82F6',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'filled',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.BIDIRECTIONAL,
    label: 'Bidirectional',
    description: 'Two-way relationship',
    category: 'Directional',
    icon: '↔',
    defaultStyle: {
      borderColor: '#3B82F6',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'double',
      linePattern: 'orthogonal',
    },
  },
  
  // Custom/Default
  {
    type: ConnectionType.CUSTOM,
    label: 'Custom',
    description: 'Custom connection type',
    category: 'General',
    icon: '※',
    defaultStyle: {
      borderColor: '#6B7280',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'filled',
      linePattern: 'orthogonal',
    },
  },
  {
    type: ConnectionType.DEFAULT,
    label: 'Default',
    description: 'Default connection',
    category: 'General',
    icon: '→',
    defaultStyle: {
      borderColor: '#3B82F6',
      borderThickness: 2,
      borderStyle: 'solid',
      arrowType: 'filled',
      linePattern: 'orthogonal',
    },
  },
];

/**
 * Get connection type definition by type
 */
export function getConnectionTypeDefinition(type: ConnectionType): ConnectionTypeDefinition | undefined {
  return CONNECTION_TYPE_DEFINITIONS.find(def => def.type === type);
}

/**
 * Get connection types grouped by category
 */
export function getConnectionTypesByCategory(): Record<string, ConnectionTypeDefinition[]> {
  const grouped: Record<string, ConnectionTypeDefinition[]> = {};
  
  CONNECTION_TYPE_DEFINITIONS.forEach(def => {
    if (!grouped[def.category]) {
      grouped[def.category] = [];
    }
    grouped[def.category].push(def);
  });
  
  return grouped;
}

/**
 * Get default style for a connection type
 */
export function getDefaultStyleForType(type: ConnectionType) {
  const definition = getConnectionTypeDefinition(type);
  return definition?.defaultStyle || CONNECTION_TYPE_DEFINITIONS.find(d => d.type === ConnectionType.DEFAULT)!.defaultStyle;
}

/**
 * Get default connectionData based on connection type
 * Returns sensible defaults for common connection types
 */
export function getDefaultConnectionData(type: ConnectionType): Record<string, any> | undefined {
  switch (type) {
    case ConnectionType.SYNCHRONOUS_CALL:
      return {
        synchronous: true,
        pattern: 'request-reply',
        timeout: 5000,
      };
    
    case ConnectionType.ASYNCHRONOUS_CALL:
      return {
        synchronous: false,
        pattern: 'fire-and-forget',
      };
    
    case ConnectionType.REQUEST_RESPONSE:
      return {
        pattern: 'request-reply',
        synchronous: true,
      };
    
    case ConnectionType.PUBLISH_SUBSCRIBE:
      return {
        pattern: 'publish-subscribe',
        synchronous: false,
      };
    
    case ConnectionType.COMPOSITION:
      return {
        cardinality: '1:N',
      };
    
    case ConnectionType.AGGREGATION:
      return {
        cardinality: '1:N',
      };
    
    // For other types, return undefined (no default data)
    default:
      return undefined;
  }
}
