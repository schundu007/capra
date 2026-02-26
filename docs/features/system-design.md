# System Design Assistant

The System Design feature helps you tackle architecture interviews with AI-generated diagrams, scalability analysis, and structured explanations.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Diagram Generation](#diagram-generation)
4. [Design Components](#design-components)
5. [Cloud Provider Options](#cloud-provider-options)
6. [Follow-up Discussions](#follow-up-discussions)
7. [Common Design Patterns](#common-design-patterns)
8. [Interview Tips](#interview-tips)

---

## Overview

System Design mode transforms high-level requirements into:

- **Architecture diagrams** with proper components
- **Scalability analysis** for different traffic levels
- **Technology recommendations** with trade-offs
- **Interview-ready explanations** you can present

![System Design Overview](../images/system-design-overview.png)
*System design interface with diagram and explanation panels*

---

## Getting Started

### Switch to System Design Mode

1. Click the **Mode Selector** in the top navigation
2. Select **System Design**
3. The interface adjusts for architecture problems

![Mode Selector](../images/mode-selector-design.png)
*Switching to System Design mode*

### Enter a Design Problem

Type or paste your system design prompt:

```
Design a URL shortener like bit.ly that:
- Handles 100M new URLs per day
- Redirects 1B requests per day
- URLs expire after 5 years
- Analytics for click tracking
```

> **Tip:** Include scale requirements for better recommendations.

---

## Diagram Generation

### Automatic Architecture Diagrams

Ascend generates professional architecture diagrams using:

- **Eraser.io** — Clean, professional diagrams
- **Cloud-native components** — AWS, GCP, or Azure icons
- **Proper relationships** — Data flow, dependencies

![Generated Diagram](../images/generated-diagram.png)
*Auto-generated architecture diagram*

### Diagram Components

| Component | Symbol | Use Case |
|-----------|--------|----------|
| Load Balancer | ⚖️ | Traffic distribution |
| API Gateway | 🚪 | Request routing |
| Database | 🗄️ | Data storage |
| Cache | ⚡ | Performance layer |
| Queue | 📬 | Async processing |
| CDN | 🌐 | Content delivery |

### Exporting Diagrams

1. Right-click the diagram
2. Select **Export as PNG** or **Export as SVG**
3. Use in presentations or documentation

---

## Design Components

### Requirements Clarification

Every design starts with clarifying requirements:

**Functional Requirements:**
- What should the system do?
- Core features and user flows
- Edge cases to handle

**Non-Functional Requirements:**
- Scale (users, requests, data volume)
- Latency expectations
- Availability requirements (99.9%? 99.99%?)
- Consistency vs. availability trade-offs

### High-Level Design

The solution includes:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Client    │────▶│  API Gateway │────▶│   Service    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                     ┌──────────────┐     ┌──────▼───────┐
                     │    Cache     │◀────│   Database   │
                     └──────────────┘     └──────────────┘
```

### Deep Dives

Detailed explanations for each component:

1. **Database Design**
   - Schema design
   - Partitioning strategy
   - Replication approach

2. **API Design**
   - REST endpoints
   - Request/response formats
   - Rate limiting

3. **Scaling Strategy**
   - Horizontal vs vertical scaling
   - Caching layers
   - CDN placement

---

## Cloud Provider Options

### Select Your Cloud

Choose a cloud provider for specific service recommendations:

| Provider | Button | Services |
|----------|--------|----------|
| **AWS** | ☁️ AWS | EC2, RDS, S3, CloudFront, SQS |
| **GCP** | 🔷 GCP | Compute Engine, Cloud SQL, GCS |
| **Azure** | 🔶 Azure | VMs, Azure SQL, Blob Storage |
| **Generic** | ⚙️ Generic | Platform-agnostic components |

![Cloud Selection](../images/cloud-selection.png)
*Choose cloud provider for specific recommendations*

### Example: AWS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Architecture                      │
├─────────────────────────────────────────────────────────────┤
│  CloudFront ──▶ ALB ──▶ ECS/EKS ──▶ RDS (Aurora)            │
│       │                    │              │                  │
│       │                    ▼              ▼                  │
│       │              ElastiCache     Read Replicas           │
│       │                    │                                 │
│       └──────────────▶ S3 (Static Assets)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Follow-up Discussions

### Typical Follow-ups

After the initial design, explore deeper:

```
"How would you handle 10x the current scale?"
"What happens if the database goes down?"
"How do you ensure data consistency across regions?"
"Walk me through a user request end-to-end."
```

### Trade-off Analysis

Discuss design decisions:

| Decision | Option A | Option B |
|----------|----------|----------|
| Database | SQL (Strong consistency) | NoSQL (Horizontal scale) |
| Caching | Redis (Fast, complex) | Memcached (Simple, limited) |
| Messaging | Kafka (High throughput) | SQS (Managed, simpler) |

---

## Common Design Patterns

### Microservices

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│ User    │  │ Order   │  │ Payment │
│ Service │  │ Service │  │ Service │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┼────────────┘
                  │
           ┌──────▼──────┐
           │ Message Bus │
           │   (Kafka)   │
           └─────────────┘
```

### Event-Driven Architecture

```
Producer ──▶ Event Bus ──▶ Consumer 1
                      ├──▶ Consumer 2
                      └──▶ Consumer 3
```

### CQRS Pattern

```
Commands ──▶ Write DB ──▶ Event Log ──▶ Read DB ◀── Queries
```

---

## Interview Tips

### The Framework

Follow this structure for any system design interview:

| Phase | Time | Focus |
|-------|------|-------|
| **Clarify** | 3-5 min | Requirements, constraints, scale |
| **High-Level** | 5-10 min | Core components, data flow |
| **Deep Dive** | 15-20 min | Specific components in detail |
| **Trade-offs** | 5-10 min | Alternatives, bottlenecks |
| **Extensions** | 5 min | Future improvements |

### Common Mistakes to Avoid

1. **Jumping to solutions** — Always clarify first
2. **Ignoring scale** — Numbers matter in design
3. **Single points of failure** — Always discuss redundancy
4. **Over-engineering** — Start simple, add complexity as needed
5. **Not drawing** — Visual communication is key

### Practice Problems

| Problem | Difficulty | Key Concepts |
|---------|------------|--------------|
| URL Shortener | Easy | Hashing, DB design |
| Twitter Feed | Medium | Fan-out, caching |
| Uber | Medium-Hard | Location, matching |
| YouTube | Hard | CDN, transcoding |
| Google Search | Hard | Indexing, ranking |

---

## Next Steps

- [Coding Interview Guide](./coding-interview.md) — Algorithm preparation
- [Company Prep Guide](./company-prep.md) — Company-specific preparation
- [Interview Assistant](./interview-assistant.md) — Real-time interview help
