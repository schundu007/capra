// Concurrency topics

export const concurrencyTopics = [
    {
      id: 'concurrency-fundamentals',
      title: 'Concurrency Fundamentals',
      icon: 'cpu',
      color: '#10b981',
      description: 'Core concepts of concurrent programming',

      introduction: `Concurrency is the ability of a system to handle multiple tasks simultaneously. Understanding concurrency is essential for building efficient, scalable software systems.

In interviews, you'll be expected to understand the difference between processes and threads, recognize race conditions, and know how to prevent deadlocks.`,

      basicImplementation: {
        title: 'Process vs Thread',
        description: 'Concurrency manages multiple tasks through time-slicing (illusion of parallelism). Parallelism executes tasks truly simultaneously on multiple cores. Processes have isolated memory (higher overhead, IPC needed). Threads share memory within a process (lower overhead, need synchronization).',
        svgTemplate: 'concurrencyFundamentals'
      },

      coreEntities: [
        { name: 'Process vs Thread', description: 'Process has own memory space; threads share memory within a process' },
        { name: 'Parallelism vs Concurrency', description: 'Parallelism is simultaneous execution; concurrency is managing multiple tasks' },
        { name: 'Race Condition', description: 'When output depends on timing of uncontrollable events' },
        { name: 'Critical Section', description: 'Code section accessing shared resources that needs protection' },
        { name: 'Deadlock', description: 'Circular wait where threads block each other forever' },
        { name: 'Starvation', description: 'Thread never gets resources despite being ready to run' },
        { name: 'Livelock', description: 'Threads keep responding to each other without making progress' }
      ]
    },
    {
      id: 'synchronization-primitives',
      title: 'Synchronization Primitives',
      icon: 'lock',
      color: '#3b82f6',
      description: 'Locks, mutexes, semaphores, and more',

      introduction: `Synchronization primitives are the building blocks for coordinating access to shared resources in concurrent programs. They prevent race conditions and ensure thread safety.`,

      primitives: [
        { name: 'Mutex', description: 'Mutual exclusion lock - only one thread can hold it', example: 'threading.Lock() in Python' },
        { name: 'Semaphore', description: 'Counting lock allowing N concurrent accesses', example: 'threading.Semaphore(n)' },
        { name: 'Condition Variable', description: 'Wait for specific condition with notification', example: 'threading.Condition()' },
        { name: 'Read-Write Lock', description: 'Multiple readers OR one writer', example: 'threading.RLock()' },
        { name: 'Barrier', description: 'Wait until all threads reach a point', example: 'threading.Barrier(n)' }
      ]
    },
    {
      id: 'classic-problems',
      title: 'Classic Concurrency Problems',
      icon: 'alertTriangle',
      color: '#ef4444',
      description: 'Producer-Consumer, Readers-Writers, Dining Philosophers',

      introduction: `These classic problems are frequently asked in interviews and demonstrate fundamental concurrency patterns. Understanding their solutions helps you tackle real-world synchronization challenges.`,

      basicImplementation: {
        title: 'Producer-Consumer Pattern',
        description: 'Producers add items to a bounded buffer while consumers remove them. Uses semaphores (empty_slots, filled_slots) and mutex for synchronization. Producer: wait(empty)→lock→add→unlock→signal(filled). Consumer: wait(filled)→lock→remove→unlock→signal(empty).',
        svgTemplate: 'producerConsumer'
      },

      problems: [
        {
          name: 'Producer-Consumer',
          description: 'Producers add items to buffer, consumers remove. Must handle full/empty buffer.',
          solution: 'Use bounded queue with semaphores or condition variables'
        },
        {
          name: 'Readers-Writers',
          description: 'Multiple readers can read simultaneously, but writers need exclusive access.',
          solution: 'Read-write locks with reader/writer preference strategies'
        },
        {
          name: 'Dining Philosophers',
          description: 'N philosophers share N forks, need 2 forks to eat. Avoid deadlock.',
          solution: 'Resource hierarchy, arbitrator, or Chandy-Misra solution'
        }
      ]
    },
    {
      id: 'thread-pools',
      title: 'Thread Pools',
      icon: 'layers',
      color: '#8b5cf6',
      description: 'Managing worker threads efficiently',

      introduction: `Thread pools manage a collection of reusable worker threads to execute tasks. They reduce overhead from thread creation/destruction and prevent resource exhaustion from unbounded thread spawning.`,

      basicImplementation: {
        title: 'Thread Pool Architecture',
        description: 'Managing worker threads efficiently with task queue and bounded concurrency',
        svgTemplate: 'threadPool',
        architecture: `
┌──────────────────────────────────────────────────────────────────────────┐
│                           Thread Pool                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐    ┌──────────────────────────────────────────────┐ │
│  │  Task Submitter │───►│              Task Queue                       │ │
│  │  (Main Thread)  │    │  [Task1][Task2][Task3][Task4][Task5]...      │ │
│  └─────────────────┘    └──────────────────────────────────────────────┘ │
│                                         │                                 │
│                                         ▼                                 │
│         ┌───────────────────────────────────────────────────────┐        │
│         │                   Worker Threads                       │        │
│         │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │        │
│         │  │Worker 1 │  │Worker 2 │  │Worker 3 │  │Worker 4 │   │        │
│         │  │ [busy]  │  │ [idle]  │  │ [busy]  │  │ [idle]  │   │        │
│         │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │        │
│         │       │            │            │            │         │        │
│         │       ▼            ▼            ▼            ▼         │        │
│         │   Execute      Wait for      Execute     Wait for     │        │
│         │   Task 1       next task     Task 3      next task    │        │
│         └───────────────────────────────────────────────────────┘        │
│                                         │                                 │
│                                         ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        Completed Results                          │   │
│  │                    Future1 ✓  Future2 ✓  Future3 ...              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  Benefits:                                                                │
│  • Reuse threads (no creation overhead)                                  │
│  • Bounded concurrency (prevent resource exhaustion)                     │
│  • Task queue handles bursts gracefully                                  │
└──────────────────────────────────────────────────────────────────────────┘`
      },

      concepts: [
        'Reuse threads instead of creating/destroying',
        'Bounded pool prevents resource exhaustion',
        'Task queue for work distribution',
        'ThreadPoolExecutor in Python, ExecutorService in Java'
      ],

      implementation: `from concurrent.futures import ThreadPoolExecutor
import time

def task(n):
    print(f"Task {n} starting")
    time.sleep(1)
    return n * 2

# Create pool with 4 workers
with ThreadPoolExecutor(max_workers=4) as executor:
    # Submit tasks
    futures = [executor.submit(task, i) for i in range(10)]

    # Get results
    for future in futures:
        print(f"Result: {future.result()}")`
    },
    {
      id: 'concurrent-data-structures',
      title: 'Concurrent Data Structures',
      icon: 'database',
      color: '#06b6d4',
      description: 'Thread-safe collections and atomic operations',

      introduction: `Concurrent data structures are designed for safe access by multiple threads without external synchronization. They use techniques like lock-free algorithms, fine-grained locking, and copy-on-write semantics.`,

      structures: [
        { name: 'ConcurrentHashMap', description: 'Segment-level locking for high concurrency' },
        { name: 'BlockingQueue', description: 'Thread-safe queue with blocking operations' },
        { name: 'CopyOnWriteArrayList', description: 'Snapshot semantics for read-heavy workloads' },
        { name: 'AtomicInteger', description: 'Lock-free atomic operations via CAS' }
      ]
    }
  ];

  // Behavioral Topics
  // Behavioral topic categories for organized display
