# Quick Start: New Design Schema

## Visual Styling Options

### Connection Styles
| Property | Values | Example |
|----------|--------|---------|
| borderColor | Any hex color | `"#FF6B6B"`, `"#4CAF50"` |
| borderThickness | 1-5 (recommended) | `2`, `3` |
| borderStyle | `solid`, `dashed`, `dotted` | `"dashed"` |

### Border Style Examples
```
solid:  ──────────────
dashed: ── ── ── ── ──
dotted: ‥‥‥‥‥‥‥‥‥‥‥‥
```

## Test with PATCH CANVAS

### Quick Test - Simple Example
Copy this into PATCH CANVAS panel:

```json
{
  "items": [
    {
      "id": "1",
      "name": "Start",
      "uidata": {
        "type": "circle",
        "x": 100,
        "y": 100,
        "width": 80,
        "height": 80,
        "content": "Start",
        "color": "#4CAF50",
        "zIndex": 1
      }
    },
    {
      "id": "2",
      "name": "End",
      "uidata": {
        "type": "circle",
        "x": 300,
        "y": 100,
        "width": 80,
        "height": 80,
        "content": "End",
        "color": "#F44336",
        "zIndex": 2
      }
    }
  ],
  "connections": [
    {
      "name": "Flow",
      "from": { "name": "Start", "type": "DesignItem" },
      "to": { "name": "End", "type": "DesignItem" },
      "fromPoint": "right",
      "toPoint": "left",
      "uidata": {
        "borderColor": "#2196F3",
        "borderThickness": 3,
        "borderStyle": "solid"
      }
    }
  ],
  "designGroups": []
}
```

## Key Concepts

### 1. Items use `name` for connections
```javascript
// Item definition
{ "name": "Auth Service", ... }

// Connection references it by name
{
  "from": { "name": "Auth Service", "type": "DesignItem" },
  "to": { "name": "Database", "type": "DesignItem" }
}
```

### 2. All visual properties go in `uidata`
```javascript
{
  "name": "My Item",
  "uidata": {
    "x": 100,           // Position
    "y": 100,
    "width": 120,       // Size
    "height": 60,
    "color": "#4CAF50", // Fill color
    "borderColor": "#2E7D32",
    "borderThickness": 2
  }
}
```

### 3. Connection styling
```javascript
{
  "from": { "name": "A", "type": "DesignItem" },
  "to": { "name": "B", "type": "DesignItem" },
  "fromPoint": "right",  // Exit from right side of A
  "toPoint": "left",     // Enter left side of B
  "uidata": {
    "borderColor": "#333",
    "borderThickness": 2,
    "borderStyle": "dashed"  // Makes it dashed
  }
}
```

### 4. Anchor Points
Valid values for `fromPoint` and `toPoint`:
- `"top"` - Top center
- `"right"` - Right center
- `"bottom"` - Bottom center
- `"left"` - Left center

## Color Palette Suggestions

### Professional
```
Blue:   #2196F3
Green:  #4CAF50
Red:    #F44336
Orange: #FF9800
Purple: #9C27B0
```

### Pastel
```
Blue:   #E3F2FD
Green:  #E8F5E9
Red:    #FFEBEE
Orange: #FFF3E0
Purple: #F3E5F5
```

### Dark
```
Blue:   #1565C0
Green:  #2E7D32
Red:    #C62828
Orange: #E65100
Purple: #6A1B9A
```

## Common Patterns

### Database Connection
```json
{
  "name": "Store Data",
  "from": { "name": "Service", "type": "DesignItem" },
  "to": { "name": "Database", "type": "DesignItem" },
  "fromPoint": "bottom",
  "toPoint": "top",
  "uidata": {
    "borderColor": "#2196F3",
    "borderThickness": 2,
    "borderStyle": "solid"
  }
}
```

### Async/Event Connection
```json
{
  "name": "Event",
  "from": { "name": "Publisher", "type": "DesignItem" },
  "to": { "name": "Subscriber", "type": "DesignItem" },
  "fromPoint": "right",
  "toPoint": "left",
  "uidata": {
    "borderColor": "#FF9800",
    "borderThickness": 1,
    "borderStyle": "dashed"
  }
}
```

### Optional Dependency
```json
{
  "name": "Optional Call",
  "from": { "name": "Service A", "type": "DesignItem" },
  "to": { "name": "Service B", "type": "DesignItem" },
  "fromPoint": "right",
  "toPoint": "left",
  "uidata": {
    "borderColor": "#9E9E9E",
    "borderThickness": 1,
    "borderStyle": "dotted"
  }
}
```

## Design Groups

Create visual boundaries:
```json
{
  "id": "backend",
  "name": "Backend Services",
  "description": "All backend microservices",
  "uidata": {
    "x": 200,
    "y": 100,
    "borderColor": "#4CAF50",
    "borderThickness": 2,
    "borderStyle": "dashed"
  }
}
```

## Troubleshooting

### Connections not showing?
- Check that `from` and `to` names exactly match item names
- Verify `fromPoint` and `toPoint` are valid ("top", "right", "bottom", "left")

### Items not visible?
- Check `x`, `y` coordinates are within canvas view
- Verify `width` and `height` are reasonable (50-200 typical)
- Ensure `zIndex` is set (higher = on top)

### Styling not applied?
- Connection styles go in connection's `uidata`
- Item styles go in item's `uidata`
- borderStyle must be exactly: "solid", "dashed", or "dotted"

## More Examples

See complete working examples in:
- [docs/SCHEMA_EXAMPLES.ts](./SCHEMA_EXAMPLES.ts)
- [docs/SCHEMA_MIGRATION_GUIDE.md](./SCHEMA_MIGRATION_GUIDE.md)
