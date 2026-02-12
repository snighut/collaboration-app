# Connection Types - Visual Reference Guide

## Quick Reference: Connection Types by Use Case

### 🏗️ System Architecture Diagrams

#### Microservices Architecture
```
Service A  ────REST API───→  Service B
           ⇢ Async Call ⇢
           
Service B  ─══Data Flow══→  Database
           
Service A  ⋯⋯ Message ⋯⋯→  Queue  ⋯⋯→  Service C
```

**Use these types:**
- `REST_API` - RESTful API calls
- `ASYNCHRONOUS_CALL` - Non-blocking async operations
- `DATA_FLOW` - Data transfer between components
- `MESSAGE_QUEUE` - Queue-based messaging

---

### 🗄️ Database Design & Data Modeling

#### Entity Relationships
```
Order  ♦────→  LineItem     (Composition - strong ownership)
User   ◇────→  Address      (Aggregation - weak ownership)
Class  ─────→  Interface    (Dependency)
```

**Use these types:**
- `COMPOSITION` (♦) - Part cannot exist without whole
- `AGGREGATION` (◇) - Part can exist independently
- `DEPENDENCY` - Uses or depends on
- `DATABASE_CONNECTION` - Physical DB connections

---

### 🎯 Object-Oriented Design (UML)

#### Class Diagrams
```
Animal  ─────▷  Dog          (Inheritance/Generalization)
ILogger - - -△  FileLogger   (Interface Implementation)
Car     ♦───→  Engine        (Composition)
Library ◇───→  Book          (Aggregation)
```

**Use these types:**
- `INHERITANCE` or `GENERALIZATION` (─────▷) - Is-a relationship
- `REALIZATION` or `IMPLEMENTATION` (- - -△) - Implements interface
- `COMPOSITION` (♦) - Strong ownership
- `AGGREGATION` (◇) - Weak ownership

---

### 🔄 Event-Driven Architecture

#### Event Flow
```
User Action  ⚡→  Event Bus  ⊷→  Handlers
                              ⊷→  
                              ⊷→  
                              
Frontend  ─WS─→  Backend  (WebSocket - bidirectional)
```

**Use these types:**
- `EVENT_FLOW` (⚡→) - Event propagation
- `EVENT_BUS` (⊷→) - Broadcast to multiple subscribers
- `WEBSOCKET` - Real-time bidirectional communication
- `PUBLISH_SUBSCRIBE` - Pub/sub pattern

---

### 🌐 Network & Integration Patterns

#### API Integration
```
Client  ──REST──→  API Gateway  ──GQL──→  GraphQL Service
                   ──RPC──→  gRPC Service
                   
Web App ══HTTP══→  Server
Mobile  ──TCP───→  Server
IoT     - -UDP- -→  Server
```

**Use these types:**
- `REST_API` - REST endpoints
- `GRAPHQL` - GraphQL queries/mutations
- `GRPC` - gRPC calls
- `HTTP_REQUEST` - HTTP/HTTPS requests
- `TCP_CONNECTION` - Reliable TCP
- `UDP_CONNECTION` - Unreliable UDP

---

### 📊 Data Pipeline & ETL

#### Data Processing
```
Source  ═══►  Transform  ═══►  Load  ───→  Warehouse
        ⇢          ⇢            ⇢
        
Database  ───→  Cache  ⚡─→  Application
```

**Use these types:**
- `DATA_FLOW` (═══►) - Heavy data transfer
- `CONTROL_FLOW` (━━►) - Process orchestration
- `DATABASE_CONNECTION` - DB access
- `CACHE_CONNECTION` (⚡) - Fast cache access

---

### 🔗 System Integration Patterns

#### Coupling Types
```
Module A  - - - - →  Module B    (Loose Coupling - Good!)
Module C  ━━━━━━→  Module D    (Tight Coupling - Be careful!)

Service X  ⇄  Service Y          (Bidirectional)
Service P  →   Service Q          (Unidirectional)
```

**Use these types:**
- `LOOSE_COUPLING` (- - - -) - Preferred in microservices
- `TIGHT_COUPLING` (━━━━━) - Indicates strong dependency
- `BIDIRECTIONAL` (⇄) - Two-way communication
- `UNIDIRECTIONAL` (→) - One-way communication

---

## Connection Type Properties Table

| Connection Type | Visual | Color | Line Style | Best For |
|----------------|--------|-------|------------|----------|
| **REST_API** | REST | Green (#059669) | Solid, Filled | RESTful API calls |
| **GRAPHQL** | GQL | Red (#E11D48) | Solid, Filled | GraphQL operations |
| **GRPC** | RPC | Blue (#2563EB) | Solid, Filled | gRPC services |
| **WEBSOCKET** | WS | Purple (#7C3AED) | Solid, Double | Real-time bidirectional |
| **DATA_FLOW** | ═► | Blue (#2563EB) | Thick Solid | Heavy data transfer |
| **CONTROL_FLOW** | ━► | Red (#DC2626) | Thick Solid | Process control |
| **MESSAGE_FLOW** | ⋯► | Purple (#7C3AED) | Dotted | Message passing |
| **EVENT_FLOW** | ⚡→ | Yellow (#EAB308) | Dashed | Event-driven |
| **COMPOSITION** | ♦— | Dark Green (#059669) | Solid, Diamond | Strong ownership |
| **AGGREGATION** | ◇— | Green (#10B981) | Solid, Hollow Diamond | Weak ownership |
| **INHERITANCE** | —△ | Orange (#F59E0B) | Solid, Hollow Triangle | Class inheritance |
| **DEPENDENCY** | - - → | Purple (#8B5CF6) | Dashed, Open | Uses/depends on |
| **DATABASE_CONNECTION** | ⛁ | Blue (#0284C7) | Thick Solid | Database access |
| **CACHE_CONNECTION** | ⚡⛁ | Orange (#F59E0B) | Dashed | Cache access |
| **MESSAGE_QUEUE** | ▭→ | Purple (#7C3AED) | Solid, Stepped | Queue-based messaging |
| **EVENT_BUS** | ⊷⊷→ | Pink (#DB2777) | Dashed, Curved | Event broadcasting |
| **SYNCHRONOUS_CALL** | → | Cyan (#0EA5E9) | Solid | Blocking calls |
| **ASYNCHRONOUS_CALL** | ⇢ | Cyan (#06B6D4) | Dashed | Non-blocking calls |
| **REQUEST_RESPONSE** | ⇄ | Teal (#14B8A6) | Solid, Double | Request-reply pattern |
| **PUBLISH_SUBSCRIBE** | ⊷→ | Purple (#8B5CF6) | Dashed, Curved | Pub/sub pattern |
| **LOOSE_COUPLING** | - - | Green (#10B981) | Thin Dashed | Preferred design |
| **TIGHT_COUPLING** | ━━ | Red (#EF4444) | Thick Solid | Strong dependency |

---

## Example Architectures

### 1. E-Commerce System
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ REST API
       ▼
┌─────────────────────────────────────┐
│         API Gateway                 │
└─────┬───────────┬──────────┬────────┘
      │ REST      │ GraphQL  │ gRPC
      ▼           ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ User Svc │ │ Cart Svc │ │ Order Svc│
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │ DB         │ Cache      │ DB
     ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│PostgreSQL│ │  Redis   │ │PostgreSQL│
└──────────┘ └──────────┘ └──────────┘
```

**Connection Types Used:**
- Browser → API Gateway: `REST_API`
- API Gateway → Services: `REST_API`, `GRAPHQL`, `GRPC`
- Services → PostgreSQL: `DATABASE_CONNECTION`
- Cart Service → Redis: `CACHE_CONNECTION`

### 2. Event-Driven Microservices
```
┌────────────────────────────────────────────┐
│              Event Bus                     │
└─┬────────┬────────┬────────┬──────────┬───┘
  │ Event  │ Event  │ Event  │ Event    │
  ▼        ▼        ▼        ▼          ▼
[Svc A] [Svc B] [Svc C] [Svc D]  [Analytics]
```

**Connection Types Used:**
- →All: `EVENT_BUS` with `PUBLISH_SUBSCRIBE` pattern
- Services → Event Bus: `EVENT_FLOW`
- Services internally: `ASYNCHRONOUS_CALL`

### 3. Layered Architecture
```
┌────────────────────┐
│  Presentation      │ (Tight Coupling)
├────────────────────┤ ━━━━━━━━━
│  Business Logic    │ (Loose Coupling)
├────────────────────┤ - - - -
│  Data Access       │ (DB Connection)
├────────────────────┤ ═══►
│  Database          │
└────────────────────┘
```

**Connection Types Used:**
- Presentation → Business: `TIGHT_COUPLING` (MVC framework)
- Business → Data Access: `LOOSE_COUPLING` (Interface/DI)
- Data Access → Database: `DATABASE_CONNECTION`

---

## Choosing the Right Connection Type

### Decision Tree

**Is it a relationship between classes/entities?**
- Inheritance/Is-a → `INHERITANCE`
- Implements interface → `REALIZATION`
- Strong ownership (part dies with whole) → `COMPOSITION`
- Weak ownership (part can exist alone) → `AGGREGATION`
- Just uses → `DEPENDENCY`

**Is it a network call?**
- REST → `REST_API`
- GraphQL → `GRAPHQL`
- gRPC → `GRPC`
- WebSocket → `WEBSOCKET`
- Generic HTTP → `HTTP_REQUEST`

**Is it messaging?**
- Queue-based → `MESSAGE_QUEUE`
- Event broadcast → `EVENT_BUS`
- Pub/sub pattern → `PUBLISH_SUBSCRIBE`

**Is it data-related?**
- Large data transfer → `DATA_FLOW`
- Database access → `DATABASE_CONNECTION`
- Cache access → `CACHE_CONNECTION`

**Is it about coupling?**
- Prefer loose → `LOOSE_COUPLING`
- Existing tight → `TIGHT_COUPLING`

**Is it about flow control?**
- Data movement → `DATA_FLOW`
- Process control → `CONTROL_FLOW`
- Event-driven → `EVENT_FLOW`
- Messages → `MESSAGE_FLOW`

---

## Pro Tips

### 🎨 Color Coding Strategy
- **Blue** family: Data & Network (DATA_FLOW, REST_API, TCP)
- **Green** family: Good design (LOOSE_COUPLING, AGGREGATION)
- **Red** family: Warnings (TIGHT_COUPLING, CONTROL_FLOW)
- **Purple** family: Messaging & Events (MESSAGE_QUEUE, EVENT_BUS)
- **Orange** family: OOP concepts (INHERITANCE, GENERALIZATION)

### 📏 Line Thickness Meanings
- **Thin (1-2px)**: Weak relationships, optional (LOOSE_COUPLING, DEPENDENCY)
- **Medium (2-3px)**: Standard relationships (most types)
- **Thick (3-4px)**: Heavy/important relationships (DATA_FLOW, TIGHT_COUPLING, DATABASE)

### 🎯 Arrow Type Meanings
- **Filled arrow**: Standard, directional flow
- **Open arrow**: Weak relationship, optional
- **Double arrow**: Bidirectional communication
- **Diamond**: Ownership relationship (filled = strong, hollow = weak)
- **Triangle**: Inheritance/interface relationship (always hollow)

### 🔀 Line Pattern Meanings
- **Straight**: Direct, standard connection
- **Curved**: Broadcast, non-direct (EVENT_BUS, PUBLISH_SUBSCRIBE)
- **Stepped**: Queued, staged processing (MESSAGE_QUEUE)

---

## Common Mistakes to Avoid

❌ **Don't use `TIGHT_COUPLING` everywhere** - It should indicate problematic dependencies
✅ **Use `LOOSE_COUPLING` for well-designed interfaces**

❌ **Don't use generic `DEFAULT` for specific scenarios** - Be explicit
✅ **Use specific types** like `REST_API`, `DATABASE_CONNECTION`

❌ **Don't mix UML and architecture patterns incorrectly** - Keep contexts separate
✅ **Use `INHERITANCE` for class diagrams, `REST_API` for system architecture**

❌ **Don't use `DATA_FLOW` for everything** - It indicates heavy data movement
✅ **Use `MESSAGE_FLOW` for light messages, `DATA_FLOW` for bulk data**

---

## Keyboard Shortcuts & Workflow Tips

1. **Quick Selection**: Click connection type before drawing
2. **Keep It Consistent**: Use same connection types for similar relationships
3. **Start Simple**: Begin with `DEFAULT`, refine to specific types later
4. **Name Your Connections**: Add descriptive names (e.g., "Fetch User Data")
5. **Add Metadata**: Use `connectionData` to document protocols, ports, etc.

---

## Need Help?

Refer to:
- `lib/connectionTypes.ts` - Complete type definitions
- `CONNECTION_TYPES_ENHANCEMENT.md` - Implementation details
- This guide - Visual reference and examples

Happy architecting! 🚀
