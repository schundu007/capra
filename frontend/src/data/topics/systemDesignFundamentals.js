// System Design Fundamentals Extra - 11 deep-dive fundamental topics

export const systemDesignFundamentalsExtra = [
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing',
    icon: 'hash',
    color: '#f59e0b',
    questions: 8,
    description: 'Ring-based hashing, virtual nodes, and data distribution across distributed systems.',
    introduction: `**Consistent hashing** is a distributed hashing technique that minimizes the number of keys that need to be remapped when the hash table is resized. Unlike traditional modular hashing where adding or removing a server causes nearly all keys to be remapped, consistent hashing ensures only **K/N** keys need to move on average, where K is the number of keys and N is the number of nodes.

This technique was introduced in the 1997 paper by Karger et al. and has since become foundational in distributed systems. **Amazon DynamoDB**, **Apache Cassandra**, **Akamai CDN**, and **Discord** all rely on consistent hashing for data partitioning and load distribution.

In system design interviews, consistent hashing comes up whenever you need to distribute data or load across multiple servers. Understanding the **hash ring**, **virtual nodes**, and **rebalancing mechanics** is essential for designing scalable storage systems, caches, and content delivery networks.`,

    concepts: [
      'Hash ring topology and key placement',
      'Virtual nodes (vnodes) for balanced distribution',
      'Clockwise key assignment to nearest node',
      'Minimal disruption on node addition/removal',
      'Weighted consistent hashing for heterogeneous nodes',
      'Jump consistent hashing (Google, 2014)',
      'Replication factor and successor nodes',
      'Bounded-load consistent hashing'
    ],

    tips: [
      'Draw the hash ring immediately when explaining - interviewers expect visual reasoning',
      'Always mention virtual nodes as the solution to uneven distribution',
      'Know the math: only K/N keys move when one of N nodes is added or removed',
      'Compare with modular hashing to show why consistent hashing is superior',
      'Mention real-world usage: DynamoDB, Cassandra, Memcached client-side routing',
      'Discuss how replication works by storing copies on successive ring nodes'
    ],

    functionalRequirements: [
      'Map keys to nodes in a distributed cluster',
      'Add or remove nodes with minimal key redistribution',
      'Support replication by assigning keys to multiple nodes',
      'Handle heterogeneous node capacities via weighting',
      'Enable predictable key-to-node lookup without centralized directory',
      'Support range queries when combined with ordered hashing'
    ],

    nonFunctionalRequirements: [
      'Load balance: < 10% variance across nodes with virtual nodes',
      'Lookup latency: O(log N) with sorted ring, O(1) with jump hashing',
      'Scalability: Support thousands of nodes without degradation',
      'Minimal data movement: Only K/N keys remapped per topology change',
      'Deterministic: Same key always maps to same node given same ring state',
      'Fault tolerant: Graceful handling of node failures'
    ],

    dataModel: {
      description: 'Consistent hashing ring structure and key placement',
      schema: `Hash Ring (0 to 2^32 - 1):

         0
         |
   330---.---30
        / \\
  300--/   \\--60
      |     |
  270-|     |-90
      |     |
  240--\\   /--120
        \\ /
   210---.---150
         |
        180

Node Placement (hash of node ID):
  Node A → position 30
  Node B → position 120
  Node C → position 250

Key Assignment (clockwise to nearest node):
  key1 = hash("user:1001") → position 45  → Node B (next clockwise)
  key2 = hash("user:1002") → position 200 → Node C (next clockwise)
  key3 = hash("user:1003") → position 5   → Node A (next clockwise)

Virtual Nodes (150-200 per physical node):
  Node A → A-0(30), A-1(85), A-2(190), A-3(310), ...
  Node B → B-0(120), B-1(55), B-2(220), B-3(340), ...
  Node C → C-0(250), C-1(15), C-2(160), C-3(290), ...`
    },

    apiDesign: {
      description: 'Consistent hashing ring operations',
      endpoints: [
        { method: 'ADD', path: 'ring.addNode(nodeId, weight)', params: 'nodeId, weight (optional)', response: 'Updated ring, list of migrated keys' },
        { method: 'REMOVE', path: 'ring.removeNode(nodeId)', params: 'nodeId', response: 'Updated ring, reassignment map' },
        { method: 'LOOKUP', path: 'ring.getNode(key)', params: 'key', response: 'Responsible node ID' },
        { method: 'LOOKUP', path: 'ring.getNodes(key, replicaCount)', params: 'key, N', response: 'List of N successor nodes for replication' },
        { method: 'GET', path: 'ring.getKeyDistribution()', params: '-', response: 'Map of nodeId to key count and load percentage' }
      ]
    },

    keyQuestions: [
      {
        question: 'How does consistent hashing work and why is it better than modular hashing?',
        answer: `**Modular hashing** uses \`server = hash(key) % N\`. When N changes (add/remove server), almost ALL keys remap.

**Consistent hashing** places nodes and keys on a virtual ring (0 to 2^32-1). Each key is assigned to the next node clockwise on the ring.

\`\`\`
Modular Hashing (N=3 → N=4):
  hash(k) % 3 → Server 0    hash(k) % 4 → Server 2  (MOVED!)
  Almost all keys remapped when N changes

Consistent Hashing Ring:
        ┌───── 0 ─────┐
        │              │
     Node C          Node A
        │     Ring     │
     Node B            │
        │              │
        └──── 180 ─────┘

  Add Node D between A and B:
  - Only keys between A and D move to D
  - All other keys stay put
  - ~K/N keys move (minimal disruption)
\`\`\`

**Key advantages**:
- Adding a node moves only **K/N** keys (vs nearly all with modular)
- Removing a node moves only the removed node's keys to its successor
- No central directory needed - any client can compute key placement
- Enables incremental scaling without costly full rebalancing`
      },
      {
        question: 'What problem do virtual nodes solve and how are they implemented?',
        answer: `**Problem**: With few physical nodes, the ring can be very uneven. If you have 3 nodes, one might get 50% of keys while another gets 15%.

**Virtual nodes (vnodes)** solve this by mapping each physical node to many positions on the ring:

\`\`\`
Without Virtual Nodes (3 physical):
  Ring: [---A(33%)---][------B(52%)------][--C(15%)--]
  Heavily unbalanced!

With Virtual Nodes (150 per physical):
  Ring: [A2][B1][C3][A1][C2][B3][A4][B2][C1]...
  Each physical node has ~33% of keys
  Standard deviation drops from ~40% to ~5%

Virtual Node Mapping:
  Physical Node A (IP: 10.0.0.1)
    → hash("10.0.0.1:0")  = position 234
    → hash("10.0.0.1:1")  = position 891
    → hash("10.0.0.1:2")  = position 1567
    ... (150+ positions)
\`\`\`

**Implementation details**:
- Typically **150-200 virtual nodes** per physical node
- Use weighted vnodes for heterogeneous hardware (powerful server gets more vnodes)
- Store sorted list of vnode positions for O(log N) binary search lookup
- When a physical node fails, its load spreads across MANY other nodes (not just one successor)
- This prevents cascade failures from overloading a single successor`
      },
      {
        question: 'How does replication work with consistent hashing?',
        answer: `**Replication** in consistent hashing stores each key on **N successive distinct physical nodes** clockwise on the ring:

\`\`\`
Replication Factor = 3

Hash Ring with vnodes:
    ┌──────────────────────────────────┐
    │          0                        │
    │    A2 ──── B1                     │
    │   /          \\                    │
    │  C1          A1    Key X lands    │
    │  |            |    here (pos 50)  │
    │  B2          C2                   │
    │   \\          /                    │
    │    A3 ──── B3                     │
    │         180                       │
    └──────────────────────────────────┘

Key X (position 50):
  Replica 1 → Node A (next clockwise physical node)
  Replica 2 → Node B (skip vnodes of A, next distinct physical)
  Replica 3 → Node C (skip vnodes of A and B)

On read:  Read from any replica (or quorum of R replicas)
On write: Write to all N replicas (or quorum of W replicas)

Quorum: W + R > N ensures consistency
  N=3, W=2, R=2: Strong consistency
  N=3, W=1, R=1: High availability, eventual consistency
\`\`\`

**Failure handling**:
- If Node A fails, reads/writes go to remaining replicas B and C
- **Hinted handoff**: Temporarily store A's writes on another node, replay when A recovers
- **Anti-entropy**: Background Merkle tree comparison to detect and repair inconsistencies`
      },
      {
        question: 'How do systems like DynamoDB and Cassandra use consistent hashing?',
        answer: `**Amazon DynamoDB**:
- Uses consistent hashing with virtual nodes for partition key distribution
- Each table's data is split into **partitions** based on the hash of the partition key
- Partitions are distributed across storage nodes using a consistent hash ring
- Automatic splitting when a partition exceeds 10GB or throughput limits

\`\`\`
DynamoDB Architecture:
  Client Request
       │
       ▼
  ┌──────────┐     ┌─────────────────────────┐
  │  Router   │────▶│   Consistent Hash Ring   │
  │ (Request  │     │                         │
  │  Router)  │     │  Part1(NodeA) ──────┐   │
  └──────────┘     │  Part2(NodeB)       │   │
                    │  Part3(NodeC) ◀─────┘   │
                    │                Replicas  │
                    └─────────────────────────┘
\`\`\`

**Apache Cassandra**:
- Uses consistent hashing with **token ranges** and vnodes (default 256 per node)
- Each node owns a set of token ranges on the ring
- The **partitioner** (Murmur3Partitioner) hashes partition keys to tokens
- Replication strategy (SimpleStrategy or NetworkTopologyStrategy) determines replica placement

**Key differences**:
| Aspect | DynamoDB | Cassandra |
|--------|----------|-----------|
| Ring management | Managed by AWS | Configured by operator |
| Vnodes | Automatic | Configurable (num_tokens) |
| Rebalancing | Automatic | nodetool repair/rebuild |
| Replication | Built-in 3x | Configurable RF |`
      },
      {
        question: 'What are the alternatives to consistent hashing and when would you use them?',
        answer: `**1. Jump Consistent Hashing** (Google, 2014):
- O(1) memory, O(ln N) time
- Produces perfectly balanced distribution
- Only works for numbered buckets (0 to N-1)
- Cannot handle arbitrary node names or weighted nodes
- Best for: Homogeneous clusters where nodes are numbered sequentially

**2. Rendezvous Hashing (Highest Random Weight)**:
- Hash each (key, node) pair, pick node with highest hash
- O(N) per lookup (check all nodes)
- Perfectly balanced, minimal disruption on node changes
- Best for: Small clusters where O(N) lookup is acceptable

\`\`\`
Rendezvous Hashing:
  For key "user:123":
    score(key, NodeA) = hash("user:123" + "NodeA") = 0.82
    score(key, NodeB) = hash("user:123" + "NodeB") = 0.91  ← Winner
    score(key, NodeC) = hash("user:123" + "NodeC") = 0.45
  Assign to NodeB (highest score)
\`\`\`

**3. Maglev Hashing** (Google, 2016):
- Builds a lookup table for O(1) lookups
- Minimal disruption similar to consistent hashing
- Best for: Network load balancers (Google's Maglev LB)

**4. Multi-probe Consistent Hashing**:
- Hash the key multiple times, pick closest node
- Better balance than single-probe without vnodes
- Best for: When vnode overhead is too high

**Comparison**:
| Method | Lookup | Memory | Balance | Use Case |
|--------|--------|--------|---------|----------|
| Consistent + vnodes | O(log N) | O(N * vnodes) | Good | General distributed systems |
| Jump | O(ln N) | O(1) | Perfect | Numbered buckets |
| Rendezvous | O(N) | O(N) | Perfect | Small clusters |
| Maglev | O(1) | O(N * M) | Good | Load balancers |`
      }
    ],

    basicImplementation: {
      title: 'Simple Consistent Hash Ring',
      description: 'Basic ring with physical nodes only, using sorted array and binary search for O(log N) lookups. Works for small clusters but suffers from uneven distribution.',
      svgTemplate: 'consistentHashBasic',
      problems: [
        'Uneven key distribution with few physical nodes',
        'Single node failure shifts all load to one successor',
        'No replication support built in',
        'Cannot handle heterogeneous node capacities'
      ]
    },

    advancedImplementation: {
      title: 'Production Consistent Hashing with Virtual Nodes',
      description: 'Full implementation with 150+ virtual nodes per physical node, replication factor of 3, quorum reads/writes, and automatic rebalancing on topology changes.',
      svgTemplate: 'consistentHashAdvanced',
      keyPoints: [
        'Virtual nodes ensure < 5% standard deviation in load distribution',
        'Replication on successive distinct physical nodes provides fault tolerance',
        'Quorum protocol (W + R > N) balances consistency and availability',
        'Hinted handoff handles temporary node failures without data loss',
        'Merkle trees enable efficient anti-entropy repair across replicas'
      ]
    },

    discussionPoints: [
      {
        topic: 'When to Use Consistent Hashing',
        points: [
          'Distributed caches (Memcached, Redis Cluster)',
          'Distributed databases (DynamoDB, Cassandra, Riak)',
          'CDN request routing (Akamai, Cloudflare)',
          'Load balancing with session affinity',
          'Any system where nodes join/leave frequently'
        ]
      },
      {
        topic: 'Virtual Node Tuning',
        points: [
          '150-200 vnodes per physical node is standard',
          'More vnodes = better balance but more memory and slower lookups',
          'Weight vnodes based on node hardware capacity',
          'Cassandra default: 256 tokens per node (configurable)',
          'Monitor actual key distribution and adjust'
        ]
      },
      {
        topic: 'Common Interview Pitfalls',
        points: [
          'Forgetting to mention virtual nodes as the load balancing solution',
          'Not explaining how replication interacts with the ring',
          'Confusing consistent hashing with hash-based sharding',
          'Not discussing what happens during node failure and recovery',
          'Ignoring the trade-off between vnodes count and lookup performance'
        ]
      }
    ]
  },

  {
    id: 'bloom-filters',
    title: 'Bloom Filters',
    icon: 'filter',
    color: '#3b82f6',
    questions: 7,
    description: 'Probabilistic data structures, false positives, and applications in distributed systems.',
    introduction: `A **Bloom filter** is a space-efficient probabilistic data structure that tests whether an element is a member of a set. It can tell you "definitely not in the set" or "probably in the set," but never gives false negatives. This property makes it invaluable for reducing unnecessary expensive lookups.

**Google Chrome** uses Bloom filters to check malicious URLs against a local filter before making network requests. **Apache Cassandra** uses them to avoid reading SSTables that do not contain a requested key. **Medium** uses Bloom filters to avoid recommending articles a user has already seen.

The key trade-off is between **space efficiency** and **false positive rate**. With 10 bits per element and 7 hash functions, you achieve roughly a 1% false positive rate. Understanding how to size Bloom filters and choose hash functions is essential for system design interviews involving large-scale membership testing, caching, and database optimization.`,

    concepts: [
      'Bit array and multiple hash functions',
      'False positive rate and its mathematical formula',
      'Optimal number of hash functions: k = (m/n) * ln(2)',
      'Space-time trade-off: bits per element vs error rate',
      'Counting Bloom filters for deletion support',
      'Cuckoo filters as an alternative with deletion',
      'Scalable Bloom filters for growing datasets',
      'Bloom filter unions and intersections'
    ],

    tips: [
      'Emphasize the "no false negatives" guarantee - this is the core value proposition',
      'Know the formula: false positive rate ~ (1 - e^(-kn/m))^k',
      'Rule of thumb: 10 bits per element with 7 hash functions gives ~1% FPR',
      'Always mention that standard Bloom filters do not support deletion',
      'Discuss real systems: Cassandra SSTables, Chrome safe browsing, CDN caching',
      'Compare with alternatives like Cuckoo filters when deletion is needed'
    ],

    functionalRequirements: [
      'Add elements to the filter',
      'Test membership with guaranteed no false negatives',
      'Support configurable false positive rate',
      'Handle billions of elements with bounded memory',
      'Support serialization for network transfer',
      'Enable union of multiple Bloom filters'
    ],

    nonFunctionalRequirements: [
      'Space: 10 bits per element for 1% FPR (vs 64+ bits for hash sets)',
      'Insert time: O(k) where k is number of hash functions',
      'Lookup time: O(k) with high cache efficiency',
      'False positive rate: Configurable, typically 0.1% to 5%',
      'False negative rate: Exactly 0% (guaranteed)',
      'Scalability: Support billions of elements in megabytes of memory'
    ],

    dataModel: {
      description: 'Bloom filter bit array and hash function mechanics',
      schema: `Bloom Filter Structure:
  m = bit array size (e.g., 1,000,000 bits = 125 KB)
  k = number of hash functions (e.g., 7)
  n = number of inserted elements

Bit Array (m = 16 for illustration):
  Index:  0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
  Bits:  [0][0][0][0][0][0][0][0][0][0][0][0][0][0][0][0]

Insert "apple" (k=3 hash functions):
  h1("apple") % 16 = 3
  h2("apple") % 16 = 7
  h3("apple") % 16 = 12
  Bits:  [0][0][0][1][0][0][0][1][0][0][0][0][1][0][0][0]

Insert "banana":
  h1("banana") % 16 = 1
  h2("banana") % 16 = 7   (already set - collision)
  h3("banana") % 16 = 14
  Bits:  [0][1][0][1][0][0][0][1][0][0][0][0][1][0][1][0]

Query "cherry" → h1=3, h2=14, h3=9:
  Bit 3=1, Bit 14=1, Bit 9=0 → DEFINITELY NOT IN SET

Query "grape" → h1=3, h2=7, h3=12:
  Bit 3=1, Bit 7=1, Bit 12=1 → PROBABLY IN SET (false positive!)

Sizing Formula:
  Optimal m = -n * ln(p) / (ln(2))^2
  Optimal k = (m/n) * ln(2)
  Where p = desired false positive rate`
    },

    apiDesign: {
      description: 'Bloom filter operations interface',
      endpoints: [
        { method: 'ADD', path: 'bloom.add(element)', params: 'element (string or bytes)', response: 'void (always succeeds)' },
        { method: 'TEST', path: 'bloom.mightContain(element)', params: 'element', response: 'boolean (true = maybe, false = definitely not)' },
        { method: 'CREATE', path: 'bloom.create(expectedElements, fpRate)', params: 'n, p', response: 'New Bloom filter with optimal m and k' },
        { method: 'MERGE', path: 'bloom.union(otherFilter)', params: 'another Bloom filter', response: 'Combined filter (bitwise OR)' },
        { method: 'STATS', path: 'bloom.getStats()', params: '-', response: '{ fillRatio, estimatedFPR, elementCount }' }
      ]
    },

    keyQuestions: [
      {
        question: 'How does a Bloom filter work and why are there no false negatives?',
        answer: `**Structure**: A Bloom filter uses a bit array of m bits and k independent hash functions.

**Insert**: Hash the element with all k functions, set those k bits to 1.
**Query**: Hash the element with all k functions, check if ALL k bits are 1.

\`\`\`
Insert "hello":
  h1("hello")=2, h2("hello")=5, h3("hello")=9
  [0][0][1][0][0][1][0][0][0][1][0]
         ^         ^            ^

Query "hello":
  Check bits 2,5,9 → all 1 → PROBABLY IN SET ✓

Query "world":
  h1("world")=1, h2("world")=5, h3("world")=8
  Check bit 1 → 0 → DEFINITELY NOT IN SET ✗
\`\`\`

**Why no false negatives**: If an element was inserted, its k bits were set to 1. Bits are NEVER cleared (set back to 0). Therefore, all k bits will still be 1 when queried.

**Why false positives exist**: Multiple elements can set the same bits. After many insertions, random combinations of set bits can match an element that was never inserted.

**False positive rate formula**: FPR ≈ (1 - e^(-kn/m))^k
- As fill ratio increases, FPR increases
- Optimal k = (m/n) * ln(2) ≈ 0.693 * (m/n)`
      },
      {
        question: 'How do you size a Bloom filter for a specific use case?',
        answer: `**Sizing process**:

1. Determine expected number of elements (n)
2. Choose acceptable false positive rate (p)
3. Calculate optimal bit array size: m = -n * ln(p) / (ln(2))^2
4. Calculate optimal hash functions: k = (m/n) * ln(2)

**Example - URL deduplication for web crawler**:
\`\`\`
n = 1 billion URLs
p = 1% false positive rate (0.01)

m = -1,000,000,000 * ln(0.01) / (ln(2))^2
m = -1,000,000,000 * (-4.605) / 0.4805
m ≈ 9.58 billion bits ≈ 1.14 GB

k = (9.58/1) * 0.693 ≈ 7 hash functions

Compare alternatives:
  Hash set (64-bit hashes): 1B * 8 bytes = 8 GB
  Bloom filter: 1.14 GB (7x smaller!)
  Trie: 10-50 GB depending on URL lengths
\`\`\`

**Quick reference table**:
| Elements | FPR  | Memory     | Hash Functions |
|----------|------|------------|----------------|
| 1M       | 1%   | 1.14 MB   | 7              |
| 10M      | 1%   | 11.4 MB   | 7              |
| 100M     | 1%   | 114 MB    | 7              |
| 1B       | 1%   | 1.14 GB   | 7              |
| 1B       | 0.1% | 1.71 GB   | 10             |

**Rule of thumb**: ~10 bits per element for 1% FPR, ~15 bits for 0.1%`
      },
      {
        question: 'Where are Bloom filters used in real distributed systems?',
        answer: `**1. Cassandra - SSTable Lookup Optimization**:
\`\`\`
Read Request for key "user:123"
       │
       ▼
  ┌─────────────┐
  │ Memtable    │──── Key in memory? YES → Return
  └──────┬──────┘
         │ NO
         ▼
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │ SSTable 1   │  │ SSTable 2   │  │ SSTable 3   │
  │ Bloom: NO   │  │ Bloom: YES  │  │ Bloom: NO   │
  │ (skip disk) │  │ (read disk) │  │ (skip disk) │
  └─────────────┘  └─────────────┘  └─────────────┘

  Without Bloom: Read all 3 SSTables from disk (3 I/O ops)
  With Bloom: Read only 1 SSTable (1 I/O op) - 67% fewer reads
\`\`\`

**2. Google Chrome - Safe Browsing**:
- Local Bloom filter of known malicious URLs (~25K entries)
- If filter says NO → URL is safe, no network request needed
- If filter says MAYBE → Make API call to verify
- Saves millions of unnecessary network requests

**3. CDN Cache Routing**:
- Each edge server has a Bloom filter of its cached objects
- Router checks filters to find which server has the content
- Avoids checking all servers on cache miss

**4. Medium - Article Recommendation**:
- Per-user Bloom filter of read articles
- Filter out already-read articles from recommendations
- Occasional false positive (skip an unread article) is acceptable

**5. Bitcoin - SPV Node Transaction Filtering**:
- Lightweight nodes send Bloom filter of their addresses
- Full nodes filter transactions through it, send only matching ones
- Reduces bandwidth for mobile wallets`
      },
      {
        question: 'What are the limitations of Bloom filters and what alternatives exist?',
        answer: `**Bloom Filter Limitations**:
1. **No deletion**: Cannot remove elements (clearing bits may affect other elements)
2. **No enumeration**: Cannot list contained elements
3. **Fixed size**: Must estimate capacity upfront
4. **False positives**: Cannot eliminate completely, only reduce

**Alternatives**:

**Counting Bloom Filter**:
- Replace each bit with a counter (typically 4 bits)
- Increment on insert, decrement on delete
- 4x more memory than standard Bloom filter
- Risk: counter overflow can cause false negatives

**Cuckoo Filter** (Fan et al., 2014):
\`\`\`
Standard Bloom:  [bit array with k hash positions]
Cuckoo Filter:   [bucket array with fingerprints]

  Bucket 0: [fp1][fp2][  ][  ]
  Bucket 1: [fp3][  ][  ][  ]
  Bucket 2: [fp4][fp5][fp6][  ]
  ...

  Insert: Store fingerprint in one of two candidate buckets
  Delete: Remove fingerprint from bucket
  Lookup: Check both candidate buckets for fingerprint
\`\`\`
- Supports deletion
- Better space efficiency at low FPR (< 3%)
- Used in: MemC3 (optimized Memcached)

**Quotient Filter**:
- Compact hash table supporting deletion
- Cache-friendly (sequential memory layout)
- Supports merging and resizing
- Used in: Splunk for indexing

**Comparison**:
| Feature | Bloom | Counting Bloom | Cuckoo | Quotient |
|---------|-------|----------------|--------|----------|
| Deletion | No | Yes | Yes | Yes |
| Space (1% FPR) | 9.6 bits/el | 38.4 bits/el | 7.2 bits/el | 10.7 bits/el |
| Lookup time | O(k) | O(k) | O(1) avg | O(1) avg |
| Merge support | Yes (OR) | Yes (add) | No | Yes |`
      }
    ],

    basicImplementation: {
      title: 'Simple Bloom Filter',
      description: 'Basic Bloom filter with a fixed-size bit array and k hash functions using double hashing technique. Suitable for single-machine use with known capacity.',
      svgTemplate: 'bloomFilterBasic',
      problems: [
        'Fixed capacity - cannot grow after creation',
        'No deletion support',
        'Must estimate element count upfront',
        'False positive rate increases as filter fills'
      ]
    },

    advancedImplementation: {
      title: 'Scalable Bloom Filter with Distributed Support',
      description: 'Layered Bloom filters that grow dynamically, with tightening FPR per layer. Supports serialization for network transfer and merging across distributed nodes.',
      svgTemplate: 'bloomFilterAdvanced',
      keyPoints: [
        'Scalable Bloom filter chains multiple filters with decreasing FPR',
        'New filter added when current fill ratio exceeds threshold',
        'Overall FPR bounded by geometric series sum',
        'Serializable for distribution across cluster nodes',
        'Union operation enables combining filters from different shards'
      ]
    },

    discussionPoints: [
      {
        topic: 'Choosing the Right Probabilistic Data Structure',
        points: [
          'Bloom filter: Insert and membership test only, no deletion needed',
          'Counting Bloom filter: Need deletion but can afford 4x memory',
          'Cuckoo filter: Need deletion with good space efficiency',
          'HyperLogLog: Count distinct elements (cardinality estimation)',
          'Count-Min Sketch: Frequency estimation of elements'
        ]
      },
      {
        topic: 'Bloom Filter Sizing Mistakes',
        points: [
          'Underestimating element count leads to high FPR at scale',
          'Not accounting for growth - use scalable Bloom filters for unbounded sets',
          'Too many hash functions wastes computation and fills the filter faster',
          'Too few hash functions gives poor FPR for the memory used',
          'Not monitoring fill ratio in production'
        ]
      },
      {
        topic: 'Interview Talking Points',
        points: [
          'Start by explaining the problem Bloom filters solve: expensive lookups',
          'Draw the bit array and walk through insert/query step by step',
          'Mention the mathematical guarantee of zero false negatives',
          'Tie to a real system: Cassandra SSTable reads, browser safe browsing',
          'Discuss trade-offs: space vs accuracy, and when false positives are acceptable'
        ]
      }
    ]
  },

  {
    id: 'data-partitioning',
    title: 'Data Partitioning',
    icon: 'grid',
    color: '#3b82f6',
    questions: 9,
    description: 'Horizontal, vertical, and directory-based sharding strategies for scaling databases.',
    introduction: `**Data partitioning** (also called sharding) is the technique of splitting a large dataset across multiple machines so that no single machine has to store or process the entire dataset. It is one of the most important concepts in scaling databases beyond the capacity of a single server.

There are three primary partitioning strategies: **horizontal partitioning** (splitting rows), **vertical partitioning** (splitting columns), and **directory-based partitioning** (using a lookup service). Each has distinct trade-offs around query patterns, data distribution, and operational complexity.

Every large-scale system uses data partitioning. **Instagram** shards user data across thousands of PostgreSQL databases. **Uber** partitions trip data by geography and time. **Slack** uses Vitess to shard MySQL for per-workspace isolation. Understanding how to choose a partition key, handle cross-partition queries, and rebalance data is critical for system design interviews.`,

    concepts: [
      'Horizontal partitioning (row-based sharding)',
      'Vertical partitioning (column-based splitting)',
      'Directory-based partitioning with lookup service',
      'Hash-based vs range-based partitioning',
      'Composite partitioning (hash + range)',
      'Hot spot detection and mitigation',
      'Partition rebalancing strategies',
      'Cross-partition query handling'
    ],

    tips: [
      'Always discuss the choice of partition key first - it determines everything else',
      'Explain the trade-off: sharding enables scale but adds complexity for joins and transactions',
      'Mention that most systems try read replicas and caching before resorting to sharding',
      'Know how to handle cross-shard queries: scatter-gather, denormalization, or application-level joins',
      'Discuss rebalancing: fixed partitions vs dynamic splitting vs consistent hashing',
      'Be ready to calculate partition sizes: total data / partition count and growth projections'
    ],

    functionalRequirements: [
      'Distribute data across multiple database nodes',
      'Route queries to the correct partition efficiently',
      'Support adding and removing partitions without downtime',
      'Handle cross-partition queries when necessary',
      'Maintain data consistency within and across partitions',
      'Support partition-level backup and recovery'
    ],

    nonFunctionalRequirements: [
      'Even data distribution: < 20% variance across partitions',
      'Query routing latency: < 1ms overhead',
      'Rebalancing: < 5% performance impact during migration',
      'Scalability: Support 100+ partitions',
      'Availability: Individual partition failure does not affect others',
      'Throughput: Linear scaling with partition count for single-partition queries'
    ],

    dataModel: {
      description: 'Data partitioning strategies and their layouts',
      schema: `Horizontal Partitioning (most common):
  Original Table: users (10M rows)

  Shard 1 (user_id 1-2.5M):    Shard 2 (user_id 2.5M-5M):
  | id  | name    | country |  | id   | name   | country |
  | 1   | Alice   | US      |  | 2.5M | Dave   | UK      |
  | 2   | Bob     | UK      |  | 2.5M+| Eve    | JP      |
  | ... | ...     | ...     |  | ...  | ...    | ...     |

Vertical Partitioning:
  User Core (fast, small):     User Profile (larger, less frequent):
  | id | name  | email    |   | id | bio   | avatar_url | settings |
  | 1  | Alice | a@b.com  |   | 1  | ...   | s3://...   | {...}    |

Directory-Based Partitioning:
  ┌──────────────┐     ┌──────────────┐
  │   Lookup     │     │  Partition 1  │
  │   Service    │────▶│  (US users)   │
  │              │     └──────────────┘
  │  user → shard│     ┌──────────────┐
  │  mapping     │────▶│  Partition 2  │
  └──────────────┘     │  (EU users)   │
                       └──────────────┘

Partition Key Selection:
  user_id:    Even distribution, all user data co-located
  country:    Geographic locality but potential hot spots
  created_at: Time-range queries but recent data = hot partition
  hash(user_id): Even distribution but no range queries`
    },

    apiDesign: {
      description: 'Partition management and routing operations',
      endpoints: [
        { method: 'ROUTE', path: 'router.getPartition(partitionKey)', params: 'partition key value', response: 'Target partition/shard identifier' },
        { method: 'QUERY', path: 'shard.query(sql, partitionKey)', params: 'SQL, partition key', response: 'Results from single partition' },
        { method: 'SCATTER', path: 'router.scatterGather(sql)', params: 'SQL without partition key', response: 'Merged results from all partitions' },
        { method: 'MIGRATE', path: 'admin.rebalance(fromShard, toShard, keyRange)', params: 'source, target, key range', response: 'Migration status and progress' },
        { method: 'STATUS', path: 'admin.getPartitionStats()', params: '-', response: 'Per-partition row count, size, QPS' }
      ]
    },

    keyQuestions: [
      {
        question: 'What are the different data partitioning strategies and when should you use each?',
        answer: `**1. Horizontal Partitioning (Sharding)**:
Split rows across multiple databases based on a partition key.

\`\`\`
Original: users table (10M rows, single DB)

After sharding by user_id % 4:
  Shard 0: user_id 0,4,8,...  (2.5M rows)
  Shard 1: user_id 1,5,9,...  (2.5M rows)
  Shard 2: user_id 2,6,10,.. (2.5M rows)
  Shard 3: user_id 3,7,11,.. (2.5M rows)
\`\`\`
- Use when: Table has too many rows for one server
- Pro: Each shard is a complete, functional database
- Con: Cross-shard joins are expensive

**2. Vertical Partitioning**:
Split columns into separate tables/databases.

\`\`\`
users_core: id, name, email        (frequently accessed)
users_profile: id, bio, avatar_url (infrequently accessed, large)
users_settings: id, preferences    (rarely accessed)
\`\`\`
- Use when: Some columns are accessed much more frequently than others
- Pro: Reduces I/O for common queries
- Con: Requires joins to reassemble full record

**3. Directory-Based Partitioning**:
A lookup service maps keys to partitions.

\`\`\`
  App ──▶ Directory Service ──▶ Shard N
          "user:123 → shard:2"
\`\`\`
- Use when: Partition logic is complex or changes frequently
- Pro: Most flexible, can move users between shards easily
- Con: Directory is a single point of failure and latency`
      },
      {
        question: 'How do you choose the right partition key?',
        answer: `**Partition key selection** is the most critical decision in sharding. The wrong key leads to hot spots, cross-shard queries, and rebalancing nightmares.

**Selection criteria**:
1. **High cardinality**: Many distinct values for even distribution
2. **Query alignment**: Most queries include the partition key
3. **Even distribution**: No value should be much more common than others
4. **Growth pattern**: Distribution stays even as data grows

\`\`\`
Social Media Example:
  ┌──────────────┬─────────────┬──────────────────────┐
  │ Partition Key │ Distribution│ Trade-off            │
  ├──────────────┼─────────────┼──────────────────────┤
  │ user_id      │ Even        │ Best for user-centric│
  │              │             │ queries, poor for    │
  │              │             │ global feeds         │
  ├──────────────┼─────────────┼──────────────────────┤
  │ post_id      │ Even        │ Good for post lookup │
  │              │             │ poor for "my posts"  │
  ├──────────────┼─────────────┼──────────────────────┤
  │ country      │ UNEVEN      │ US shard = hot spot! │
  │              │             │ Good for data        │
  │              │             │ locality laws (GDPR) │
  ├──────────────┼─────────────┼──────────────────────┤
  │ created_date │ Time-skewed │ Recent = hot, good   │
  │              │             │ for time-range queries│
  └──────────────┴─────────────┴──────────────────────┘
\`\`\`

**Composite partition keys**: Combine two fields for better distribution
- \`(user_id, month)\` → Spreads one user's data across time-based partitions
- \`(region, user_id)\` → Geographic + user isolation

**Anti-patterns**:
- Auto-increment ID with range partitioning → All new writes hit last partition
- Low-cardinality key (status, country) → Extreme imbalance
- Key not in common queries → Every query is cross-shard`
      },
      {
        question: 'How do you handle cross-partition queries and joins?',
        answer: `Cross-partition operations are the biggest challenge of sharding. There are several strategies:

**1. Scatter-Gather**:
\`\`\`
Query: "SELECT * FROM orders WHERE total > 100 ORDER BY date LIMIT 10"

  App Server
     │
     ├──▶ Shard 1: Top 10 results (total > 100)
     ├──▶ Shard 2: Top 10 results (total > 100)
     ├──▶ Shard 3: Top 10 results (total > 100)
     │
     ▼
  Merge + Sort + Limit 10 (application-level)

  Latency = slowest shard + merge time
  Fan-out increases with shard count
\`\`\`

**2. Denormalization**:
- Store redundant data to avoid cross-shard joins
- Example: Store user_name in orders table instead of joining with users
- Trade-off: Storage cost and update complexity for read performance

**3. Global Tables**:
- Small, frequently-joined tables replicated to every shard
- Example: countries, currencies, categories
- Works only for small, rarely-updated reference data

**4. Application-Level Joins**:
\`\`\`
// Instead of SQL JOIN:
users = userShard.query("SELECT * FROM users WHERE id IN (?)", userIds)
orders = orderShard.query("SELECT * FROM orders WHERE user_id IN (?)", userIds)
// Merge in application code
result = join(users, orders, on: 'user_id')
\`\`\`

**5. Dedicated Analytics Store**:
- Use CDC (Change Data Capture) to replicate to a data warehouse
- Run complex queries against the warehouse, not the sharded OLTP database
- Example: Shard MySQL for writes → Replicate to BigQuery for analytics`
      },
      {
        question: 'How do you rebalance partitions when data distribution becomes uneven?',
        answer: `**Why rebalancing is needed**:
- Data growth makes some partitions too large
- Traffic patterns shift, creating hot spots
- New nodes are added or old nodes are removed

**Strategy 1: Fixed Number of Partitions**:
\`\`\`
Pre-create many partitions, assign multiple to each node:

Initial (3 nodes, 12 partitions):
  Node A: [P0][P1][P2][P3]
  Node B: [P4][P5][P6][P7]
  Node C: [P8][P9][P10][P11]

Add Node D (move some partitions):
  Node A: [P0][P1][P2]
  Node B: [P4][P5][P6]
  Node C: [P8][P9][P10]
  Node D: [P3][P7][P11]    ← Took one from each

Used by: Riak, Elasticsearch, Couchbase
\`\`\`

**Strategy 2: Dynamic Splitting/Merging**:
\`\`\`
Split when partition exceeds size threshold:

Before: [P0: 0-1000] (too large!)
After:  [P0: 0-500] [P0b: 501-1000]

Merge when adjacent partitions are small:
Before: [P5: 5000-5100] [P6: 5100-5200] (both tiny)
After:  [P5: 5000-5200]

Used by: HBase, MongoDB (auto-split at 64MB)
\`\`\`

**Strategy 3: Consistent Hashing with Virtual Nodes**:
- Each node owns multiple virtual nodes on hash ring
- Add node → assign it some vnodes, data migrates automatically
- Remove node → redistribute its vnodes to remaining nodes
- Used by: Cassandra, DynamoDB

**Rebalancing best practices**:
- Migrate data in the background, keep serving reads from old location
- Use dual-write during migration to prevent data loss
- Throttle migration to avoid saturating network
- Verify data integrity with checksums after migration`
      },
      {
        question: 'How does Instagram shard its PostgreSQL databases?',
        answer: `**Instagram's Sharding Strategy** (real-world case study):

\`\`\`
Architecture Overview:
  ┌─────────┐
  │  Django  │  Application Layer
  │  App     │  (knows shard mapping)
  └────┬────┘
       │
  ┌────▼────────────────────────────────────┐
  │         Shard Router (pgbouncer)         │
  │  user_id → shard_id → database server   │
  └────┬──────────┬──────────┬──────────────┘
       │          │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
  │Shard 0 │ │Shard 1 │ │Shard 2 │  ... thousands
  │Primary │ │Primary │ │Primary │
  │+ Replica│ │+ Replica│ │+ Replica│
  └────────┘ └────────┘ └────────┘
\`\`\`

**Key decisions**:
1. **Partition key**: user_id (all user data co-located)
2. **ID generation**: Snowflake-like IDs embedding shard info
   - Timestamp (41 bits) + Shard ID (13 bits) + Sequence (10 bits)
   - Can determine shard from ID without lookup
3. **Logical shards > Physical shards**:
   - Thousands of logical shards mapped to fewer physical servers
   - Move logical shards between physical servers for rebalancing
4. **PgBouncer**: Connection pooling to handle thousands of connections

**Lessons**:
- Embed shard info in IDs to avoid lookup service
- Use logical sharding for flexibility in physical mapping
- Keep shard-local queries > 99% of traffic
- Plan for rebalancing from day one`
      }
    ],

    basicImplementation: {
      title: 'Simple Hash-Based Sharding',
      description: 'Modular hash partitioning with a fixed number of shards. Each query is routed to shard = hash(key) % N. Simple but inflexible when N changes.',
      svgTemplate: 'simpleSharding',
      problems: [
        'Adding a shard requires rehashing and migrating most data',
        'No support for range queries on the partition key',
        'Hot spots if hash distribution is uneven',
        'Cross-shard queries require scatter-gather'
      ]
    },

    advancedImplementation: {
      title: 'Dynamic Partitioning with Consistent Hashing',
      description: 'Consistent hashing ring with virtual nodes, automatic partition splitting/merging, background rebalancing, and a partition metadata service for routing.',
      svgTemplate: 'dynamicSharding',
      keyPoints: [
        'Consistent hashing minimizes data movement when adding/removing nodes',
        'Virtual nodes ensure even distribution across heterogeneous hardware',
        'Partition metadata service tracks current shard assignments',
        'Background rebalancing with throttling prevents performance degradation',
        'Dual-write during migration ensures zero data loss'
      ]
    },

    discussionPoints: [
      {
        topic: 'Sharding vs Other Scaling Strategies',
        points: [
          'Read replicas: Scale reads without complexity of sharding',
          'Vertical partitioning: Separate hot columns before horizontal sharding',
          'Caching: Reduce load 80-90% before considering sharding',
          'Sharding: Last resort for write scaling beyond single-node capacity',
          'Consider managed solutions: Aurora, Spanner, CockroachDB before DIY sharding'
        ]
      },
      {
        topic: 'Operational Challenges',
        points: [
          'Schema migrations must be applied to all shards',
          'Backup and restore becomes per-shard operations',
          'Monitoring must track per-shard metrics for hot spot detection',
          'Connection pooling is critical with many shards',
          'Testing must cover cross-shard edge cases'
        ]
      },
      {
        topic: 'Real-World Sharding Examples',
        points: [
          'Instagram: PostgreSQL sharded by user_id with Snowflake IDs',
          'Slack: Vitess over MySQL for per-workspace sharding',
          'Pinterest: MySQL sharded by object_id with custom routing',
          'Notion: PostgreSQL sharded by workspace_id',
          'Discord: Cassandra for messages, ScyllaDB migration for performance'
        ]
      }
    ]
  },

  {
    id: 'database-indexes',
    title: 'Database Indexes',
    icon: 'search',
    color: '#3b82f6',
    questions: 8,
    description: 'B-tree, hash, composite, and covering indexes for query optimization.',
    introduction: `**Database indexes** are data structures that speed up data retrieval at the cost of additional storage and write overhead. Without indexes, a database must perform a full table scan for every query, reading potentially millions of rows to find matching results.

The most common index type is the **B-tree** (or B+ tree), which organizes data in a balanced tree structure for O(log N) lookups. **Hash indexes** provide O(1) exact-match lookups. **Composite indexes** combine multiple columns for multi-condition queries. **Covering indexes** include all queried columns, eliminating the need to access the main table.

In system design interviews, indexing knowledge demonstrates that you understand database internals and can design efficient data access patterns. **A single missing index can degrade query performance from milliseconds to minutes.** Knowing when to add indexes, how they work internally, and their trade-offs is essential for building performant systems at scale.`,

    concepts: [
      'B-tree and B+ tree structure and operations',
      'Hash indexes for equality lookups',
      'Composite indexes and leftmost prefix rule',
      'Covering indexes to avoid table lookups',
      'Clustered vs non-clustered indexes',
      'Partial indexes for filtered subsets',
      'Index selectivity and cardinality',
      'Write amplification and index maintenance cost'
    ],

    tips: [
      'Always mention the trade-off: faster reads but slower writes and more storage',
      'Know the leftmost prefix rule for composite indexes cold - it comes up constantly',
      'Discuss EXPLAIN/EXPLAIN ANALYZE as the tool for verifying index usage',
      'Mention that over-indexing is as bad as under-indexing for write-heavy workloads',
      'Understand clustered vs non-clustered: clustered determines physical row order',
      'Be ready to design indexes for specific query patterns in a case study'
    ],

    functionalRequirements: [
      'Speed up SELECT queries with WHERE, JOIN, and ORDER BY clauses',
      'Support equality, range, prefix, and multi-column lookups',
      'Enforce uniqueness constraints efficiently',
      'Enable sorted access without additional sorting step',
      'Support index-only scans for covered queries',
      'Allow partial indexing for filtered subsets'
    ],

    nonFunctionalRequirements: [
      'Read improvement: 100x-10000x for indexed vs full table scan',
      'Write overhead: 10-30% slower inserts/updates per index',
      'Storage: Typically 10-30% of table size per index',
      'Index build time: Minutes to hours for large tables',
      'Maintenance: Auto-rebalancing on B-tree operations',
      'Memory: Hot index pages should fit in buffer pool'
    ],

    dataModel: {
      description: 'Index structures and their internal organization',
      schema: `B+ Tree Index (most common):
                  ┌─────────────┐
                  │  [30 | 60]  │     Root Node
                  └──┬────┬──┬──┘
              ┌──────┘    │  └──────┐
              ▼           ▼         ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │[10|20|30]│ │[40|50|60]│ │[70|80|90]│  Leaf Nodes
        └──┬──┬──┬─┘ └──┬──┬──┬─┘ └──┬──┬──┬─┘  (linked list)
           │  │  │      │  │  │      │  │  │
          row row row  row row row  row row row   → Table Rows

  Lookup "WHERE id = 50": Root → Middle branch → Leaf → 1 row
  Range "WHERE id BETWEEN 20 AND 50": Navigate to 20, scan linked list to 50
  Complexity: O(log_B N) where B = branching factor (~100-500)

Hash Index:
  hash(email) → bucket → [row pointer]
  O(1) for exact match: WHERE email = 'alice@example.com'
  Cannot do: WHERE email > 'a%' (no range support)

Composite Index on (user_id, created_at):
  Leftmost Prefix Rule:
  ✅ WHERE user_id = 123
  ✅ WHERE user_id = 123 AND created_at > '2024-01-01'
  ✅ WHERE user_id = 123 ORDER BY created_at
  ❌ WHERE created_at > '2024-01-01' (skips first column)

Covering Index on (user_id, email, name):
  SELECT email, name FROM users WHERE user_id = 123
  → Index contains all needed columns, no table lookup!`
    },

    apiDesign: {
      description: 'Common index operations and SQL syntax',
      endpoints: [
        { method: 'CREATE', path: 'CREATE INDEX idx_email ON users(email)', params: 'column(s)', response: 'B-tree index on email column' },
        { method: 'CREATE', path: 'CREATE INDEX idx_composite ON orders(user_id, created_at)', params: 'multiple columns', response: 'Composite B-tree index' },
        { method: 'CREATE', path: 'CREATE UNIQUE INDEX idx_unique ON users(email)', params: 'column', response: 'Unique constraint with index' },
        { method: 'ANALYZE', path: 'EXPLAIN ANALYZE SELECT * FROM users WHERE email = ?', params: 'query', response: 'Query plan showing index usage and timing' },
        { method: 'DROP', path: 'DROP INDEX idx_email', params: 'index name', response: 'Removes index, reclaims storage' }
      ]
    },

    keyQuestions: [
      {
        question: 'How does a B+ tree index work internally?',
        answer: `**B+ tree** is a self-balancing tree optimized for disk-based storage systems:

\`\`\`
Structure (branching factor B = 4):

Level 0 (Root):    [  30  |  60  |  90  ]
                   /    |      |      \\
Level 1:    [10|20] [40|50] [70|80] [100|110]
              |  |    |  |    |  |     |   |
Level 2:    [leaf nodes with data pointers]
  (Leaves)   10→r1  20→r2  30→r3  40→r4 ...
              ↔      ↔      ↔      ↔
            (doubly linked list for range scans)
\`\`\`

**Key properties**:
- All data pointers are in leaf nodes (not internal nodes)
- Leaf nodes form a linked list for efficient range scans
- Tree is always balanced: same depth for all leaves
- Branching factor of 100-500 means 3-4 levels for billions of rows

**Lookup example** (find id = 45):
1. Root: 45 > 30, 45 < 60 → go to middle child
2. Level 1: 45 > 40, 45 < 50 → go to correct leaf
3. Leaf: Find 45 → return row pointer
4. Total: 3 disk reads (vs millions for full scan)

**Performance math**:
- 1 billion rows, branching factor 500
- Tree depth = log_500(1,000,000,000) ≈ 3.4 → 4 levels
- 4 disk reads to find any row among 1 billion
- With root and level 1 cached in memory: 2 disk reads`
      },
      {
        question: 'What is the leftmost prefix rule for composite indexes?',
        answer: `A **composite index** on (A, B, C) sorts data by A first, then B within each A value, then C within each (A,B) pair. The index can only be used when the query includes a leftmost prefix of the columns.

\`\`\`
Index on orders(user_id, status, created_at):

Internal sort order:
  user_id=1, status='active',   created_at='2024-01-01'
  user_id=1, status='active',   created_at='2024-01-15'
  user_id=1, status='complete', created_at='2024-01-10'
  user_id=2, status='active',   created_at='2024-02-01'
  user_id=2, status='pending',  created_at='2024-01-20'

Query Usage:
  ✅ WHERE user_id = 1
     → Uses index (first column)

  ✅ WHERE user_id = 1 AND status = 'active'
     → Uses index (first two columns)

  ✅ WHERE user_id = 1 AND status = 'active'
     AND created_at > '2024-01-01'
     → Uses full index (all three columns)

  ✅ WHERE user_id = 1 ORDER BY status
     → Uses index for both filter and sort

  ❌ WHERE status = 'active'
     → Cannot use index (skips user_id)

  ❌ WHERE status = 'active' AND created_at > '2024-01-01'
     → Cannot use index (skips user_id)

  ⚠️ WHERE user_id = 1 AND created_at > '2024-01-01'
     → Uses index for user_id only (gap in prefix)
\`\`\`

**Design implication**: Order composite index columns by:
1. Equality conditions first (WHERE col = value)
2. Range conditions last (WHERE col > value)
3. Most selective (highest cardinality) columns first`
      },
      {
        question: 'What is the difference between clustered and non-clustered indexes?',
        answer: `**Clustered Index**: Determines the physical order of rows on disk. The table IS the index.

**Non-Clustered Index**: Separate structure with pointers back to the table rows.

\`\`\`
Clustered Index (one per table):
  ┌────────────────────────────────┐
  │         B+ Tree                │
  │     (sorted by PK)            │
  │            │                   │
  │    ┌───────┴───────┐          │
  │    ▼               ▼          │
  │ [id=1,name=Alice] [id=2,name=Bob]  ← Actual rows
  │ [id=3,name=Carol] [id=4,name=Dave]   in leaf nodes
  └────────────────────────────────┘
  Rows are physically sorted by the clustered index key

Non-Clustered Index:
  ┌────────────────────────┐
  │   Secondary B+ Tree    │
  │   (sorted by email)    │
  │          │             │
  │   ┌──────┴──────┐     │
  │   ▼              ▼    │
  │ [alice@→PK:1] [bob@→PK:2]  ← Pointers to rows
  │ [carol@→PK:3] [dave@→PK:4]
  └────────────────────────┘
         │
         ▼ (bookmark lookup)
  ┌────────────────────────┐
  │   Clustered Index      │
  │   (find actual row)    │
  └────────────────────────┘
\`\`\`

**Key differences**:
| Aspect | Clustered | Non-Clustered |
|--------|-----------|---------------|
| Per table | Exactly 1 | Many (up to ~250) |
| Leaf data | Full row | Pointer to row |
| Range scan | Very fast (sequential I/O) | Slower (random I/O for each row) |
| Insert order | Must maintain sort | Append anywhere |
| Size | IS the table | 10-30% of table |

**Covering index** avoids the bookmark lookup by including all needed columns in the non-clustered index itself:
\`CREATE INDEX idx ON users(email) INCLUDE (name, phone)\``
      },
      {
        question: 'How do you decide which indexes to create for a given workload?',
        answer: `**Index design process**:

\`\`\`
Step 1: Identify Critical Queries
  ┌─────────────────────────────────────────┐
  │ Query Log Analysis                      │
  │                                         │
  │ Top queries by frequency:               │
  │  1. SELECT * FROM orders                │
  │     WHERE user_id = ? ORDER BY date     │
  │     (50K queries/hour)                  │
  │                                         │
  │  2. SELECT * FROM products              │
  │     WHERE category = ? AND price < ?    │
  │     (30K queries/hour)                  │
  │                                         │
  │  3. SELECT user_id, COUNT(*)            │
  │     FROM orders GROUP BY user_id        │
  │     (100 queries/hour - analytics)      │
  └─────────────────────────────────────────┘

Step 2: Design Indexes
  Query 1 → CREATE INDEX idx_orders_user_date
             ON orders(user_id, created_date DESC)
             -- Composite: filter + sort in one index

  Query 2 → CREATE INDEX idx_products_cat_price
             ON products(category, price)
             -- Equality first, range second

  Query 3 → Low frequency, skip or use analytics DB

Step 3: Verify with EXPLAIN ANALYZE
  Before index: Seq Scan, 45,000ms
  After index:  Index Scan, 2ms
\`\`\`

**Decision framework**:
- Index columns in WHERE, JOIN ON, ORDER BY clauses
- High-frequency queries get indexes first
- High-cardinality columns benefit most (email > status)
- Write-heavy tables: fewer indexes (each insert updates all indexes)
- Read-heavy tables: more indexes acceptable

**Warning signs of over-indexing**:
- Write latency increasing over time
- Index storage exceeds table storage
- pg_stat_user_indexes shows indexes with zero scans
- Each index costs ~10-30% write overhead`
      }
    ],

    basicImplementation: {
      title: 'Single Column Indexes',
      description: 'Individual B-tree indexes on frequently queried columns. Simple and effective for single-condition lookups but does not optimize multi-column queries.',
      svgTemplate: 'singleColumnIndex',
      problems: [
        'Multiple single-column indexes cannot efficiently serve multi-column conditions',
        'Database may choose wrong index for complex queries',
        'Still requires table lookup for non-indexed columns',
        'No coverage for ORDER BY optimization'
      ]
    },

    advancedImplementation: {
      title: 'Comprehensive Indexing Strategy',
      description: 'Workload-driven composite indexes, covering indexes for hot queries, partial indexes for filtered subsets, and expression indexes for computed conditions.',
      svgTemplate: 'advancedIndexing',
      keyPoints: [
        'Composite indexes designed with equality-first-range-last rule',
        'Covering indexes eliminate bookmark lookups for top queries',
        'Partial indexes reduce size for filtered subsets (e.g., active users only)',
        'Regular EXPLAIN ANALYZE audits verify index effectiveness',
        'Unused index cleanup prevents unnecessary write overhead'
      ]
    },

    discussionPoints: [
      {
        topic: 'Index Design Principles',
        points: [
          'Equality columns before range columns in composite indexes',
          'Include ORDER BY columns to avoid sort operations',
          'Use covering indexes for your hottest queries',
          'Partial indexes for filtered subsets (WHERE active = true)',
          'Expression indexes for computed lookups (LOWER(email))'
        ]
      },
      {
        topic: 'Index Anti-Patterns',
        points: [
          'Indexing every column "just in case"',
          'Low-cardinality indexes (boolean columns with 50/50 split)',
          'Redundant indexes (idx on (A) when idx on (A,B) exists)',
          'Not monitoring index usage with pg_stat_user_indexes',
          'Forgetting to REINDEX after bulk data loads'
        ]
      },
      {
        topic: 'Database-Specific Index Features',
        points: [
          'PostgreSQL: GIN indexes for full-text search and JSONB',
          'PostgreSQL: GiST indexes for geometric and range types',
          'MySQL: InnoDB always has a clustered index (primary key)',
          'MongoDB: Compound indexes follow same leftmost prefix rule',
          'Elasticsearch: Inverted indexes for full-text, BKD trees for numeric'
        ]
      }
    ]
  },

  {
    id: 'proxies',
    title: 'Proxies',
    icon: 'shield',
    color: '#8b5cf6',
    questions: 7,
    description: 'Forward and reverse proxies, Layer 4 vs Layer 7, and common use cases.',
    introduction: `A **proxy** is an intermediary server that sits between clients and backend servers, forwarding requests and responses. Proxies are fundamental infrastructure components that enable load balancing, security, caching, and traffic management at scale.

There are two main types: **forward proxies** act on behalf of clients (like a VPN or corporate gateway), while **reverse proxies** act on behalf of servers (like Nginx, HAProxy, or cloud load balancers). Understanding the distinction and knowing when to use each is essential for system design.

Proxies also operate at different network layers. **Layer 4 (L4) proxies** work at the TCP/UDP transport layer and route based on IP addresses and ports. **Layer 7 (L7) proxies** work at the application layer (HTTP) and can make routing decisions based on headers, URLs, cookies, and content. Every major web architecture uses proxies, from small startups using Nginx to companies like Cloudflare proxying 20% of all web traffic.`,

    concepts: [
      'Forward proxy vs reverse proxy',
      'Layer 4 (transport) vs Layer 7 (application) proxying',
      'TLS termination at the proxy layer',
      'Content-based routing and URL rewriting',
      'Connection pooling and keep-alive management',
      'Health checking and circuit breaking',
      'Rate limiting and request throttling at the proxy',
      'Service mesh sidecar proxy pattern (Envoy)'
    ],

    tips: [
      'Draw the proxy in your architecture diagram explicitly - show where it sits in the request path',
      'Know the difference between L4 and L7 and when each is appropriate',
      'Always mention TLS termination as a key reverse proxy function',
      'Discuss Nginx, HAProxy, and Envoy as concrete technology choices',
      'Explain how reverse proxies enable zero-downtime deployments',
      'Mention service mesh (Istio/Envoy) for microservices proxy patterns'
    ],

    functionalRequirements: [
      'Route client requests to appropriate backend servers',
      'Terminate TLS and handle SSL certificate management',
      'Cache static and dynamic content at the proxy layer',
      'Perform health checks on backend servers',
      'Enable content-based routing (URL path, headers, cookies)',
      'Support WebSocket and HTTP/2 proxying'
    ],

    nonFunctionalRequirements: [
      'Latency overhead: < 1ms per proxy hop',
      'Throughput: 100K+ concurrent connections per proxy instance',
      'Availability: 99.999% with active-passive or active-active proxy pairs',
      'TLS handshake: < 50ms with session resumption',
      'Connection reuse: 90%+ backend connection reuse rate',
      'Failover: < 1 second detection and rerouting on backend failure'
    ],

    dataModel: {
      description: 'Proxy types and their placement in network architecture',
      schema: `Forward Proxy (client-side):
  ┌────────┐    ┌──────────────┐    ┌──────────┐
  │ Client │───▶│Forward Proxy │───▶│ Internet │
  │ (Corp) │    │(Squid, etc.) │    │ Servers  │
  └────────┘    └──────────────┘    └──────────┘
  Use cases: Content filtering, caching, anonymity, access control

Reverse Proxy (server-side):
  ┌────────┐    ┌──────────────┐    ┌──────────┐
  │ Client │───▶│Reverse Proxy │───▶│ Backend  │
  │        │    │(Nginx, HAProxy)│   │ Servers  │
  └────────┘    └──────────────┘    └──────────┘
  Use cases: Load balancing, TLS termination, caching, compression

Layer 4 vs Layer 7:
  L4 Proxy (TCP level):
    Sees: Source IP, Dest IP, Source Port, Dest Port
    Routes by: IP/port rules, round-robin, least connections
    Speed: Very fast (no payload inspection)

  L7 Proxy (HTTP level):
    Sees: URL path, headers, cookies, body content
    Routes by: /api → service A, /web → service B
    Speed: Slower but much more flexible`
    },

    apiDesign: {
      description: 'Reverse proxy configuration patterns (Nginx-style)',
      endpoints: [
        { method: 'ROUTE', path: '/api/* → upstream api_servers', params: 'URL path prefix', response: 'Forward to API backend pool' },
        { method: 'ROUTE', path: '/static/* → upstream cdn_origin', params: 'URL path prefix', response: 'Forward to CDN origin with caching' },
        { method: 'HEALTH', path: '/health → backend:3001/health', params: 'interval, threshold', response: 'Mark backend up/down' },
        { method: 'CACHE', path: 'proxy_cache_path /tmp levels=1:2', params: 'cache config', response: 'Cache responses for configured duration' },
        { method: 'LIMIT', path: 'limit_req zone=api rate=100r/s', params: 'zone, rate, burst', response: '429 when rate exceeded' }
      ]
    },

    keyQuestions: [
      {
        question: 'What is the difference between a forward proxy and a reverse proxy?',
        answer: `**Forward Proxy** (client-side proxy):
- Client knows it is using a proxy
- Proxy acts on behalf of the client
- Server does not know about the proxy

\`\`\`
Forward Proxy:
  ┌──────────┐      ┌───────────────┐      ┌──────────┐
  │  Client   │─────▶│ Forward Proxy │─────▶│  Server  │
  │  Browser  │      │ (client side) │      │          │
  │ config:   │      │               │      │ sees IP  │
  │ proxy=... │      │ - Filters     │      │ of proxy │
  └──────────┘      │ - Caches      │      └──────────┘
                     │ - Anonymizes  │
                     └───────────────┘

Use cases:
  - Corporate firewall and content filtering
  - Caching for bandwidth savings (Squid)
  - Anonymity (hiding client IP)
  - Accessing geo-restricted content
\`\`\`

**Reverse Proxy** (server-side proxy):
- Client does not know about the proxy (talks to proxy as if it were the server)
- Proxy acts on behalf of the server
- Client sees only the proxy's IP/domain

\`\`\`
Reverse Proxy:
  ┌──────────┐      ┌───────────────┐      ┌──────────┐
  │  Client   │─────▶│ Reverse Proxy │──┬──▶│ Server 1 │
  │           │      │ (server side) │  │   └──────────┘
  │ thinks it │      │               │  │   ┌──────────┐
  │ talks to  │      │ - Load balance│  ├──▶│ Server 2 │
  │ the proxy │      │ - TLS term.   │  │   └──────────┘
  └──────────┘      │ - Cache       │  │   ┌──────────┐
                     │ - Compress    │  └──▶│ Server 3 │
                     └───────────────┘      └──────────┘

Use cases:
  - Load balancing across backends
  - SSL/TLS termination
  - Response caching and compression
  - DDoS protection, WAF
  - A/B testing, canary deployments
\`\`\`

**Key insight**: Forward proxy = client-side (hides clients), Reverse proxy = server-side (hides servers)`
      },
      {
        question: 'When should you use Layer 4 vs Layer 7 proxying?',
        answer: `**Layer 4 Proxy** operates at TCP/UDP level:

\`\`\`
L4 Proxy Decision:
  Packet arrives → Read TCP header (IP + Port)
  Route based on: dest port, source IP, connection count

  Client ──[TCP]──▶ L4 Proxy ──[TCP]──▶ Backend

  What it sees:   Source IP, Dest IP, Ports
  What it can't:  URL, headers, cookies, body

  Algorithms: Round-robin, least connections, IP hash
  Speed: ~1M+ connections/sec (no payload parsing)
\`\`\`

**Layer 7 Proxy** operates at HTTP/application level:

\`\`\`
L7 Proxy Decision:
  Request arrives → Parse HTTP request fully
  Route based on: URL path, headers, cookies, method

  Client ──[HTTP]──▶ L7 Proxy ──[HTTP]──▶ Backend

  What it sees:   Everything in the HTTP request
  Can do:         URL rewriting, header injection,
                  compression, caching, auth

  Algorithms: Content-based routing, sticky sessions,
              weighted routing, canary splitting
  Speed: ~100K requests/sec (payload inspection)
\`\`\`

**When to use L4**:
- Raw TCP/UDP proxying (database connections, gaming)
- Maximum throughput, minimal latency overhead
- Don't need content-based routing
- Non-HTTP protocols (gRPC direct, MQTT, custom TCP)

**When to use L7**:
- Microservices with URL-based routing (/api/users → user-service)
- TLS termination with SNI routing
- A/B testing, canary deployments (route 5% to new version)
- Caching HTTP responses at the proxy
- Authentication and rate limiting per API endpoint

**In practice**: Most architectures use L7 (Nginx, Envoy) for flexibility. Use L4 (HAProxy in TCP mode, NLB) only when L7 overhead is unacceptable or for non-HTTP traffic.`
      },
      {
        question: 'How does TLS termination work at a reverse proxy?',
        answer: `**TLS termination** means the proxy handles the encrypted connection with the client, then communicates with backend servers over plain HTTP (or re-encrypted HTTP).

\`\`\`
Without TLS Termination:
  Client ──[HTTPS]──▶ Server 1 (manages own TLS cert)
  Client ──[HTTPS]──▶ Server 2 (manages own TLS cert)
  Client ──[HTTPS]──▶ Server 3 (manages own TLS cert)
  Problem: Certificate management on every server

With TLS Termination at Proxy:
  Client ──[HTTPS]──▶ Reverse Proxy ──[HTTP]──▶ Server 1
                      (one TLS cert)  ──[HTTP]──▶ Server 2
                                      ──[HTTP]──▶ Server 3

  Benefits:
  ✓ One place to manage certificates
  ✓ Offload CPU-intensive TLS from backends
  ✓ Enable HTTP/2 without backend changes
  ✓ Centralized security policy

With TLS Re-encryption (end-to-end):
  Client ──[HTTPS]──▶ Proxy ──[HTTPS]──▶ Backends
                      (terminates +     (internal certs,
                       re-encrypts)      mTLS between
                                         services)
\`\`\`

**TLS termination performance**:
- TLS handshake: ~5-50ms (with session resumption: ~1-5ms)
- Proxy handles handshake, backends avoid crypto overhead
- Hardware acceleration (AES-NI) makes this very fast on modern CPUs
- A single Nginx instance can handle 10K+ TLS connections/sec

**Certificate management**:
- Let's Encrypt with auto-renewal at the proxy
- Wildcard certificates: *.example.com
- SNI (Server Name Indication): Route different domains to different backends based on TLS handshake hostname`
      },
      {
        question: 'What is a service mesh and how do sidecar proxies work?',
        answer: `A **service mesh** adds a dedicated infrastructure layer for service-to-service communication. Each service gets a **sidecar proxy** (typically Envoy) that handles all network traffic.

\`\`\`
Without Service Mesh:
  Service A ──── direct HTTP ────▶ Service B
  (handles retries, TLS, tracing, auth in app code)

With Service Mesh (Istio + Envoy):
  ┌─────────────────────┐     ┌─────────────────────┐
  │   Pod A              │     │   Pod B              │
  │ ┌─────────┐         │     │ ┌─────────┐         │
  │ │Service A│         │     │ │Service B│         │
  │ │ (app    │         │     │ │ (app    │         │
  │ │  code)  │         │     │ │  code)  │         │
  │ └────┬────┘         │     │ └────▲────┘         │
  │      │ localhost     │     │      │ localhost     │
  │ ┌────▼────┐         │     │ ┌────┴────┐         │
  │ │ Envoy   │──mTLS───┼─────┼▶│ Envoy   │         │
  │ │ Sidecar │         │     │ │ Sidecar │         │
  │ └─────────┘         │     │ └─────────┘         │
  └─────────────────────┘     └─────────────────────┘
         │                             │
         └────── Control Plane (Istio) ─┘
               (config, certs, policies)
\`\`\`

**What the sidecar proxy handles**:
- **mTLS**: Automatic encryption between all services
- **Retries and timeouts**: Configurable retry policies
- **Circuit breaking**: Stop sending to failing services
- **Load balancing**: Weighted routing, canary deployments
- **Observability**: Distributed tracing, metrics, access logs
- **Rate limiting**: Per-service and per-endpoint limits

**Trade-offs**:
- Pro: All networking concerns extracted from application code
- Pro: Language-agnostic (any service gets the same features)
- Pro: Centralized policy management
- Con: Added latency per hop (~1-3ms for sidecar)
- Con: Operational complexity (Istio control plane)
- Con: Resource overhead (one Envoy per pod)

**When to use**: Microservices architectures with 10+ services where you need consistent security, observability, and traffic management.`
      }
    ],

    basicImplementation: {
      title: 'Single Reverse Proxy (Nginx)',
      description: 'Single Nginx instance as reverse proxy handling TLS termination, static file serving, and round-robin load balancing across backend servers.',
      svgTemplate: 'singleProxy',
      problems: [
        'Single point of failure if proxy goes down',
        'Limited to one machine throughput',
        'No content-aware routing beyond basic URL matching',
        'Manual SSL certificate management'
      ]
    },

    advancedImplementation: {
      title: 'Multi-Tier Proxy Architecture',
      description: 'Global L4 load balancer (NLB/Anycast) in front of regional L7 proxy clusters (Nginx/Envoy), with auto-scaling, health checking, and service mesh for inter-service communication.',
      svgTemplate: 'multiTierProxy',
      keyPoints: [
        'L4 at the edge for high throughput and DDoS mitigation',
        'L7 proxy cluster for content-based routing and caching',
        'Service mesh sidecar proxies for inter-service communication',
        'Active-active proxy pairs eliminate single point of failure',
        'Centralized configuration management with hot-reload'
      ]
    },

    discussionPoints: [
      {
        topic: 'Proxy Technology Choices',
        points: [
          'Nginx: Most popular, great for HTTP reverse proxy and static files',
          'HAProxy: Best for L4 proxying and raw TCP load balancing',
          'Envoy: Modern, designed for service mesh and cloud-native',
          'Traefik: Auto-discovery and configuration from container orchestrators',
          'AWS ALB/NLB: Managed L7/L4 proxying in AWS'
        ]
      },
      {
        topic: 'Proxy Performance Optimization',
        points: [
          'Enable keep-alive connections to backends (connection pooling)',
          'Use HTTP/2 between proxy and client, HTTP/1.1 to backends',
          'Enable response buffering to free up backend connections quickly',
          'Use proxy-level caching for frequently requested content',
          'Tune worker processes and connection limits for hardware'
        ]
      },
      {
        topic: 'Security at the Proxy Layer',
        points: [
          'TLS termination and certificate management',
          'Web Application Firewall (WAF) rules',
          'Rate limiting and DDoS protection',
          'Header sanitization (remove internal headers)',
          'IP allowlisting and geoblocking'
        ]
      }
    ]
  },

  {
    id: 'dns-deep-dive',
    title: 'DNS Deep Dive',
    icon: 'globe',
    color: '#10b981',
    questions: 8,
    description: 'DNS resolution process, DNS-based load balancing, GeoDNS, and Anycast routing.',
    introduction: `The **Domain Name System (DNS)** is the internet's phone book, translating human-readable domain names into IP addresses. Every web request begins with a DNS lookup, making it one of the most critical and heavily queried infrastructure systems in existence.

DNS is more than simple name resolution. Modern DNS is used for **load balancing** (distributing traffic across multiple IPs), **geographic routing** (directing users to the nearest data center via GeoDNS), **failover** (removing unhealthy servers from DNS responses), and **service discovery** in microservice architectures.

Understanding DNS deeply is important for system design interviews because it is the first step in every request's lifecycle. A poorly configured DNS setup can add 100-500ms of latency to every request. Conversely, smart DNS strategies like **Anycast** (used by Cloudflare and Google Public DNS) can reduce latency to < 10ms globally. At scale, companies like Netflix, Google, and Amazon operate their own authoritative DNS infrastructure to maintain full control over resolution.`,

    concepts: [
      'Recursive vs iterative DNS resolution',
      'DNS hierarchy: root, TLD, authoritative servers',
      'Record types: A, AAAA, CNAME, MX, NS, TXT, SRV',
      'TTL (Time To Live) and caching at each level',
      'GeoDNS for geographic traffic routing',
      'Anycast DNS for low-latency global resolution',
      'DNS-based load balancing (round-robin, weighted)',
      'DNS failover and health checking'
    ],

    tips: [
      'Walk through the full resolution chain when explaining: stub → recursive → root → TLD → authoritative',
      'Know common TTL values and their trade-offs: low TTL = fast failover but more queries',
      'Mention DNS as the first step in any system design - it happens before anything else',
      'Discuss DNS propagation delays and why DNS changes do not take effect immediately',
      'Compare DNS load balancing to application load balancing and explain limitations',
      'Know the difference between Anycast and GeoDNS - both route geographically but differently'
    ],

    functionalRequirements: [
      'Translate domain names to IP addresses',
      'Support multiple record types (A, AAAA, CNAME, MX, etc.)',
      'Cache responses at multiple levels for performance',
      'Support geographic routing via GeoDNS or Anycast',
      'Enable DNS-based load balancing across multiple IPs',
      'Provide failover by removing unhealthy endpoints'
    ],

    nonFunctionalRequirements: [
      'Resolution latency: < 50ms for cached, < 200ms for uncached',
      'Availability: 100% (designed for extreme availability)',
      'Throughput: Millions of queries per second globally',
      'Propagation: TTL-dependent, typically 5 minutes to 48 hours',
      'Resilience: Tolerate root/TLD server failures via redundancy',
      'Security: DNSSEC for response authenticity, DoH/DoT for privacy'
    ],

    dataModel: {
      description: 'DNS record types and resolution flow',
      schema: `DNS Record Types:
  A Record:     example.com → 93.184.216.34 (IPv4)
  AAAA Record:  example.com → 2606:2800:220:1:... (IPv6)
  CNAME:        www.example.com → example.com (alias)
  MX Record:    example.com → mail.example.com (email)
  NS Record:    example.com → ns1.example.com (nameserver)
  TXT Record:   example.com → "v=spf1 ..." (metadata)
  SRV Record:   _http._tcp.example.com → 10 0 80 web.example.com

DNS Resolution Chain:
  Browser Cache → OS Cache → Recursive Resolver → Root → TLD → Authoritative

  Step 1: Browser cache (Chrome: chrome://net-internals/#dns)
  Step 2: OS resolver cache (/etc/hosts, systemd-resolved)
  Step 3: Recursive resolver (ISP or 8.8.8.8/1.1.1.1)
  Step 4: Root servers (13 clusters, Anycast, a.root-servers.net)
  Step 5: TLD servers (.com, .org, .io nameservers)
  Step 6: Authoritative nameserver (ns1.example.com)

TTL Values:
  Typical: 300s (5 min) for dynamic, 86400s (24h) for static
  Low TTL (60s): Fast failover, more DNS queries
  High TTL (86400s): Fewer queries, slow propagation`
    },

    apiDesign: {
      description: 'DNS query and configuration operations',
      endpoints: [
        { method: 'QUERY', path: 'dig example.com A', params: 'domain, record type', response: 'IP address(es) with TTL' },
        { method: 'QUERY', path: 'dig example.com MX', params: 'domain', response: 'Mail server(s) with priority' },
        { method: 'CREATE', path: 'Route53: CREATE A record', params: 'domain, IP, TTL, routing policy', response: 'Record created in hosted zone' },
        { method: 'UPDATE', path: 'Route53: UPSERT weighted record', params: 'domain, IPs, weights', response: 'Weighted DNS load balancing' },
        { method: 'HEALTH', path: 'Route53: Health check', params: 'endpoint, interval, threshold', response: 'Auto-remove unhealthy IPs from DNS' }
      ]
    },

    keyQuestions: [
      {
        question: 'Walk through the full DNS resolution process',
        answer: `**DNS Resolution** for \`www.example.com\`:

\`\`\`
Browser types "www.example.com"
       │
       ▼
┌──────────────┐  Cache hit?
│ Browser Cache │─────────────▶ Return IP (done)
└──────┬───────┘  Cache miss
       │
       ▼
┌──────────────┐  Cache hit?
│  OS Cache    │─────────────▶ Return IP (done)
│ (/etc/hosts) │  Cache miss
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Recursive Resolver│  (ISP or 8.8.8.8)
│ (cache checked)  │
└──────┬───────────┘
       │ Cache miss - begin iterative resolution
       │
       ▼
┌──────────────┐
│ Root Server  │  "I don't know example.com, but
│ (one of 13)  │   .com TLD is at a.gtld-servers.net"
└──────┬───────┘
       │ NS referral
       ▼
┌──────────────┐
│ .com TLD     │  "I don't know example.com, but
│ Server       │   its NS is ns1.example.com at 93.x.x.x"
└──────┬───────┘
       │ NS referral
       ▼
┌──────────────┐
│ Authoritative│  "www.example.com = 93.184.216.34
│ ns1.example  │   TTL = 300 seconds"
└──────┬───────┘
       │ A record response
       ▼
  IP cached at each level (recursive, OS, browser)
  Browser connects to 93.184.216.34
\`\`\`

**Performance**: Uncached = 4 network hops (50-200ms). Cached = 0-1ms.
**Caching**: Each level caches for the TTL duration, dramatically reducing load on authoritative servers.`
      },
      {
        question: 'How does DNS-based load balancing work and what are its limitations?',
        answer: `**DNS Load Balancing** returns multiple IP addresses or rotates them to distribute traffic:

\`\`\`
Round-Robin DNS:
  Query 1: example.com → [1.1.1.1, 2.2.2.2, 3.3.3.3]
  Query 2: example.com → [2.2.2.2, 3.3.3.3, 1.1.1.1]
  Query 3: example.com → [3.3.3.3, 1.1.1.1, 2.2.2.2]

Weighted DNS (Route53):
  example.com → 1.1.1.1 (weight: 70)  ← 70% of queries
  example.com → 2.2.2.2 (weight: 20)  ← 20% of queries
  example.com → 3.3.3.3 (weight: 10)  ← 10% of queries

DNS Failover:
  Primary:  1.1.1.1 (health check: /health every 30s)
  Secondary: 2.2.2.2 (returned only if primary fails)

  Normal:    example.com → 1.1.1.1
  Primary down: example.com → 2.2.2.2
\`\`\`

**Limitations of DNS load balancing**:
1. **Caching defeats balancing**: Clients cache DNS for TTL duration, ignoring rotations
2. **No health awareness**: Basic DNS returns all IPs regardless of server health (managed DNS like Route53 adds health checks)
3. **No session affinity**: Cannot route same user to same server
4. **Uneven distribution**: Clients behind shared resolvers get same cached IP
5. **Slow failover**: Must wait for TTL expiry to stop sending to dead server
6. **No connection awareness**: Cannot route based on server load

**When to use DNS LB**:
- Global traffic distribution across data centers
- Coarse-grained load balancing (combined with L7 LB at each DC)
- Failover between regions

**Better alternatives for fine-grained LB**: Hardware/software load balancers (Nginx, HAProxy, ALB) that check real-time health and connection counts`
      },
      {
        question: 'What is GeoDNS and how does it differ from Anycast?',
        answer: `**GeoDNS**: Returns different IP addresses based on the geographic location of the requesting client (determined by the resolver's IP).

\`\`\`
GeoDNS Resolution:
  US Client ──▶ Resolver ──▶ GeoDNS Server
                              │ Client IP = US
                              ▼
                           Return: 1.1.1.1 (US DC)

  EU Client ──▶ Resolver ──▶ GeoDNS Server
                              │ Client IP = EU
                              ▼
                           Return: 2.2.2.2 (EU DC)

  Asia Client ──▶ Resolver ──▶ GeoDNS Server
                                │ Client IP = Asia
                                ▼
                             Return: 3.3.3.3 (Asia DC)
\`\`\`

**Anycast**: The SAME IP address is announced from multiple geographic locations via BGP routing. Network routers direct traffic to the nearest announcement.

\`\`\`
Anycast DNS:
  All locations announce: 1.1.1.1

  US Client ──[BGP shortest path]──▶ US Server (1.1.1.1)
  EU Client ──[BGP shortest path]──▶ EU Server (1.1.1.1)
  Asia Client ──[BGP shortest path]──▶ Asia Server (1.1.1.1)

  Same IP, different physical servers!
\`\`\`

**Comparison**:
| Aspect | GeoDNS | Anycast |
|--------|--------|---------|
| Routing level | Application (DNS) | Network (BGP) |
| Different IPs | Yes (per region) | No (same IP everywhere) |
| Failover speed | TTL-dependent (minutes) | BGP convergence (seconds) |
| Accuracy | Based on resolver IP (can be wrong) | Based on network path (usually accurate) |
| Setup complexity | DNS provider config | BGP peering at each site |
| Use case | CDN, multi-region apps | DNS resolvers, DDoS protection |
| Examples | AWS Route53 Geolocation | Cloudflare 1.1.1.1, Google 8.8.8.8 |

**In practice**: Use Anycast for your DNS infrastructure itself (fast, reliable resolution). Use GeoDNS for routing application traffic to the nearest data center.`
      },
      {
        question: 'How do you design DNS for high availability and fast failover?',
        answer: `**HA DNS Architecture**:

\`\`\`
Global DNS Setup:
  ┌────────────────────────────────────────────┐
  │        Managed DNS (Route53/Cloudflare)     │
  │                                            │
  │  Health Checks ──▶ Automated Failover      │
  │                                            │
  │  Primary: us-east.example.com → 1.1.1.1   │
  │  Secondary: eu-west.example.com → 2.2.2.2 │
  │                                            │
  │  Routing Policy:                           │
  │    Latency-based + Failover                │
  │    (route to nearest healthy DC)           │
  └────────────────────────────────────────────┘
         │               │
    ┌────▼────┐     ┌────▼────┐
    │ US-East │     │ EU-West │
    │  DC     │     │  DC     │
    │ 1.1.1.1 │     │ 2.2.2.2 │
    └─────────┘     └─────────┘
\`\`\`

**Fast failover strategies**:

1. **Low TTL**: Set TTL to 60 seconds for records that need fast failover
   - Trade-off: More DNS queries to authoritative servers
   - Critical for active-passive failover

2. **Health checks**: DNS provider monitors endpoints
   - Route53: HTTP/HTTPS/TCP checks every 10-30 seconds
   - 3 consecutive failures → remove from DNS rotation

3. **Multiple NS records**: Use 4+ nameservers across providers
   - Route53 gives 4 NS records in different TLDs
   - Some companies use multi-provider DNS (Route53 + Cloudflare)

4. **Anycast for DNS servers themselves**:
   - Even if one DNS POP fails, traffic routes to next nearest
   - Cloudflare has 300+ POPs worldwide

**DNS failover timeline**:
\`\`\`
T+0s:    Server goes down
T+30s:   Health check detects failure (3 checks × 10s)
T+30s:   DNS provider removes unhealthy IP
T+30-90s: Clients with cached DNS still send to old IP
T+90s:   All clients have fresh DNS pointing to healthy server
Total: 30-90 seconds (with 60s TTL)
\`\`\`

**Best practice**: Combine DNS failover (coarse, cross-region) with L7 load balancer failover (fine, within-region) for comprehensive HA.`
      }
    ],

    basicImplementation: {
      title: 'Simple DNS Configuration',
      description: 'Single authoritative nameserver with A records pointing to a single server. No redundancy, no geographic routing, no health checks.',
      svgTemplate: 'simpleDNS',
      problems: [
        'Single point of failure for DNS resolution',
        'No geographic routing - all users hit same server',
        'No automatic failover on server failure',
        'TTL propagation delays on changes'
      ]
    },

    advancedImplementation: {
      title: 'Global DNS with GeoDNS and Failover',
      description: 'Managed DNS (Route53/Cloudflare) with latency-based routing, health checks, automatic failover, and multi-provider redundancy for authoritative DNS.',
      svgTemplate: 'globalDNS',
      keyPoints: [
        'Latency-based routing sends users to nearest healthy data center',
        'Health checks detect failures within 30 seconds',
        'Low TTL (60s) enables fast failover at the cost of more queries',
        'Multi-provider DNS (Route53 + Cloudflare) eliminates DNS SPOF',
        'DNSSEC prevents DNS spoofing and cache poisoning attacks'
      ]
    },

    discussionPoints: [
      {
        topic: 'DNS Performance Optimization',
        points: [
          'Use Anycast DNS providers (Cloudflare, Google) for low-latency resolution',
          'Optimize TTL: balance between caching benefit and failover speed',
          'Pre-resolve critical domains with dns-prefetch HTML hints',
          'Minimize CNAME chains (each adds a resolution round)',
          'Use HTTP/2 connection coalescing to reduce DNS lookups'
        ]
      },
      {
        topic: 'DNS Security',
        points: [
          'DNSSEC: Cryptographic signatures on DNS responses to prevent spoofing',
          'DNS over HTTPS (DoH): Encrypt DNS queries to prevent eavesdropping',
          'DNS over TLS (DoT): Alternative encrypted DNS transport',
          'DNS rebinding protection: Validate response IPs are not private ranges',
          'DNS amplification DDoS: Use response rate limiting on authoritative servers'
        ]
      },
      {
        topic: 'DNS in Microservices',
        points: [
          'Kubernetes CoreDNS: Service discovery via DNS (service.namespace.svc.cluster.local)',
          'Consul DNS: Service mesh DNS for service discovery',
          'SRV records: Include port and weight for service endpoints',
          'Short TTL for internal DNS: Enable fast service deployment',
          'DNS caching pitfalls: Stale entries after deployment if TTL too long'
        ]
      }
    ]
  },

  {
    id: 'cdn-deep-dive',
    title: 'CDN Deep Dive',
    icon: 'trendingUp',
    color: '#f59e0b',
    questions: 8,
    description: 'Push vs pull CDN, origin vs edge architecture, cache hierarchies, and CDN design.',
    introduction: `A **Content Delivery Network (CDN)** is a globally distributed network of proxy servers that cache and serve content from locations close to end users. CDNs reduce latency, offload origin server traffic, and improve availability by serving content from the **edge** rather than a distant origin.

CDNs serve over **50% of all internet traffic** today. **Cloudflare** proxies more than 20% of all websites. **Netflix** uses its own CDN (Open Connect) embedded directly in ISP networks. **Akamai** operates 300,000+ servers in 130+ countries. In system design interviews, CDNs appear in virtually every web-scale architecture.

There are two fundamental CDN models: **pull-based** CDNs (cache content on first request, used by most websites) and **push-based** CDNs (proactively distribute content, used for large static assets). Understanding how CDNs work internally — from **DNS-based routing** to **cache hierarchies** to **cache invalidation** — is essential for designing systems that serve millions of users with low latency worldwide.`,

    concepts: [
      'Push CDN vs Pull CDN models',
      'Origin server vs Edge server (POP)',
      'Cache hierarchy: L1 edge, L2 shield, origin',
      'CDN routing: DNS-based, Anycast, BGP',
      'Cache keys and cache variations (Vary header)',
      'Cache invalidation and purge mechanisms',
      'Origin shielding to protect backend servers',
      'Dynamic content acceleration (TCP optimization, route optimization)'
    ],

    tips: [
      'Always include a CDN in any web-scale system design - it is expected',
      'Know the difference between push and pull CDN and when each is appropriate',
      'Discuss cache hit ratio as the key CDN metric - aim for 90%+',
      'Mention origin shield as the solution to origin overload on cache misses',
      'Explain how CDNs handle dynamic content (not just static files)',
      'Be specific with technology: Cloudflare, CloudFront, Akamai, Fastly'
    ],

    functionalRequirements: [
      'Cache static assets (images, CSS, JS, videos) at edge locations',
      'Serve cached content to users from geographically close servers',
      'Fetch content from origin on cache miss',
      'Support cache invalidation and purge on content update',
      'Handle HTTPS termination at edge locations',
      'Support dynamic content acceleration and route optimization'
    ],

    nonFunctionalRequirements: [
      'Latency: < 50ms to edge from 95% of global users',
      'Cache hit ratio: > 90% for static content',
      'Availability: 99.99% with automatic failover between POPs',
      'Throughput: Terabits per second across the CDN network',
      'Purge time: < 5 seconds for global cache invalidation',
      'Origin offload: 80-95% of requests served from cache'
    ],

    dataModel: {
      description: 'CDN architecture and cache hierarchy',
      schema: `CDN Architecture:
  User Request → DNS/Anycast → Nearest Edge POP → Cache Check

  Cache HIT:  Edge POP → User (fast, no origin contact)
  Cache MISS: Edge POP → Origin Shield → Origin Server

Pull CDN (lazy, on-demand):
  1. User requests /image.jpg from cdn.example.com
  2. Edge POP checks local cache → MISS
  3. Edge fetches from origin: origin.example.com/image.jpg
  4. Edge caches response, serves to user
  5. Subsequent requests: served from edge cache

Push CDN (eager, pre-populated):
  1. Content published to origin
  2. Origin pushes to CDN API: PUT /content/image.jpg
  3. CDN distributes to all edge POPs
  4. User requests are always cache HITs

Cache Hierarchy (Cloudflare/Akamai):
  ┌──────────────┐
  │  L1: Edge POP │  (200+ locations, closest to user)
  │  Cache: Hot   │
  └──────┬───────┘
         │ MISS
  ┌──────▼───────┐
  │ L2: Shield   │  (5-10 regional locations)
  │ Cache: Warm  │  (protects origin from stampede)
  └──────┬───────┘
         │ MISS
  ┌──────▼───────┐
  │   Origin     │  (your server)
  └──────────────┘`
    },

    apiDesign: {
      description: 'CDN management and caching operations',
      endpoints: [
        { method: 'PURGE', path: '/api/cdn/purge', params: '{ urls: [...] } or { tags: [...] }', response: 'Purge status across all POPs' },
        { method: 'PUT', path: '/api/cdn/push', params: '{ path, content, headers }', response: 'Content distributed to edge POPs (push CDN)' },
        { method: 'GET', path: '/api/cdn/analytics', params: 'dateRange, metric', response: 'Cache hit ratio, bandwidth, latency stats' },
        { method: 'POST', path: '/api/cdn/rules', params: '{ pattern, ttl, headers }', response: 'Caching rule configuration' },
        { method: 'GET', path: '/api/cdn/pops', params: '-', response: 'List of POP locations with status' }
      ]
    },

    keyQuestions: [
      {
        question: 'What is the difference between push and pull CDNs?',
        answer: `**Pull CDN** (most common):
Content is cached on first request. The CDN "pulls" from origin on cache miss.

\`\`\`
Pull CDN Flow:
  User ──▶ Edge POP
              │
              ├── Cache HIT → Return cached content (fast)
              │
              └── Cache MISS
                    │
                    ▼
                  Origin Server
                    │
                    ▼
                  Cache at Edge + Return to User
                    │
                    ▼
                  Future requests = Cache HIT

Pros: Simple setup, only caches what is actually requested
Cons: First request is slow (origin fetch), cold cache problem
Used by: Most websites, API responses, dynamic content
Examples: Cloudflare, CloudFront (default), Fastly
\`\`\`

**Push CDN**:
Content is proactively uploaded to CDN before any user requests.

\`\`\`
Push CDN Flow:
  Publisher ──▶ CDN API: "Store this content"
                    │
                    ▼
              CDN distributes to all POPs
                    │
  User ──▶ Edge POP ──▶ Always cache HIT

Pros: First request is always fast, predictable performance
Cons: Must manage what to push, storage costs for unpopular content
Used by: Video streaming (pre-position), software updates, large files
Examples: Netflix Open Connect, game patch distribution
\`\`\`

**Decision criteria**:
| Factor | Pull | Push |
|--------|------|------|
| Content size | Small/medium | Large (video, downloads) |
| Content popularity | Varies (long tail) | Known popular items |
| Update frequency | Frequent | Infrequent |
| Storage cost concern | Lower (cache only popular) | Higher (store everything) |
| First-request latency | Higher (origin fetch) | Lower (pre-cached) |`
      },
      {
        question: 'How does origin shielding work and why is it important?',
        answer: `**Origin shielding** adds an intermediate cache layer between edge POPs and the origin server, preventing cache stampedes from overwhelming the origin.

\`\`\`
Without Origin Shield:
  POP-US ─── cache miss ───┐
  POP-EU ─── cache miss ───┤
  POP-Asia── cache miss ───┼──▶ Origin Server (OVERWHELMED!)
  POP-SA ─── cache miss ───┤     200 simultaneous requests
  POP-AF ─── cache miss ───┘     for same content

With Origin Shield:
  POP-US ─── miss ───┐
  POP-EU ─── miss ───┤
  POP-Asia── miss ───┼──▶ Shield (US-East)
  POP-SA ─── miss ───┤       │
  POP-AF ─── miss ───┘       │ Single request
                              ▼
                         Origin Server
                         (1 request instead of 200)
\`\`\`

**How it works**:
1. Edge POP gets cache miss
2. Instead of going to origin, POP checks the shield server
3. Shield: HIT → return to edge (origin never contacted)
4. Shield: MISS → fetch from origin, cache, return to edge
5. Only one request reaches origin per unique content per TTL

**Shield placement**: Choose shield location close to origin server
- If origin is in US-East, shield in US-East
- Multiple shields for multiple origins (US shield, EU shield)

**Benefits**:
- Reduces origin load by 90%+ (especially for popular content)
- Protects origin during traffic spikes and cache expiration storms
- Reduces origin bandwidth costs
- Enables smaller origin infrastructure

**Collapse (request coalescing)**: The shield also collapses concurrent requests for the same object. If 100 edge POPs request the same URL simultaneously, the shield makes ONE request to origin and fans out the response.`
      },
      {
        question: 'How do you handle cache invalidation in a CDN?',
        answer: `**Cache invalidation** is the process of removing stale content from CDN edge caches when the origin content changes.

**Strategy 1: TTL-based expiration**
\`\`\`
Cache-Control: public, max-age=3600  (1 hour)
Cache-Control: public, max-age=31536000, immutable  (1 year, versioned files)

Best for: Content with predictable update frequency
Limitation: Stale content served until TTL expires
\`\`\`

**Strategy 2: Purge API**
\`\`\`
POST /api/purge
{
  "urls": ["https://cdn.example.com/image.jpg"]
}
→ Purge propagated to all POPs in < 5 seconds

POST /api/purge
{
  "tags": ["product-images"]  // Surrogate keys
}
→ Purge all content tagged "product-images"
\`\`\`

**Strategy 3: Cache busting with versioned URLs**
\`\`\`
Before update: /assets/style.v1.css  (TTL: 1 year)
After update:  /assets/style.v2.css  (new URL = new cache entry)

Or with content hashing:
  /assets/style.a1b2c3d4.css  (hash changes when content changes)

HTML references the new URL → old version expires naturally
\`\`\`

**Strategy 4: Stale-while-revalidate**
\`\`\`
Cache-Control: public, max-age=60, stale-while-revalidate=3600

Behavior:
  0-60s:    Serve from cache (fresh)
  60-3660s: Serve stale content, revalidate in background
  3660s+:   Cache expired, must fetch from origin

Best for: Content where slight staleness is acceptable
\`\`\`

**Best practice for production**:
- Immutable assets (JS, CSS, images): Content-hashed URLs + long TTL (1 year)
- HTML pages: Short TTL (60s) + stale-while-revalidate
- API responses: Short TTL (10-60s) or no-cache with ETag/If-Modified-Since
- Emergency: Purge API for immediate cache invalidation`
      },
      {
        question: 'How does Netflix deliver video content at global scale?',
        answer: `**Netflix Open Connect** is Netflix's custom CDN, responsible for 15%+ of all internet bandwidth globally.

\`\`\`
Netflix Content Delivery Architecture:
  ┌──────────────────────────────────────────┐
  │         Netflix Control Plane             │
  │  (AWS: user data, recommendations, API)  │
  └────────────────┬─────────────────────────┘
                   │ Manifest: "stream from OCA at 1.2.3.4"
                   │
  ┌────────────────▼─────────────────────────┐
  │         Open Connect Alliance (OCA)       │
  │                                          │
  │  ┌──────────┐  ┌──────────┐  ┌────────┐ │
  │  │ISP POP 1 │  │ISP POP 2 │  │IXP POP │ │
  │  │(Comcast) │  │(Verizon) │  │(Equinix│ │
  │  │100TB     │  │100TB     │  │ )      │ │
  │  │storage   │  │storage   │  │        │ │
  │  └──────────┘  └──────────┘  └────────┘ │
  └──────────────────────────────────────────┘

Content Flow:
  1. New content encoded in multiple bitrates (4K, 1080p, etc.)
  2. Pushed to regional OCA servers during off-peak hours
  3. Popular content replicated to ISP-embedded OCAs
  4. User plays video → Netflix API returns OCA URL
  5. Video streams directly from ISP POP (zero hops!)
\`\`\`

**Key design decisions**:
1. **Push-based CDN**: Content pre-positioned before users request it
2. **ISP-embedded**: Servers inside ISP networks (zero transit costs)
3. **Custom hardware**: Purpose-built servers with 100+ TB SSD storage
4. **Popularity-based placement**: Most popular content on most OCAs
5. **Adaptive bitrate**: Client switches quality based on bandwidth
6. **Control plane separate**: AWS handles user sessions, OCAs handle streaming

**Performance**:
- Content served from same ISP network as user
- Average latency: < 10ms
- Peak traffic: 20+ Tbps globally
- Cache hit ratio: > 95% (most content pre-positioned)

**Lesson for interviews**: Sometimes building your own CDN makes sense for dominant use cases (video streaming), while general-purpose CDN (Cloudflare, CloudFront) is better for typical web applications.`
      }
    ],

    basicImplementation: {
      title: 'Single CDN with Pull Caching',
      description: 'CloudFront or Cloudflare in front of a single origin. Pull-based caching with default TTLs. Simple but effective for most applications.',
      svgTemplate: 'simpleCDN',
      problems: [
        'Cache misses go directly to origin (no shield)',
        'Single origin is a bottleneck and single point of failure',
        'No geographic awareness in content placement',
        'Slow cache warming for new or infrequently accessed content'
      ]
    },

    advancedImplementation: {
      title: 'Multi-Tier CDN with Origin Shielding',
      description: 'L1 edge POPs worldwide → L2 origin shield regional caches → multi-region origin servers with failover. Content-hashed URLs for immutable assets, surrogate key purging for dynamic content.',
      svgTemplate: 'advancedCDN',
      keyPoints: [
        'Origin shield reduces origin load by 90%+ on cache misses',
        'Content-hashed URLs enable aggressive caching (1-year TTL)',
        'Surrogate key tagging enables precise cache invalidation',
        'Multi-origin failover ensures availability if one origin fails',
        'Real-time analytics track cache hit ratio and P99 latency per POP'
      ]
    },

    discussionPoints: [
      {
        topic: 'CDN Selection Criteria',
        points: [
          'Cloudflare: Best free tier, global Anycast, Workers for edge compute',
          'CloudFront: Best AWS integration, Lambda@Edge for dynamic processing',
          'Akamai: Largest network, best for enterprise and media',
          'Fastly: Fastest purge (<150ms), best for dynamic content (Varnish-based)',
          'Build your own: Only for dominant use case (Netflix, Apple)'
        ]
      },
      {
        topic: 'CDN for Dynamic Content',
        points: [
          'API response caching with short TTLs and Vary headers',
          'Edge computing (Cloudflare Workers, Lambda@Edge) for personalization',
          'TCP optimization and persistent connections reduce TTFB',
          'Route optimization: CDN backbone faster than public internet',
          'ESI (Edge Side Includes) for partially cached pages'
        ]
      },
      {
        topic: 'CDN Cost Optimization',
        points: [
          'Maximize cache hit ratio to reduce origin bandwidth costs',
          'Use origin shield to reduce egress from origin to CDN',
          'Compress content (Brotli/gzip) before caching at edge',
          'Optimize image formats (WebP, AVIF) to reduce bytes served',
          'Monitor and set appropriate TTLs to avoid unnecessary origin fetches'
        ]
      }
    ]
  },

  {
    id: 'redundancy-replication',
    title: 'Redundancy & Replication',
    icon: 'copy',
    color: '#ef4444',
    questions: 8,
    description: 'Data replication strategies, failover mechanisms, and disaster recovery planning.',
    introduction: `**Redundancy** is the duplication of critical system components to increase reliability. **Replication** is the specific practice of maintaining multiple copies of data across different nodes. Together, they form the foundation of fault-tolerant distributed systems.

The fundamental idea is simple: any single component will eventually fail, so you need copies. The challenge lies in keeping those copies consistent. **Synchronous replication** guarantees consistency but adds latency. **Asynchronous replication** is fast but can lose recent data on failure. Understanding these trade-offs is essential for designing systems with appropriate reliability guarantees.

Real-world systems combine multiple redundancy strategies. **AWS S3** achieves 99.999999999% (11 nines) durability by replicating data across multiple facilities. **Google Spanner** uses synchronous replication across continents for global consistency. **GitHub** survived a major outage by failing over to a secondary MySQL cluster with only minutes of data replication lag. These examples illustrate why replication strategy choices have profound business implications.`,

    concepts: [
      'Active-passive vs active-active redundancy',
      'Synchronous vs asynchronous replication',
      'Primary-replica (master-slave) replication',
      'Multi-primary (master-master) replication',
      'Quorum-based replication (W + R > N)',
      'Conflict resolution strategies (LWW, vector clocks)',
      'Failover mechanisms (automatic vs manual)',
      'Disaster recovery: RPO and RTO targets'
    ],

    tips: [
      'Always ask: what is the acceptable data loss (RPO) and downtime (RTO)?',
      'Know the trade-off: sync replication = consistency, async = performance',
      'Discuss both data redundancy and compute redundancy separately',
      'Mention quorum writes/reads as the way to tune consistency vs availability',
      'Be specific about failover: automatic detection, promotion, DNS update, connection draining',
      'Discuss disaster recovery tiers: backup/restore, pilot light, warm standby, multi-site active'
    ],

    functionalRequirements: [
      'Maintain multiple copies of data across nodes/regions',
      'Automatically detect and recover from node failures',
      'Promote replicas to primary on primary failure',
      'Resolve conflicts in multi-primary replication',
      'Support configurable consistency levels per operation',
      'Enable cross-region replication for disaster recovery'
    ],

    nonFunctionalRequirements: [
      'RPO (Recovery Point Objective): Zero for sync, seconds to minutes for async',
      'RTO (Recovery Time Objective): < 30 seconds for automatic failover',
      'Replication lag: < 100ms for async within a region',
      'Durability: 99.999999999% (11 nines) for critical data',
      'Availability: 99.99%+ with redundancy in place',
      'Throughput: Replication should not degrade primary by more than 10-20%'
    ],

    dataModel: {
      description: 'Replication topologies and failover configurations',
      schema: `Primary-Replica (most common):
  ┌─────────┐  sync/async   ┌──────────┐
  │ Primary │──────────────▶│ Replica 1│ (read scaling)
  │ (writes)│──────────────▶│ Replica 2│ (failover)
  └─────────┘               └──────────┘

Multi-Primary:
  ┌──────────┐  bidirectional  ┌──────────┐
  │Primary 1 │◀───────────────▶│Primary 2 │
  │(US-East) │  replication    │(EU-West) │
  └──────────┘                 └──────────┘
  Both accept writes → Conflict resolution needed

Quorum Replication (N=3, W=2, R=2):
  Client writes to 2 of 3 nodes (W=2)
  Client reads from 2 of 3 nodes (R=2)
  W + R > N ensures overlap → strong consistency

Failover Timeline:
  T+0s:   Primary fails
  T+5s:   Heartbeat timeout detected
  T+10s:  Replica promoted to primary
  T+15s:  DNS/routing updated
  T+20s:  Connections drained from old primary
  T+30s:  System fully recovered

DR Tiers:
  Tier 1 - Backup/Restore:    RPO=hours,  RTO=hours
  Tier 2 - Pilot Light:       RPO=minutes, RTO=minutes
  Tier 3 - Warm Standby:      RPO=seconds, RTO=seconds
  Tier 4 - Multi-Site Active:  RPO=0,       RTO=0`
    },

    apiDesign: {
      description: 'Replication management and failover operations',
      endpoints: [
        { method: 'STATUS', path: 'replication.getStatus()', params: '-', response: '{ lag, state, role } per node' },
        { method: 'FAILOVER', path: 'replication.promoteReplica(replicaId)', params: 'replicaId', response: 'New primary confirmation' },
        { method: 'CONFIG', path: 'replication.setMode(mode)', params: 'sync | async | semi-sync', response: 'Replication mode updated' },
        { method: 'ADD', path: 'replication.addReplica(config)', params: 'host, port, region', response: 'New replica initialized and syncing' },
        { method: 'CHECK', path: 'replication.verifyConsistency()', params: '-', response: 'Checksum comparison across replicas' }
      ]
    },

    keyQuestions: [
      {
        question: 'What is the difference between synchronous and asynchronous replication?',
        answer: `**Synchronous Replication**: Primary waits for replica acknowledgment before confirming the write to the client.

\`\`\`
Synchronous:
  Client ──▶ Primary ──▶ Replica
                │             │
                │◀── ACK ─────┘
                │
  Client ◀── ACK (write confirmed)

  Timeline: Write → Replicate → Replica ACK → Client ACK
  Latency: write_time + replication_time + replica_ack
  Data loss on primary failure: ZERO (replica has all data)
\`\`\`

**Asynchronous Replication**: Primary confirms write immediately, replicates in background.

\`\`\`
Asynchronous:
  Client ──▶ Primary ──▶ Client ACK (immediate!)
                │
                │──(background)──▶ Replica
                                     │
                                   ACK (primary ignores)

  Timeline: Write → Client ACK ... later ... Replicate
  Latency: write_time only
  Data loss on primary failure: Recent uncommitted writes (replication lag)
\`\`\`

**Semi-Synchronous** (MySQL): Wait for at least ONE replica to ACK, not all.

\`\`\`
Semi-Synchronous:
  Primary ──▶ Replica 1 (sync - must ACK)
         ──▶ Replica 2 (async - best effort)

  Guarantees at least one replica has the data
  Latency between full sync and full async
\`\`\`

**Comparison**:
| Aspect | Sync | Async | Semi-Sync |
|--------|------|-------|-----------|
| Write latency | High | Low | Medium |
| Data loss risk | Zero | Possible | Minimal |
| Availability | Lower (replica must be up) | Higher | Medium |
| Use case | Financial, critical data | Analytics, caching | Most production DBs |

**Real-world**: PostgreSQL streaming replication defaults to async, configurable to sync. MySQL semi-sync is common in production.`
      },
      {
        question: 'How does automatic failover work in a primary-replica setup?',
        answer: `**Automatic failover** detects primary failure and promotes a replica to become the new primary, all without human intervention.

\`\`\`
Failover Process:

Phase 1: Detection (5-30 seconds)
  ┌─────────┐  heartbeat  ┌──────────┐
  │ Primary │◀────────────│ Sentinel │
  │  (down) │  ✗ ✗ ✗     │ /Monitor │
  └─────────┘             └──────────┘
  3 missed heartbeats → primary declared DEAD

Phase 2: Election (1-5 seconds)
  ┌──────────┐  most up-to-date?  ┌──────────┐
  │ Replica 1│◀──────────────────│ Sentinel │
  │ lag: 0.5s│  ← WINNER         │          │
  └──────────┘                   │          │
  ┌──────────┐                   │          │
  │ Replica 2│◀──────────────────│          │
  │ lag: 2.0s│  ← not selected   └──────────┘
  └──────────┘

Phase 3: Promotion (1-5 seconds)
  ┌──────────┐
  │ Replica 1│ → Promoted to PRIMARY
  │ (new     │ → Accepts writes
  │  primary)│ → Other replicas repoint here
  └──────────┘

Phase 4: Routing Update (1-10 seconds)
  DNS/VIP/Proxy updated to point to new primary
  Clients reconnect to new primary
  Old primary fenced off (STONITH) to prevent split-brain
\`\`\`

**Tools and implementations**:
- **Redis Sentinel**: Monitors Redis, handles automatic failover
- **PostgreSQL Patroni**: Consensus-based leader election using etcd/ZooKeeper
- **MySQL Group Replication**: Built-in consensus for automatic failover
- **AWS RDS Multi-AZ**: Managed automatic failover within minutes

**Split-brain prevention**:
\`\`\`
DANGEROUS: Both nodes think they are primary!

  "Primary" A ──writes──▶ Data Set A
  "Primary" B ──writes──▶ Data Set B

  Data diverges! Unrecoverable without manual intervention.

Prevention:
  1. Fencing (STONITH): Kill the old primary's access to storage
  2. Quorum: Require majority of sentinels to agree
  3. Lease-based: Primary must renew lease periodically
  4. Shared storage lock: Only one node can write to disk
\`\`\`

**Total failover time**: 10-60 seconds depending on detection speed, election algorithm, and routing update mechanism.`
      },
      {
        question: 'What is quorum-based replication and how do you tune it?',
        answer: `**Quorum replication** requires a minimum number of nodes to acknowledge an operation. It allows tuning the trade-off between consistency and performance.

\`\`\`
Configuration: N=3 nodes, W=write quorum, R=read quorum
Rule: W + R > N guarantees reading the latest write

Strong Consistency (W=2, R=2):
  Write "x=5":
    Node A: x=5 ✓ (ACK)
    Node B: x=5 ✓ (ACK)  ← W=2 met, confirm to client
    Node C: x=4   (async, may be behind)

  Read x:
    Node A: x=5
    Node B: x=5  ← R=2 met, return latest (x=5)

    Overlap: At least 1 node has latest value
    W(2) + R(2) = 4 > N(3) ✓

High Availability Write (W=1, R=3):
  Write "x=5":
    Node A: x=5 ✓ (ACK)  ← W=1 met, fast!
    Node B: x=4   (async)
    Node C: x=4   (async)

  Read x:
    Must read ALL 3 nodes, take latest
    Slow reads but fast writes

High Availability Read (W=3, R=1):
  Write "x=5":
    All 3 nodes must ACK ← slow writes
  Read x:
    Any 1 node has latest ← fast reads!
\`\`\`

**Common configurations**:
| Config | W | R | Behavior |
|--------|---|---|----------|
| Strong | N/2+1 | N/2+1 | Consistent, moderate speed |
| Fast write | 1 | N | Write-optimized, slow reads |
| Fast read | N | 1 | Read-optimized, slow writes |
| Eventual | 1 | 1 | Fastest but may read stale data |

**Sloppy quorum** (DynamoDB-style):
- If a node is unreachable, write to a different node temporarily
- **Hinted handoff**: When the original node recovers, transfer the data back
- Improves availability at the cost of potential consistency

**Read repair**:
- During a quorum read, if nodes disagree, the stale node is updated
- Lazy consistency repair that happens during normal reads`
      },
      {
        question: 'How do you design a disaster recovery strategy?',
        answer: `**Disaster recovery** planning starts with two metrics:
- **RPO** (Recovery Point Objective): Maximum acceptable data loss (time)
- **RTO** (Recovery Time Objective): Maximum acceptable downtime

\`\`\`
DR Tier 1: Backup & Restore
  ┌──────────┐    nightly backup    ┌───────────┐
  │ Primary  │─────────────────────▶│ S3/Glacier│
  │ Region A │                      └───────────┘
  └──────────┘                           │
  Disaster occurs...                     │ restore
                                    ┌────▼─────┐
                                    │ New Infra │
                                    │ Region B  │
                                    └──────────┘
  RPO: Hours (last backup)    RTO: Hours (restore time)
  Cost: $ (storage only)

DR Tier 2: Pilot Light
  ┌──────────┐    continuous repl   ┌──────────┐
  │ Primary  │─────────────────────▶│ DB only  │
  │ Region A │                      │ Region B │
  │ (full)   │                      │ (minimal)│
  └──────────┘                      └──────────┘
  Disaster: Scale up Region B compute
  RPO: Minutes     RTO: 10-30 minutes
  Cost: $$ (DB replication)

DR Tier 3: Warm Standby
  ┌──────────┐    continuous repl   ┌──────────┐
  │ Primary  │─────────────────────▶│ Reduced  │
  │ Region A │                      │ Region B │
  │ (full)   │                      │ (scaled  │
  │          │                      │  down)   │
  └──────────┘                      └──────────┘
  Disaster: Scale up Region B to full capacity
  RPO: Seconds     RTO: Minutes
  Cost: $$$ (running smaller clone)

DR Tier 4: Multi-Site Active-Active
  ┌──────────┐  bidirectional repl  ┌──────────┐
  │ Active   │◀────────────────────▶│ Active   │
  │ Region A │                      │ Region B │
  │ (full)   │                      │ (full)   │
  └──────────┘                      └──────────┘
  Disaster: DNS routes all traffic to surviving region
  RPO: 0 (no data loss)   RTO: ~0 (seconds)
  Cost: $$$$ (2x infrastructure)
\`\`\`

**DR testing** (critical and often forgotten):
- **Game days**: Simulate failures monthly (Netflix Chaos Monkey)
- **DR drills**: Full failover to DR site quarterly
- **Backup verification**: Regularly restore from backups to verify integrity
- **Runbook testing**: Verify documented procedures work

**Multi-region trade-offs**:
- Active-active eliminates downtime but requires conflict resolution
- Cross-region latency: 50-200ms (affects sync replication feasibility)
- Data sovereignty: Some data cannot leave certain regions (GDPR)`
      }
    ],

    basicImplementation: {
      title: 'Single Primary with Async Replica',
      description: 'Primary database with one asynchronous read replica. Provides read scaling and basic disaster recovery, but has replication lag and manual failover.',
      svgTemplate: 'basicReplication',
      problems: [
        'Manual failover requires human intervention (high RTO)',
        'Async replication means recent writes may be lost on failure',
        'Single replica means no redundancy for the replica itself',
        'No cross-region protection against regional disasters'
      ]
    },

    advancedImplementation: {
      title: 'Multi-Region Active-Passive with Automatic Failover',
      description: 'Semi-synchronous replication to in-region replica, async replication to cross-region standby. Automatic failover via consensus-based leader election (Patroni/etcd), with connection routing via PgBouncer/ProxySQL.',
      svgTemplate: 'advancedReplication',
      keyPoints: [
        'Semi-sync in-region replication ensures zero data loss for regional failures',
        'Async cross-region replication provides disaster recovery with minimal lag',
        'Consensus-based election prevents split-brain during failover',
        'Connection proxy abstracts primary location from applications',
        'Regular DR drills verify failover procedures work correctly'
      ]
    },

    discussionPoints: [
      {
        topic: 'Replication in Different Databases',
        points: [
          'PostgreSQL: Streaming replication (sync/async), logical replication for selective tables',
          'MySQL: Binary log replication, Group Replication for automatic failover',
          'MongoDB: Replica sets with automatic election, oplog-based replication',
          'Cassandra: Tunable consistency with quorum replication, no single primary',
          'Redis: Async replication by default, Redis Cluster for partitioned replication'
        ]
      },
      {
        topic: 'Conflict Resolution in Multi-Primary',
        points: [
          'Last-Writer-Wins (LWW): Simple but may lose updates',
          'Vector clocks: Track causal ordering of updates',
          'CRDTs: Conflict-free data types that auto-merge (counters, sets)',
          'Application-level resolution: Custom merge logic per data type',
          'Avoid multi-primary: Use single-primary with fast failover when possible'
        ]
      },
      {
        topic: 'Cost vs Reliability Trade-offs',
        points: [
          'Each additional 9 of availability costs roughly 10x more',
          'Multi-region active-active doubles infrastructure cost',
          'RPO=0 requires synchronous replication (increased write latency)',
          'Managed services (RDS Multi-AZ) simplify ops but cost more',
          'DR that is never tested is the same as no DR at all'
        ]
      }
    ]
  },

  {
    id: 'network-essentials',
    title: 'Network Essentials',
    icon: 'wifi',
    color: '#8b5cf6',
    questions: 8,
    description: 'HTTP versions, TCP vs UDP vs QUIC, TLS/mTLS, and network protocol design.',
    introduction: `**Network protocols** are the foundation upon which all distributed systems communicate. Understanding the evolution from **HTTP/1.1** to **HTTP/2** to **HTTP/3** (QUIC), and the differences between **TCP** and **UDP**, is essential for making informed architecture decisions.

**HTTP/1.1** introduced persistent connections and chunked transfer encoding but suffers from head-of-line blocking. **HTTP/2** solved this with multiplexing over a single TCP connection. **HTTP/3** takes this further by replacing TCP entirely with **QUIC** (UDP-based), eliminating TCP-level head-of-line blocking and reducing connection setup time.

Security is equally important. **TLS** (Transport Layer Security) encrypts data in transit, and **mutual TLS (mTLS)** provides bidirectional authentication between services. In microservice architectures, mTLS is the standard for zero-trust networking. Every system design interview implicitly requires knowledge of these protocols — they determine latency, throughput, security, and reliability of your architecture.`,

    concepts: [
      'HTTP/1.1 limitations and workarounds',
      'HTTP/2 multiplexing, server push, header compression',
      'HTTP/3 and QUIC: UDP-based transport',
      'TCP: reliable, ordered, connection-oriented',
      'UDP: unreliable, unordered, connectionless',
      'QUIC: UDP with reliability, encryption, multiplexing',
      'TLS 1.3 handshake and 0-RTT resumption',
      'mTLS for service-to-service authentication'
    ],

    tips: [
      'Know the HTTP/2 improvements over 1.1 cold: multiplexing, header compression, server push',
      'Explain why HTTP/3 uses UDP: to avoid TCP head-of-line blocking and OS kernel constraints',
      'Mention QUIC as the protocol that makes HTTP/3 possible',
      'For system design, know when TCP vs UDP is appropriate: reliability needs vs latency needs',
      'Discuss TLS 1.3 improvements: 1-RTT handshake (vs 2-RTT in 1.2), 0-RTT resumption',
      'Mention mTLS for microservices: every service both presents and verifies certificates'
    ],

    functionalRequirements: [
      'Reliable data transfer for web applications and APIs',
      'Low-latency communication for real-time applications',
      'Encrypted communication to prevent eavesdropping',
      'Multiplexed connections to reduce latency and connection overhead',
      'Service identity verification for zero-trust security',
      'Support for streaming, bidirectional communication'
    ],

    nonFunctionalRequirements: [
      'Connection setup: < 1 RTT with HTTP/3 (0-RTT resumption)',
      'Latency: Minimize protocol overhead per request',
      'Throughput: Maximize concurrent streams per connection',
      'Security: TLS 1.3 minimum, no fallback to insecure protocols',
      'Compatibility: Graceful fallback for older clients',
      'Overhead: Minimal bandwidth waste from protocol framing'
    ],

    dataModel: {
      description: 'Protocol comparison and connection lifecycle',
      schema: `HTTP Version Comparison:
  HTTP/1.1:
    Connection 1: [Request A]──[Response A]──[Request B]──[Response B]
    Connection 2: [Request C]──[Response C]  (parallel connection)
    Problem: Head-of-line blocking, 6 connection limit per domain

  HTTP/2:
    Single Connection:
      Stream 1: [Request A]────[Response A]
      Stream 2: [Request B]──[Response B]
      Stream 3: [Request C]─────[Response C]
    Multiplexed! But TCP HOL blocking remains

  HTTP/3 (QUIC over UDP):
    Single Connection:
      Stream 1: [Request A]────[Response A]
      Stream 2: [Request B]──[Response B]  (loss here)
      Stream 3: [Request C]─────[Response C]  (unaffected!)
    No HOL blocking even at transport layer!

Connection Setup:
  TCP + TLS 1.2: 3 RTT (TCP SYN + TLS handshake)
  TCP + TLS 1.3: 2 RTT (TCP SYN + 1-RTT TLS)
  QUIC + TLS 1.3: 1 RTT (combined transport + crypto)
  QUIC Resumption: 0 RTT (send data immediately!)

TCP vs UDP:
  TCP: Reliable | Ordered | Connection-oriented | Flow control
  UDP: Unreliable | Unordered | Connectionless | No flow control
  QUIC: Reliable | Per-stream ordering | Connection-oriented | Built on UDP`
    },

    apiDesign: {
      description: 'Protocol-level configuration and diagnostic operations',
      endpoints: [
        { method: 'CONFIG', path: 'nginx: listen 443 http2', params: 'port, protocol', response: 'Enable HTTP/2 on HTTPS port' },
        { method: 'CONFIG', path: 'nginx: listen 443 quic', params: 'port, protocol', response: 'Enable HTTP/3 with QUIC' },
        { method: 'CONFIG', path: 'ssl_certificate + ssl_certificate_key', params: 'cert path, key path', response: 'TLS configuration' },
        { method: 'CONFIG', path: 'ssl_client_certificate + ssl_verify_client', params: 'CA cert, verify mode', response: 'mTLS configuration' },
        { method: 'DEBUG', path: 'curl -v --http2 https://example.com', params: 'URL', response: 'Protocol negotiation and timing details' }
      ]
    },

    keyQuestions: [
      {
        question: 'What are the key differences between HTTP/1.1, HTTP/2, and HTTP/3?',
        answer: `**HTTP/1.1** (1997):
\`\`\`
Connection per request (keep-alive helps):
  Conn 1: ──[Req A]──[Resp A]──[Req B]──[Resp B]──
  Conn 2: ──[Req C]──[Resp C]──  (browsers open 6 parallel)

Problems:
  - Head-of-line blocking: Req B waits for Resp A
  - Max 6 connections per domain (browser limit)
  - Redundant headers sent with every request
  - No server push capability

Workarounds:
  - Domain sharding (cdn1.example.com, cdn2.example.com)
  - Sprite sheets (combine images)
  - CSS/JS bundling (reduce request count)
\`\`\`

**HTTP/2** (2015):
\`\`\`
Multiplexed streams over single connection:
  ┌─────────────Single TCP Connection────────────┐
  │ Stream 1: ▓▓░░▓▓▓▓░░  (Request/Response A)  │
  │ Stream 2: ░▓▓▓▓░░▓▓░  (Request/Response B)  │
  │ Stream 3: ░░▓▓░▓▓▓▓░  (Request/Response C)  │
  └──────────────────────────────────────────────┘

Improvements:
  ✓ Multiplexing: All requests share one connection
  ✓ Header compression (HPACK): 80-90% smaller headers
  ✓ Server push: Send resources before client asks
  ✓ Stream prioritization: Important resources first

Remaining problem:
  ✗ TCP head-of-line blocking: One lost packet blocks ALL streams
\`\`\`

**HTTP/3** (2022):
\`\`\`
QUIC (UDP-based) transport:
  ┌─────────────Single QUIC Connection───────────┐
  │ Stream 1: ▓▓░░▓▓▓▓░░  (independent!)         │
  │ Stream 2: ░▓▓✗▓░░▓▓░  (packet loss here)     │
  │ Stream 3: ░░▓▓░▓▓▓▓░  (unaffected by loss!)  │
  └──────────────────────────────────────────────┘

Improvements over HTTP/2:
  ✓ No HOL blocking (streams independent at transport)
  ✓ 0-RTT connection resumption
  ✓ Built-in encryption (TLS 1.3 integrated)
  ✓ Connection migration (survives IP change, e.g., WiFi→cellular)
\`\`\`

**Adoption**: HTTP/2 used by ~45% of websites. HTTP/3 used by ~30% (Google, Facebook, Cloudflare). All modern browsers support both.`
      },
      {
        question: 'When should you use TCP vs UDP, and what is QUIC?',
        answer: `**TCP** (Transmission Control Protocol):
- Reliable: Guarantees delivery via ACK and retransmission
- Ordered: Data arrives in the same order it was sent
- Connection-oriented: Three-way handshake before data transfer
- Flow and congestion control: Adapts to network conditions

\`\`\`
TCP Three-Way Handshake:
  Client ──SYN──▶ Server
  Client ◀──SYN-ACK── Server
  Client ──ACK──▶ Server
  (1.5 RTT before first data byte)
\`\`\`

**UDP** (User Datagram Protocol):
- Unreliable: No delivery guarantee
- Unordered: Packets may arrive out of order
- Connectionless: No handshake, send immediately
- No flow control: Application must handle congestion

\`\`\`
UDP: Client ──Data──▶ Server (immediate, no handshake)
\`\`\`

**QUIC** (Quick UDP Internet Connections):
- Reliable (like TCP) but built on UDP
- Per-stream ordering (no cross-stream HOL blocking)
- Built-in TLS 1.3 (encrypted by default)
- Connection migration (handles IP changes gracefully)
- 0-RTT resumption for repeat connections

**When to use each**:
| Protocol | Use When | Examples |
|----------|----------|---------|
| TCP | Need reliability, ordered delivery | HTTP/1.1, HTTP/2, databases, SSH |
| UDP | Need speed, can tolerate loss | DNS, video streaming, gaming, VoIP |
| QUIC | Need TCP reliability + UDP speed | HTTP/3, real-time apps, mobile |

**Why QUIC is built on UDP, not as a new protocol**:
- New transport protocols cannot traverse existing NATs and firewalls
- UDP passes through all existing network infrastructure
- QUIC implements reliability in user-space, not kernel
- Faster iteration and deployment than changing OS kernels`
      },
      {
        question: 'How does TLS 1.3 improve over TLS 1.2, and what is mTLS?',
        answer: `**TLS 1.3** improvements over 1.2:

\`\`\`
TLS 1.2 Handshake (2 RTT):
  Client ──ClientHello──────────────────▶ Server
  Client ◀──ServerHello+Cert+KeyExchange── Server
  Client ──KeyExchange+Finished──────────▶ Server
  Client ◀──Finished──────────────────── Server
  (2 round trips before encrypted data)

TLS 1.3 Handshake (1 RTT):
  Client ──ClientHello+KeyShare──────────▶ Server
  Client ◀──ServerHello+Cert+Finished──── Server
  Client ──Finished──────────────────────▶ Server
  (1 round trip before encrypted data!)

TLS 1.3 Resumption (0 RTT):
  Client ──ClientHello+EarlyData────────▶ Server
  (data sent on FIRST packet! zero round trips)
  Risk: Replay attacks on 0-RTT data
\`\`\`

**TLS 1.3 security improvements**:
- Removed insecure algorithms (RSA key exchange, RC4, SHA-1, etc.)
- Forward secrecy mandatory (ephemeral Diffie-Hellman only)
- Encrypted more of the handshake (certificate encrypted)
- Simpler, smaller attack surface

**mTLS (Mutual TLS)**:
Standard TLS: Only server presents certificate (server identity verified)
mTLS: BOTH client AND server present certificates (mutual verification)

\`\`\`
Standard TLS:
  Client ──────▶ Server
  Client verifies server cert ✓
  Server does NOT verify client ✗

mTLS:
  Client ──────▶ Server
  Client verifies server cert ✓
  Server verifies client cert ✓

  ┌─────────┐  mutual   ┌─────────┐
  │Service A│◀──TLS────▶│Service B│
  │ cert: A │  both     │ cert: B │
  │ CA: root│  verify   │ CA: root│
  └─────────┘           └─────────┘
\`\`\`

**mTLS use cases**:
- Microservices: Every service proves its identity to every other service
- Zero-trust networking: No implicit trust based on network location
- Service mesh (Istio): Automatic mTLS between all services
- API authentication: Client certificates instead of API keys

**Certificate management at scale**:
- Service mesh (Istio/Linkerd) automates certificate rotation
- Vault or cert-manager for certificate issuance
- Short-lived certificates (hours) reduce revocation complexity`
      },
      {
        question: 'How do you choose the right protocol for a system design?',
        answer: `**Decision framework based on requirements**:

\`\`\`
Question 1: Do you need reliability?
  YES → TCP or QUIC
  NO  → UDP

Question 2: Is latency critical?
  YES + Reliable → QUIC (HTTP/3)
  YES + Unreliable OK → UDP
  NO  → TCP (HTTP/2)

Question 3: Mobile or changing networks?
  YES → QUIC (connection migration)
  NO  → TCP is fine

Question 4: Browser-based?
  YES → HTTP/2 or HTTP/3 (browser supports both)
  NO  → Any protocol

Decision Tree:
                    Need Reliability?
                   /                 \\
                 YES                  NO
                 /                     \\
         Latency Critical?           UDP
         /           \\          (gaming, video,
       YES            NO         DNS, metrics)
       /               \\
     QUIC            TCP/HTTP/2
   (HTTP/3,         (APIs, web,
    mobile,          databases,
    real-time)       file transfer)
\`\`\`

**System Design Protocol Choices**:
| System | Protocol | Why |
|--------|----------|-----|
| Web API | HTTP/2 + TLS 1.3 | Standard, multiplexed, secure |
| Mobile API | HTTP/3 (QUIC) | Connection migration, 0-RTT |
| Microservice-to-microservice | gRPC over HTTP/2 + mTLS | Efficient, typed, authenticated |
| Real-time chat | WebSocket over TCP | Persistent bidirectional |
| Video streaming | QUIC or UDP (RTP) | Low latency, loss tolerant |
| Gaming | UDP with custom reliability | Minimum latency, selective reliability |
| Database connection | TCP | Reliability essential |
| DNS lookup | UDP (default), TCP (large responses) | Fast, stateless |
| IoT sensor data | MQTT over TCP or CoAP over UDP | Lightweight, resource-constrained |

**Performance comparison (typical)**:
\`\`\`
Connection setup latency (to first byte):
  HTTP/1.1 + TLS 1.2: ~150ms (TCP + TLS = 3 RTT)
  HTTP/2 + TLS 1.3:   ~100ms (TCP + TLS = 2 RTT)
  HTTP/3 (QUIC):       ~50ms  (QUIC = 1 RTT)
  HTTP/3 resumption:    ~0ms  (0-RTT!)
\`\`\``
      }
    ],

    basicImplementation: {
      title: 'HTTP/1.1 with TLS 1.2',
      description: 'Standard HTTPS setup with persistent connections and domain sharding for parallelism. Works everywhere but has head-of-line blocking and connection overhead.',
      svgTemplate: 'basicHTTP',
      problems: [
        'Head-of-line blocking limits request parallelism',
        'Multiple TCP connections waste resources (6 per domain)',
        'TLS 1.2 requires 2 RTT handshake',
        'No server push capability'
      ]
    },

    advancedImplementation: {
      title: 'HTTP/3 with mTLS and Protocol Negotiation',
      description: 'HTTP/3 (QUIC) as primary protocol with Alt-Svc header fallback to HTTP/2. mTLS for service-to-service communication. 0-RTT resumption for returning clients.',
      svgTemplate: 'advancedHTTP',
      keyPoints: [
        'HTTP/3 eliminates all head-of-line blocking with independent QUIC streams',
        'Alt-Svc header enables graceful upgrade from HTTP/2 to HTTP/3',
        '0-RTT resumption sends data on the first packet for returning clients',
        'mTLS ensures every service is authenticated and encrypted',
        'Connection migration handles mobile network switches without reconnection'
      ]
    },

    discussionPoints: [
      {
        topic: 'HTTP/2 Adoption Considerations',
        points: [
          'Most benefits come for free with modern servers (Nginx, Caddy)',
          'Single connection reduces TCP overhead and improves TLS efficiency',
          'Avoid domain sharding (counterproductive with multiplexing)',
          'Server push has been removed from Chrome due to low adoption',
          'Header compression (HPACK) significant for API-heavy applications'
        ]
      },
      {
        topic: 'QUIC and HTTP/3 Readiness',
        points: [
          'Supported by all major browsers (Chrome, Firefox, Safari, Edge)',
          'Cloudflare, Google, Facebook serve HTTP/3 in production',
          'Nginx has experimental QUIC support, Caddy has full support',
          'Some corporate firewalls block UDP, requiring TCP fallback',
          'Best for mobile users and high-latency connections'
        ]
      },
      {
        topic: 'Security Best Practices',
        points: [
          'Require TLS 1.3 minimum, disable TLS 1.0/1.1',
          'Use HSTS headers to enforce HTTPS',
          'Enable OCSP stapling for faster certificate validation',
          'Implement certificate pinning for mobile apps (with caution)',
          'Rotate certificates automatically (Let\'s Encrypt, cert-manager)'
        ]
      }
    ]
  },

  {
    id: 'long-polling-websockets-sse',
    title: 'Long Polling, WebSockets & SSE',
    icon: 'radio',
    color: '#8b5cf6',
    questions: 7,
    description: 'Real-time communication patterns: long polling, WebSockets, and Server-Sent Events.',
    introduction: `Traditional HTTP follows a **request-response** model where the client must initiate every interaction. But many modern applications need **real-time updates**: chat messages, live notifications, stock tickers, collaborative editing, and live sports scores. Three main patterns solve this: **long polling**, **WebSockets**, and **Server-Sent Events (SSE)**.

**Long polling** is the simplest approach: the client sends a request, and the server holds it open until new data is available. **WebSockets** establish a persistent bidirectional connection for full-duplex communication. **Server-Sent Events** provide a server-to-client push channel over standard HTTP. Each has distinct trade-offs in complexity, scalability, and use cases.

Choosing the right real-time pattern is a common system design decision. **Slack** uses WebSockets for real-time messaging. **Twitter** uses SSE for live timeline updates. **Facebook** originally used long polling before migrating to WebSockets. Understanding when to use each pattern — and how to scale them to millions of concurrent connections — is essential interview knowledge.`,

    concepts: [
      'Short polling vs long polling vs streaming',
      'WebSocket handshake and frame protocol',
      'Server-Sent Events (EventSource API)',
      'Connection management and heartbeats',
      'Scaling real-time connections with pub/sub',
      'Load balancing sticky sessions for stateful connections',
      'Reconnection and message replay strategies',
      'Multiplexing logical channels over single connections'
    ],

    tips: [
      'Start by explaining the problem: HTTP is request-response, but we need server-initiated updates',
      'Know the WebSocket upgrade handshake sequence from HTTP',
      'SSE is underused and underappreciated - mention it as a simpler alternative to WebSockets for unidirectional push',
      'Discuss scaling challenges: each WebSocket is a persistent connection consuming server resources',
      'Mention pub/sub (Redis, Kafka) as the backend pattern for fan-out to connected clients',
      'Always discuss reconnection handling - connections WILL drop'
    ],

    functionalRequirements: [
      'Deliver real-time updates from server to client with minimal delay',
      'Support bidirectional communication when needed',
      'Handle connection drops and automatic reconnection',
      'Support multiplexing multiple logical channels per connection',
      'Deliver missed messages after reconnection',
      'Scale to millions of concurrent connections'
    ],

    nonFunctionalRequirements: [
      'Message delivery latency: < 100ms for real-time features',
      'Connection overhead: Support 100K+ concurrent connections per server',
      'Reconnection: Auto-reconnect within 1-5 seconds',
      'Message ordering: Guaranteed per-channel ordering',
      'Bandwidth: Minimal protocol overhead per message',
      'Reliability: At-least-once delivery for critical messages'
    ],

    dataModel: {
      description: 'Real-time communication patterns comparison',
      schema: `Short Polling:
  Client ──GET──▶ Server: "Any updates?" → "No" (200, empty)
  Client ──GET──▶ Server: "Any updates?" → "No" (200, empty)
  Client ──GET──▶ Server: "Any updates?" → "Yes! Here's data" (200)
  Problem: Many wasted requests, latency = poll interval

Long Polling:
  Client ──GET──▶ Server: "Any updates?"
  Server holds connection open...
  ...waits for data... (30-60 second timeout)
  Server responds: "Here's data" (200)
  Client immediately re-establishes connection

WebSocket:
  Client ──HTTP Upgrade──▶ Server
  Server ◀──101 Switching──  Server
  Client ◀═══════════════▶ Server (persistent bidirectional)
  Frames: [opcode][length][payload]

Server-Sent Events (SSE):
  Client ──GET──▶ Server (Accept: text/event-stream)
  Server ──data: {"msg":"hello"}\\n\\n──▶ Client
  Server ──data: {"msg":"update"}\\n\\n──▶ Client
  Server ──data: {"msg":"more"}\\n\\n──▶ Client
  (Unidirectional: server → client only)

Protocol Overhead per message:
  Short Polling: ~800 bytes (full HTTP headers)
  Long Polling:  ~800 bytes (full HTTP headers per message)
  WebSocket:     ~6 bytes (2-byte header + 4-byte mask)
  SSE:           ~50 bytes (data: + \\n\\n framing)`
    },

    apiDesign: {
      description: 'Real-time communication API patterns',
      endpoints: [
        { method: 'GET', path: '/api/events/poll?since=timestamp', params: 'last event timestamp', response: 'Held open until new events or timeout (long polling)' },
        { method: 'GET', path: '/api/events/stream', params: 'Accept: text/event-stream', response: 'SSE stream: data: {...}\\n\\n' },
        { method: 'WS', path: 'ws://api/realtime', params: 'Upgrade: websocket', response: 'Bidirectional WebSocket connection' },
        { method: 'POST', path: '/api/events/publish', params: '{ channel, event, data }', response: 'Published to all subscribers' },
        { method: 'GET', path: '/api/events/replay?from=eventId', params: 'last received event ID', response: 'Missed events since eventId' }
      ]
    },

    keyQuestions: [
      {
        question: 'Compare long polling, WebSockets, and SSE - when should you use each?',
        answer: `**Long Polling**:
\`\`\`
Flow:
  Client ──GET /events?since=T──▶ Server
  Server: No new events, HOLD connection...
  ...30 seconds pass or new event arrives...
  Server ──Response with events──▶ Client
  Client immediately sends NEW request
  Repeat forever
\`\`\`
- Direction: Server → Client (simulated)
- Latency: Near-real-time (event delivered when response sent)
- Complexity: Low (standard HTTP)
- Use when: Simple notifications, broad compatibility needed

**WebSockets**:
\`\`\`
Flow:
  Client ──GET /ws (Upgrade: websocket)──▶ Server
  Server ──101 Switching Protocols──▶ Client
  Client ◀═══ Full duplex channel ═══▶ Server
  Client ──{"type":"msg","text":"hi"}──▶ Server
  Server ──{"type":"msg","text":"hello"}──▶ Client
\`\`\`
- Direction: Bidirectional
- Latency: Lowest (persistent connection, no overhead per message)
- Complexity: High (connection management, scaling)
- Use when: Chat, gaming, collaborative editing, trading platforms

**Server-Sent Events (SSE)**:
\`\`\`
Flow:
  Client ──GET /stream (Accept: text/event-stream)──▶ Server
  Server ──data: {"update":1}\\n\\n──▶ Client
  Server ──data: {"update":2}\\n\\n──▶ Client
  (connection stays open, server pushes)
\`\`\`
- Direction: Server → Client only
- Latency: Low (persistent connection)
- Complexity: Low (standard HTTP, auto-reconnect built in)
- Use when: Live feeds, notifications, dashboards, SSE streaming

**Comparison**:
| Feature | Long Polling | WebSocket | SSE |
|---------|-------------|-----------|-----|
| Direction | Server→Client | Bidirectional | Server→Client |
| Protocol | HTTP | WS (TCP) | HTTP |
| Auto reconnect | Manual | Manual | Built-in |
| Binary data | No | Yes | No (text only) |
| HTTP/2 compatible | Yes | No (own protocol) | Yes |
| Browser support | All | All modern | All modern |
| Complexity | Low | High | Low |`
      },
      {
        question: 'How do you scale WebSocket connections to millions of users?',
        answer: `**Challenge**: Each WebSocket is a persistent TCP connection. One server can handle ~100K connections with proper tuning, but millions require a distributed architecture.

\`\`\`
Scaling Architecture:
  ┌──────────────────────────────────────────────┐
  │           Load Balancer (L4 / sticky)        │
  └───────┬──────────┬──────────┬───────────────┘
          │          │          │
  ┌───────▼──┐ ┌────▼─────┐ ┌─▼──────────┐
  │  WS      │ │  WS      │ │  WS        │
  │ Server 1 │ │ Server 2 │ │ Server 3   │
  │ 100K     │ │ 100K     │ │ 100K       │
  │ clients  │ │ clients  │ │ clients    │
  └────┬─────┘ └────┬─────┘ └────┬───────┘
       │             │            │
       └─────────────┴────────────┘
                     │
              ┌──────▼──────┐
              │  Pub/Sub    │
              │  (Redis /   │
              │   Kafka)    │
              └─────────────┘
\`\`\`

**Key strategies**:

**1. Sticky sessions at load balancer**:
- WebSocket connections are stateful - client must connect to SAME server
- Use IP hash or cookie-based affinity at L4 load balancer
- Alternative: Store connection metadata in Redis, any server can route

**2. Pub/Sub for cross-server messaging**:
\`\`\`
User A (Server 1) sends message to User B (Server 2):
  Server 1 ──publish(channel:user_B, msg)──▶ Redis Pub/Sub
  Redis ──notify──▶ Server 2 (subscribed to channel:user_B)
  Server 2 ──WebSocket push──▶ User B
\`\`\`

**3. Connection-level optimizations**:
- Increase file descriptor limits: \`ulimit -n 1000000\`
- Use epoll (Linux) or kqueue (macOS) for efficient I/O multiplexing
- Heartbeats every 30s to detect dead connections
- Compression (permessage-deflate) to reduce bandwidth

**4. Horizontal scaling**:
- Stateless WS servers + Redis/Kafka for state
- Auto-scale WS server pool based on connection count
- Graceful drain: On scale-down, stop accepting new connections, wait for existing ones to close

**Real-world numbers**:
- Slack: ~1M concurrent WebSocket connections per workspace cluster
- Discord: Millions of concurrent connections across thousands of servers
- Phoenix (Elixir): Demonstrated 2M connections on single server`
      },
      {
        question: 'How does SSE work and when is it better than WebSockets?',
        answer: `**Server-Sent Events** use the \`EventSource\` browser API to receive a stream of events over a standard HTTP connection:

\`\`\`
Client Code:
  const source = new EventSource('/api/stream');
  source.onmessage = (event) => {
    console.log(event.data);  // {"price": 150.25}
  };

Server Response:
  HTTP/1.1 200 OK
  Content-Type: text/event-stream
  Cache-Control: no-cache
  Connection: keep-alive

  data: {"price": 150.25}

  event: trade
  data: {"symbol": "AAPL", "price": 150.50}

  id: 12345
  data: {"update": "latest"}

  : this is a comment (heartbeat)

  retry: 5000
\`\`\`

**Built-in features** (free with SSE):
1. **Auto-reconnect**: Browser automatically reconnects on disconnect
2. **Last-Event-ID**: On reconnect, sends last received \`id\` header
3. **Event types**: Named events with \`event:\` field
4. **Retry interval**: Server controls reconnect delay

**SSE is better than WebSockets when**:
- You only need server → client push (notifications, live feeds)
- You want standard HTTP infrastructure (proxies, load balancers, CDNs)
- You need auto-reconnect with last-event-ID replay
- You want HTTP/2 multiplexing (multiple SSE streams over one connection)
- You need simpler server-side implementation

**WebSockets are better when**:
- You need bidirectional communication (chat, gaming)
- You need binary data transfer
- You need lowest possible latency (no HTTP framing)
- Custom subprotocols are needed

\`\`\`
SSE + HTTP/2 (powerful combination):
  Single HTTP/2 Connection:
    Stream 1: SSE /notifications ───▶ push push push
    Stream 2: SSE /stock-prices  ───▶ push push push
    Stream 3: Regular HTTP requests ◀▶ API calls

  All multiplexed over one TCP connection!
\`\`\`

**In this codebase**: The Ascend backend uses SSE for streaming AI responses via \`/api/solve/stream\`, which is a perfect SSE use case — unidirectional server-to-client streaming of partial results.`
      },
      {
        question: 'How do you handle reconnection and missed messages in real-time systems?',
        answer: `**The problem**: Network connections WILL drop. When a client reconnects, it may have missed messages sent during the disconnection.

\`\`\`
Timeline:
  Connected: msg1 ──▶ msg2 ──▶ msg3 ──▶ [DISCONNECT]
  Offline:   msg4    msg5    msg6   (MISSED!)
  Reconnect: msg7 ──▶ ...

  Client missed msg4, msg5, msg6!
\`\`\`

**Strategy 1: Last-Event-ID (SSE built-in)**:
\`\`\`
Server sends:
  id: 1003
  data: {"msg": "hello"}

Client disconnects at id 1003
Client reconnects with header: Last-Event-ID: 1003
Server replays events 1004, 1005, 1006...

Requires: Server-side event log (Redis Stream, Kafka topic)
\`\`\`

**Strategy 2: Cursor-based catch-up**:
\`\`\`
Reconnection Flow:
  Client stores last received event ID locally
  On reconnect:
    1. Open new connection
    2. Request: GET /events?since=last_event_id
    3. Server sends missed events, then switches to live stream

  ┌──────────┐  GET /events?since=1003  ┌──────────┐
  │  Client  │─────────────────────────▶│  Server  │
  │          │                          │          │
  │          │◀─── events 1004,1005,1006│          │
  │          │◀─── live stream begins   │          │
  └──────────┘                          └──────────┘
\`\`\`

**Strategy 3: Periodic snapshots + delta**:
\`\`\`
Every N seconds, client requests full state:
  GET /api/state → full current state

Between snapshots, receive incremental updates:
  SSE: delta events applied to local state

On reconnect:
  1. Fetch full snapshot
  2. Subscribe to delta stream from snapshot version

Used by: Collaborative editors, game state sync
\`\`\`

**Backend infrastructure for replay**:
\`\`\`
                    ┌──────────────────┐
  Events published ▶│  Redis Stream /  │
                    │  Kafka Topic     │
                    │  (ordered log)   │
                    └──────┬───────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
          ┌───▼───┐   ┌───▼───┐   ┌───▼───┐
          │ WS    │   │ WS    │   │ WS    │
          │Server1│   │Server2│   │Server3│
          └───┬───┘   └───┬───┘   └───┬───┘
              │           │           │
          Clients     Clients     Clients

  On reconnect: Read from Redis Stream starting at last event ID
  Replay missed events, then switch to live subscription
\`\`\`

**Delivery guarantees**:
- At-most-once: Fire and forget (acceptable for non-critical updates)
- At-least-once: Retry until ACK (may duplicate, client must be idempotent)
- Exactly-once: Complex, use idempotency keys + deduplication`
      }
    ],

    basicImplementation: {
      title: 'Long Polling with REST API',
      description: 'Simple long polling endpoint that holds HTTP connections open until new data is available or timeout occurs. No persistent connections, works through all proxies and firewalls.',
      svgTemplate: 'longPolling',
      problems: [
        'High overhead: full HTTP headers on every response cycle',
        'Server resource waste holding open connections with no data',
        'Timeout management complexity (30-60 second timeout needed)',
        'Latency equals polling interval for non-event-driven implementations'
      ]
    },

    advancedImplementation: {
      title: 'WebSocket Hub with Redis Pub/Sub',
      description: 'WebSocket servers with Redis Pub/Sub for cross-server message fan-out. Supports named channels, presence tracking, message replay from Redis Streams on reconnection.',
      svgTemplate: 'websocketHub',
      keyPoints: [
        'Redis Pub/Sub enables message delivery across WebSocket server instances',
        'Redis Streams provide ordered message log for reconnection replay',
        'Channel-based subscription allows efficient targeted delivery',
        'Heartbeats detect and clean up dead connections',
        'Graceful degradation to SSE or long polling for restricted networks'
      ]
    },

    discussionPoints: [
      {
        topic: 'Choosing the Right Real-Time Pattern',
        points: [
          'Notifications/feeds: SSE (simple, auto-reconnect, HTTP compatible)',
          'Chat/messaging: WebSockets (bidirectional, low latency)',
          'Live dashboards: SSE (server push, HTTP/2 multiplexing)',
          'Online gaming: WebSockets (bidirectional, binary data)',
          'Legacy system integration: Long polling (works everywhere)'
        ]
      },
      {
        topic: 'Scaling Challenges',
        points: [
          'Connection count: Millions of persistent connections consume memory',
          'Fan-out: Broadcasting to 1M users requires efficient pub/sub',
          'Sticky sessions: Stateful connections complicate load balancing',
          'Thundering herd: Mass reconnection after server restart',
          'Resource cleanup: Detect and release dead connections promptly'
        ]
      },
      {
        topic: 'Production Best Practices',
        points: [
          'Always implement heartbeats (30-60 second interval)',
          'Use exponential backoff for reconnection attempts',
          'Implement message deduplication for at-least-once delivery',
          'Monitor connection count, message throughput, and latency per server',
          'Plan for graceful shutdown: drain connections before server restart'
        ]
      }
    ]
  },

  {
    id: 'cap-pacelc-deep-dive',
    title: 'CAP & PACELC Deep Dive',
    icon: 'scale',
    color: '#10b981',
    questions: 8,
    description: 'CAP theorem deep dive, PACELC extension, and practical trade-off analysis for distributed systems.',
    introduction: `The **CAP theorem**, formulated by Eric Brewer in 2000 and proven by Gilbert and Lynch in 2002, states that a distributed system can provide at most two of three guarantees: **Consistency**, **Availability**, and **Partition tolerance**. Since network partitions are inevitable in distributed systems, the real choice is between consistency and availability during a partition.

However, CAP only describes behavior during failures. The **PACELC** theorem (Abadi, 2012) extends CAP to describe the trade-off during normal operation: even when there is no partition, you must choose between **Latency** and **Consistency**. This is the trade-off that systems face 99.99% of the time, making PACELC arguably more useful for day-to-day design decisions.

Understanding these theorems deeply — beyond the surface-level definitions — is critical for system design interviews. You need to know how specific databases map to these trade-offs, why "choosing CA" is not actually possible in a distributed system, and how to reason about consistency models (linearizability, causal, eventual) in the context of your design. **Every database and distributed system choice is ultimately a position on the CAP/PACELC spectrum.**`,

    concepts: [
      'CAP theorem: C, A, P definitions and proof intuition',
      'Why partition tolerance is not optional in distributed systems',
      'CP vs AP: the real trade-off during partitions',
      'PACELC: extending CAP to normal operation (latency vs consistency)',
      'Consistency models: linearizable, sequential, causal, eventual',
      'Tunable consistency (Cassandra, DynamoDB)',
      'Harvest and yield as alternatives to binary CAP',
      'Real-world database classification on the CAP/PACELC spectrum'
    ],

    tips: [
      'Start by clarifying that network partitions WILL happen - so the real choice is CP or AP',
      'Mention PACELC to show depth beyond the basic CAP discussion',
      'Know 3-4 databases for each CAP category with specific justification',
      'Discuss tunable consistency as the modern approach (not binary CP/AP)',
      'Explain consistency models beyond "strong" and "eventual" - know causal consistency',
      'Connect CAP/PACELC to concrete business decisions: banking (CP) vs social feed (AP)'
    ],

    functionalRequirements: [
      'Read and write data across distributed nodes',
      'Maintain chosen consistency guarantees under all conditions',
      'Continue serving requests during network partitions',
      'Support configurable consistency levels per operation',
      'Detect and recover from network partitions',
      'Provide clear consistency semantics to application developers'
    ],

    nonFunctionalRequirements: [
      'Consistency: Configurable from eventual to linearizable',
      'Availability: 99.9% to 99.999% depending on CP/AP choice',
      'Partition tolerance: System continues operating during network splits',
      'Latency: < 10ms for eventual, < 100ms for strong consistency',
      'Throughput: Strong consistency reduces throughput by 30-50% vs eventual',
      'Recovery: Automatic reconciliation after partition heals'
    ],

    dataModel: {
      description: 'CAP theorem and PACELC classification of distributed systems',
      schema: `CAP Theorem Venn Diagram:
         ┌───────────────────────────────┐
         │         Consistency (C)       │
         │    "Every read returns the    │
         │     most recent write"        │
         │         ┌─────┐              │
         │    CP   │ CA  │              │
         │         │(not │              │
         │         │real)│   AP          │
         │         └─────┘              │
         │  Availability (A)  Partition │
         │  "Every request    Tolerance │
         │   gets a response" (P)       │
         └───────────────────────────────┘

  CA = Only possible on single node (not distributed!)
  CP = Consistent during partition (may refuse requests)
  AP = Available during partition (may return stale data)

PACELC Extension:
  If Partition → choose C or A  (same as CAP)
  Else (normal) → choose L or C  (new insight!)

  PA/EL: Available during partition, Low latency normally
         → Cassandra, DynamoDB (eventual consistency default)

  PC/EC: Consistent during partition, Consistent normally
         → MongoDB, HBase (strong consistency, higher latency)

  PA/EC: Available during partition, Consistent normally
         → Cosmos DB (multi-consistency levels)

  PC/EL: Consistent during partition, Low latency normally
         → Rare (contradictory, usually PC implies EC)

Database Classification:
  CP: MongoDB, HBase, Redis Cluster, etcd, ZooKeeper
  AP: Cassandra, DynamoDB, CouchDB, Riak
  Tunable: Cassandra (per-query), Cosmos DB (per-container)`
    },

    apiDesign: {
      description: 'Consistency level configuration across databases',
      endpoints: [
        { method: 'QUERY', path: 'Cassandra: SELECT * FROM users (CL=QUORUM)', params: 'consistency_level', response: 'Strong consistency read (W+R>N)' },
        { method: 'QUERY', path: 'Cassandra: SELECT * FROM users (CL=ONE)', params: 'consistency_level', response: 'Eventual consistency read (fastest)' },
        { method: 'QUERY', path: 'DynamoDB: GetItem (ConsistentRead=true)', params: 'ConsistentRead flag', response: 'Strongly consistent read from leader' },
        { method: 'QUERY', path: 'Cosmos DB: SELECT * (Session consistency)', params: 'consistency_level', response: 'Read-your-writes within session' },
        { method: 'CONFIG', path: 'MongoDB: readConcern("majority")', params: 'readConcern level', response: 'Only return data acknowledged by majority' }
      ]
    },

    keyQuestions: [
      {
        question: 'Explain the CAP theorem and why you cannot have all three',
        answer: `**CAP Theorem**: In a distributed system, during a network partition, you must choose between consistency and availability.

\`\`\`
Scenario: Two nodes, A and B, with a network partition between them

              ┌──── Network Partition ────┐
  ┌────────┐  │  ✗ ✗ ✗ ✗ ✗ ✗ ✗ ✗ ✗ ✗   │  ┌────────┐
  │ Node A │  │  (cannot communicate)    │  │ Node B │
  │ x = 5  │  │                          │  │ x = 3  │
  └────────┘  └──────────────────────────┘  └────────┘

Client writes x = 5 to Node A.
Node A cannot replicate to Node B (partition).

Another client reads x from Node B.
What happens?
\`\`\`

**Choice 1 - CP (Consistency)**:
- Node B refuses the read: "I might be stale, cannot guarantee latest value"
- System is CONSISTENT (no stale reads) but NOT AVAILABLE (Node B refused)
- Example: HBase returns error during partition

**Choice 2 - AP (Availability)**:
- Node B returns x = 3 (its last known value)
- System is AVAILABLE (responded) but NOT CONSISTENT (returned stale data)
- Example: Cassandra returns stale data during partition

**Why not CA?**:
- "CA" means consistent and available but NOT partition tolerant
- In a distributed system, you CANNOT choose to not have partitions
- Network failures, switch failures, cable cuts WILL happen
- "CA" only exists for single-node systems (which are not distributed)

**Important nuance**: CAP is about behavior DURING a partition. When the network is healthy, you can have both C and A. This is why PACELC is more useful for normal operation.`
      },
      {
        question: 'What is the PACELC theorem and why does it matter?',
        answer: `**PACELC** extends CAP to address the trade-off during NORMAL operation (no partition):

**P**artition → choose **A**vailability or **C**onsistency
**E**lse (no partition) → choose **L**atency or **C**onsistency

\`\`\`
PACELC Decision Tree:

  Is there a network partition?
       /              \\
     YES               NO (99.99% of the time!)
      │                │
  Choose:           Choose:
  A or C            L or C
  (same as CAP)     (NEW insight!)

  A = serve requests    L = fast responses
      (may be stale)        (may be stale)
  C = reject or wait    C = wait for consensus
      (guaranteed fresh)    (guaranteed fresh, slower)
\`\`\`

**Why PACELC matters more than CAP in practice**:
- Network partitions are rare (minutes per year)
- Latency vs consistency trade-off is faced on EVERY request
- This trade-off determines user experience and system design

**Database classification**:
\`\`\`
PA/EL (Available + Low Latency):
  Cassandra (default):  Write to one node, read from one node
  DynamoDB (default):   Eventually consistent reads (fast)
  Riak:                 Available, async replication

PC/EC (Consistent + Consistent):
  MongoDB:    Reads from primary, waits for majority writes
  HBase:      Single-master consistency, no availability during partition
  Spanner:    Global strong consistency via TrueTime + Paxos
  etcd:       Raft consensus, all reads go through leader

PA/EC (Available during partition + Consistent normally):
  Cosmos DB:  Configurable per container
  Cassandra:  With QUORUM consistency level
  DynamoDB:   With ConsistentRead=true

Real-world implication:
  Banking: PC/EC (never show wrong balance, even if slower)
  Social feed: PA/EL (show something fast, stale is OK)
  Shopping cart: PA/EC (available always, consistent when possible)
\`\`\`

**Key insight**: Most modern databases let you CHOOSE where to sit on this spectrum, per operation. Cassandra with CL=ONE is PA/EL, with CL=QUORUM it is PC/EC.`
      },
      {
        question: 'What are the different consistency models and how do they relate to CAP?',
        answer: `**Consistency models** define what guarantees a distributed system provides about the ordering and visibility of reads and writes:

\`\`\`
Strongest ────────────────────────────── Weakest
Linearizable → Sequential → Causal → Eventual

Linearizable (Strongest):
  "Every read returns the most recent write, as if there
   were a single copy of the data."

  Time:  ──────────────────────────────────▶
  Write: x=1 ──────── x=2
  Read:        x=1          x=2    x=2

  ALL readers see x=2 after the write completes.
  Requires coordination (consensus protocol).
  Example: etcd, ZooKeeper, Spanner

Sequential Consistency:
  "All operations appear in some sequential order consistent
   with each process's program order."

  Write (A): x=1
  Write (B): x=2
  Read (C):  Could see x=1 then x=2, or x=2 then x=1
  BUT: Once C sees x=2, it NEVER sees x=1 again
  Example: ZooKeeper reads (non-sync)

Causal Consistency:
  "Operations that are causally related are seen in order.
   Concurrent operations may be seen in any order."

  A writes x=1
  B reads x=1, then writes y=2 (causally dependent on x=1)
  C must see x=1 before y=2 (causal order preserved)
  D writes z=3 (independent) → can be seen in any order
  Example: MongoDB (causal consistency session)

Eventual Consistency:
  "If no new writes, all replicas will eventually converge."

  Write x=1 to Node A
  Read from Node B: might return old value
  ...eventually (seconds to minutes)...
  All nodes agree: x=1
  Example: DynamoDB (default), Cassandra (CL=ONE), DNS
\`\`\`

**Practical implications**:
| Consistency | Latency | Use Case |
|-------------|---------|----------|
| Linearizable | Highest (consensus needed) | Financial transactions, leader election |
| Sequential | High | Distributed locks, configuration |
| Causal | Medium | Social feeds (see own writes + causal dependencies) |
| Eventual | Lowest | Caching, analytics, metrics, DNS |

**Read-your-writes consistency**: A special guarantee where a process always sees its own writes. Important for user experience (write a comment, immediately see it). Can be achieved even with eventual consistency by routing reads to the same node that handled the write.`
      },
      {
        question: 'How do real-world systems navigate CAP/PACELC trade-offs?',
        answer: `**Case Study 1: Amazon DynamoDB**
\`\`\`
Default: AP / EL (Available + Low Latency)
  Write: Acknowledged by one node, replicated async
  Read:  Eventually consistent (fast, from any replica)

Optional: CP / EC (Consistent + Consistent)
  Read:  ConsistentRead=true (reads from leader, slower)
  Transactions: TransactWriteItems (ACID across items)

Architecture:
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Node A   │◀──▶│ Node B   │◀──▶│ Node C   │
  │ (leader) │    │ (replica)│    │ (replica)│
  └──────────┘    └──────────┘    └──────────┘

  Eventually consistent read: Any node (fast)
  Strongly consistent read: Leader only (slower)
\`\`\`

**Case Study 2: Google Spanner**
\`\`\`
Classification: PC/EC (Consistent everywhere!)
  How? TrueTime: GPS + atomic clocks for global timestamp ordering
  Trade-off: Higher write latency (cross-region consensus)

  Write commit latency: 10-100ms (Paxos across zones)
  Read latency: < 10ms (local read from any replica with timestamp)

  Use case: Global financial systems, Google Ads, Google Play
  Why: "Strong consistency globally" is worth the latency cost
\`\`\`

**Case Study 3: Slack (Practical Trade-offs)**
\`\`\`
Messages: CP within workspace shard
  → Users MUST see messages in order
  → MySQL with strong consistency within shard

Presence (online/offline): AP
  → Eventual consistency is fine
  → Seeing someone "online" 30s after they left is acceptable

Read receipts: AP
  → Best effort, eventual consistency
  → Missing a read receipt is not critical

Search index: AP
  → Eventual consistency (Elasticsearch)
  → New messages searchable within seconds, not instantly
\`\`\`

**Key lesson**: Real systems do not pick one CAP position for everything. They use different consistency levels for different data types based on business requirements:

\`\`\`
Data Type          │ Consistency │ Why
───────────────────┼─────────────┼───────────────────
Financial balance  │ Linearizable│ Cannot show wrong $
User profile       │ Read-your-writes│ See own changes
Social feed        │ Eventual    │ Slight delay OK
Analytics/metrics  │ Eventual    │ Aggregate, not exact
Inventory count    │ Linearizable│ Overselling is costly
Session data       │ Read-your-writes│ User experience
Chat messages      │ Causal      │ Order matters
Recommendations    │ Eventual    │ Stale is fine
\`\`\``
      }
    ],

    basicImplementation: {
      title: 'Single-Node Database (CA, No Distribution)',
      description: 'Traditional single-server database providing both consistency and availability. No partition tolerance because there is no distribution. Simple but limited by single-machine capacity.',
      svgTemplate: 'singleNodeDB',
      problems: [
        'Single point of failure - no redundancy',
        'Cannot scale beyond single machine capacity',
        'No geographic distribution for global users',
        'Not a distributed system - CAP does not apply'
      ]
    },

    advancedImplementation: {
      title: 'Tunable Consistency Distributed Database',
      description: 'Multi-node database with configurable consistency levels per operation. Write path supports ONE (fast) to ALL (strong). Read path supports eventual to linearizable. Quorum-based (W + R > N) for strong consistency when needed.',
      svgTemplate: 'tunableConsistency',
      keyPoints: [
        'Per-operation consistency level lets applications choose the right trade-off',
        'Quorum (W=2, R=2, N=3) provides strong consistency with one-node fault tolerance',
        'Eventual consistency (W=1, R=1) provides lowest latency for non-critical reads',
        'Causal consistency via client session tokens tracks read-your-writes',
        'Monitoring replication lag helps applications make informed consistency choices'
      ]
    },

    discussionPoints: [
      {
        topic: 'CAP Misconceptions',
        points: [
          '"CA" is not a valid choice for distributed systems - partitions are unavoidable',
          'CAP is about behavior DURING partition, not normal operation',
          'CP does not mean "always consistent" - only during partition at availability cost',
          'AP does not mean "always available" - other failures can still cause unavailability',
          'PACELC is more practical because it addresses normal operation trade-offs'
        ]
      },
      {
        topic: 'Choosing Consistency for Your Design',
        points: [
          'Start with business requirements: what is the cost of inconsistency?',
          'Financial data: linearizable (wrong balance = legal/monetary risk)',
          'User-facing writes: read-your-writes (user experience)',
          'Analytics: eventual (aggregates tolerate slight inaccuracy)',
          'Use different consistency for different data types in the same system'
        ]
      },
      {
        topic: 'Beyond CAP: Harvest and Yield',
        points: [
          'Harvest: Fraction of data included in response (completeness)',
          'Yield: Fraction of requests that receive a response (availability)',
          'Trading harvest for yield: Return partial results instead of nothing',
          'Example: Search engine returns results from available shards, skips unavailable ones',
          'More nuanced than binary CAP: graceful degradation instead of total failure'
        ]
      }
    ]
  }
];

export const systemDesignFundamentalsCategoryMap = {
  'consistent-hashing': 'scalability',
  'bloom-filters': 'storage',
  'data-partitioning': 'storage',
  'database-indexes': 'storage',
  'proxies': 'communication',
  'dns-deep-dive': 'fundamentals',
  'cdn-deep-dive': 'scalability',
  'redundancy-replication': 'reliability',
  'network-essentials': 'communication',
  'long-polling-websockets-sse': 'communication',
  'cap-pacelc-deep-dive': 'fundamentals',
};
