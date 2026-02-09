# Design Schema Migration Guide

## Overview

The collaboration app has been updated to support a new, more flexible design schema that provides better support for:
- Rich UI metadata (uidata) for visual styling
- Named references for connections (using `name` instead of `id`)
- Design groups with visual boundaries
- Styled connections with customizable colors, thickness, and line styles

## Schema Changes

### Old Schema (Legacy)
```typescript
{
  items: CanvasObject[],  // Flat array of canvas objects
  connections: Array<{    // Simple string-based connections
    from: string,
    to: string,
    fromPoint: string,
    toPoint: string
  }>
}
```

### New Schema
```typescript
{
  name: string,
  description: string,
  thumbnail: string | null,
  context: {
    category: string,
    tags: string[]
  },
  items: DesignItem[],    // Items with rich uidata
  connections: Connection[], // Styled connections with metadata
  designGroups: DesignGroup[] // Visual grouping boundaries
}
```

## Key Interfaces

### DesignItem
Each design item now has a separate `uidata` object for UI-specific properties:

```typescript
interface DesignItem {
  id: string;           // Unique ID (e.g., "temp-user-1")
  name: string;         // Display name used for connections
  uidata: {
    type: AssetType;    // 'text' | 'rectangle' | 'circle' | etc.
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    zIndex: number;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderThickness?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    fontSize?: number;
    fontStyle?: string;
  };
}
```

### Connection
Connections now support:
- Named references (using item names instead of IDs)
- Type specification (DesignItem or DesignGroup)
- Rich styling metadata

```typescript
interface Connection {
  name?: string;         // Optional connection label
  from: string | {       // Can be simple string or typed reference
    name: string;
    type: 'DesignItem' | 'DesignGroup';
  };
  to: string | {
    name: string;
    type: 'DesignItem' | 'DesignGroup';
  };
  fromPoint: string;     // 'top' | 'right' | 'bottom' | 'left'
  toPoint: string;
  uidata?: {
    borderColor?: string;        // Connection line color
    borderThickness?: number;    // Line width (default: 2)
    borderStyle?: 'solid' | 'dashed' | 'dotted'; // Line style
  };
}
```

### DesignGroup
Visual containers for organizing related items:

```typescript
interface DesignGroup {
  id: string;
  name: string;
  description?: string;
  uidata?: {
    x?: number;
    y?: number;
    borderColor?: string;
    borderThickness?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
  };
  designs?: any[];
}
```

## Visual Styling Features

### Connection Styles

Connections can be styled with three properties:

1. **borderColor**: Controls the line color
   ```typescript
   borderColor: "#FF6B6B"  // Red connection
   ```

2. **borderThickness**: Controls line width (1-5 recommended)
   ```typescript
   borderThickness: 3  // Thicker line for emphasis
   ```

3. **borderStyle**: Controls line pattern
   - `solid`: Continuous line (default)
   - `dashed`: Dashed line pattern (10px dash, 5px gap)
   - `dotted`: Dotted line pattern (2px dot, 4px gap)

### Design Group Styles

Groups create visual boundaries with customizable:
- Border color
- Border thickness
- Border style (solid/dashed/dotted)
- Position (x, y)

Groups render:
- A styled boundary rectangle
- A label badge at the top
- An optional description tooltip when selected

## New Components

### ConnectionRenderer
Handles rendering of all connections with proper styling:
- Extracts connection endpoints from item names
- Applies borderColor, borderThickness, borderStyle
- Renders as Arrow components for directionality
- Supports both string and object-based from/to references

Located: `components/ConnectionRenderer.tsx`

### DesignGroupRenderer
Renders design group boundaries:
- Draws styled boundary rectangles
- Shows group name labels
- Displays descriptions for active groups
- Handles selection state

Located: `components/DesignGroupRenderer.tsx`

## Schema Transformation Layer

The app includes utilities to convert between old and new schemas:

### transformFromBackendSchema
Converts backend data to canvas state:
```typescript
const { objects, connections, designGroups } = transformFromBackendSchema(backendData);
```

Handles:
- New schema with `items` array
- Legacy schema with `data.objects`
- Connection normalization
- Design groups extraction

### transformToBackendSchema
Converts canvas state to backend format:
```typescript
const backendSchema = transformToBackendSchema({
  name, description, thumbnail,
  objects, connections, designGroups
});
```

Transforms:
- CanvasObjects → DesignItems with uidata
- Simple connections → Typed ConnectionReferences
- Adds default styling metadata

Located: `lib/schemaTransform.ts`

## Usage Examples

### Creating a Design Item
```typescript
{
  "id": "temp-auth-1",
  "name": "Auth Service",
  "uidata": {
    "type": "rectangle",
    "x": 300,
    "y": 50,
    "content": "Auth Service",
    "width": 140,
    "height": 60,
    "color": "#4CAF50",
    "borderColor": "#2E7D32",
    "borderThickness": 2,
    "zIndex": 2
  }
}
```

### Creating a Styled Connection
```typescript
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
}
```

### Creating a Design Group
```typescript
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
}
```

## Testing Your Changes

1. **PATCH CANVAS Panel**: Use the debug panel to test new schema
   - Accepts both new schema (with `items`) and old schema (with `objects`)
   - Automatically transforms new schema to canvas format
   - See `docs/SCHEMA_EXAMPLES.ts` for complete examples

2. **Visual Verification**:
   - Connections should show custom colors and styles
   - Design groups should render as colored boundary boxes
   - Item names should appear correctly
   - Different line styles (solid/dashed/dotted) should be visible

3. **Save/Load Cycle**:
   - Create a design with styled elements
   - Save it (transforms to new backend schema)
   - Reload the page
   - Verify all styling is preserved

## Backward Compatibility

The system maintains full backward compatibility:

- **Loading**: Supports both old and new schema formats
- **Saving**: Always saves in new schema format
- **Internal**: Uses legacy CanvasObject format internally for compatibility
- **Transformation**: Automatic conversion at load/save boundaries

## Files Modified

1. **types.ts**: Added new interfaces (DesignItem, Connection, DesignGroup, UIData)
2. **lib/canvasReducer.ts**: Added designGroups state and actions
3. **lib/schemaTransform.ts**: NEW - Schema transformation utilities
4. **components/ConnectionRenderer.tsx**: NEW - Styled connection rendering
5. **components/DesignGroupRenderer.tsx**: NEW - Design group rendering
6. **components/CanvasTool.tsx**: Updated to use new components and transformations

## Migration Checklist

- [x] Update type definitions
- [x] Add schema transformation layer
- [x] Create ConnectionRenderer component
- [x] Create DesignGroupRenderer component
- [x] Update CanvasTool to use new components
- [x] Update save/load logic with transformations
- [x] Add designGroups to canvas state
- [x] Update PATCH CANVAS to support new schema
- [x] Test backward compatibility
- [x] Create documentation and examples

## Future Enhancements

Potential improvements to consider:

1. **Item-to-Group Membership**: Track which items belong to which groups
2. **Group Auto-sizing**: Calculate group bounds from contained items
3. **Connection Labels**: Display connection names on the canvas
4. **Style Presets**: Pre-defined color/style themes
5. **Group Nesting**: Support for nested design groups
6. **Connection Routing**: Smart path routing around objects

## Support

For questions or issues:
- Check `docs/SCHEMA_EXAMPLES.ts` for working examples
- Review `lib/schemaTransform.ts` for transformation logic
- Test with PATCH CANVAS panel for quick iteration
