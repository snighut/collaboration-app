
# Architectural Decision Record (ADR) 1: Workflow Canvas UI and Component Connections

Date: 2026-01-28

## Status
Proposed

## Context

I am designing an application that allows users to visually create and manage workflow components on a canvas UI. Each workflow item will be represented as a tile, holding both metadata (such as description, creation date, modification date, and canvas coordinates) and a specific context (the purpose and reasoning behind the component).

To enhance usability, each tile will display a set of action icons on hover:
- **Share icon:** Opens a modal to share the component via Facebook, email, or by generating a shareable link.
- **Delete icon:** Removes the component from the UI.
- **Link icon:** Allows connecting this tile to others. When activated, hovering over other tiles shows their description in a highlighted tooltip. Clicking a target tile draws an arrow (curved or straight, depending on layout) from the source to the target.
- **Clone icon:** Duplicates the component.
- **Expand icon:** Reveals child components as additional tiles on the canvas.
- **Child icon:** Creates a child clone and links it to the parent, visually representing a parent-child relationship.

Connections between components are first-class citizens, each carrying its own context to describe the relationship. There is also a feature to shrink a child component into a "green dot" that resides within the parent tile, following the composition principle and visually indicating the parent-child link.

For example, to model a microservice deployment flow, I can add an API gateway component, a microservice component, and a database component. Connections can be drawn to represent the flow. By using the child icon, I can create instances of the microservice as children, each linked to its parent, and connect the microservice to the database as needed.

## Decision

I will implement this interactive workflow canvas UI with rich component and connection features as described above.

## Consequences

This approach will result in a visually intuitive and powerful tool for designing and understanding complex workflows. The UI will look smart, be highly interactive, and support advanced relationships between components.

---