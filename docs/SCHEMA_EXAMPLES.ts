/**
 * Example: Testing the new design schema
 * 
 * This file demonstrates how to create and use designs with the new schema format.
 * You can paste this example data into the PATCH CANVAS panel to test.
 */

export const exampleDesignNewSchema = {
  "name": "User Auth Flow → PostgreSQL",
  "description": "Shows user authentication flow ending in PostgreSQL storage.",
  "thumbnail": null,
  "context": {
    "category": "authentication",
    "tags": ["auth", "database", "security"]
  },
  "items": [
    {
      "id": "temp-user-1",
      "name": "User",
      "uidata": {
        "type": "text",
        "x": 100,
        "y": 50,
        "content": "User",
        "zIndex": 1,
        "width": 120,
        "height": 40,
        "color": "#000000",
        "backgroundColor": "#E3F2FD",
        "borderColor": "#2196F3",
        "borderThickness": 2
      }
    },
    {
      "id": "temp-auth-1",
      "name": "Auth Service",
      "uidata": {
        "type": "rectangle",
        "x": 300,
        "y": 50,
        "content": "Auth Service",
        "zIndex": 2,
        "width": 140,
        "height": 60,
        "color": "#4CAF50",
        "borderColor": "#2E7D32",
        "borderThickness": 2
      }
    },
    {
      "id": "temp-pg-1",
      "name": "PostgreSQL",
      "uidata": {
        "type": "rectangle",
        "x": 500,
        "y": 50,
        "content": "PostgreSQL",
        "zIndex": 3,
        "width": 140,
        "height": 60,
        "color": "#2196F3",
        "borderColor": "#1565C0",
        "borderThickness": 3
      }
    },
    {
      "id": "temp-audit-1",
      "name": "Audit Log",
      "uidata": {
        "type": "text",
        "x": 500,
        "y": 150,
        "content": "Audit Log",
        "zIndex": 4,
        "width": 120,
        "height": 40,
        "color": "#000000",
        "backgroundColor": "#FFF9C4",
        "borderColor": "#FBC02D",
        "borderThickness": 1
      }
    }
  ],
  "connections": [
    {
      "name": "User Request",
      "from": { "name": "User", "type": "DesignItem" },
      "to": { "name": "Auth Service", "type": "DesignItem" },
      "fromPoint": "right",
      "toPoint": "left",
      "uidata": {
        "borderColor": "#333333",
        "borderThickness": 2,
        "borderStyle": "solid"
      }
    },
    {
      "name": "Store Credentials",
      "from": { "name": "Auth Service", "type": "DesignItem" },
      "to": { "name": "PostgreSQL", "type": "DesignItem" },
      "fromPoint": "right",
      "toPoint": "left",
      "uidata": {
        "borderColor": "#333333",
        "borderThickness": 3,
        "borderStyle": "solid"
      }
    },
    {
      "name": "Log Event",
      "from": { "name": "Auth Service", "type": "DesignItem" },
      "to": { "name": "Audit Log", "type": "DesignItem" },
      "fromPoint": "bottom",
      "toPoint": "top",
      "uidata": {
        "borderColor": "#666666",
        "borderThickness": 1,
        "borderStyle": "dashed"
      }
    }
  ],
  "designGroups": [
    {
      "id": "auth-layer",
      "name": "Authentication Layer",
      "description": "Core authentication components",
      "uidata": {
        "x": 280,
        "y": 30,
        "borderColor": "#4CAF50",
        "borderThickness": 2,
        "borderStyle": "dashed"
      },
      "designs": []
    },
    {
      "id": "storage-layer",
      "name": "Storage Layer",
      "description": "Data persistence components",
      "uidata": {
        "x": 480,
        "y": 30,
        "borderColor": "#2196F3",
        "borderThickness": 2,
        "borderStyle": "dotted"
      },
      "designs": []
    }
  ]
};

// Example with dotted and dashed styles
export const exampleWithVariedStyles = {
  "name": "Microservices Architecture",
  "description": "Example showing different connection and border styles",
  "items": [
    {
      "id": "api-gateway",
      "name": "API Gateway",
      "uidata": {
        "type": "rectangle",
        "x": 100,
        "y": 200,
        "content": "API Gateway",
        "width": 150,
        "height": 80,
        "color": "#FF6B6B",
        "zIndex": 1
      }
    },
    {
      "id": "service-a",
      "name": "Service A",
      "uidata": {
        "type": "circle",
        "x": 350,
        "y": 150,
        "content": "Service A",
        "width": 100,
        "height": 100,
        "color": "#4ECDC4",
        "zIndex": 2
      }
    },
    {
      "id": "service-b",
      "name": "Service B",
      "uidata": {
        "type": "circle",
        "x": 350,
        "y": 280,
        "content": "Service B",
        "width": 100,
        "height": 100,
        "color": "#95E1D3",
        "zIndex": 3
      }
    }
  ],
  "connections": [
    {
      "name": "HTTP Request",
      "from": { "name": "API Gateway", "type": "DesignItem" },
      "to": { "name": "Service A", "type": "DesignItem" },
      "fromPoint": "right",
      "toPoint": "left",
      "uidata": {
        "borderColor": "#FF6B6B",
        "borderThickness": 3,
        "borderStyle": "solid"
      }
    },
    {
      "name": "Async Message",
      "from": { "name": "API Gateway", "type": "DesignItem" },
      "to": { "name": "Service B", "type": "DesignItem" },
      "fromPoint": "right",
      "toPoint": "left",
      "uidata": {
        "borderColor": "#95E1D3",
        "borderThickness": 2,
        "borderStyle": "dashed"
      }
    },
    {
      "name": "Event Bus",
      "from": { "name": "Service A", "type": "DesignItem" },
      "to": { "name": "Service B", "type": "DesignItem" },
      "fromPoint": "bottom",
      "toPoint": "top",
      "uidata": {
        "borderColor": "#FFD93D",
        "borderThickness": 1,
        "borderStyle": "dotted"
      }
    }
  ],
  "designGroups": [
    {
      "id": "backend-services",
      "name": "Backend Services",
      "description": "Microservices handling business logic",
      "uidata": {
        "x": 330,
        "y": 130,
        "borderColor": "#6C5CE7",
        "borderThickness": 3,
        "borderStyle": "dashed"
      }
    }
  ]
};

/**
 * Instructions for testing:
 * 
 * 1. Open your design tool
 * 2. Scroll to the "PATCH CANVAS" section in the left panel
 * 3. Copy the entire exampleDesignNewSchema object above
 * 4. Paste it into the textarea
 * 5. Click "Apply"
 * 
 * You should see:
 * - 4 design items with different styles and colors
 * - 3 connections with varying thickness and styles (solid, dashed)
 * - 2 design groups with colored borders
 * - Items labeled with their names
 * 
 * Features to notice:
 * - borderColor controls the color of connections and group boundaries
 * - borderThickness controls line width
 * - borderStyle can be 'solid', 'dashed', or 'dotted'
 * - Each item uses the "name" field for connections instead of "id"
 */
