// System design categories, category map, and core topics

export const systemDesignCategories = [
    { id: 'fundamentals', name: 'Core Fundamentals', icon: 'lightbulb', color: '#10b981' },
    { id: 'storage', name: 'Storage & Databases', icon: 'database', color: '#3b82f6' },
    { id: 'communication', name: 'Communication & APIs', icon: 'globe', color: '#8b5cf6' },
    { id: 'scalability', name: 'Scalability & Performance', icon: 'trendingUp', color: '#f59e0b' },
    { id: 'reliability', name: 'Reliability & Security', icon: 'shield', color: '#ef4444' },
  ];

export const systemDesignCategoryMap = {
    'fundamentals': 'fundamentals',
    'databases': 'storage',
    'caching': 'storage',
    'message-queues': 'communication',
    'api-design': 'communication',
    'load-balancing': 'scalability',
    'rate-limiting': 'scalability',
    'microservices': 'scalability',
    'security': 'reliability',
    'monitoring': 'reliability',
  };

  // System Design Topics
export const systemDesignTopics = [
    {
      id: 'fundamentals',
      title: 'Fundamentals',
      icon: 'lightbulb',
      color: '#10b981',
      questions: 12,
      description: 'Core concepts every system design interview requires.',
      concepts: ['Scalability', 'Latency vs Throughput', 'Availability vs Consistency', 'DNS', 'CDN', 'Load Balancing'],
      tips: [
        'Always clarify requirements first: functional and non-functional',
        'Back-of-envelope calculations show you understand scale',
        'Know the difference between vertical and horizontal scaling'
      ],

      introduction: `System design fundamentals are the building blocks every engineer must master. These concepts appear in every interview and form the vocabulary for discussing large-scale systems.

Understanding scalability, reliability, and performance trade-offs allows you to reason about complex systems. These fundamentals are not just theory—they're used daily at companies like Google, Netflix, and Amazon to serve billions of users.`,

      functionalRequirements: [
        'Handle increasing user load without degradation',
        'Respond to requests within acceptable latency',
        'Remain available even when components fail',
        'Store and retrieve data reliably',
        'Support geographic distribution of users',
        'Enable system evolution without major rewrites'
      ],

      nonFunctionalRequirements: [
        'Scalability: 10x growth without architecture change',
        'Availability: 99.9% to 99.999% uptime (3 nines to 5 nines)',
        'Latency: p50 < 100ms, p99 < 500ms',
        'Throughput: Thousands to millions of requests/second',
        'Durability: Zero data loss for critical data',
        'Cost efficiency: Linear or sub-linear cost scaling'
      ],

      dataModel: {
        description: 'Key metrics and calculations for system design',
        schema: `Availability Calculations:
  99% = 87.6 hours downtime/year
  99.9% = 8.76 hours downtime/year
  99.99% = 52.6 minutes downtime/year
  99.999% = 5.26 minutes downtime/year

Storage Estimates:
  1 KB = 1,000 bytes
  1 MB = 1,000 KB = 10^6 bytes
  1 GB = 1,000 MB = 10^9 bytes
  1 TB = 1,000 GB = 10^12 bytes
  1 PB = 1,000 TB = 10^15 bytes

Traffic Estimates:
  1 million users × 10 requests/day = 10M requests/day
  10M / 86400 seconds = ~116 requests/second
  Peak = 2-5x average = 230-580 RPS`
      },

      apiDesign: {
        description: 'Common patterns in API design',
        endpoints: [
          { method: 'GET', path: '/api/resource/:id', params: '-', response: 'Single resource' },
          { method: 'GET', path: '/api/resources', params: 'limit, offset, filters', response: 'Paginated list' },
          { method: 'POST', path: '/api/resources', params: 'resource data', response: '201 Created' },
          { method: 'PUT', path: '/api/resource/:id', params: 'full resource', response: 'Updated resource' },
          { method: 'DELETE', path: '/api/resource/:id', params: '-', response: '204 No Content' }
        ]
      },

      keyQuestions: [
        {
          question: 'What is the difference between vertical and horizontal scaling?',
          answer: `**Vertical Scaling (Scale Up)**:
- Add more CPU, RAM, storage to existing machine
- Simpler: no code changes needed
- Limited: single machine has hardware limits
- Single point of failure

**Horizontal Scaling (Scale Out)**:
- Add more machines to the pool
- More complex: requires distributed design
- Unlimited: can keep adding servers
- Better fault tolerance

**When to use each**:
- Start vertical (simpler) until you hit limits
- Scale horizontally when: need fault tolerance, single machine can't handle load, or need geographic distribution
- Most production systems combine both`
        },
        {
          question: 'Explain the CAP theorem and its implications',
          answer: `**CAP Theorem**: A distributed system can provide at most 2 of 3 guarantees:

**Consistency**: Every read receives the most recent write
**Availability**: Every request receives a response
**Partition tolerance**: System operates despite network failures

**Reality**: Network partitions WILL happen, so you must choose:
- **CP systems** (Consistency + Partition): Refuse requests during partition
  - Examples: HBase, MongoDB, Redis Cluster
  - Use when: Financial transactions, inventory counts

- **AP systems** (Availability + Partition): Serve requests but may return stale data
  - Examples: Cassandra, DynamoDB, CouchDB
  - Use when: Social feeds, caching, analytics

**PACELC Extension**: In absence of partition (E), choose Latency vs Consistency`
        },
        {
          question: 'How do you estimate scale for a system?',
          answer: `**Back-of-Envelope Calculation Framework**:

1. **Users**: Start with DAU (Daily Active Users)
   - Twitter: 300M DAU
   - Medium app: 1M DAU

2. **Requests**: Actions per user per day
   - Read-heavy: 10-100 reads per user
   - Write-heavy: 1-10 writes per user
   - Total: DAU × actions/day ÷ 86,400 = RPS

3. **Storage**: Data per action × actions × retention
   - Tweet: ~300 bytes × 500M tweets/day × 5 years
   - Images: ~200KB average × uploads/day

4. **Bandwidth**: Data transferred per request
   - API response: 1-10 KB average
   - Images/video: 100KB-10MB per asset

**Example - URL Shortener**:
- 100M new URLs/month = ~40 URLs/second
- 100:1 read:write ratio = 4000 reads/second
- 100 bytes/URL × 100M × 12 months × 5 years = 600GB`
        },
        {
          question: 'What is latency vs throughput?',
          answer: `**Latency**: Time to complete one request (milliseconds)
- Network: 0.5ms local, 150ms cross-continent
- SSD read: 0.1ms
- HDD seek: 10ms
- RAM access: 0.0001ms (100 nanoseconds)

**Throughput**: Requests completed per unit time (RPS)
- Single server: 1,000-10,000 RPS
- With caching: 100,000+ RPS
- Distributed: millions of RPS

**Trade-offs**:
- Batching: ↑ throughput, ↑ latency
- Caching: ↓ latency, ↑ complexity
- Parallel processing: ↑ throughput, same latency

**Little's Law**: L = λW
- L = items in system
- λ = arrival rate (throughput)
- W = time in system (latency)`
        }
      ],

      basicImplementation: {
        title: 'Single Server Architecture',
        description: 'Starting point for small applications. A single server hosts both the web server and database, suitable for low-traffic applications with ~1,000 concurrent users and 100-1,000 RPS.',
        svgTemplate: 'singleServer',
        problems: [
          'Single point of failure - any failure takes down entire system',
          'Limited scalability - constrained by single machine',
          'No redundancy - data loss risk',
          'Maintenance requires downtime'
        ]
      },

      advancedImplementation: {
        title: 'Distributed Architecture',
        description: 'CDN for static assets → Load Balancer distributes traffic → Multiple stateless App Servers → Redis Cache + Primary-Replica Database setup.',
        svgTemplate: 'loadBalancer',
        keyPoints: [
          'Stateless app servers enable horizontal scaling',
          'CDN offloads static content and reduces latency',
          'Caching reduces database load by 80-90%',
          'Database replication provides read scaling and failover',
          'Load balancer eliminates single point of failure'
        ]
      },

      discussionPoints: [
        {
          topic: 'Scalability Patterns',
          points: [
            'Stateless services: Enable horizontal scaling',
            'Database sharding: Distribute data across machines',
            'Caching layers: Reduce database load',
            'Async processing: Handle spikes with queues',
            'Microservices: Scale components independently'
          ]
        },
        {
          topic: 'Reliability Patterns',
          points: [
            'Redundancy: No single point of failure',
            'Replication: Multiple copies of data',
            'Failover: Automatic switching to backup',
            'Circuit breaker: Prevent cascade failures',
            'Graceful degradation: Partial functionality when failing'
          ]
        },
        {
          topic: 'Common Mistakes in Interviews',
          points: [
            'Jumping to solutions without clarifying requirements',
            'Not doing back-of-envelope calculations',
            'Over-engineering for scale you don\'t need',
            'Ignoring trade-offs in design decisions',
            'Not discussing failure scenarios'
          ]
        }
      ]
    },
    {
      id: 'databases',
      title: 'Databases',
      icon: 'database',
      color: '#ef4444',
      questions: 15,
      description: 'SQL vs NoSQL, sharding, replication, and indexing strategies.',
      concepts: ['SQL vs NoSQL tradeoffs', 'ACID properties', 'Sharding strategies', 'Replication', 'Indexes', 'CAP theorem'],
      tips: [
        'SQL for complex queries and transactions',
        'NoSQL for flexible schema and horizontal scaling',
        'Shard by user_id for user-centric applications'
      ],

      introduction: `Database design is the foundation of every system. The choice between SQL and NoSQL, the sharding strategy, and indexing decisions fundamentally shape system capabilities and constraints.

At scale, database choices become critical. Instagram stores 2+ billion photos, Uber processes millions of rides daily, and Facebook handles 4+ petabytes of data per day. Understanding when to use which database and how to scale them is essential for system design interviews.`,

      functionalRequirements: [
        'Store and retrieve data reliably',
        'Support complex queries when needed',
        'Handle concurrent read/write operations',
        'Maintain data consistency',
        'Support transactions for critical operations',
        'Enable efficient data access patterns'
      ],

      nonFunctionalRequirements: [
        'Read latency: < 10ms for cached, < 100ms for disk',
        'Write throughput: 10K-100K writes/second',
        'Availability: 99.99% uptime',
        'Durability: Zero data loss',
        'Scalability: Handle 10x data growth',
        'Recovery: RPO < 1 minute, RTO < 5 minutes'
      ],

      dataModel: {
        description: 'Comparison of database types',
        schema: `SQL (Relational):
  users (id, name, email, created_at)
  orders (id, user_id FK, total, status)
  - Strict schema, ACID transactions
  - JOIN operations, complex queries
  - Examples: PostgreSQL, MySQL, Oracle

NoSQL Document:
  { _id, name, email, orders: [...] }
  - Flexible schema, denormalized
  - No JOINs, embedded documents
  - Examples: MongoDB, CouchDB

NoSQL Key-Value:
  key → value (binary blob)
  - Simplest model, fastest access
  - No queries beyond key lookup
  - Examples: Redis, DynamoDB, Riak

NoSQL Wide-Column:
  row_key → { cf:col → value, ... }
  - Column families, sparse data
  - High write throughput
  - Examples: Cassandra, HBase, BigTable

NoSQL Graph:
  (node)-[relationship]->(node)
  - Optimized for relationships
  - Traversal queries
  - Examples: Neo4j, Amazon Neptune`
      },

      apiDesign: {
        description: 'Common database access patterns',
        endpoints: [
          { method: 'SELECT', path: 'users WHERE id = ?', params: 'id', response: 'Single row (indexed: O(log n))' },
          { method: 'SELECT', path: 'users WHERE email = ?', params: 'email', response: 'Single row (needs index!)' },
          { method: 'SELECT', path: 'orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', params: 'user_id', response: 'Recent orders (composite index)' },
          { method: 'INSERT', path: 'users VALUES (...)', params: 'user data', response: 'New row with id' },
          { method: 'UPDATE', path: 'users SET status = ? WHERE id = ?', params: 'status, id', response: 'Updated row count' }
        ]
      },

      keyQuestions: [
        {
          question: 'When should I use SQL vs NoSQL?',
          answer: `**Use SQL (Relational) when**:
- Need ACID transactions (banking, e-commerce orders)
- Complex queries with JOINs
- Data has clear relationships
- Need strong consistency
- Schema is well-defined

**Use NoSQL when**:
- Need horizontal scaling
- Flexible/evolving schema
- High write throughput
- Simple access patterns (key lookup)
- Geographic distribution

**Common Patterns**:
- User data: SQL (transactions, relationships)
- Session storage: Redis (fast, ephemeral)
- Analytics/logs: Cassandra (high write throughput)
- Product catalog: MongoDB (flexible schema)
- Social graph: Neo4j (relationship queries)

**Polyglot persistence**: Use multiple databases for different needs`
        },
        {
          question: 'How does database sharding work?',
          answer: `**Sharding**: Horizontal partitioning of data across multiple databases

**Sharding Strategies**:

1. **Hash-based sharding**:
   \`shard = hash(user_id) % num_shards\`
   - Even distribution
   - Hard to add/remove shards
   - Use consistent hashing to minimize reshuffling

2. **Range-based sharding**:
   \`shard = user_id / shard_size\`
   - Supports range queries
   - Can have hot spots (new users on one shard)

3. **Directory-based sharding**:
   \`lookup_service.get_shard(user_id)\`
   - Most flexible
   - Lookup adds latency

**Challenges**:
- Cross-shard queries are expensive
- Transactions across shards are complex
- Rebalancing data is difficult
- JOINs don't work across shards

**Best practice**: Shard by the entity you query most (usually user_id)`
        },
        {
          question: 'What is database replication?',
          answer: `**Replication**: Keeping copies of data on multiple machines

**Primary-Replica (Master-Slave)**:
\`\`\`
        Writes
          │
    ┌─────▼─────┐
    │  Primary  │
    └─────┬─────┘
          │ Replication
    ┌─────┴─────┐
    ▼           ▼
┌───────┐  ┌───────┐
│Replica│  │Replica│
└───────┘  └───────┘
   Reads     Reads
\`\`\`

**Sync vs Async replication**:
- Synchronous: Wait for replica ACK (strong consistency, higher latency)
- Asynchronous: Don't wait (eventual consistency, lower latency)

**Multi-Primary (Master-Master)**:
- Write to any node
- Conflict resolution needed
- Used for geographic distribution

**Replication Lag**: Delay between primary write and replica update
- Can cause stale reads
- Solutions: Read-your-writes consistency, causal consistency`
        },
        {
          question: 'How do database indexes work?',
          answer: `**Index**: Data structure for fast lookups (like a book index)

**B-Tree Index** (most common):
- Balanced tree structure
- O(log n) lookups, inserts, deletes
- Good for range queries
- Used by: PostgreSQL, MySQL, most SQL databases

**Hash Index**:
- O(1) exact match lookups
- No range queries
- Used for equality comparisons

**Composite Index**:
\`CREATE INDEX idx ON orders(user_id, created_at)\`
- Leftmost prefix rule: Can use for (user_id) or (user_id, created_at)
- Order matters!

**Trade-offs**:
- Indexes speed up reads
- Indexes slow down writes (must update index)
- Indexes use storage space
- Too many indexes hurt write performance

**Best practices**:
- Index columns in WHERE clauses
- Index foreign keys
- Analyze query patterns before adding indexes
- Use EXPLAIN to verify index usage`
        },
        {
          question: 'Explain ACID properties',
          answer: `**ACID**: Properties that guarantee database transaction reliability

**Atomicity**: All or nothing
- Transaction either fully completes or fully rolls back
- No partial updates

**Consistency**: Valid state to valid state
- Database constraints are maintained
- Foreign keys, unique constraints respected

**Isolation**: Concurrent transactions don't interfere
- Isolation levels (from weakest to strongest):
  - Read Uncommitted: See uncommitted changes
  - Read Committed: Only see committed changes
  - Repeatable Read: Same query returns same results
  - Serializable: Full isolation (slowest)

**Durability**: Committed data survives crashes
- Write-ahead logging (WAL)
- Data written to disk before commit returns

**BASE** (NoSQL alternative):
- Basically Available
- Soft state
- Eventual consistency`
        }
      ],

      basicImplementation: {
        title: 'Single Database Architecture',
        description: 'Traditional setup with one database server',
        svgTemplate: 'singleDatabase',
        problems: [
          'No failover capability',
          'Read contention at scale',
          'Limited storage capacity',
          'Backup impacts performance'
        ]
      },

      advancedImplementation: {
        title: 'Sharded Database Architecture',
        description: 'Distributed database with data partitioned across multiple shards, each with its own replicas for high availability.',
        svgTemplate: 'shardedDatabase',
        keyPoints: [
          'Consistent hashing minimizes data movement when adding shards',
          'Each shard has its own replicas for read scaling',
          'Shard key choice is critical - usually user_id',
          'Avoid cross-shard transactions when possible',
          'Monitor shard sizes and rebalance proactively'
        ]
      },

      discussionPoints: [
        {
          topic: 'SQL vs NoSQL Trade-offs',
          points: [
            'SQL: Strong consistency, complex queries, harder to scale',
            'NoSQL: Horizontal scaling, flexible schema, eventual consistency',
            'Most systems use both (polyglot persistence)',
            'Start with SQL unless you have specific NoSQL requirements'
          ]
        },
        {
          topic: 'Scaling Strategies',
          points: [
            'Read replicas: Scale reads without sharding',
            'Connection pooling: Reduce connection overhead',
            'Query optimization: Fix slow queries before scaling',
            'Caching: Reduce database load by 80-90%',
            'Sharding: Last resort for write scaling'
          ]
        },
        {
          topic: 'Common Database Choices',
          points: [
            'PostgreSQL: Default choice for most applications',
            'MySQL: High read throughput, good replication',
            'MongoDB: Flexible schema, horizontal scaling',
            'Redis: Caching, session storage, rate limiting',
            'Cassandra: High write throughput, time-series data',
            'DynamoDB: Managed NoSQL, serverless friendly'
          ]
        }
      ]
    },
    {
      id: 'caching',
      title: 'Caching',
      icon: 'zap',
      color: '#f59e0b',
      questions: 10,
      description: 'Redis, Memcached, and cache invalidation strategies.',
      concepts: ['Cache-aside', 'Write-through', 'Write-behind', 'TTL', 'LRU eviction', 'Cache stampede'],
      tips: [
        'Cache frequently accessed, rarely changing data',
        'Consider cache invalidation carefully',
        'Use Redis for complex data structures, Memcached for simple key-value'
      ],

      introduction: `Caching is one of the most impactful performance optimizations. A well-designed cache can reduce latency from 100ms to 1ms and cut database load by 90%.

"There are only two hard things in Computer Science: cache invalidation and naming things." - Phil Karlton. This quote captures why caching, while powerful, requires careful thought about consistency and invalidation.`,

      functionalRequirements: [
        'Store frequently accessed data for fast retrieval',
        'Reduce load on backend databases',
        'Support multiple data types (strings, lists, hashes)',
        'Handle cache misses gracefully',
        'Support cache invalidation mechanisms',
        'Enable cache warm-up strategies'
      ],

      nonFunctionalRequirements: [
        'Read latency: < 1ms (in-memory)',
        'Throughput: 100K+ operations/second per node',
        'Hit rate: > 90% for effective caching',
        'Availability: 99.99%',
        'Memory efficiency: Optimal storage of hot data',
        'Eviction: Graceful handling when cache is full'
      ],

      dataModel: {
        description: 'Common caching patterns and data structures',
        schema: `Cache Key Patterns:
  user:{userId}:profile → user profile JSON
  product:{productId} → product details
  feed:{userId}:page:{page} → paginated feed
  session:{sessionId} → session data
  rate_limit:{userId}:{endpoint} → request count

Redis Data Structures:
  STRING: Simple key-value (user profile)
  HASH: Object with fields (user with multiple attributes)
  LIST: Ordered list (activity feed, recent items)
  SET: Unique items (followers, tags)
  SORTED SET: Ranked items (leaderboard, timeline)
  HYPERLOGLOG: Cardinality estimation (unique visitors)

TTL Strategies:
  Short (1-5 min): Rate limits, session tokens
  Medium (5-60 min): API responses, user profiles
  Long (1-24 hrs): Static data, computed results
  No TTL: Reference data (countries, categories)`
      },

      apiDesign: {
        description: 'Common caching operations',
        endpoints: [
          { method: 'GET', path: 'cache.get(key)', params: 'key', response: 'Cached value or null' },
          { method: 'SET', path: 'cache.set(key, value, ttl)', params: 'key, value, ttl', response: 'OK' },
          { method: 'DEL', path: 'cache.delete(key)', params: 'key', response: 'Deleted count' },
          { method: 'MGET', path: 'cache.mget([keys])', params: 'array of keys', response: 'Array of values' },
          { method: 'INCR', path: 'cache.incr(key)', params: 'key', response: 'New value (atomic)' }
        ]
      },

      keyQuestions: [
        {
          question: 'What are the main caching strategies?',
          answer: `**Cache-Aside (Lazy Loading)** - Most common
\`\`\`
Read:
1. Check cache
2. If miss, read from DB
3. Store in cache
4. Return data

Write:
1. Write to DB
2. Invalidate cache (or let it expire)
\`\`\`
- Pros: Only caches data that's requested
- Cons: Cache miss = slow request, stale data possible

**Write-Through**
\`\`\`
Write:
1. Write to cache
2. Cache writes to DB (synchronous)
\`\`\`
- Pros: Cache always consistent with DB
- Cons: Write latency increased

**Write-Behind (Write-Back)**
\`\`\`
Write:
1. Write to cache
2. Cache writes to DB (async, batched)
\`\`\`
- Pros: Fast writes, batching efficiency
- Cons: Data loss risk if cache fails

**Read-Through**
\`\`\`
Read:
1. Check cache
2. Cache fetches from DB on miss
3. Cache returns data
\`\`\`
- Pros: Simplified app logic
- Cons: Cache needs DB access`
        },
        {
          question: 'How do you handle cache invalidation?',
          answer: `**Cache Invalidation Strategies**:

1. **TTL-based expiration**:
   - Set expiry time on all cached items
   - Simple but may serve stale data until TTL

2. **Event-driven invalidation**:
   - Delete cache when data changes
   - Requires knowing all affected cache keys
   \`\`\`
   on_user_update(user_id):
     cache.delete(f"user:{user_id}")
     cache.delete(f"feed:{user_id}")
   \`\`\`

3. **Version-based invalidation**:
   - Include version in cache key
   - Increment version to invalidate
   \`user:{userId}:v{version}\`

4. **Tag-based invalidation**:
   - Tag related cache entries
   - Delete all entries with a tag
   \`\`\`
   cache.set("product:123", data, tags=["catalog"])
   cache.delete_by_tag("catalog")  # Clear all catalog
   \`\`\`

**Best practice**: Combine TTL (safety net) with event-driven (freshness)`
        },
        {
          question: 'What is cache stampede and how to prevent it?',
          answer: `**Cache Stampede (Thundering Herd)**:
Many requests hit database simultaneously when:
- Popular cached item expires
- Cache server restarts
- Cold cache on deployment

\`\`\`
                     Cache Miss!
Request 1 ───┐
Request 2 ───┼───▶ Database ◀─── OVERLOADED!
Request 3 ───┤
   ...       │
Request 100 ─┘
\`\`\`

**Prevention Strategies**:

1. **Locking (Mutex)**:
   - First request acquires lock and fetches
   - Others wait or return stale data
   \`\`\`python
   if not cache.get(key):
     if cache.acquire_lock(key):
       data = db.fetch()
       cache.set(key, data)
       cache.release_lock(key)
     else:
       wait_or_return_stale()
   \`\`\`

2. **Early expiration (Probabilistic)**:
   - Refresh before actual expiry
   - Random refresh within window
   \`ttl_remaining < random(0, buffer_time)\`

3. **Background refresh**:
   - Async worker refreshes before expiry
   - Never serve miss, always return (possibly stale) data

4. **Request coalescing**:
   - Multiple requests for same key share one DB call`
        },
        {
          question: 'Redis vs Memcached - when to use each?',
          answer: `**Redis** - Feature-rich:
- Data structures: Strings, lists, sets, hashes, sorted sets
- Persistence: RDB snapshots, AOF logs
- Replication: Primary-replica, Redis Cluster
- Pub/Sub: Real-time messaging
- Lua scripting: Atomic operations
- Use for: Sessions, leaderboards, rate limiting, pub/sub

**Memcached** - Simple and fast:
- Only strings (key-value)
- No persistence (pure cache)
- Multi-threaded (better multi-core usage)
- Simpler protocol (slightly lower latency)
- Use for: Simple caching, when you need only strings

**Decision Matrix**:
| Feature | Redis | Memcached |
|---------|-------|-----------|
| Data types | Many | Strings only |
| Persistence | Yes | No |
| Replication | Yes | No |
| Clustering | Yes | Client-side |
| Memory efficiency | Good | Better |
| Multi-threaded | No* | Yes |

*Redis 6+ has I/O threading

**Recommendation**: Default to Redis unless you need Memcached's specific advantages`
        },
        {
          question: 'How do you design a distributed cache?',
          answer: `**Distributed Caching Architecture**:

\`\`\`
           ┌──────────────────────────────────────────┐
           │            Cache Cluster                 │
           │  ┌────────┐  ┌────────┐  ┌────────┐     │
           │  │ Node 1 │  │ Node 2 │  │ Node 3 │     │
           │  │ Keys   │  │ Keys   │  │ Keys   │     │
           │  │ A-F    │  │ G-M    │  │ N-Z    │     │
           │  └────────┘  └────────┘  └────────┘     │
           └──────────────────────────────────────────┘
                          ▲
                          │ Consistent Hashing
                          │
           ┌──────────────────────────────────────────┐
           │            App Servers                   │
           │  ┌────────┐  ┌────────┐  ┌────────┐     │
           │  │Server 1│  │Server 2│  │Server 3│     │
           │  └────────┘  └────────┘  └────────┘     │
           └──────────────────────────────────────────┘
\`\`\`

**Key Components**:

1. **Consistent hashing**: Distribute keys across nodes
   - Add/remove nodes affects minimal keys
   - Virtual nodes for better distribution

2. **Replication**: Each key on 2+ nodes
   - Read from any replica
   - Write to primary, replicate async

3. **Client-side routing**: App knows which node has key
   - No proxy latency
   - Requires cluster-aware client

4. **Failure handling**:
   - Health checks detect failed nodes
   - Traffic redirected to replicas
   - Auto-recovery when node returns`
        }
      ],

      basicImplementation: {
        title: 'Simple Application Cache',
        description: 'Single Redis instance for caching with cache-aside pattern',
        svgTemplate: 'simpleCache',
        problems: [
          'Single point of failure',
          'Limited memory capacity',
          'No automatic failover',
          'Cache stampede risk'
        ]
      },

      advancedImplementation: {
        title: 'Multi-Tier Caching Architecture',
        description: 'CDN for edge caching → L1 in-process cache → L2 Redis cluster → Database, with each tier providing faster access than the next.',
        svgTemplate: 'multiTierCache',
        keyPoints: [
          'Multi-tier reduces load on each subsequent tier',
          'L1 cache prevents network round-trip for hot data',
          'Redis Cluster provides horizontal scaling and HA',
          'CDN offloads static content globally',
          'Each tier has appropriate TTL and invalidation'
        ]
      },

      discussionPoints: [
        {
          topic: 'Cache Hit Rate Optimization',
          points: [
            'Monitor hit rate - aim for >90%',
            'Increase TTL for stable data',
            'Pre-warm cache on deployment',
            'Use appropriate key granularity',
            'Consider cache-aside vs read-through based on patterns'
          ]
        },
        {
          topic: 'Memory Management',
          points: [
            'Set maxmemory in Redis',
            'Choose eviction policy: LRU, LFU, random',
            'Monitor memory usage and eviction rate',
            'Compress large values',
            'Use appropriate data structures (HASH vs STRING)'
          ]
        },
        {
          topic: 'Consistency Trade-offs',
          points: [
            'TTL provides eventual consistency guarantee',
            'Event-driven invalidation for stronger consistency',
            'Accept stale data for read-heavy, tolerance systems',
            'Use write-through for critical data',
            'Consider read-your-writes consistency'
          ]
        }
      ]
    },
    {
      id: 'message-queues',
      title: 'Message Queues',
      icon: 'inbox',
      color: '#ec4899',
      questions: 7,
      description: 'Async processing with Kafka, RabbitMQ, SQS.',
      concepts: ['Pub/Sub', 'Point-to-point', 'At-least-once delivery', 'Exactly-once semantics', 'Dead letter queues'],
      tips: [
        'Use queues to decouple services and handle traffic spikes',
        'Kafka for high-throughput event streaming',
        'SQS for simple async task processing'
      ],

      introduction: `Message queues enable asynchronous communication between services, decoupling producers from consumers. They're essential for building scalable, resilient distributed systems.

LinkedIn processes 7+ trillion messages per day through Kafka. Netflix uses queues to handle 200+ billion events daily. Understanding when and how to use message queues is critical for system design.`,

      functionalRequirements: [
        'Send messages from producers to consumers',
        'Support multiple messaging patterns (point-to-point, pub/sub)',
        'Handle message ordering when required',
        'Support message acknowledgment',
        'Enable message filtering and routing',
        'Dead letter queue for failed messages'
      ],

      nonFunctionalRequirements: [
        'Throughput: 100K-1M+ messages/second',
        'Latency: Single-digit milliseconds',
        'Durability: No message loss',
        'Availability: 99.99%',
        'Ordering: Maintain order within partition/queue',
        'Scalability: Horizontal scaling of consumers'
      ],

      dataModel: {
        description: 'Message structure and queue concepts',
        schema: `Message Structure:
{
  id: uuid,
  topic/queue: string,
  key: string (for partitioning),
  value: bytes (payload),
  headers: map (metadata),
  timestamp: datetime,
  partition: int (Kafka),
  offset: long (Kafka)
}

Kafka Concepts:
  Topic → Multiple Partitions
  Partition → Ordered sequence of messages
  Consumer Group → Consumers sharing load
  Offset → Position in partition

Queue Concepts (RabbitMQ/SQS):
  Queue: FIFO message storage
  Exchange: Routes messages to queues
  Binding: Rules for routing
  Visibility timeout: Lock while processing`
      },

      apiDesign: {
        description: 'Common messaging operations',
        endpoints: [
          { method: 'PRODUCE', path: 'topic.send(key, message)', params: 'key, payload', response: 'ack with offset' },
          { method: 'CONSUME', path: 'consumer.poll()', params: 'timeout', response: 'batch of messages' },
          { method: 'ACK', path: 'consumer.commit(offset)', params: 'offset', response: 'confirmed' },
          { method: 'SUBSCRIBE', path: 'consumer.subscribe(topics)', params: 'topic list', response: 'subscribed' },
          { method: 'SEEK', path: 'consumer.seek(offset)', params: 'partition, offset', response: 'position set' }
        ]
      },

      keyQuestions: [
        {
          question: 'What are the main messaging patterns?',
          answer: `**Point-to-Point (Queue)**:
\`\`\`
Producer ───▶ Queue ───▶ Consumer
                    ───▶ Consumer (only one gets each message)
\`\`\`
- Each message processed by exactly one consumer
- Use for: Task queues, work distribution
- Examples: SQS, RabbitMQ queues

**Publish-Subscribe (Fan-out)**:
\`\`\`
              ┌───▶ Subscriber A (gets all messages)
Producer ───▶ Topic
              └───▶ Subscriber B (gets all messages)
\`\`\`
- Each message delivered to all subscribers
- Use for: Event broadcasting, notifications
- Examples: Kafka topics, SNS, RabbitMQ exchanges

**Consumer Groups (Kafka)**:
\`\`\`
              ┌───▶ Consumer 1 ─┐
Producer ───▶ Topic               Group A (shares load)
              └───▶ Consumer 2 ─┘
\`\`\`
- Combines both: pub/sub between groups, queue within group
- Each partition assigned to one consumer in group`
        },
        {
          question: 'What delivery guarantees exist?',
          answer: `**At-Most-Once**:
- Send and forget
- Message may be lost
- Fastest, simplest
- Use for: Metrics, logs (loss acceptable)

**At-Least-Once** (most common):
- Retry until acknowledged
- Message may be delivered multiple times
- Consumer must be idempotent
- Use for: Most applications
\`\`\`
Producer: Send → wait for ACK → retry if no ACK
Consumer: Receive → process → ACK
\`\`\`

**Exactly-Once** (hardest):
- Each message processed exactly once
- Requires distributed transactions or idempotency
- Kafka supports via transactions + idempotent producer
- Use for: Financial transactions, inventory

**Idempotency** - Key to at-least-once:
\`\`\`python
# Bad: Duplicate message = double charge
def process_payment(msg):
    charge_card(msg.amount)

# Good: Use unique ID to deduplicate
def process_payment(msg):
    if not already_processed(msg.id):
        charge_card(msg.amount)
        mark_processed(msg.id)
\`\`\``
        },
        {
          question: 'Kafka vs RabbitMQ vs SQS - when to use each?',
          answer: `**Apache Kafka**:
- Log-based, append-only storage
- Very high throughput (millions/sec)
- Message retention (replay old messages)
- Ordering within partition
- Complex consumer groups
- Use for: Event streaming, logs, analytics, high throughput

**RabbitMQ**:
- Traditional message broker
- Flexible routing (exchanges, bindings)
- Message acknowledgment
- Priority queues
- Lower latency for small messages
- Use for: Task queues, complex routing, RPC

**Amazon SQS**:
- Fully managed, serverless
- Unlimited throughput (standard queues)
- FIFO queues for ordering
- No operational overhead
- Pay per request
- Use for: AWS workloads, simple queues, serverless

**Decision Matrix**:
| Need | Choose |
|------|--------|
| Event streaming | Kafka |
| Task queue | RabbitMQ or SQS |
| Complex routing | RabbitMQ |
| Managed service | SQS or Kafka (MSK) |
| Message replay | Kafka |
| Low ops overhead | SQS |`
        },
        {
          question: 'How do you handle message ordering?',
          answer: `**The Problem**:
- Distributed systems process messages in parallel
- Parallel = no global order
- But some operations need order (bank transactions)

**Solutions**:

1. **Partition by key** (Kafka):
   \`\`\`
   Messages with same key → same partition → same order

   User 123's events → Partition 5 → Order preserved
   User 456's events → Partition 8 → Order preserved
   \`\`\`

2. **Single consumer**:
   - Only one consumer per queue
   - Simple but limits throughput

3. **FIFO queues** (SQS FIFO):
   - Message groups for ordering
   - Exactly-once processing
   - Lower throughput (300 msg/sec)

4. **Sequence numbers**:
   - Include sequence in message
   - Consumer reorders if needed
   - Buffer out-of-order messages

**Best practice**: Partition by entity (user_id, order_id) to maintain ordering per entity while enabling parallelism`
        },
        {
          question: 'How do you handle failed messages?',
          answer: `**Dead Letter Queue (DLQ)**:
Messages that fail repeatedly go to separate queue for investigation.

\`\`\`
┌──────────┐    ┌───────────┐    ┌──────────┐
│ Producer │───▶│   Queue   │───▶│ Consumer │
└──────────┘    └─────┬─────┘    └────┬─────┘
                      │               │
                      │    Failed     │
                      │  (3 retries)  │
                      ▼               │
                ┌───────────┐         │
                │    DLQ    │◀────────┘
                └───────────┘
                      │
                      ▼
                ┌───────────┐
                │  Alerting │
                │  & Debug  │
                └───────────┘
\`\`\`

**Retry Strategies**:

1. **Immediate retry**: Retry N times immediately
2. **Exponential backoff**: Wait 1s, 2s, 4s, 8s...
3. **Scheduled retry**: Wait fixed interval between retries

**Error Categories**:
- Transient: Retry (network timeout, temporary failure)
- Permanent: Send to DLQ (invalid data, business rule violation)
- Poison message: Message that always fails

**DLQ Processing**:
- Alert on DLQ messages
- Manual investigation
- Fix and replay
- Or discard with logging`
        }
      ],

      basicImplementation: {
        title: 'Simple Message Queue',
        description: 'Single broker for async processing - Producer sends to queue, consumer processes asynchronously.',
        svgTemplate: 'simpleQueue',
        problems: [
          'Single point of failure',
          'Limited throughput',
          'No message replay',
          'Manual scaling'
        ]
      },

      advancedImplementation: {
        title: 'Distributed Event Streaming',
        description: 'Kafka cluster with multiple producers, partitioned topics, and consumer groups for horizontal scaling.',
        svgTemplate: 'distributedQueue',
        keyPoints: [
          'Partitions enable parallel processing',
          'Replication factor of 3 for fault tolerance',
          'Each consumer group gets all messages',
          'Within group, partitions distributed to consumers',
          'ZooKeeper (or KRaft) for coordination'
        ]
      },

      discussionPoints: [
        {
          topic: 'Choosing the Right Tool',
          points: [
            'Kafka: High throughput, event streaming, replay needed',
            'RabbitMQ: Complex routing, lower latency, traditional queuing',
            'SQS: Managed service, simple queues, AWS integration',
            'Redis Streams: Simple streaming, already using Redis',
            'Consider operational complexity vs features'
          ]
        },
        {
          topic: 'Common Patterns',
          points: [
            'Event sourcing: Store events, derive state',
            'CQRS: Separate read and write models via events',
            'Saga pattern: Distributed transactions via messages',
            'Outbox pattern: Reliable publishing with transactions',
            'Competing consumers: Scale processing horizontally'
          ]
        },
        {
          topic: 'Operational Considerations',
          points: [
            'Monitor consumer lag (falling behind)',
            'Set appropriate retention periods',
            'Plan for partition rebalancing',
            'Handle schema evolution (Avro, Protobuf)',
            'Test failure scenarios (broker down, network partition)'
          ]
        }
      ]
    },
    {
      id: 'api-design',
      title: 'API Design',
      icon: 'code',
      color: '#6366f1',
      questions: 8,
      description: 'REST, GraphQL, gRPC, and API best practices.',
      concepts: ['REST principles', 'GraphQL vs REST', 'gRPC for microservices', 'API versioning', 'Rate limiting', 'Pagination'],
      tips: [
        'Use REST for public APIs, gRPC for internal microservices',
        'GraphQL when clients need flexible queries',
        'Always version your APIs (v1, v2) in the URL or header'
      ],

      introduction: `API design is how services communicate. A well-designed API is intuitive, consistent, and scales with your product. A poorly designed API creates technical debt that's painful to fix.

Stripe and Twilio are famous for excellent API design—developers love using them. Understanding REST, GraphQL, and gRPC, and when to use each, is fundamental to system design interviews.`,

      functionalRequirements: [
        'Support CRUD operations on resources',
        'Enable filtering, sorting, and pagination',
        'Handle authentication and authorization',
        'Support versioning for backward compatibility',
        'Provide clear error messages',
        'Enable rate limiting per client'
      ],

      nonFunctionalRequirements: [
        'Latency: < 100ms p95 for simple queries',
        'Throughput: 10K+ requests/second',
        'Availability: 99.99%',
        'Consistency: Predictable behavior',
        'Discoverability: Self-documenting',
        'Backward compatibility: No breaking changes'
      ],

      dataModel: {
        description: 'Comparison of API paradigms',
        schema: `REST (Resource-oriented):
  GET /users/123          → Read user
  POST /users             → Create user
  PUT /users/123          → Update user (full)
  PATCH /users/123        → Update user (partial)
  DELETE /users/123       → Delete user
  GET /users/123/orders   → User's orders

GraphQL (Query-oriented):
  query {
    user(id: "123") {
      name
      email
      orders(first: 10) {
        id, total, status
      }
    }
  }

gRPC (Method-oriented):
  service UserService {
    rpc GetUser(GetUserRequest) returns (User);
    rpc CreateUser(CreateUserRequest) returns (User);
    rpc ListOrders(ListOrdersRequest) returns (stream Order);
  }`
      },

      apiDesign: {
        description: 'RESTful API design patterns',
        endpoints: [
          { method: 'GET', path: '/api/v1/users', params: 'limit, offset, sort, filter', response: '{ data: [...], pagination: {...} }' },
          { method: 'GET', path: '/api/v1/users/:id', params: '-', response: '{ data: user }' },
          { method: 'POST', path: '/api/v1/users', params: '{ name, email, ... }', response: '201 { data: user }' },
          { method: 'PUT', path: '/api/v1/users/:id', params: 'full user object', response: '{ data: user }' },
          { method: 'PATCH', path: '/api/v1/users/:id', params: 'partial updates', response: '{ data: user }' },
          { method: 'DELETE', path: '/api/v1/users/:id', params: '-', response: '204 No Content' }
        ]
      },

      keyQuestions: [
        {
          question: 'REST vs GraphQL vs gRPC - when to use each?',
          answer: `**REST**:
- Resource-oriented (nouns, not verbs)
- HTTP verbs for operations (GET, POST, PUT, DELETE)
- Stateless, cacheable
- Best for: Public APIs, simple CRUD, browser clients

**GraphQL**:
- Query language for APIs
- Client specifies exactly what data it needs
- Single endpoint, flexible queries
- Best for: Mobile apps (bandwidth), complex data requirements, multiple clients with different needs

**gRPC**:
- Remote Procedure Call using Protocol Buffers
- Binary format (smaller, faster)
- Strong typing, code generation
- Bidirectional streaming
- Best for: Microservices communication, high-performance internal APIs

**Decision Matrix**:
| Scenario | Choice |
|----------|--------|
| Public API | REST (most familiar) |
| Mobile app | GraphQL (reduce over-fetching) |
| Microservices | gRPC (performance) |
| Real-time | gRPC streaming or WebSocket |
| Browser SPA | REST or GraphQL |
| Third-party integrations | REST (universal support) |`
        },
        {
          question: 'How do you handle API versioning?',
          answer: `**URL Versioning** (most common):
\`\`\`
GET /api/v1/users
GET /api/v2/users
\`\`\`
- Pros: Clear, cacheable, easy to test
- Cons: URL pollution, maintaining multiple versions

**Header Versioning**:
\`\`\`
GET /api/users
Accept: application/vnd.api+json;version=1
\`\`\`
- Pros: Clean URLs
- Cons: Hidden, harder to test

**Query Parameter**:
\`\`\`
GET /api/users?version=1
\`\`\`
- Pros: Simple
- Cons: Less RESTful, caching issues

**Best Practices**:
- Start with v1 (never v0)
- Support at least N-1 versions
- Deprecation timeline: 6-12 months notice
- Breaking changes = new version:
  - Removing fields
  - Changing field types
  - Changing semantics
- Non-breaking (add to existing version):
  - Adding optional fields
  - Adding new endpoints`
        },
        {
          question: 'How do you implement pagination?',
          answer: `**Offset-based Pagination**:
\`\`\`
GET /users?limit=20&offset=40  (page 3)

Response:
{
  "data": [...],
  "pagination": {
    "total": 1000,
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
\`\`\`
- Pros: Jump to any page, simple
- Cons: Inconsistent if data changes, slow for large offsets

**Cursor-based Pagination** (recommended):
\`\`\`
GET /users?limit=20&cursor=abc123

Response:
{
  "data": [...],
  "pagination": {
    "nextCursor": "xyz789",
    "hasMore": true
  }
}
\`\`\`
- Cursor = encoded position (e.g., last seen ID)
- Pros: Consistent, efficient (no OFFSET)
- Cons: Can't jump to page N

**Keyset Pagination** (variant of cursor):
\`\`\`sql
WHERE created_at < '2024-01-01' AND id < 12345
ORDER BY created_at DESC, id DESC
LIMIT 20
\`\`\`

**Best practice**: Use cursor-based for infinite scroll, offset for admin dashboards`
        },
        {
          question: 'How do you design error responses?',
          answer: `**Consistent Error Format**:
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "requestId": "req_abc123",
    "documentation": "https://api.example.com/docs/errors#VALIDATION_ERROR"
  }
}
\`\`\`

**HTTP Status Codes**:
- 200 OK: Success
- 201 Created: Resource created
- 204 No Content: Success, no body (DELETE)
- 400 Bad Request: Client error (validation)
- 401 Unauthorized: Missing/invalid auth
- 403 Forbidden: Authenticated but not allowed
- 404 Not Found: Resource doesn't exist
- 409 Conflict: Conflict with current state
- 422 Unprocessable: Semantic errors
- 429 Too Many Requests: Rate limited
- 500 Internal Server Error: Server bug
- 503 Service Unavailable: Overloaded/maintenance

**Best Practices**:
- Always include request ID for debugging
- Use machine-readable error codes
- Provide human-readable messages
- Link to documentation
- Don't expose internal errors to clients`
        },
        {
          question: 'How do you handle authentication in APIs?',
          answer: `**API Keys** (simplest):
\`\`\`
GET /api/users
X-API-Key: sk_live_abc123
\`\`\`
- Pros: Simple, good for server-to-server
- Cons: No user context, hard to rotate

**JWT (JSON Web Tokens)**:
\`\`\`
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

JWT Payload:
{
  "sub": "user_123",
  "exp": 1700000000,
  "roles": ["user", "admin"]
}
\`\`\`
- Pros: Stateless, contains user info
- Cons: Can't revoke until expiry

**OAuth 2.0** (for third-party access):
\`\`\`
1. User authorizes app
2. App receives authorization code
3. App exchanges code for access token
4. App uses access token for API calls
\`\`\`
- Pros: Delegated access, scopes
- Cons: Complex implementation

**Best Practices**:
- Use HTTPS always
- Short-lived tokens (15 min) + refresh tokens
- Include scopes/permissions in token
- Validate on every request
- Rate limit by API key/user`
        }
      ],

      basicImplementation: {
        title: 'Simple REST API',
        description: 'Client → REST API with CRUD operations (GET, POST, PUT, DELETE)',
        svgTemplate: 'restApi',
        problems: [
          'Over-fetching: Getting more data than needed',
          'Under-fetching: Multiple requests for related data',
          'No type safety',
          'Documentation can drift from implementation'
        ]
      },

      advancedImplementation: {
        title: 'API Gateway Architecture',
        description: 'API Gateway handling auth, rate limiting, SSL, and routing to internal gRPC microservices',
        svgTemplate: 'apiGateway',
        keyPoints: [
          'Gateway handles auth, rate limiting, logging',
          'Internal services use gRPC for performance',
          'External clients use REST for familiarity',
          'Gateway can aggregate multiple service calls',
          'Versioning handled at gateway level'
        ]
      },

      discussionPoints: [
        {
          topic: 'RESTful Best Practices',
          points: [
            'Use nouns for resources, not verbs (/users not /getUsers)',
            'Use HTTP methods correctly (GET safe, POST creates)',
            'Use plural nouns (/users not /user)',
            'Nest resources appropriately (/users/123/orders)',
            'Use query params for filtering, not path params'
          ]
        },
        {
          topic: 'API Security',
          points: [
            'Always use HTTPS',
            'Validate all input (never trust client)',
            'Implement rate limiting',
            'Use short-lived tokens',
            'Audit log sensitive operations',
            'Don\'t expose internal errors'
          ]
        },
        {
          topic: 'Documentation',
          points: [
            'OpenAPI/Swagger for REST APIs',
            'Generate docs from code (stays in sync)',
            'Include examples for every endpoint',
            'Document error responses',
            'Provide SDKs for popular languages'
          ]
        }
      ]
    },
    {
      id: 'load-balancing',
      title: 'Load Balancing',
      icon: 'share',
      color: '#14b8a6',
      questions: 6,
      description: 'Distribute traffic across servers effectively.',
      concepts: ['Round Robin', 'Least Connections', 'IP Hash', 'Layer 4 vs Layer 7', 'Health checks', 'Session affinity'],
      tips: [
        'Layer 7 (application) for content-based routing',
        'Layer 4 (transport) for raw performance',
        'Use health checks to remove unhealthy servers'
      ],

      introduction: `Load balancing distributes incoming traffic across multiple servers to ensure no single server becomes overwhelmed. It's the foundation of horizontal scaling and high availability.

Every major website uses load balancing. Google handles billions of requests by distributing them across thousands of servers. Understanding load balancing algorithms and configurations is essential for building scalable systems.`,

      functionalRequirements: [
        'Distribute traffic across healthy servers',
        'Support multiple distribution algorithms',
        'Detect and remove unhealthy servers',
        'Handle SSL/TLS termination',
        'Support session persistence when needed',
        'Enable zero-downtime deployments'
      ],

      nonFunctionalRequirements: [
        'Latency: < 1ms added overhead',
        'Throughput: Millions of connections/second',
        'Availability: 99.999% (no single point of failure)',
        'Failover: Automatic in < 5 seconds',
        'Scalability: Handle 10x traffic spikes',
        'Health checks: Detect failures within seconds'
      ],

      dataModel: {
        description: 'Load balancer configuration concepts',
        schema: `Load Balancer Configuration:
{
  frontend: {
    bind: "0.0.0.0:443",
    protocol: "HTTPS",
    ssl_certificate: "/path/to/cert.pem"
  },
  backend: {
    name: "app_servers",
    algorithm: "round_robin",
    servers: [
      { address: "10.0.0.1:8080", weight: 1 },
      { address: "10.0.0.2:8080", weight: 2 },
      { address: "10.0.0.3:8080", weight: 1 }
    ],
    health_check: {
      path: "/health",
      interval: "5s",
      timeout: "2s",
      unhealthy_threshold: 3
    }
  }
}

Server Pool State:
  server_1: { status: "healthy", connections: 45 }
  server_2: { status: "healthy", connections: 32 }
  server_3: { status: "unhealthy", last_check: "2024-01-01T12:00:00Z" }`
      },

      apiDesign: {
        description: 'Common load balancer operations',
        endpoints: [
          { method: 'GET', path: '/health', params: '-', response: '200 OK (health check endpoint)' },
          { method: 'GET', path: '/api/lb/status', params: '-', response: 'Server pool health status' },
          { method: 'POST', path: '/api/lb/servers', params: 'server address', response: 'Add server to pool' },
          { method: 'DELETE', path: '/api/lb/servers/:id', params: '-', response: 'Remove server from pool' },
          { method: 'PUT', path: '/api/lb/servers/:id/drain', params: '-', response: 'Drain connections before removal' }
        ]
      },

      keyQuestions: [
        {
          question: 'What are the main load balancing algorithms?',
          answer: `**Round Robin**:
- Rotate through servers in order
- Simple and fair
- Best when servers are equal capacity
- Problem: Ignores server load/capacity

**Weighted Round Robin**:
- Assign weights to servers (server1: 3, server2: 1)
- Faster servers get more requests
- Good for heterogeneous hardware

**Least Connections**:
- Route to server with fewest active connections
- Better for varying request times
- Best for long-lived connections (WebSocket)

**Least Response Time**:
- Consider both connections and response time
- Route to fastest responding server
- Requires continuous monitoring

**IP Hash**:
- Hash client IP to determine server
- Same client always goes to same server
- Natural session affinity
- Problem: Uneven distribution possible

**Consistent Hashing**:
- Hash both servers and requests to ring
- Minimal redistribution when servers change
- Used by CDNs, distributed caches

**Random**:
- Simple, surprisingly effective
- No state to maintain
- Good enough for many use cases`
        },
        {
          question: 'What is the difference between Layer 4 and Layer 7 load balancing?',
          answer: `**Layer 4 (Transport Layer)**:
\`\`\`
Client ──TCP/UDP──▶ Load Balancer ──TCP/UDP──▶ Server

Makes decision based on:
- Source/destination IP
- Source/destination port
- Protocol (TCP/UDP)
\`\`\`
- Faster: Just forwards packets
- Simpler: No application awareness
- Can't route based on content
- Examples: AWS NLB, HAProxy TCP mode

**Layer 7 (Application Layer)**:
\`\`\`
Client ──HTTP──▶ Load Balancer ──HTTP──▶ Server

Makes decision based on:
- URL path (/api vs /static)
- HTTP headers (Host, User-Agent)
- Cookies
- Request content
\`\`\`
- Content-based routing: /api → API servers
- SSL termination: Decrypt at LB
- Header manipulation: Add X-Forwarded-For
- Caching: Cache responses
- Examples: AWS ALB, NGINX, HAProxy HTTP mode

**When to use each**:
| Use Case | Layer |
|----------|-------|
| Simple TCP pass-through | L4 |
| High-performance | L4 |
| Content-based routing | L7 |
| SSL termination | L7 |
| Header inspection | L7 |
| WebSocket | Either (L7 for routing) |`
        },
        {
          question: 'How do health checks work?',
          answer: `**Active Health Checks**:
Load balancer periodically probes servers.

\`\`\`
Load Balancer                    Server
     │                              │
     │──GET /health────────────────▶│
     │◀─────────────200 OK──────────│
     │                              │
     │──GET /health────────────────▶│
     │◀─────────────500 Error───────│
     │                              │
     │ (Mark unhealthy after 3 fails)
     │──GET /health────────────────▶│
     │◀─────────────200 OK──────────│
     │ (Mark healthy after 2 passes)
\`\`\`

**Health Check Parameters**:
- Interval: How often to check (5-30 seconds)
- Timeout: How long to wait for response (2-10 seconds)
- Unhealthy threshold: Failures before marking down (2-5)
- Healthy threshold: Passes before marking up (2-3)

**Types of Health Checks**:
- **TCP**: Can establish connection?
- **HTTP**: Returns 2xx/3xx status?
- **HTTPS**: Valid SSL + HTTP check
- **Custom**: Application-specific logic

**Deep Health Checks**:
\`\`\`python
@app.route('/health')
def health():
    # Check database
    if not db.ping():
        return "DB down", 503

    # Check cache
    if not cache.ping():
        return "Cache down", 503

    # Check dependencies
    if not check_dependencies():
        return "Dependency down", 503

    return "OK", 200
\`\`\`

**Passive Health Checks**:
Monitor real traffic for failures.
- Track error rates per server
- Mark unhealthy if errors exceed threshold
- Faster detection than active checks`
        },
        {
          question: 'How do you handle session persistence (sticky sessions)?',
          answer: `**The Problem**:
- User logs in on Server A
- Next request goes to Server B
- Server B doesn't have session = user logged out!

**Solutions**:

1. **Sticky Sessions (Session Affinity)**:
\`\`\`
Load balancer routes same user to same server

Methods:
- Cookie-based: LB adds cookie with server ID
- IP-based: Hash client IP
- Header-based: Use session ID in header
\`\`\`
- Pros: Simple, works with stateful apps
- Cons: Uneven load, server failure loses sessions

2. **Session Replication**:
\`\`\`
Server A ←──sync──→ Server B
        ←──sync──→ Server C

All servers have all sessions
\`\`\`
- Pros: Any server can handle any request
- Cons: Sync overhead, consistency issues

3. **Centralized Session Store** (recommended):
\`\`\`
Server A ──┐
Server B ──┼──▶ Redis (sessions)
Server C ──┘
\`\`\`
- Pros: Stateless servers, easy scaling
- Cons: Redis dependency, network latency

4. **Stateless Sessions (JWT)**:
\`\`\`
Session data encoded in token
Sent with every request
No server-side storage
\`\`\`
- Pros: Truly stateless, no shared storage
- Cons: Token size, can't revoke easily

**Recommendation**: Use centralized store (Redis) or JWT`
        },
        {
          question: 'How do you achieve high availability for the load balancer itself?',
          answer: `**The Problem**: Load balancer is a single point of failure!

**Solution: Active-Passive (VRRP)**:
\`\`\`
┌─────────────────────────────────────┐
│         Virtual IP: 10.0.0.100      │
│              (Floating)             │
└─────────────────┬───────────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
┌────▼────┐               ┌────▼────┐
│ Active  │  Heartbeat    │ Passive │
│   LB    │◀─────────────▶│   LB    │
│10.0.0.1 │               │10.0.0.2 │
└─────────┘               └─────────┘

- Active handles all traffic
- Passive monitors via heartbeat
- If Active fails, Passive takes VIP
- Failover in < 5 seconds
\`\`\`

**Solution: Active-Active**:
\`\`\`
                DNS Round Robin
┌───────────────────┴───────────────────┐
│                                       │
▼                                       ▼
┌─────────┐                       ┌─────────┐
│   LB 1  │                       │   LB 2  │
│ Active  │                       │ Active  │
└────┬────┘                       └────┬────┘
     │                                 │
     └─────────────┬───────────────────┘
                   ▼
           ┌─────────────┐
           │   Servers   │
           └─────────────┘

- Both LBs handle traffic
- DNS distributes across LBs
- Better utilization
- Requires shared state for sessions
\`\`\`

**Cloud Solutions**:
- AWS: ALB/NLB are inherently HA (multi-AZ)
- GCP: Cloud Load Balancing (global)
- Azure: Load Balancer with availability zones`
        }
      ],

      basicImplementation: {
        title: 'Single Load Balancer',
        description: 'Basic load balancing with NGINX distributing traffic across multiple backend servers using round-robin.',
        svgTemplate: 'loadBalancer',
        problems: [
          'Load balancer is single point of failure',
          'No automatic failover',
          'Manual server management',
          'Limited monitoring'
        ]
      },

      advancedImplementation: {
        title: 'Global Load Balancing Architecture',
        description: 'GeoDNS routing users to nearest region, with regional HA load balancers and server pools',
        svgTemplate: 'globalLoadBalancer',
        keyPoints: [
          'GeoDNS routes users to nearest region',
          'Each region has redundant load balancers',
          'Automatic failover at every tier',
          'Can handle regional outages gracefully',
          'Central monitoring for all regions'
        ]
      },

      discussionPoints: [
        {
          topic: 'Algorithm Selection',
          points: [
            'Round Robin: Default for equal servers',
            'Least Connections: Long-running requests',
            'IP Hash: Need session affinity without cookies',
            'Weighted: Mixed server capacities',
            'Random: Simple, often good enough'
          ]
        },
        {
          topic: 'Common Load Balancer Options',
          points: [
            'NGINX: Versatile, widely used, good performance',
            'HAProxy: High performance, feature-rich',
            'AWS ALB/NLB: Managed, integrates with AWS',
            'Envoy: Modern, observability-focused',
            'Traefik: Container-native, auto-discovery'
          ]
        },
        {
          topic: 'Production Considerations',
          points: [
            'Connection draining before removing servers',
            'Graceful degradation under load',
            'SSL certificate management',
            'Logging and metrics collection',
            'Rate limiting at the load balancer'
          ]
        }
      ]
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting',
      icon: 'shield',
      color: '#f43f5e',
      questions: 5,
      description: 'Protect services from abuse and overload.',
      concepts: ['Token bucket', 'Leaky bucket', 'Fixed window', 'Sliding window', 'Distributed rate limiting'],
      tips: [
        'Token bucket allows burst while maintaining average rate',
        'Sliding window is most accurate but memory-intensive',
        'Use Redis for distributed rate limiting across servers'
      ],

      introduction: `A rate limiter controls the number of requests a user or system can perform within a specific time frame. Think of it as a bouncer managing entry flow to maintain system stability.

Rate limiters are critical for: preventing API abuse, mitigating DDoS attacks, ensuring fair resource usage, and controlling costs in usage-based billing. Companies like Stripe, GitHub, and Twitter rely heavily on rate limiting.`,

      functionalRequirements: [
        'Limit requests per user/IP/API key',
        'Support multiple tiers (free, pro, enterprise)',
        'Configure limits per endpoint or globally',
        'Return remaining quota and reset time',
        'Allow burst traffic within limits',
        'Dynamic rule updates without restart'
      ],

      nonFunctionalRequirements: [
        'Sub-millisecond latency (<1ms cached)',
        'Handle 1M+ rate limit checks per second',
        'Distributed consistency across servers',
        'Graceful degradation when Redis unavailable',
        '99.99% availability'
      ],

      dataModel: {
        description: 'Rate limit rules and token bucket state in Redis',
        schema: `rate_limit_rules {
  id: uuid PK
  key_pattern: varchar -- user:{userId}, ip:{ip}
  limit: int
  window_seconds: int
  algorithm: enum(TOKEN_BUCKET, SLIDING_WINDOW)
}

token_buckets (Redis) {
  key: string -- "bucket:user:123"
  tokens: float
  last_refill: timestamp
  ttl: seconds
}`
      },

      apiDesign: {
        description: 'Rate limiting check endpoints',
        endpoints: [
          { method: 'GET', path: '/api/ratelimit/check', params: 'key, cost=1', response: '{ allowed, remaining, resetAt }' },
          { method: 'GET', path: '/api/ratelimit/status/:key', params: '-', response: '{ currentUsage, limit, resetAt }' }
        ]
      },

      keyQuestions: [
        {
          question: 'Which algorithm should we use?',
          answer: `**Token Bucket** (Most common):
- Tokens refill at steady rate into bucket
- Allows bursts up to bucket capacity
- Used by Stripe, AWS

**Sliding Window Log**:
- Track timestamp of each request
- Most accurate but memory intensive

**Fixed Window Counter**:
- Simple but has boundary burst problem
- User sends 100 req at 0:59 + 100 at 1:00

**Leaky Bucket**:
- Smooths traffic to constant rate
- Good for streaming/consistent throughput`
        },
        {
          question: 'How do we implement distributed rate limiting?',
          answer: `**Centralized Redis** (Recommended):
- All servers check Redis
- Use Lua scripts for atomic check-and-decrement:
\`\`\`lua
local tokens = redis.call('GET', key) or bucket_size
if tokens >= cost then
  redis.call('DECRBY', key, cost)
  return {1, tokens - cost}
end
return {0, tokens}
\`\`\`

**Local Cache + Sync**:
- Each server has local counter
- Periodically sync to Redis
- Less accurate but faster`
        },
        {
          question: 'What happens when Redis is down?',
          answer: `**Fail Open**: Allow requests (risk overload)
**Fail Closed**: Deny all (frustrate users)

**Hybrid** (Recommended):
- Fall back to local rate limiting
- Each server has approximate limit
- Degraded accuracy, maintained protection`
        }
      ],

      basicImplementation: {
        title: 'Basic Rate Limiter',
        description: 'Single Redis instance with Lua scripts for token bucket implementation',
        svgTemplate: 'rateLimiter',
        problems: ['Single point of failure', 'No failover']
      },

      advancedImplementation: {
        title: 'Production Architecture',
        description: 'CDN Edge → API Gateway → Redis Cluster for distributed rate limiting',
        svgTemplate: 'rateLimiterAdvanced',
        keyPoints: [
          'Edge rate limiting at CDN for DDoS protection',
          'Redis Cluster with automatic failover',
          'Local cache for hot keys (<1ms latency)',
          'Lua scripts for atomic operations'
        ]
      },

      discussionPoints: [
        {
          topic: 'Algorithm Trade-offs',
          points: [
            'Token bucket: Best for APIs allowing bursts',
            'Sliding window: Most accurate, higher memory',
            'Fixed window: Simplest, boundary burst problem',
            'Leaky bucket: Smooths traffic, adds latency'
          ]
        },
        {
          topic: 'Multi-tier Rate Limiting',
          points: [
            'Edge/CDN: Coarse limits for DDoS (10K/min per IP)',
            'API Gateway: User-level limits (1000/min for Pro)',
            'Service-level: Endpoint-specific limits'
          ]
        }
      ]
    },
    {
      id: 'microservices',
      title: 'Microservices',
      icon: 'layers',
      color: '#8b5cf6',
      questions: 10,
      description: 'Service decomposition, communication, and orchestration.',
      concepts: ['Service boundaries', 'API Gateway', 'Service discovery', 'Circuit breaker', 'Saga pattern', 'Event sourcing'],
      tips: [
        'Start monolith, extract services when boundaries are clear',
        'Use API gateway for auth, rate limiting, routing',
        'Circuit breaker prevents cascade failures'
      ],

      introduction: `Microservices architecture structures an application as a collection of loosely coupled, independently deployable services. Each service owns its data and can be developed, deployed, and scaled independently.

Netflix has 700+ microservices, Amazon has thousands. While powerful, microservices add complexity—you're trading one type of problem (monolith scaling) for another (distributed systems). Understanding when and how to use them is crucial.`,

      functionalRequirements: [
        'Independent deployment of services',
        'Service-to-service communication',
        'Service discovery and registration',
        'Load balancing across instances',
        'Fault tolerance and resilience',
        'Distributed tracing and monitoring'
      ],

      nonFunctionalRequirements: [
        'Latency: < 50ms added for service hops',
        'Availability: 99.99% per service',
        'Scalability: Independent scaling per service',
        'Isolation: Service failure doesn\'t cascade',
        'Deployment: Zero-downtime deployments',
        'Recovery: < 30 second restart time'
      ],

      dataModel: {
        description: 'Microservices architecture components',
        schema: `Service Definition:
{
  name: "order-service",
  version: "2.3.1",
  endpoints: [
    { path: "/orders", methods: ["GET", "POST"] },
    { path: "/orders/:id", methods: ["GET", "PUT"] }
  ],
  dependencies: ["user-service", "inventory-service"],
  database: "orders_db",
  instances: 5,
  resources: { cpu: "0.5", memory: "512Mi" }
}

Service Registry (Consul/Eureka):
{
  "order-service": [
    { "id": "order-1", "address": "10.0.0.1:8080", "health": "passing" },
    { "id": "order-2", "address": "10.0.0.2:8080", "health": "passing" }
  ],
  "user-service": [
    { "id": "user-1", "address": "10.0.1.1:8080", "health": "passing" }
  ]
}`
      },

      apiDesign: {
        description: 'Service communication patterns',
        endpoints: [
          { method: 'GET', path: '/api/orders/:id', params: '-', response: 'Order with user and items (aggregated)' },
          { method: 'gRPC', path: 'UserService.GetUser', params: 'user_id', response: 'User proto message' },
          { method: 'EVENT', path: 'order.created', params: 'order payload', response: 'Async notification' },
          { method: 'GET', path: '/health', params: '-', response: 'Service health status' },
          { method: 'GET', path: '/metrics', params: '-', response: 'Prometheus metrics' }
        ]
      },

      keyQuestions: [
        {
          question: 'How do you decompose a monolith into microservices?',
          answer: `**Domain-Driven Design (DDD) Approach**:

1. **Identify Bounded Contexts**:
   - User Management: Registration, profiles, auth
   - Orders: Cart, checkout, order history
   - Inventory: Stock levels, warehouses
   - Payments: Processing, refunds, billing

2. **Start with the Strangler Pattern**:
\`\`\`
┌────────────────────────────────────────────┐
│              Monolith                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Users  │ │ Orders  │ │Inventory│       │
│  └─────────┘ └─────────┘ └─────────┘       │
└────────────────────────────────────────────┘
                    │
          Extract one at a time
                    ▼
┌──────────────┐  ┌──────────────────────────┐
│    User      │  │      Monolith            │
│   Service    │  │  Orders + Inventory      │
│  (extracted) │  │                          │
└──────────────┘  └──────────────────────────┘
\`\`\`

3. **Guidelines for Service Boundaries**:
   - Single responsibility (one reason to change)
   - Own their data (no shared databases!)
   - Team-sized (2-pizza team can own it)
   - Business capability aligned
   - Independently deployable

**Anti-patterns**:
- Nano-services (too small)
- Distributed monolith (tightly coupled services)
- Shared database between services`
        },
        {
          question: 'How do services communicate with each other?',
          answer: `**Synchronous Communication**:

1. **REST over HTTP**:
\`\`\`
Order Service ──GET /users/123──▶ User Service
              ◀──{ user data }───
\`\`\`
- Simple, widely understood
- Tight coupling (caller waits)
- Good for: Queries, simple operations

2. **gRPC**:
\`\`\`
Order Service ──GetUser(123)──▶ User Service
              ◀──User proto────
\`\`\`
- Binary protocol (faster)
- Strong typing with Protobuf
- Streaming support
- Good for: Internal service calls

**Asynchronous Communication**:

3. **Message Queues**:
\`\`\`
Order Service ──[OrderCreated]──▶ Queue
                                    │
Inventory ◀────────────────────────┘
Email     ◀────────────────────────┘
Analytics ◀────────────────────────┘
\`\`\`
- Loose coupling
- Better fault tolerance
- Good for: Events, long-running tasks

**When to use each**:
| Pattern | Use Case |
|---------|----------|
| Sync (REST/gRPC) | Need immediate response |
| Async (Events) | Fire-and-forget, eventual consistency |
| gRPC | High-performance internal calls |
| REST | Public APIs, simple integrations |`
        },
        {
          question: 'What is the Circuit Breaker pattern?',
          answer: `**The Problem**: Cascading failures
\`\`\`
Order Service ──▶ User Service (DOWN)
      │
      └──▶ Waiting... waiting... TIMEOUT
      └──▶ Retry... TIMEOUT
      └──▶ Resources exhausted
      └──▶ Order Service ALSO DOWN!
\`\`\`

**Circuit Breaker States**:
\`\`\`
┌─────────┐    Failures exceed     ┌─────────┐
│ CLOSED  │────threshold──────────▶│  OPEN   │
│ (normal)│                        │ (fail   │
└─────────┘                        │  fast)  │
     ▲                             └────┬────┘
     │                                  │
     │    Success                       │ Timeout
     │                                  │
     │                             ┌────▼────┐
     └─────────────────────────────│HALF-OPEN│
                                   │ (test)  │
                                   └─────────┘
\`\`\`

**Implementation**:
\`\`\`python
class CircuitBreaker:
    def call(self, func):
        if self.state == OPEN:
            if time.now() > self.open_until:
                self.state = HALF_OPEN
            else:
                raise CircuitOpenException()

        try:
            result = func()
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e

    def on_failure(self):
        self.failure_count += 1
        if self.failure_count >= THRESHOLD:
            self.state = OPEN
            self.open_until = time.now() + TIMEOUT
\`\`\`

**Libraries**: Hystrix (Netflix), Resilience4j, Polly`
        },
        {
          question: 'How do you handle distributed transactions?',
          answer: `**The Problem**: No ACID across services
\`\`\`
Order Service:  Create order ✓
Payment Service: Charge card ✓
Inventory:      Reduce stock ✗ (FAILS!)

Now what? Order exists, card charged, but no inventory!
\`\`\`

**Solution 1: Saga Pattern (Choreography)**:
\`\`\`
Events flow between services:

1. Order Created ──────────────────▶
2.                 ◀── Payment Charged
3. Inventory Reserved ─────────────▶
4. (or) Inventory Failed ──────────▶
5.                 ◀── Payment Refunded
6. Order Cancelled ────────────────▶
\`\`\`
- Each service reacts to events
- Compensating transactions for rollback
- Decentralized, no coordinator

**Solution 2: Saga Pattern (Orchestration)**:
\`\`\`
┌─────────────────┐
│  Saga           │
│  Orchestrator   │
└────────┬────────┘
         │
         ├──▶ 1. Create Order
         ├──▶ 2. Charge Payment
         ├──▶ 3. Reserve Inventory
         │
         │    If any step fails:
         ├──▶ Compensate (reverse order)
         │
         └──▶ Mark saga complete
\`\`\`
- Central coordinator
- Easier to understand flow
- Single point of failure

**Compensating Transactions**:
| Action | Compensation |
|--------|--------------|
| Create order | Cancel order |
| Charge card | Refund card |
| Reserve stock | Release stock |
| Send email | Send cancellation email |`
        },
        {
          question: 'How does service discovery work?',
          answer: `**The Problem**: How does Order Service find User Service?
- IP addresses change
- Instances scale up/down
- Services move between hosts

**Client-Side Discovery**:
\`\`\`
┌────────────────┐
│Service Registry│
│   (Consul)     │
└───────┬────────┘
        │ 2. user-service:
        │    [10.0.0.1, 10.0.0.2]
        │
┌───────▼────────┐         ┌─────────────────┐
│  Order Service │──3.────▶│  User Service   │
│                │  call   │  (10.0.0.1)     │
└────────────────┘         └─────────────────┘
        │
        │ 1. Query registry

- Client queries registry
- Client does load balancing
- Examples: Eureka, Consul
\`\`\`

**Server-Side Discovery**:
\`\`\`
┌────────────────┐         ┌─────────────────┐
│  Order Service │───1.───▶│   Load Balancer │
└────────────────┘  call   └────────┬────────┘
                                    │
                           2. Route │
                                    │
┌──────────────────────────────────▼─────────┐
│                User Services               │
│   [10.0.0.1]    [10.0.0.2]    [10.0.0.3]  │
└────────────────────────────────────────────┘

- Load balancer queries registry
- Client just calls load balancer
- Examples: AWS ALB, Kubernetes Service
\`\`\`

**Kubernetes Service Discovery**:
\`\`\`yaml
# user-service is DNS name
http://user-service:8080/users/123

# Kubernetes resolves to pod IPs
# Built-in load balancing
\`\`\``
        }
      ],

      basicImplementation: {
        title: 'Simple Microservices',
        description: 'API Gateway routing to independent services, each owning their database',
        svgTemplate: 'simpleMicroservices',
        problems: [
          'Direct calls create tight coupling',
          'No fault tolerance (cascading failures)',
          'Hard to trace requests across services',
          'No service discovery (hardcoded URLs)'
        ]
      },

      advancedImplementation: {
        title: 'Production Microservices Architecture',
        description: 'API Gateway with service mesh providing mTLS, circuit breakers, and observability across services.',
        svgTemplate: 'apiGateway',
        architecture: `
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│     User      │           │     Order     │           │    Payment    │
│   Service     │           │   Service     │           │   Service     │
│   ┌───────┐   │           │   ┌───────┐   │           │   ┌───────┐   │
│   │Sidecar│   │           │   │Sidecar│   │           │   │Sidecar│   │
│   └───────┘   │           │   └───────┘   │           │   └───────┘   │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        ▼                           │                           ▼
┌───────────────┐                   │                   ┌───────────────┐
│   Users DB    │                   │                   │  Payments DB  │
└───────────────┘                   │                   └───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │        Message Queue          │
                    │         (Kafka/SQS)           │
                    └───────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
        ┌───────────┐       ┌───────────┐       ┌───────────┐
        │ Analytics │       │  Email    │       │ Inventory │
        │  Service  │       │  Service  │       │  Service  │
        └───────────┘       └───────────┘       └───────────┘

Supporting Infrastructure:
┌─────────────────────────────────────────────────────────────────────────────┐
│  Service Registry │ Config Server │ Distributed Tracing │ Log Aggregation  │
│    (Consul)       │   (Vault)     │     (Jaeger)        │    (ELK)         │
└─────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Service mesh handles cross-cutting concerns',
          'Sidecar proxies for each service',
          'Event-driven for loose coupling',
          'Centralized observability stack',
          'Each service independently scalable'
        ]
      },

      discussionPoints: [
        {
          topic: 'Microservices vs Monolith',
          points: [
            'Start monolith until you need to scale',
            'Microservices add operational complexity',
            'Need mature DevOps practices',
            'Team size matters (Conway\'s Law)',
            'Don\'t microservice for the sake of it'
          ]
        },
        {
          topic: 'Common Patterns',
          points: [
            'API Gateway: Single entry point',
            'Service Mesh: Infrastructure layer',
            'Saga: Distributed transactions',
            'Event Sourcing: Audit log of changes',
            'CQRS: Separate read/write models'
          ]
        },
        {
          topic: 'Operational Challenges',
          points: [
            'Distributed tracing is essential',
            'Centralized logging and monitoring',
            'Contract testing between services',
            'Handling partial failures gracefully',
            'Database per service (no sharing!)'
          ]
        }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: 'lock',
      color: '#dc2626',
      questions: 8,
      description: 'Authentication, authorization, and data protection.',
      concepts: ['OAuth 2.0', 'JWT', 'HTTPS/TLS', 'Encryption at rest', 'API keys', 'RBAC', 'SQL injection prevention'],
      tips: [
        'Use OAuth 2.0 for third-party auth, JWT for stateless sessions',
        'Always encrypt sensitive data at rest and in transit',
        'Principle of least privilege for access control'
      ],

      introduction: `Security is not optional—it's a fundamental requirement for every system. A single vulnerability can expose millions of users' data, destroy trust, and result in massive fines.

Breaches at companies like Equifax (143M users), Yahoo (3B accounts), and Facebook (533M users) show the consequences of poor security. Understanding authentication, authorization, encryption, and common vulnerabilities is essential for system design.`,

      functionalRequirements: [
        'Authenticate users securely',
        'Authorize access to resources',
        'Protect data in transit and at rest',
        'Handle sensitive data (PII, credentials)',
        'Audit security-relevant events',
        'Support secure password management'
      ],

      nonFunctionalRequirements: [
        'Compliance: SOC2, GDPR, HIPAA as applicable',
        'Encryption: TLS 1.3+, AES-256',
        'Password: bcrypt/Argon2 with proper work factors',
        'Session: Secure, HttpOnly, SameSite cookies',
        'Audit: 1 year retention for security logs',
        'Recovery: < 24 hour response to security incidents'
      ],

      dataModel: {
        description: 'Security-related data models',
        schema: `User Authentication:
{
  id: uuid,
  email: string (unique, indexed),
  password_hash: string (bcrypt/Argon2),
  salt: string,
  mfa_secret: string (encrypted),
  mfa_enabled: boolean,
  failed_attempts: int,
  locked_until: timestamp,
  last_login: timestamp
}

API Key:
{
  id: uuid,
  user_id: uuid FK,
  key_hash: string (never store plaintext!),
  key_prefix: string (for identification: "sk_live_"),
  name: string,
  scopes: string[],
  last_used: timestamp,
  expires_at: timestamp
}

Audit Log:
{
  id: uuid,
  timestamp: datetime,
  user_id: uuid,
  action: string,
  resource: string,
  ip_address: string,
  user_agent: string,
  result: "success" | "failure",
  details: json
}`
      },

      apiDesign: {
        description: 'Secure API patterns',
        endpoints: [
          { method: 'POST', path: '/api/auth/login', params: 'email, password', response: '{ accessToken, refreshToken }' },
          { method: 'POST', path: '/api/auth/refresh', params: 'refreshToken', response: '{ accessToken }' },
          { method: 'POST', path: '/api/auth/logout', params: 'refreshToken', response: '204 (invalidate token)' },
          { method: 'POST', path: '/api/auth/mfa/verify', params: 'code', response: '{ accessToken }' },
          { method: 'GET', path: '/api/user/me', params: 'Authorization header', response: 'Current user (authenticated)' }
        ]
      },

      keyQuestions: [
        {
          question: 'What is the difference between authentication and authorization?',
          answer: `**Authentication (AuthN)**: Who are you?
- Verifies identity
- Proves you are who you claim to be
- Methods: Password, MFA, biometrics, SSO

**Authorization (AuthZ)**: What can you do?
- Verifies permissions
- Determines what resources you can access
- Methods: RBAC, ABAC, ACLs

**Example**:
\`\`\`
1. User logs in with email/password → Authentication
2. User requests /admin/users → Authorization check
3. System checks: Does user have "admin" role?
4. If yes → Allow; If no → 403 Forbidden
\`\`\`

**Common Patterns**:

| Pattern | Description | Use Case |
|---------|-------------|----------|
| RBAC | Role-Based Access Control | User has roles (admin, user) |
| ABAC | Attribute-Based Access Control | Rules based on attributes |
| ACL | Access Control Lists | Per-resource permissions |
| ReBAC | Relationship-Based | Based on relationships (owner, member) |

**Example RBAC**:
\`\`\`
Roles:
  admin: [read, write, delete, manage_users]
  editor: [read, write]
  viewer: [read]

User "john" has role "editor"
john can: read ✓, write ✓, delete ✗
\`\`\``
        },
        {
          question: 'How does OAuth 2.0 work?',
          answer: `**OAuth 2.0**: Authorization framework for third-party access

**The Problem**: App wants to access user's Google data without knowing Google password.

**OAuth Flow (Authorization Code)**:
\`\`\`
┌──────────┐                               ┌──────────┐
│   User   │                               │  Google  │
└────┬─────┘                               └────┬─────┘
     │                                          │
     │  1. Click "Login with Google"            │
     │  ──────────────────────────────────────▶ │
     │                                          │
     │  2. Google login page                    │
     │  ◀────────────────────────────────────── │
     │                                          │
     │  3. User logs in & approves              │
     │  ──────────────────────────────────────▶ │
     │                                          │
     │  4. Redirect with authorization code     │
     │  ◀────────────────────────────────────── │
     │                                          │
┌────▼─────┐                                    │
│   App    │  5. Exchange code for tokens       │
│  Server  │  ─────────────────────────────────▶│
│          │                                    │
│          │  6. Access token + Refresh token   │
│          │  ◀─────────────────────────────────│
│          │                                    │
│          │  7. Use access token for API calls │
│          │  ─────────────────────────────────▶│
└──────────┘                                    │
\`\`\`

**Key Tokens**:
- **Access Token**: Short-lived (15 min), for API calls
- **Refresh Token**: Long-lived, to get new access tokens
- **ID Token** (OpenID Connect): User info (email, name)

**Scopes**: Limit what app can access
\`\`\`
scopes: ["email", "profile", "calendar.readonly"]
\`\`\``
        },
        {
          question: 'How do you securely store passwords?',
          answer: `**NEVER store plaintext passwords!**

**Proper Password Hashing**:
\`\`\`python
# Good: bcrypt with cost factor
import bcrypt

def hash_password(password):
    salt = bcrypt.gensalt(rounds=12)  # 2^12 iterations
    return bcrypt.hashpw(password.encode(), salt)

def verify_password(password, hash):
    return bcrypt.checkpw(password.encode(), hash)
\`\`\`

**Why bcrypt/Argon2?**:
- **Slow by design**: Makes brute force impractical
- **Salt built-in**: Each password has unique salt
- **Adjustable cost**: Increase work factor over time

**Password Storage Comparison**:
| Method | Security | Notes |
|--------|----------|-------|
| Plaintext | 💀 NEVER | Catastrophic if breached |
| MD5/SHA1 | 💀 NO | Too fast, rainbow tables |
| SHA256 | ⚠️ Weak | Fast, need salt |
| bcrypt | ✅ Good | Industry standard |
| Argon2 | ✅ Best | Memory-hard, newest |

**Best Practices**:
- Use bcrypt with cost factor ≥12 (or Argon2)
- Enforce strong passwords (length > complexity)
- Rate limit login attempts
- Lock account after N failures
- Never log passwords
- Use password managers (for users)`
        },
        {
          question: 'What are common security vulnerabilities to prevent?',
          answer: `**OWASP Top 10 Vulnerabilities**:

**1. Injection (SQL, NoSQL, Command)**:
\`\`\`sql
-- Bad: String concatenation
"SELECT * FROM users WHERE id = '" + userId + "'"
-- userId = "'; DROP TABLE users; --"

-- Good: Parameterized queries
"SELECT * FROM users WHERE id = $1", [userId]
\`\`\`

**2. Broken Authentication**:
- Weak passwords allowed
- No rate limiting
- Predictable session IDs
- Credentials in URL

**3. Cross-Site Scripting (XSS)**:
\`\`\`html
<!-- Bad: Rendering user input directly -->
<div>{userInput}</div>
<!-- userInput = <script>stealCookies()</script> -->

<!-- Good: Escape HTML -->
<div>{escapeHtml(userInput)}</div>
\`\`\`

**4. Insecure Direct Object References**:
\`\`\`
GET /api/invoices/12345  (user can access any invoice!)

# Good: Check ownership
if invoice.user_id != current_user.id:
    return 403 Forbidden
\`\`\`

**5. CSRF (Cross-Site Request Forgery)**:
\`\`\`html
<!-- Attacker's site -->
<img src="https://bank.com/transfer?to=attacker&amount=10000">

<!-- Prevention: CSRF tokens -->
<input type="hidden" name="csrf_token" value="random_token">
\`\`\`

**6. Security Misconfiguration**:
- Debug mode in production
- Default credentials
- Unnecessary features enabled
- Missing security headers`
        },
        {
          question: 'How do you implement JWT authentication?',
          answer: `**JWT (JSON Web Token)**: Stateless authentication token

**Structure**: header.payload.signature
\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.
Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A

Header: {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "user_123", "exp": 1700000000, "roles": ["user"]}
Signature: HMACSHA256(header + "." + payload, secret)
\`\`\`

**Authentication Flow**:
\`\`\`
1. User logs in with credentials
2. Server validates, generates JWT
3. Client stores JWT (httpOnly cookie recommended)
4. Client sends JWT with every request
5. Server validates signature and expiry
\`\`\`

**Implementation**:
\`\`\`python
import jwt
from datetime import datetime, timedelta

def create_token(user_id, secret):
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def verify_token(token, secret):
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise AuthError("Token expired")
    except jwt.InvalidTokenError:
        raise AuthError("Invalid token")
\`\`\`

**Best Practices**:
- Short expiry (15 min) + refresh tokens
- Use httpOnly cookies (not localStorage)
- Include only necessary claims
- Rotate signing keys periodically
- Never store sensitive data in payload`
        }
      ],

      basicImplementation: {
        title: 'Basic Authentication',
        description: 'Client → Auth Service → Session Store (Redis) + User Database',
        svgTemplate: 'sessionAuth',
        problems: [
          'Server must store session state',
          'Hard to scale across servers',
          'Session storage becomes bottleneck',
          'CSRF protection needed'
        ]
      },

      advancedImplementation: {
        title: 'Zero-Trust Security Architecture',
        description: 'WAF → API Gateway → Identity Provider (JWT) → Service Mesh with mTLS',
        svgTemplate: 'serviceMesh',
        oldArchitecture: `
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   Service A   │           │   Service B   │           │   Service C   │
│               │           │               │           │               │
│ Validate JWT  │           │ Validate JWT  │           │ Validate JWT  │
│ Check scopes  │           │ Check scopes  │           │ Check scopes  │
│ RBAC checks   │           │ RBAC checks   │           │ RBAC checks   │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         Encrypted Data Store                               │
│                    Encryption at rest (AES-256)                            │
│              Secrets in Vault │ Key rotation │ Audit logs                  │
└───────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'Defense in depth: Multiple security layers',
          'Zero trust: Verify every request',
          'mTLS: Encrypted service-to-service',
          'Centralized identity management',
          'Encryption everywhere (transit + rest)',
          'Comprehensive audit logging'
        ]
      },

      discussionPoints: [
        {
          topic: 'Authentication Methods',
          points: [
            'Passwords: Simple but weakest (require MFA)',
            'OAuth/OIDC: For third-party and SSO',
            'API Keys: For service-to-service',
            'Certificates/mTLS: Strongest, complex setup',
            'Biometrics: Convenience factor'
          ]
        },
        {
          topic: 'Data Protection',
          points: [
            'Encrypt sensitive data at rest',
            'Use TLS 1.3 for all traffic',
            'Hash passwords with bcrypt/Argon2',
            'Store secrets in Vault/KMS, not code',
            'PII requires special handling (GDPR)'
          ]
        },
        {
          topic: 'Security Monitoring',
          points: [
            'Log all authentication events',
            'Alert on anomalous behavior',
            'Rate limit failed attempts',
            'Regular security audits/pentests',
            'Incident response plan'
          ]
        }
      ]
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Observability',
      icon: 'eye',
      color: '#0ea5e9',
      questions: 6,
      description: 'Logging, metrics, tracing, and alerting.',
      concepts: ['Logs vs Metrics vs Traces', 'Prometheus/Grafana', 'ELK stack', 'Distributed tracing', 'SLIs/SLOs', 'On-call rotation'],
      tips: [
        'Three pillars: Logs, Metrics, Traces',
        'Set SLOs based on user experience, not server metrics',
        'Use distributed tracing for debugging microservices'
      ],

      introduction: `Observability is the ability to understand a system's internal state by examining its outputs. In distributed systems, you can't SSH into a server to debug—you need comprehensive monitoring, logging, and tracing.

Google, Netflix, and Amazon have mature observability practices that enable them to operate at massive scale with small on-call teams. Understanding the three pillars (logs, metrics, traces) and SLOs is essential for production systems.`,

      functionalRequirements: [
        'Collect and store metrics from all services',
        'Aggregate logs from distributed systems',
        'Trace requests across service boundaries',
        'Alert on anomalies and SLO violations',
        'Provide dashboards for visualization',
        'Enable root cause analysis for incidents'
      ],

      nonFunctionalRequirements: [
        'Metrics latency: < 30 seconds end-to-end',
        'Log ingestion: Handle 100K+ events/second',
        'Trace sampling: Balance detail vs overhead',
        'Storage: 30 days hot, 1 year archive',
        'Query: Sub-second for common queries',
        'Availability: Monitoring must be more reliable than monitored systems'
      ],

      dataModel: {
        description: 'Observability data formats',
        schema: `Metric (Prometheus format):
  http_requests_total{
    method="GET",
    path="/api/users",
    status="200"
  } 1234

  http_request_duration_seconds{
    method="GET",
    path="/api/users",
    quantile="0.99"
  } 0.25

Log (Structured JSON):
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "ERROR",
  "service": "order-service",
  "trace_id": "abc123",
  "span_id": "def456",
  "message": "Failed to process order",
  "error": "Connection refused",
  "user_id": "user_789",
  "order_id": "order_456"
}

Trace Span:
{
  "trace_id": "abc123",
  "span_id": "def456",
  "parent_span_id": "ghi789",
  "operation_name": "POST /api/orders",
  "service_name": "order-service",
  "start_time": "2024-01-01T12:00:00.000Z",
  "duration_ms": 250,
  "tags": {"http.status_code": 200},
  "logs": [{"time": "...", "message": "Processing order"}]
}`
      },

      apiDesign: {
        description: 'Common observability endpoints',
        endpoints: [
          { method: 'GET', path: '/metrics', params: '-', response: 'Prometheus metrics format' },
          { method: 'GET', path: '/health', params: '-', response: '{ status: "healthy", checks: [...] }' },
          { method: 'GET', path: '/health/ready', params: '-', response: 'Ready to serve traffic' },
          { method: 'GET', path: '/health/live', params: '-', response: 'Process is alive' },
          { method: 'POST', path: '/api/traces', params: 'spans[]', response: 'Spans ingested' }
        ]
      },

      keyQuestions: [
        {
          question: 'What are the three pillars of observability?',
          answer: `**1. Logs**: Discrete events with context
\`\`\`
What: Specific event that happened
When: Timestamp
Where: Service, host, function
Why: Error details, stack traces

Use for:
- Debugging specific errors
- Audit trails
- Security analysis
\`\`\`

**2. Metrics**: Numerical measurements over time
\`\`\`
What: request_count, latency_p99, cpu_usage
Types:
- Counter: Only increases (requests total)
- Gauge: Can go up/down (active connections)
- Histogram: Distribution (latency buckets)

Use for:
- Dashboards and alerts
- Capacity planning
- SLO tracking
\`\`\`

**3. Traces**: Request journey across services
\`\`\`
          Order Service    Payment Service    Inventory
Request ─────┬──────────────────┬─────────────────┬─────
             │                  │                 │
             │◀────Span 1──────▶│                 │
             │                  │◀───Span 2──────▶│
             │                  │                 │
             ├──────────────────┴─────────────────┤
             │◀──────── Full Trace ──────────────▶│

Use for:
- Finding bottlenecks
- Debugging distributed issues
- Understanding dependencies
\`\`\`

**How they work together**:
1. Alert fires on high error rate (metric)
2. Check dashboard for affected endpoints (metrics)
3. Find trace for failed request (trace)
4. Examine logs for error details (logs)`
        },
        {
          question: 'What are SLIs, SLOs, and SLAs?',
          answer: `**SLI (Service Level Indicator)**: What you measure
\`\`\`
Examples:
- Request latency (p50, p95, p99)
- Error rate (5xx / total requests)
- Availability (successful requests / total)
- Throughput (requests per second)
\`\`\`

**SLO (Service Level Objective)**: Your target
\`\`\`
Examples:
- 99.9% of requests complete in < 200ms
- Error rate < 0.1%
- 99.95% availability per month

SLO = SLI + Target + Time Window
\`\`\`

**SLA (Service Level Agreement)**: Contract with consequences
\`\`\`
"99.9% monthly uptime, or customer gets credits"

SLA should be less strict than SLO:
- Internal SLO: 99.95%
- External SLA: 99.9%
- Buffer for safety
\`\`\`

**Error Budget**: How much failure is allowed
\`\`\`
SLO: 99.9% availability
Error Budget: 0.1% = 43.2 minutes/month

If budget exhausted:
- Freeze new features
- Focus on reliability

If budget remaining:
- Can take calculated risks
- Ship faster
\`\`\`

**Good SLOs**:
- Based on user experience, not server metrics
- Measurable and specific
- Achievable but ambitious
- Reviewed and adjusted`
        },
        {
          question: 'How does distributed tracing work?',
          answer: `**The Problem**: Request touches 10 services, where did it slow down?

**Solution**: Propagate trace context across services

\`\`\`
                        ┌─ trace_id: abc123 ─┐
                        │   span_id: 001     │
                        │   service: gateway │
                        │   duration: 250ms  │
                        └────────┬───────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │                           │
         ┌─────────▼─────────┐       ┌─────────▼─────────┐
         │ trace_id: abc123  │       │ trace_id: abc123  │
         │ span_id: 002      │       │ span_id: 003      │
         │ parent: 001       │       │ parent: 001       │
         │ service: users    │       │ service: orders   │
         │ duration: 50ms    │       │ duration: 180ms   │
         └───────────────────┘       └─────────┬─────────┘
                                               │
                                     ┌─────────▼─────────┐
                                     │ trace_id: abc123  │
                                     │ span_id: 004      │
                                     │ parent: 003       │
                                     │ service: payments │
                                     │ duration: 120ms   │
                                     └───────────────────┘
\`\`\`

**Context Propagation**:
\`\`\`python
# Service A creates trace
trace_id = generate_trace_id()
span = create_span(trace_id, "service-a")

# Pass context in headers
headers = {
    "X-Trace-Id": trace_id,
    "X-Span-Id": span.id
}
response = http.get("service-b", headers=headers)

# Service B continues trace
trace_id = request.headers["X-Trace-Id"]
parent_span = request.headers["X-Span-Id"]
span = create_span(trace_id, "service-b", parent=parent_span)
\`\`\`

**Sampling**: Not every request needs tracing
- Head-based: Decide at start (1% of requests)
- Tail-based: Sample interesting traces (errors, slow)

**Tools**: Jaeger, Zipkin, AWS X-Ray, Datadog APM`
        },
        {
          question: 'How do you design an alerting system?',
          answer: `**Alert Hierarchy**:
\`\`\`
                    ┌─────────────────┐
                    │   PAGE (P1)     │  Someone wakes up
                    │ User-impacting  │  Response: < 5 min
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  URGENT (P2)    │  Same-day response
                    │  Degradation    │  Response: < 4 hours
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  WARNING (P3)   │  Business hours
                    │  Attention      │  Response: < 1 day
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  INFO (P4)      │  Track in ticket
                    │  For tracking   │  Response: Best effort
                    └─────────────────┘
\`\`\`

**Good Alerts**:
- Actionable: Someone can do something about it
- Relevant: Indicates real user impact
- Clear: Includes context and runbook link
- Rare: Frequent alerts get ignored

**Alert Format**:
\`\`\`
[P1] Order Service Error Rate > 5%
Current: 8.5% (threshold: 5%)
Impact: Users cannot complete orders
Dashboard: https://grafana/orders
Runbook: https://wiki/order-errors
\`\`\`

**Common Alert Mistakes**:
- Too many alerts → alert fatigue
- Alerting on causes, not symptoms
- No runbook → time wasted investigating
- Static thresholds when anomaly detection needed

**Best Practices**:
- Alert on SLO burn rate, not raw metrics
- Page only for user-impacting issues
- Include context and runbook links
- Review and tune alerts regularly`
        },
        {
          question: 'What metrics should every service expose?',
          answer: `**The RED Method** (Request-focused):
\`\`\`
Rate:    Requests per second
Errors:  Failed requests per second
Duration: Request latency (p50, p95, p99)

# Prometheus examples
http_requests_total{status="2xx"}
http_requests_total{status="5xx"}
http_request_duration_seconds_bucket{le="0.1"}
\`\`\`

**The USE Method** (Resource-focused):
\`\`\`
Utilization: % time resource is busy
Saturation:  Queue depth / backlog
Errors:      Error events count

# Examples
cpu_utilization_percent
disk_queue_length
network_errors_total
\`\`\`

**The Four Golden Signals** (Google SRE):
\`\`\`
1. Latency: Time to serve a request
2. Traffic: Demand on the system
3. Errors: Rate of failed requests
4. Saturation: How "full" the system is
\`\`\`

**Standard Service Metrics**:
\`\`\`python
# Request metrics
http_requests_total{method, path, status}
http_request_duration_seconds{method, path}
http_requests_in_flight

# Resource metrics
process_cpu_seconds_total
process_resident_memory_bytes
process_open_fds

# Business metrics (custom)
orders_total
revenue_usd_total
active_users_gauge
\`\`\`

**Cardinality Warning**: Don't include high-cardinality labels
\`\`\`python
# Bad: user_id has millions of values
http_requests_total{user_id="12345"}

# Good: aggregate by meaningful dimensions
http_requests_total{endpoint="/api/orders", status="200"}
\`\`\``
        }
      ],

      basicImplementation: {
        title: 'Basic Monitoring Stack',
        description: 'Services → Collector → Prometheus, Jaeger, ELK → Grafana dashboards',
        svgTemplate: 'observability',
        problems: [
          'No distributed tracing',
          'Manual alert configuration',
          'Single points of failure',
          'Limited correlation between data types'
        ]
      },

      advancedImplementation: {
        title: 'Enterprise Observability Platform',
        svgTemplate: 'observabilityAdvanced',
        architecture: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Services                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│   │  Service A  │    │  Service B  │    │  Service C  │                     │
│   │ ┌─────────┐ │    │ ┌─────────┐ │    │ ┌─────────┐ │                     │
│   │ │OTel SDK │ │    │ │OTel SDK │ │    │ │OTel SDK │ │                     │
│   │ │Logs/Met/│ │    │ │Logs/Met/│ │    │ │Logs/Met/│ │                     │
│   │ │Traces   │ │    │ │Traces   │ │    │ │Traces   │ │                     │
│   │ └────┬────┘ │    │ └────┬────┘ │    │ └────┬────┘ │                     │
│   └──────┼──────┘    └──────┼──────┘    └──────┼──────┘                     │
└──────────┼──────────────────┼──────────────────┼────────────────────────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OpenTelemetry Collector                                │
│              (Receive, Process, Export)                                     │
│   Sampling │ Batching │ Enrichment │ Routing                               │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Metrics     │  │      Logs       │  │     Traces      │
│   Prometheus /  │  │    Loki /       │  │    Jaeger /     │
│    Mimir        │  │  Elasticsearch  │  │     Tempo       │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Grafana                                            │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│   │  Dashboards  │  │    Alerts    │  │   Explore    │                      │
│   │              │  │              │  │ (Ad-hoc      │                      │
│   │ - SLO burn  │  │ - PagerDuty  │  │  queries)    │                      │
│   │ - Service   │  │ - Slack      │  │              │                      │
│   │   health    │  │ - On-call    │  │              │                      │
│   └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘

                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Incident Management                                       │
│     PagerDuty │ Opsgenie │ Runbooks │ Postmortems                          │
└─────────────────────────────────────────────────────────────────────────────┘`,
        keyPoints: [
          'OpenTelemetry for unified instrumentation',
          'Collector for processing and routing',
          'Dedicated backends for each signal type',
          'Grafana for unified visualization',
          'Correlation between logs, metrics, traces',
          'Automated alerting and incident management'
        ]
      },

      discussionPoints: [
        {
          topic: 'Observability Stack Choices',
          points: [
            'Prometheus + Grafana: Open source, widely used',
            'Datadog: Fully managed, expensive but comprehensive',
            'New Relic: APM-focused, good tracing',
            'ELK Stack: Powerful for logs, complex to operate',
            'OpenTelemetry: Vendor-neutral instrumentation'
          ]
        },
        {
          topic: 'Cost Management',
          points: [
            'Log volume grows fast - be selective',
            'Sampling reduces trace storage costs',
            'Aggregate metrics, not store every event',
            'Set retention policies (hot, warm, cold)',
            'Consider serverless/managed vs self-hosted'
          ]
        },
        {
          topic: 'Incident Response',
          points: [
            'On-call rotation with clear escalation',
            'Runbooks for common issues',
            'Blameless postmortems',
            'Track MTTR (Mean Time To Resolve)',
            'Automate remediation where possible'
          ]
        }
      ]
    },
  ];

  // System Design Problem Categories
