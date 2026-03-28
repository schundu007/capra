// Low-level design problems

export const lldProblems = [
    {
      id: 'lru-cache',
      title: 'LRU Cache',
      subtitle: 'Least Recently Used Cache',
      icon: 'database',
      color: '#10b981',
      difficulty: 'Medium',
      description: 'Design a data structure that stores key-value pairs with automatic eviction of least recently accessed items.',

      introduction: `The LRU Cache is a fundamental data structure problem that tests your understanding of hash maps, doubly linked lists, and cache eviction policies. It's commonly asked in interviews at top tech companies.

The key insight is combining two data structures: a HashMap provides O(1) lookup while a doubly linked list maintains usage order with head as Most Recently Used and tail as Least Recently Used.`,

      functionalRequirements: [
        'get(key): Returns value if key exists, otherwise returns -1',
        'put(key, value): Inserts new pair or updates existing value',
        'Automatic eviction of least recently used item when capacity exceeded',
        'Both operations update recency of accessed/inserted items',
        'Generic key-value support (keys must be hashable)'
      ],

      nonFunctionalRequirements: [
        'Time Complexity: O(1) average for both get and put operations',
        'Thread Safety: Must be thread-safe for concurrent environments',
        'Modularity: Clean OOP design with separation of concerns',
        'Memory Efficiency: Optimized for speed and space constraints'
      ],

      coreEntities: [
        { name: 'Node<K, V>', description: 'Contains key, value, and prev/next pointers for linked list' },
        { name: 'DoublyLinkedList<K, V>', description: 'Manages node ordering with addFirst, remove, moveToFront, removeLast operations' },
        { name: 'LRUCache<K, V>', description: 'Main class with capacity, map, and list - coordinates lookup and ordering' }
      ],

      designPatterns: [
        'Composite Pattern: Node combines data with list linkage',
        'Facade Pattern: LRUCache hides complexity of two data structures',
        'Iterator Pattern: For traversing cache contents'
      ],

      keyInsight: `Store the key in each Node because eviction requires removing items from both the linked list AND HashMap. Without the key stored, identifying which HashMap entry to remove would require O(n) traversal.`,

      basicImplementation: {
        title: 'LRU Cache Architecture',
        description: 'Combines HashMap for O(1) lookup with Doubly Linked List for O(1) order management. HEAD = Most Recently Used, TAIL = Least Recently Used (evict first). get(key) returns value and moves to front. put(key,val) inserts at front, evicts LRU if full.',
        svgTemplate: 'lruCache'
      },

      implementation: `class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}  # key -> Node
        # Dummy head and tail to avoid edge cases
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _add_to_front(self, node):
        """Add node right after head (MRU position)"""
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def _remove(self, node):
        """Remove node from its current position"""
        node.prev.next = node.next
        node.next.prev = node.prev

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add_to_front(node)
            return node.value
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._remove(node)
            self._add_to_front(node)
        else:
            if len(self.cache) >= self.capacity:
                # Remove LRU (node before tail)
                lru = self.tail.prev
                self._remove(lru)
                del self.cache[lru.key]

            new_node = Node(key, value)
            self.cache[key] = new_node
            self._add_to_front(new_node)`
    },
    {
      id: 'parking-lot',
      title: 'Parking Lot',
      subtitle: 'Vehicle Parking System',
      icon: 'car',
      color: '#3b82f6',
      difficulty: 'Medium',
      description: 'Design a parking lot system managing multiple floors with different spot sizes for various vehicle types.',

      introduction: `The parking lot system is a classic LLD interview problem that tests your OOP design skills. It involves managing vehicle parking across multiple floors with different spot sizes, handling concurrent entry/exit, and calculating fees.`,

      functionalRequirements: [
        'Support multiple floors with configurable parking spots',
        'Handle three vehicle types: bikes, cars, and trucks',
        'Classify spots by size (small, compact, large)',
        'Automatically assign compatible spots',
        'Issue tickets tracking entry/exit times',
        'Calculate fees based on duration',
        'Display real-time availability by floor and size'
      ],

      nonFunctionalRequirements: [
        'Follow OOP principles with clear separation of concerns',
        'Handle concurrent entry/exit without race conditions',
        'Be modular and extensible for future enhancements',
        'Ensure thread-safe concurrent access'
      ],

      parkingRules: [
        'Bikes → small spots only',
        'Cars → compact or large spots',
        'Trucks → large spots only'
      ],

      coreEntities: [
        { name: 'ParkingLot', description: 'Main orchestrator managing floors and overall operations' },
        { name: 'Floor', description: 'Manages parking spots on a single level' },
        { name: 'ParkingSpot', description: 'Individual parking space with size and availability' },
        { name: 'Vehicle', description: 'Abstract class for Bike, Car, Truck types' },
        { name: 'ParkingTicket', description: 'Tracks entry time, spot, and vehicle' },
        { name: 'PricingStrategy', description: 'Interface for different fee calculation methods' }
      ],

      designPatterns: [
        'Strategy Pattern: Flexible pricing models (hourly, daily, monthly)',
        'Factory Pattern: Vehicle and spot creation',
        'Observer Pattern: Notify displays of availability changes',
        'Singleton Pattern: Single ParkingLot instance'
      ],

      basicImplementation: {
        title: 'Parking Lot System',
        description: 'ParkingLot (Singleton) manages multiple Floors with ParkingSpots. Vehicle hierarchy (Bike/Car/Truck) with SpotSize compatibility. PricingStrategy interface for flexible fee calculation. Entry/Exit issues ParkingTicket tracking vehicle, spot, and time.',
        svgTemplate: 'parkingLot'
      },

      implementation: `from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime
from threading import Lock

class VehicleType(Enum):
    BIKE = 1
    CAR = 2
    TRUCK = 3

class SpotSize(Enum):
    SMALL = 1
    COMPACT = 2
    LARGE = 3

class Vehicle(ABC):
    def __init__(self, license_plate: str):
        self.license_plate = license_plate

    @abstractmethod
    def get_type(self) -> VehicleType:
        pass

class Car(Vehicle):
    def get_type(self) -> VehicleType:
        return VehicleType.CAR

class ParkingSpot:
    def __init__(self, spot_id: str, size: SpotSize, floor: int):
        self.spot_id = spot_id
        self.size = size
        self.floor = floor
        self.vehicle = None
        self.lock = Lock()

    def is_available(self) -> bool:
        return self.vehicle is None

    def can_fit(self, vehicle: Vehicle) -> bool:
        if vehicle.get_type() == VehicleType.BIKE:
            return self.size == SpotSize.SMALL
        elif vehicle.get_type() == VehicleType.CAR:
            return self.size in [SpotSize.COMPACT, SpotSize.LARGE]
        else:  # TRUCK
            return self.size == SpotSize.LARGE

    def park(self, vehicle: Vehicle) -> bool:
        with self.lock:
            if self.is_available() and self.can_fit(vehicle):
                self.vehicle = vehicle
                return True
            return False

class ParkingTicket:
    def __init__(self, vehicle: Vehicle, spot: ParkingSpot):
        self.vehicle = vehicle
        self.spot = spot
        self.entry_time = datetime.now()
        self.exit_time = None

class ParkingLot:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.floors = []
        self.active_tickets = {}

    def park_vehicle(self, vehicle: Vehicle) -> ParkingTicket:
        for floor in self.floors:
            for spot in floor.spots:
                if spot.park(vehicle):
                    ticket = ParkingTicket(vehicle, spot)
                    self.active_tickets[vehicle.license_plate] = ticket
                    return ticket
        return None  # No available spot`
    },
    {
      id: 'elevator-system',
      title: 'Elevator System',
      subtitle: 'Multi-Elevator Controller',
      icon: 'arrowUpDown',
      color: '#8b5cf6',
      difficulty: 'Hard',
      description: 'Design an elevator system with multiple elevators, efficient scheduling, and the LOOK algorithm.',

      introduction: `An elevator system combines mechanical and software components to transport people vertically. The design manages movement control, door operations, user requests, and scheduling logic using algorithms like SCAN and LOOK.`,

      functionalRequirements: [
        'Support multiple elevators serving multiple floors',
        'Handle internal requests (cabin buttons) and external requests (hall buttons with direction)',
        'Dispatch requests to suitable elevators using configurable strategies',
        'Implement LOOK algorithm for efficient request serving',
        'Display current floor and direction',
        'Run each elevator independently in separate threads'
      ],

      nonFunctionalRequirements: [
        'Follow OOP principles with clear separation of concerns',
        'Maintain modularity for new dispatch strategies',
        'Ensure thread-safe concurrent operations',
        'Support swappable dispatch strategies at runtime'
      ],

      algorithms: [
        { name: 'FIFO', description: 'Serves requests in arrival order—simple but inefficient with unnecessary back-and-forth' },
        { name: 'SCAN', description: 'Moves in one direction serving all requests, then reverses. Travels to extremes even without requests' },
        { name: 'LOOK (Recommended)', description: 'Travels only to furthest pending request in current direction, then reverses immediately' }
      ],

      coreEntities: [
        { name: 'ElevatorSystem', description: 'Main controller managing all elevators' },
        { name: 'Elevator', description: 'Individual elevator with state, position, and request queue' },
        { name: 'Request', description: 'Represents floor request with direction' },
        { name: 'DispatchStrategy', description: 'Interface for different scheduling algorithms' },
        { name: 'Display', description: 'Shows current floor and direction' }
      ],

      designPatterns: [
        'Strategy Pattern: Pluggable scheduling algorithms (FIFO, SCAN, LOOK)',
        'Observer Pattern: Display updates when elevator moves',
        'State Pattern: Elevator states (IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN)',
        'Command Pattern: Encapsulate requests as objects'
      ],

      basicImplementation: {
        title: 'Elevator System Architecture',
        description: 'ElevatorSystem manages multiple Elevators with DispatchStrategy. Each Elevator has state (IDLE/UP/DOWN), current floor, and request queues. LOOK Algorithm: Move UP serving requests in order, reverse when no more UP requests, move DOWN serving in reverse order.',
        svgTemplate: 'elevatorSystem'
      },

      implementation: `from enum import Enum
from threading import Thread, Lock
from collections import deque
import heapq

class Direction(Enum):
    UP = 1
    DOWN = -1
    IDLE = 0

class ElevatorState(Enum):
    IDLE = 0
    MOVING = 1
    DOOR_OPEN = 2

class Request:
    def __init__(self, floor: int, direction: Direction = None):
        self.floor = floor
        self.direction = direction

class Elevator:
    def __init__(self, elevator_id: int, min_floor: int, max_floor: int):
        self.id = elevator_id
        self.current_floor = min_floor
        self.direction = Direction.IDLE
        self.state = ElevatorState.IDLE
        self.min_floor = min_floor
        self.max_floor = max_floor
        # Two sets: requests above and below current floor
        self.up_requests = set()
        self.down_requests = set()
        self.lock = Lock()

    def add_request(self, floor: int):
        with self.lock:
            if floor > self.current_floor:
                self.up_requests.add(floor)
            elif floor < self.current_floor:
                self.down_requests.add(floor)

            if self.direction == Direction.IDLE:
                self._set_direction()

    def _set_direction(self):
        if self.up_requests:
            self.direction = Direction.UP
        elif self.down_requests:
            self.direction = Direction.DOWN
        else:
            self.direction = Direction.IDLE

    def move(self):
        """LOOK algorithm implementation"""
        with self.lock:
            if self.direction == Direction.UP:
                if self.up_requests:
                    next_floor = min(self.up_requests)
                    self.up_requests.remove(next_floor)
                    self.current_floor = next_floor
                else:
                    self.direction = Direction.DOWN
                    self.move()
            elif self.direction == Direction.DOWN:
                if self.down_requests:
                    next_floor = max(self.down_requests)
                    self.down_requests.remove(next_floor)
                    self.current_floor = next_floor
                else:
                    self.direction = Direction.UP
                    self.move()`
    },
    {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      subtitle: 'Classic Board Game',
      icon: 'grid',
      color: '#ef4444',
      difficulty: 'Easy',
      description: 'Design a Tic Tac Toe game with win detection, scoreboard, and extensible architecture.',

      introduction: `Tic Tac Toe is a simple game but provides an excellent opportunity to demonstrate clean OOP design, design patterns, and extensibility considerations.`,

      functionalRequirements: [
        'Two players alternate placing X and O on 3x3 grid',
        'Detect win conditions (row, column, diagonal)',
        'Detect draw when board is full',
        'Track scores across multiple games',
        'Validate moves (bounds and cell availability)'
      ],

      coreEntities: [
        { name: 'Symbol (Enum)', description: 'X, O, EMPTY values' },
        { name: 'GameStatus (Enum)', description: 'IN_PROGRESS, WINNER_X, WINNER_O, DRAW' },
        { name: 'Player', description: 'Name and assigned symbol (immutable)' },
        { name: 'Cell', description: 'Board position (mutable symbol)' },
        { name: 'Board', description: 'Manages 3×3 grid operations' },
        { name: 'Game', description: 'Orchestrates gameplay and win detection' },
        { name: 'Scoreboard', description: 'Tracks wins across sessions' }
      ],

      designPatterns: [
        'Strategy Pattern: Pluggable win detection (RowWinningStrategy, ColumnWinningStrategy, DiagonalWinningStrategy)',
        'Observer Pattern: Scoreboard observes game completion events',
        'Singleton Pattern: Single TicTacToeSystem instance'
      ],

      implementation: `from enum import Enum
from typing import List, Optional

class Symbol(Enum):
    X = 'X'
    O = 'O'
    EMPTY = ' '

class GameStatus(Enum):
    IN_PROGRESS = 0
    WINNER_X = 1
    WINNER_O = 2
    DRAW = 3

class Player:
    def __init__(self, name: str, symbol: Symbol):
        self.name = name
        self.symbol = symbol

class Board:
    def __init__(self, size: int = 3):
        self.size = size
        self.grid = [[Symbol.EMPTY] * size for _ in range(size)]

    def place(self, row: int, col: int, symbol: Symbol) -> bool:
        if self._is_valid(row, col) and self.grid[row][col] == Symbol.EMPTY:
            self.grid[row][col] = symbol
            return True
        return False

    def _is_valid(self, row: int, col: int) -> bool:
        return 0 <= row < self.size and 0 <= col < self.size

    def is_full(self) -> bool:
        return all(cell != Symbol.EMPTY for row in self.grid for cell in row)

class Game:
    def __init__(self, player1: Player, player2: Player):
        self.board = Board()
        self.players = [player1, player2]
        self.current_player_idx = 0
        self.status = GameStatus.IN_PROGRESS

    def make_move(self, row: int, col: int) -> bool:
        if self.status != GameStatus.IN_PROGRESS:
            return False

        current = self.players[self.current_player_idx]
        if self.board.place(row, col, current.symbol):
            if self._check_winner(current.symbol):
                self.status = GameStatus.WINNER_X if current.symbol == Symbol.X else GameStatus.WINNER_O
            elif self.board.is_full():
                self.status = GameStatus.DRAW
            else:
                self.current_player_idx = 1 - self.current_player_idx
            return True
        return False

    def _check_winner(self, symbol: Symbol) -> bool:
        # Check rows, columns, and diagonals
        for i in range(self.board.size):
            if all(self.board.grid[i][j] == symbol for j in range(self.board.size)):
                return True
            if all(self.board.grid[j][i] == symbol for j in range(self.board.size)):
                return True

        if all(self.board.grid[i][i] == symbol for i in range(self.board.size)):
            return True
        if all(self.board.grid[i][self.board.size-1-i] == symbol for i in range(self.board.size)):
            return True

        return False`
    },
    {
      id: 'snake-ladder',
      title: 'Snake and Ladder',
      subtitle: 'Classic Board Game',
      icon: 'gamepad',
      color: '#22c55e',
      difficulty: 'Easy',
      description: 'Design the Snake and Ladder game with dice rolling, player turns, and board entities.',

      introduction: `Snake and Ladder is a classic board game that demonstrates clean OOP design with entities, game rules, and turn management. Players roll dice to move toward cell 100, with snakes moving them backward and ladders moving them forward.`,

      functionalRequirements: [
        'Players start at position 0 and move toward 100',
        'Roll dice (1-6) to determine movement',
        'Rolling 6 grants an extra turn',
        'Landing on snake slides player backward',
        'Landing on ladder moves player forward',
        'Victory requires landing exactly on cell 100',
        'Support multiple players with turn queue'
      ],

      coreEntities: [
        { name: 'GameStatus (Enum)', description: 'NOT_STARTED, RUNNING, FINISHED' },
        { name: 'Player', description: 'Name (immutable) and position (mutable, starts at 0)' },
        { name: 'BoardEntity (Abstract)', description: 'Base for Snake and Ladder with start/end positions' },
        { name: 'Snake', description: 'Validates start > end (downward movement)' },
        { name: 'Ladder', description: 'Validates start < end (upward movement)' },
        { name: 'Dice', description: 'Generates random rolls between 1-6' },
        { name: 'Board', description: 'Manages position transitions using Map for O(1) lookups' },
        { name: 'Game', description: 'Orchestrates gameplay using Queue for turn management' }
      ],

      designPatterns: [
        'Builder Pattern: Complex Game construction with validation',
        'Template Method Pattern: Snake and Ladder share structure with different validation',
        'Facade Pattern: Game as single entry point hiding complexity'
      ],

      implementation: `from enum import Enum
from collections import deque
from random import randint
from typing import Dict, List

class GameStatus(Enum):
    NOT_STARTED = 0
    RUNNING = 1
    FINISHED = 2

class Player:
    def __init__(self, name: str):
        self.name = name
        self.position = 0

class Dice:
    def __init__(self, faces: int = 6):
        self.faces = faces

    def roll(self) -> int:
        return randint(1, self.faces)

class Board:
    def __init__(self, size: int = 100):
        self.size = size
        self.transitions: Dict[int, int] = {}  # start -> end

    def add_snake(self, head: int, tail: int):
        assert head > tail, "Snake head must be above tail"
        self.transitions[head] = tail

    def add_ladder(self, bottom: int, top: int):
        assert bottom < top, "Ladder bottom must be below top"
        self.transitions[bottom] = top

    def get_final_position(self, position: int) -> int:
        return self.transitions.get(position, position)

class Game:
    def __init__(self, board: Board, players: List[Player]):
        self.board = board
        self.players = deque(players)
        self.status = GameStatus.NOT_STARTED
        self.winner = None
        self.dice = Dice()

    def start(self):
        self.status = GameStatus.RUNNING

    def take_turn(self) -> str:
        if self.status != GameStatus.RUNNING:
            return "Game not running"

        player = self.players[0]
        roll = self.dice.roll()
        new_pos = player.position + roll

        # Must land exactly on 100
        if new_pos > self.board.size:
            self.players.rotate(-1)  # Skip turn
            return f"{player.name} rolled {roll}, stays at {player.position}"

        # Apply snake/ladder
        final_pos = self.board.get_final_position(new_pos)
        player.position = final_pos

        result = f"{player.name} rolled {roll}, moved to {final_pos}"

        if final_pos == self.board.size:
            self.status = GameStatus.FINISHED
            self.winner = player
            return f"{result} - WINNER!"

        # Roll 6 = extra turn, otherwise rotate
        if roll != 6:
            self.players.rotate(-1)
        else:
            result += " (extra turn!)"

        return result`
    },
    {
      id: 'logging-framework',
      title: 'Logging Framework',
      subtitle: 'Customizable Logger',
      icon: 'document',
      color: '#06b6d4',
      difficulty: 'Medium',
      description: 'Design a logging framework with multiple log levels, appenders, and formatters.',

      introduction: `A logging framework provides a standardized way to record, format, filter, and route log messages. This design demonstrates Strategy pattern for formatters/appenders and proper separation of concerns.`,

      functionalRequirements: [
        'Log Levels: DEBUG, INFO, WARN, ERROR, FATAL with configurable minimum',
        'Multiple Destinations: Console and file outputs simultaneously',
        'Message Routing: Single messages can route to multiple appenders',
        'Custom Formatting: Pluggable formatters with timestamp and level',
        'Asynchronous Support: Non-blocking logging',
        'Simple API: logger.info("message")'
      ],

      nonFunctionalRequirements: [
        'Thread Safety: Concurrent-safe without interleaving',
        'Performance: Minimal overhead on application',
        'Extensibility: Easy to add custom appenders/formatters'
      ],

      coreEntities: [
        { name: 'LogLevel (Enum)', description: 'DEBUG, INFO, WARN, ERROR, FATAL' },
        { name: 'LogMessage', description: 'Timestamp, level, content, metadata' },
        { name: 'Formatter', description: 'Converts messages to string format' },
        { name: 'Appender', description: 'Outputs to destinations (console, file)' },
        { name: 'Logger', description: 'Main interface for logging calls' },
        { name: 'LoggerConfig', description: 'Configuration management' }
      ],

      designPatterns: [
        'Strategy Pattern: Multiple formatters and appenders',
        'Observer Pattern: Appenders observe logger events',
        'Builder Pattern: Configuration construction',
        'Singleton Pattern: Single logger instance'
      ],

      implementation: `from enum import IntEnum
from datetime import datetime
from abc import ABC, abstractmethod
from threading import Lock
from queue import Queue
from threading import Thread

class LogLevel(IntEnum):
    DEBUG = 0
    INFO = 1
    WARN = 2
    ERROR = 3
    FATAL = 4

class LogMessage:
    def __init__(self, level: LogLevel, message: str):
        self.level = level
        self.message = message
        self.timestamp = datetime.now()

class Formatter(ABC):
    @abstractmethod
    def format(self, msg: LogMessage) -> str:
        pass

class SimpleFormatter(Formatter):
    def format(self, msg: LogMessage) -> str:
        return f"[{msg.timestamp}] [{msg.level.name}] {msg.message}"

class Appender(ABC):
    def __init__(self, formatter: Formatter = None):
        self.formatter = formatter or SimpleFormatter()

    @abstractmethod
    def append(self, msg: LogMessage):
        pass

class ConsoleAppender(Appender):
    def append(self, msg: LogMessage):
        print(self.formatter.format(msg))

class FileAppender(Appender):
    def __init__(self, filepath: str, formatter: Formatter = None):
        super().__init__(formatter)
        self.filepath = filepath
        self.lock = Lock()

    def append(self, msg: LogMessage):
        with self.lock:
            with open(self.filepath, 'a') as f:
                f.write(self.formatter.format(msg) + '\\n')

class Logger:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.appenders = []
        self.min_level = LogLevel.DEBUG

    def add_appender(self, appender: Appender):
        self.appenders.append(appender)

    def log(self, level: LogLevel, message: str):
        if level >= self.min_level:
            msg = LogMessage(level, message)
            for appender in self.appenders:
                appender.append(msg)

    def debug(self, msg): self.log(LogLevel.DEBUG, msg)
    def info(self, msg): self.log(LogLevel.INFO, msg)
    def warn(self, msg): self.log(LogLevel.WARN, msg)
    def error(self, msg): self.log(LogLevel.ERROR, msg)
    def fatal(self, msg): self.log(LogLevel.FATAL, msg)`
    },
    {
      id: 'vending-machine',
      title: 'Vending Machine',
      subtitle: 'State Machine Design',
      icon: 'shoppingCart',
      color: '#f59e0b',
      difficulty: 'Medium',
      description: 'Design a vending machine with coin-based payments, product selection, and state management.',

      introduction: `The vending machine problem demonstrates the State Pattern beautifully. The machine transitions through distinct states (Idle, Accepting Money, Dispensing, etc.) based on user actions.`,

      functionalRequirements: [
        'Accept coin-based payments with fixed denominations',
        'Enable product selection by code',
        'Dispense selected products',
        'Return change if amount exceeds price',
        'Allow transaction cancellation with refund',
        'Support inventory restocking'
      ],

      nonFunctionalRequirements: [
        'Ensure atomicity in purchase operations',
        'Handle one transaction at a time',
        'Follow OOP design principles'
      ],

      states: [
        'Idle: Awaiting user input',
        'Accepting Money: Processing coin insertions',
        'Item Selected: User chooses product',
        'Dispensing: Releasing item and calculating change',
        'Returning Change: Delivering remainder'
      ],

      coreEntities: [
        { name: 'VendingMachine', description: 'Main orchestrator with current state' },
        { name: 'State (Abstract)', description: 'Interface for all states' },
        { name: 'Item', description: 'Product with code, name, price, quantity' },
        { name: 'Inventory', description: 'Tracks stock levels' },
        { name: 'CoinBox', description: 'Manages inserted coins and change' }
      ],

      designPatterns: [
        'State Pattern: Manages operational states',
        'Strategy Pattern: Different payment validation',
        'Singleton Pattern: Single vending machine instance'
      ],

      implementation: `from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict

class Coin(Enum):
    PENNY = 1
    NICKEL = 5
    DIME = 10
    QUARTER = 25
    DOLLAR = 100

class Item:
    def __init__(self, code: str, name: str, price: int, quantity: int):
        self.code = code
        self.name = name
        self.price = price  # in cents
        self.quantity = quantity

class State(ABC):
    @abstractmethod
    def insert_coin(self, machine, coin: Coin): pass
    @abstractmethod
    def select_item(self, machine, code: str): pass
    @abstractmethod
    def dispense(self, machine): pass
    @abstractmethod
    def cancel(self, machine): pass

class IdleState(State):
    def insert_coin(self, machine, coin: Coin):
        machine.balance += coin.value
        machine.state = machine.accepting_money_state
        print(f"Inserted {coin.name}, balance: {machine.balance}")

    def select_item(self, machine, code: str):
        print("Please insert coins first")

    def dispense(self, machine):
        print("Please select an item first")

    def cancel(self, machine):
        print("No transaction to cancel")

class AcceptingMoneyState(State):
    def insert_coin(self, machine, coin: Coin):
        machine.balance += coin.value
        print(f"Inserted {coin.name}, balance: {machine.balance}")

    def select_item(self, machine, code: str):
        item = machine.inventory.get(code)
        if not item or item.quantity == 0:
            print("Item not available")
            return
        if machine.balance < item.price:
            print(f"Insufficient funds. Need {item.price - machine.balance} more")
            return
        machine.selected_item = item
        machine.state = machine.dispensing_state
        machine.dispense()

    def dispense(self, machine):
        print("Please select an item")

    def cancel(self, machine):
        print(f"Returning {machine.balance} cents")
        machine.balance = 0
        machine.state = machine.idle_state

class DispensingState(State):
    def insert_coin(self, machine, coin: Coin):
        print("Please wait, dispensing")

    def select_item(self, machine, code: str):
        print("Please wait, dispensing")

    def dispense(self, machine):
        item = machine.selected_item
        change = machine.balance - item.price
        item.quantity -= 1
        print(f"Dispensing {item.name}")
        if change > 0:
            print(f"Returning change: {change} cents")
        machine.balance = 0
        machine.selected_item = None
        machine.state = machine.idle_state

    def cancel(self, machine):
        print("Cannot cancel during dispensing")

class VendingMachine:
    def __init__(self):
        self.idle_state = IdleState()
        self.accepting_money_state = AcceptingMoneyState()
        self.dispensing_state = DispensingState()
        self.state = self.idle_state
        self.balance = 0
        self.selected_item = None
        self.inventory: Dict[str, Item] = {}`
    },
    {
      id: 'task-scheduler',
      title: 'Task Scheduler',
      subtitle: 'Job Scheduling System',
      icon: 'clock',
      color: '#8b5cf6',
      difficulty: 'Medium',
      description: 'Design a task scheduler that manages one-time and recurring tasks with concurrent execution.',

      introduction: `A Task Scheduler manages the execution of tasks at predefined times or intervals. It's used in operating systems, distributed systems, and backend services to automate jobs.`,

      functionalRequirements: [
        'One-time tasks executing at specific future times',
        'Recurring tasks running at fixed intervals',
        'Concurrent execution using worker threads',
        'Task cancellation before execution',
        'Observer notifications for task lifecycle events',
        'Status tracking throughout execution'
      ],

      nonFunctionalRequirements: [
        'Thread-safe concurrent scheduling',
        'Exception handling without crashing workers',
        'Tasks are independent (no dependencies)'
      ],

      coreEntities: [
        { name: 'Task', description: 'Runnable unit with execution time and status' },
        { name: 'ScheduledTask', description: 'Wrapper with scheduling metadata' },
        { name: 'TaskScheduler', description: 'Main scheduler using priority queue' },
        { name: 'WorkerPool', description: 'Thread pool for concurrent execution' },
        { name: 'TaskObserver', description: 'Listener for task events' }
      ],

      implementation: `import heapq
import threading
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import Callable, Optional
from concurrent.futures import ThreadPoolExecutor

class TaskStatus(Enum):
    PENDING = 0
    RUNNING = 1
    COMPLETED = 2
    FAILED = 3
    CANCELLED = 4

class Task:
    def __init__(self, task_id: str, func: Callable,
                 run_at: datetime, interval: Optional[timedelta] = None):
        self.task_id = task_id
        self.func = func
        self.run_at = run_at
        self.interval = interval  # None for one-time tasks
        self.status = TaskStatus.PENDING

    def __lt__(self, other):
        return self.run_at < other.run_at

class TaskScheduler:
    def __init__(self, num_workers: int = 4):
        self.tasks = []  # min-heap by run_at
        self.task_map = {}  # task_id -> Task
        self.lock = threading.Lock()
        self.executor = ThreadPoolExecutor(max_workers=num_workers)
        self.running = False
        self.scheduler_thread = None

    def schedule(self, task: Task):
        with self.lock:
            heapq.heappush(self.tasks, task)
            self.task_map[task.task_id] = task

    def cancel(self, task_id: str) -> bool:
        with self.lock:
            if task_id in self.task_map:
                task = self.task_map[task_id]
                if task.status == TaskStatus.PENDING:
                    task.status = TaskStatus.CANCELLED
                    return True
        return False

    def start(self):
        self.running = True
        self.scheduler_thread = threading.Thread(target=self._run_scheduler)
        self.scheduler_thread.start()

    def _run_scheduler(self):
        while self.running:
            with self.lock:
                now = datetime.now()
                while self.tasks and self.tasks[0].run_at <= now:
                    task = heapq.heappop(self.tasks)
                    if task.status == TaskStatus.CANCELLED:
                        continue
                    self.executor.submit(self._execute_task, task)
            time.sleep(0.1)  # Check every 100ms

    def _execute_task(self, task: Task):
        try:
            task.status = TaskStatus.RUNNING
            task.func()
            task.status = TaskStatus.COMPLETED

            # Reschedule if recurring
            if task.interval:
                task.run_at = datetime.now() + task.interval
                task.status = TaskStatus.PENDING
                self.schedule(task)
        except Exception as e:
            task.status = TaskStatus.FAILED
            print(f"Task {task.task_id} failed: {e}")`
    },
    {
      id: 'stack-overflow',
      title: 'Stack Overflow',
      subtitle: 'Q&A Platform',
      icon: 'messageSquare',
      color: '#f97316',
      difficulty: 'Hard',
      description: 'Design a Q&A platform with voting, reputation, tags, and answer acceptance.',

      introduction: `Stack Overflow is a Q&A platform with user reputation management, voting mechanisms, and tag-based organization. The design emphasizes strong consistency for voting and supports high-concurrency scenarios.`,

      functionalRequirements: [
        'Users can post questions and answers',
        'Voting (upvote/downvote) on questions and answers',
        'Reputation system based on votes and accepts',
        'Tag-based categorization of questions',
        'Mark answer as accepted',
        'Comments on questions and answers',
        'Search by keywords, tags, users'
      ],

      coreEntities: [
        { name: 'User', description: 'Platform participant with thread-safe reputation' },
        { name: 'Content (Abstract)', description: 'Base class for all content' },
        { name: 'Post (Abstract)', description: 'Extends Content, enables voting' },
        { name: 'Question', description: 'Has tags, accepted answer reference' },
        { name: 'Answer', description: 'Linked to parent question' },
        { name: 'Comment', description: 'Flat annotations without voting' },
        { name: 'Vote', description: 'Tracks voter and vote type' },
        { name: 'Tag', description: 'Categories for questions' }
      ],

      designPatterns: [
        'Observer Pattern: ReputationManager listens for vote events',
        'Strategy Pattern: Multiple SearchStrategy implementations',
        'Facade Pattern: StackOverflowService provides unified API'
      ],

      reputationRules: [
        'Question upvote: +10 to author',
        'Question downvote: -2 to author',
        'Answer upvote: +10 to author',
        'Answer downvote: -2 to author',
        'Answer accepted: +15 to author',
        'Accepting answer: +2 to question author'
      ],

      implementation: `from datetime import datetime
from enum import Enum
from threading import Lock
from typing import List, Set, Optional

class VoteType(Enum):
    UPVOTE = 1
    DOWNVOTE = -1

class User:
    def __init__(self, user_id: str, username: str):
        self.user_id = user_id
        self.username = username
        self.reputation = 1
        self._lock = Lock()

    def update_reputation(self, delta: int):
        with self._lock:
            self.reputation = max(1, self.reputation + delta)

class Post:
    def __init__(self, post_id: str, author: User, content: str):
        self.post_id = post_id
        self.author = author
        self.content = content
        self.created_at = datetime.now()
        self.votes = {}  # user_id -> VoteType
        self._lock = Lock()

    def vote(self, user: User, vote_type: VoteType) -> bool:
        with self._lock:
            if user.user_id == self.author.user_id:
                return False  # Can't vote on own post

            old_vote = self.votes.get(user.user_id)
            if old_vote == vote_type:
                return False  # Already voted same way

            self.votes[user.user_id] = vote_type

            # Update reputation
            if old_vote:
                # Undo old vote
                self.author.update_reputation(-old_vote.value * 10)
            self.author.update_reputation(vote_type.value * 10)
            return True

    def get_score(self) -> int:
        return sum(v.value for v in self.votes.values())

class Question(Post):
    def __init__(self, post_id: str, author: User, title: str, content: str):
        super().__init__(post_id, author, content)
        self.title = title
        self.tags: Set[str] = set()
        self.answers: List['Answer'] = []
        self.accepted_answer: Optional['Answer'] = None

    def add_answer(self, answer: 'Answer'):
        self.answers.append(answer)

    def accept_answer(self, answer: 'Answer', user: User) -> bool:
        if user.user_id != self.author.user_id:
            return False  # Only question author can accept
        if answer not in self.answers:
            return False

        self.accepted_answer = answer
        answer.author.update_reputation(15)  # +15 for accepted
        self.author.update_reputation(2)  # +2 for accepting
        return True

class Answer(Post):
    def __init__(self, post_id: str, author: User, content: str, question: Question):
        super().__init__(post_id, author, content)
        self.question = question
        self.is_accepted = False`
    },
    {
      id: 'chess',
      title: 'Chess Game',
      subtitle: 'Classic Board Game',
      icon: 'crown',
      color: '#1e293b',
      difficulty: 'Hard',
      description: 'Design a chess game with piece movements, game rules, check/checkmate detection.',

      introduction: `Chess is a complex LLD problem that tests your ability to model intricate game logic using OOP principles. The key challenges include representing the board, implementing piece movements, and detecting check/checkmate conditions.

The Strategy Pattern is perfect for chess pieces because each piece type has different movement rules, but we want to treat them uniformly. Using Factory pattern simplifies piece creation.`,

      functionalRequirements: [
        'Represent 8x8 chess board with alternating colors',
        'Support all six piece types: King, Queen, Rook, Bishop, Knight, Pawn',
        'Implement unique movement rules for each piece',
        'Validate legal moves (bounds, blocking, capture rules)',
        'Detect check, checkmate, and stalemate conditions',
        'Support special moves: castling, en passant, pawn promotion',
        'Alternate turns between white and black players'
      ],

      nonFunctionalRequirements: [
        'Follow SOLID principles for extensibility',
        'Use design patterns appropriately',
        'Efficient move validation'
      ],

      pieceMovements: [
        { piece: 'King', movement: 'One square in any direction' },
        { piece: 'Queen', movement: 'Any number of squares horizontally, vertically, or diagonally' },
        { piece: 'Rook', movement: 'Any number of squares horizontally or vertically' },
        { piece: 'Bishop', movement: 'Any number of squares diagonally' },
        { piece: 'Knight', movement: 'L-shape: 2 squares in one direction + 1 perpendicular (can jump)' },
        { piece: 'Pawn', movement: 'Forward one (or two from start), captures diagonally' }
      ],

      coreEntities: [
        { name: 'Piece (Abstract)', description: 'Base class with color, position, and abstract canMove method' },
        { name: 'King, Queen, Rook, Bishop, Knight, Pawn', description: 'Concrete pieces implementing movement logic' },
        { name: 'Board', description: '8x8 grid managing piece placement and move validation' },
        { name: 'Cell/Square', description: 'Individual board position with optional piece' },
        { name: 'Player', description: 'Represents white or black player' },
        { name: 'Move', description: 'Encapsulates piece, source, destination' },
        { name: 'Game', description: 'Orchestrates gameplay, turn management, win detection' }
      ],

      designPatterns: [
        'Strategy Pattern: Different movement strategies for each piece type',
        'Factory Pattern: PieceFactory creates pieces based on type',
        'Command Pattern: Move objects for undo/redo capability',
        'Observer Pattern: Notify UI of game state changes'
      ],

      implementation: `from abc import ABC, abstractmethod
from enum import Enum
from typing import List, Optional, Tuple

class Color(Enum):
    WHITE = 'white'
    BLACK = 'black'

class PieceType(Enum):
    KING = 'K'
    QUEEN = 'Q'
    ROOK = 'R'
    BISHOP = 'B'
    KNIGHT = 'N'
    PAWN = 'P'

class Piece(ABC):
    def __init__(self, color: Color, row: int, col: int):
        self.color = color
        self.row = row
        self.col = col
        self.has_moved = False

    @abstractmethod
    def get_type(self) -> PieceType:
        pass

    @abstractmethod
    def can_move(self, board: 'Board', dest_row: int, dest_col: int) -> bool:
        pass

    def _is_valid_position(self, row: int, col: int) -> bool:
        return 0 <= row < 8 and 0 <= col < 8

class Knight(Piece):
    def get_type(self) -> PieceType:
        return PieceType.KNIGHT

    def can_move(self, board: 'Board', dest_row: int, dest_col: int) -> bool:
        if not self._is_valid_position(dest_row, dest_col):
            return False

        row_diff = abs(dest_row - self.row)
        col_diff = abs(dest_col - self.col)

        # L-shape: 2+1 or 1+2
        if not ((row_diff == 2 and col_diff == 1) or (row_diff == 1 and col_diff == 2)):
            return False

        # Check destination
        dest_piece = board.get_piece(dest_row, dest_col)
        return dest_piece is None or dest_piece.color != self.color

class Rook(Piece):
    def get_type(self) -> PieceType:
        return PieceType.ROOK

    def can_move(self, board: 'Board', dest_row: int, dest_col: int) -> bool:
        if not self._is_valid_position(dest_row, dest_col):
            return False

        # Must move in straight line
        if self.row != dest_row and self.col != dest_col:
            return False

        # Check path is clear
        return board.is_path_clear(self.row, self.col, dest_row, dest_col)

class Board:
    def __init__(self):
        self.grid = [[None for _ in range(8)] for _ in range(8)]
        self._setup_pieces()

    def get_piece(self, row: int, col: int) -> Optional[Piece]:
        return self.grid[row][col]

    def is_path_clear(self, start_row: int, start_col: int,
                      end_row: int, end_col: int) -> bool:
        row_step = 0 if start_row == end_row else (1 if end_row > start_row else -1)
        col_step = 0 if start_col == end_col else (1 if end_col > start_col else -1)

        row, col = start_row + row_step, start_col + col_step
        while (row, col) != (end_row, end_col):
            if self.grid[row][col] is not None:
                return False
            row += row_step
            col += col_step

        # Check destination (can capture enemy)
        dest_piece = self.grid[end_row][end_col]
        return dest_piece is None or dest_piece.color != self.grid[start_row][start_col].color

class Game:
    def __init__(self):
        self.board = Board()
        self.current_turn = Color.WHITE
        self.is_over = False
        self.winner = None

    def make_move(self, start: Tuple[int, int], end: Tuple[int, int]) -> bool:
        piece = self.board.get_piece(*start)
        if piece is None or piece.color != self.current_turn:
            return False

        if not piece.can_move(self.board, *end):
            return False

        # Execute move
        self.board.grid[end[0]][end[1]] = piece
        self.board.grid[start[0]][start[1]] = None
        piece.row, piece.col = end
        piece.has_moved = True

        # Switch turn
        self.current_turn = Color.BLACK if self.current_turn == Color.WHITE else Color.WHITE
        return True`
    },
    {
      id: 'atm-system',
      title: 'ATM System',
      subtitle: 'Banking Machine',
      icon: 'creditCard',
      color: '#059669',
      difficulty: 'Medium',
      description: 'Design an ATM system with card authentication, transactions, and state management.',

      introduction: `The ATM system is a classic example of the State Pattern in action. The ATM transitions through distinct states (Idle, Card Inserted, PIN Entered, Transaction) based on user actions, making it ideal for demonstrating state-based design.

The Chain of Responsibility pattern handles cash dispensing with different denominations.`,

      functionalRequirements: [
        'Card insertion and ejection',
        'PIN authentication (with retry limit)',
        'Balance inquiry',
        'Cash withdrawal with denomination selection',
        'Cash deposit',
        'Fund transfer between accounts',
        'Print receipt'
      ],

      nonFunctionalRequirements: [
        'Thread-safe for concurrent operations',
        'Validate user balance AND ATM cash availability',
        'Secure PIN handling',
        'Transaction atomicity'
      ],

      states: [
        'Idle: Awaiting card insertion',
        'Card Inserted: Awaiting PIN entry',
        'Authenticated: User verified, awaiting operation selection',
        'Transaction: Processing withdrawal/deposit/transfer',
        'Cash Dispensing: Releasing cash to user'
      ],

      coreEntities: [
        { name: 'ATM', description: 'Main context class holding current state' },
        { name: 'ATMState (Interface)', description: 'Defines insertCard, enterPin, selectOperation, etc.' },
        { name: 'IdleState, HasCardState, AuthenticatedState', description: 'Concrete states' },
        { name: 'Card', description: 'Customer card with number and PIN' },
        { name: 'Account', description: 'Bank account with balance' },
        { name: 'CashDispenser', description: 'Manages cash inventory by denomination' },
        { name: 'Transaction', description: 'Records transaction details' }
      ],

      designPatterns: [
        'State Pattern: ATM states manage allowed operations',
        'Chain of Responsibility: Cash dispensing by denomination',
        'Strategy Pattern: Different transaction types',
        'Singleton Pattern: Single ATM instance'
      ],

      cashDispensingChain: [
        'FiveHundredDispenser → TwoHundredDispenser → OneHundredDispenser → FiftyDispenser → TwentyDispenser',
        'Each dispenser handles its denomination and passes remainder to next'
      ],

      implementation: `from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional
from dataclasses import dataclass

class TransactionType(Enum):
    BALANCE_INQUIRY = 'balance'
    WITHDRAW = 'withdraw'
    DEPOSIT = 'deposit'
    TRANSFER = 'transfer'

@dataclass
class Card:
    card_number: str
    pin: str
    account_id: str

@dataclass
class Account:
    account_id: str
    balance: float

    def withdraw(self, amount: float) -> bool:
        if amount <= self.balance:
            self.balance -= amount
            return True
        return False

    def deposit(self, amount: float):
        self.balance += amount

class ATMState(ABC):
    @abstractmethod
    def insert_card(self, atm: 'ATM', card: Card): pass
    @abstractmethod
    def enter_pin(self, atm: 'ATM', pin: str): pass
    @abstractmethod
    def select_operation(self, atm: 'ATM', op: TransactionType): pass
    @abstractmethod
    def withdraw(self, atm: 'ATM', amount: float): pass
    @abstractmethod
    def eject_card(self, atm: 'ATM'): pass

class IdleState(ATMState):
    def insert_card(self, atm: 'ATM', card: Card):
        atm.current_card = card
        atm.state = HasCardState()
        print("Card inserted. Please enter PIN.")

    def enter_pin(self, atm, pin): print("Please insert card first")
    def select_operation(self, atm, op): print("Please insert card first")
    def withdraw(self, atm, amount): print("Please insert card first")
    def eject_card(self, atm): print("No card to eject")

class HasCardState(ATMState):
    def __init__(self):
        self.pin_attempts = 0
        self.max_attempts = 3

    def insert_card(self, atm, card):
        print("Card already inserted")

    def enter_pin(self, atm: 'ATM', pin: str):
        if atm.current_card.pin == pin:
            atm.state = AuthenticatedState()
            print("PIN correct. Select operation.")
        else:
            self.pin_attempts += 1
            if self.pin_attempts >= self.max_attempts:
                print("Too many attempts. Card blocked.")
                atm.eject_card()
            else:
                print(f"Wrong PIN. {self.max_attempts - self.pin_attempts} attempts left.")

    def select_operation(self, atm, op): print("Please enter PIN first")
    def withdraw(self, atm, amount): print("Please enter PIN first")
    def eject_card(self, atm: 'ATM'):
        atm.current_card = None
        atm.state = IdleState()
        print("Card ejected")

class AuthenticatedState(ATMState):
    def insert_card(self, atm, card): print("Card already inserted")
    def enter_pin(self, atm, pin): print("Already authenticated")

    def select_operation(self, atm: 'ATM', op: TransactionType):
        account = atm.get_account(atm.current_card.account_id)
        if op == TransactionType.BALANCE_INQUIRY:
            print(f"Balance: $" + str(round(account.balance, 2)))
        elif op == TransactionType.WITHDRAW:
            print("Enter withdrawal amount")

    def withdraw(self, atm: 'ATM', amount: float):
        account = atm.get_account(atm.current_card.account_id)
        if account.withdraw(amount):
            if atm.cash_dispenser.dispense(amount):
                print(f"Please take $" + str(round(amount, 2)))
            else:
                account.deposit(amount)  # Rollback
                print("ATM has insufficient cash")
        else:
            print("Insufficient funds")

    def eject_card(self, atm: 'ATM'):
        atm.current_card = None
        atm.state = IdleState()
        print("Card ejected. Thank you!")

# Chain of Responsibility for cash dispensing
class CashDispenser:
    def __init__(self):
        self.denominations = {100: 10, 50: 20, 20: 50}  # value: count

    def dispense(self, amount: float) -> bool:
        remaining = int(amount)
        dispensed = {}

        for denom in sorted(self.denominations.keys(), reverse=True):
            if remaining >= denom and self.denominations[denom] > 0:
                count = min(remaining // denom, self.denominations[denom])
                dispensed[denom] = count
                remaining -= count * denom

        if remaining == 0:
            for d, c in dispensed.items():
                self.denominations[d] -= c
            return True
        return False

class ATM:
    def __init__(self):
        self.state = IdleState()
        self.current_card: Optional[Card] = None
        self.cash_dispenser = CashDispenser()
        self.accounts = {}  # account_id -> Account

    def get_account(self, account_id: str) -> Account:
        return self.accounts.get(account_id)

    def insert_card(self, card: Card): self.state.insert_card(self, card)
    def enter_pin(self, pin: str): self.state.enter_pin(self, pin)
    def withdraw(self, amount: float): self.state.withdraw(self, amount)
    def eject_card(self): self.state.eject_card(self)`
    },
    {
      id: 'design-hashmap',
      isNew: true,
      title: 'Design HashMap',
      subtitle: 'Hash Table Implementation',
      icon: 'database',
      color: '#10b981',
      difficulty: 'Easy',
      description: 'Design a HashMap from scratch with put, get, and remove operations using hashing and collision handling.',

      introduction: `The HashMap is one of the most fundamental data structures in computer science. Designing one from scratch tests your understanding of hashing, collision resolution, and dynamic resizing. It's a common interview question at top tech companies.

The key insight is using an array of buckets where each bucket handles collisions via chaining (linked lists) or open addressing. A good hash function distributes keys uniformly, and dynamic resizing maintains O(1) amortized performance.`,

      coreEntities: [
        { name: 'HashMap<K, V>', description: 'Main class with array of buckets, size tracking, and load factor threshold' },
        { name: 'Entry<K, V>', description: 'Key-value pair node with next pointer for chaining' },
        { name: 'Bucket', description: 'Linked list head for collision chaining at each array index' }
      ],

      designPatterns: [
        'Hashing Pattern: Convert key to array index via hash function + modulo',
        'Chaining Pattern: Linked list at each bucket for collision resolution',
        'Amortized Resize: Double capacity when load factor exceeds threshold'
      ],

      implementation: `class Entry:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.next = None

class HashMap:
    def __init__(self, capacity=16, load_factor=0.75):
        self.capacity = capacity
        self.load_factor = load_factor
        self.size = 0
        self.buckets = [None] * self.capacity

    def _hash(self, key) -> int:
        return hash(key) % self.capacity

    def put(self, key, value):
        index = self._hash(key)
        entry = self.buckets[index]

        # Update existing key
        while entry:
            if entry.key == key:
                entry.value = value
                return
            entry = entry.next

        # Insert new entry at head
        new_entry = Entry(key, value)
        new_entry.next = self.buckets[index]
        self.buckets[index] = new_entry
        self.size += 1

        # Resize if needed
        if self.size / self.capacity > self.load_factor:
            self._resize()

    def get(self, key):
        index = self._hash(key)
        entry = self.buckets[index]
        while entry:
            if entry.key == key:
                return entry.value
            entry = entry.next
        return None

    def remove(self, key) -> bool:
        index = self._hash(key)
        entry = self.buckets[index]
        prev = None
        while entry:
            if entry.key == key:
                if prev:
                    prev.next = entry.next
                else:
                    self.buckets[index] = entry.next
                self.size -= 1
                return True
            prev = entry
            entry = entry.next
        return False

    def _resize(self):
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [None] * self.capacity
        self.size = 0
        for bucket in old_buckets:
            entry = bucket
            while entry:
                self.put(entry.key, entry.value)
                entry = entry.next`
    },
    {
      id: 'splitwise',
      isNew: true,
      title: 'Splitwise',
      subtitle: 'Expense Sharing',
      icon: 'dollarSign',
      color: '#5bc5a7',
      difficulty: 'Medium',
      description: 'Design an expense sharing system where users can split bills and track balances with friends.',

      introduction: `Splitwise is a popular expense-sharing app that simplifies splitting bills among groups of friends. The core challenge is maintaining a balance graph between users and implementing debt simplification to minimize the number of transactions needed to settle up.

The key design decisions involve choosing between storing individual transactions vs. net balances, implementing the debt simplification algorithm, and handling different split types (equal, exact, percentage).`,

      coreEntities: [
        { name: 'User', description: 'Participant with ID, name, email, and balance map' },
        { name: 'Group', description: 'Collection of users sharing expenses together' },
        { name: 'Expense', description: 'A bill paid by one user, split among participants' },
        { name: 'Split (Abstract)', description: 'Base class for EqualSplit, ExactSplit, PercentageSplit' },
        { name: 'BalanceSheet', description: 'Tracks net amounts owed between pairs of users' },
        { name: 'Transaction', description: 'Settlement payment from one user to another' }
      ],

      designPatterns: [
        'Strategy Pattern: Different split calculation strategies (equal, exact, percentage)',
        'Observer Pattern: Notify users when expenses are added or settled',
        'Facade Pattern: ExpenseManager provides unified API for all operations'
      ],

      implementation: `from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List
from collections import defaultdict

class SplitType(Enum):
    EQUAL = 'equal'
    EXACT = 'exact'
    PERCENTAGE = 'percentage'

class User:
    def __init__(self, user_id: str, name: str):
        self.user_id = user_id
        self.name = name

class Split(ABC):
    def __init__(self, user: User):
        self.user = user
        self.amount = 0.0

    @abstractmethod
    def set_amount(self, total: float, **kwargs):
        pass

class EqualSplit(Split):
    def set_amount(self, total: float, **kwargs):
        num_users = kwargs.get('num_users', 1)
        self.amount = round(total / num_users, 2)

class ExactSplit(Split):
    def set_amount(self, total: float, **kwargs):
        self.amount = kwargs.get('exact_amount', 0.0)

class Expense:
    def __init__(self, expense_id: str, paid_by: User, amount: float, splits: List[Split]):
        self.expense_id = expense_id
        self.paid_by = paid_by
        self.amount = amount
        self.splits = splits

class BalanceSheet:
    def __init__(self):
        # balance[A][B] > 0 means B owes A
        self.balance: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))

    def add_expense(self, expense: Expense):
        for split in expense.splits:
            if split.user.user_id == expense.paid_by.user_id:
                continue
            payer = expense.paid_by.user_id
            debtor = split.user.user_id
            self.balance[payer][debtor] += split.amount
            self.balance[debtor][payer] -= split.amount

    def get_balance(self, user_id: str) -> Dict[str, float]:
        return {uid: amt for uid, amt in self.balance[user_id].items() if amt != 0}

    def simplify_debts(self) -> List[tuple]:
        """Minimize number of transactions to settle all debts"""
        net = defaultdict(float)
        for user, balances in self.balance.items():
            for other, amount in balances.items():
                net[user] += amount

        creditors = [(amt, uid) for uid, amt in net.items() if amt > 0]
        debtors = [(-amt, uid) for uid, amt in net.items() if amt < 0]
        creditors.sort(reverse=True)
        debtors.sort(reverse=True)

        transactions = []
        i, j = 0, 0
        while i < len(creditors) and j < len(debtors):
            credit_amt, creditor = creditors[i]
            debt_amt, debtor = debtors[j]
            settle = min(credit_amt, debt_amt)
            transactions.append((debtor, creditor, round(settle, 2)))
            creditors[i] = (credit_amt - settle, creditor)
            debtors[j] = (debt_amt - settle, debtor)
            if creditors[i][0] == 0: i += 1
            if debtors[j][0] == 0: j += 1

        return transactions`
    },
    {
      id: 'circular-queue',
      isNew: true,
      title: 'Design Circular Queue',
      subtitle: 'Ring Buffer',
      icon: 'refreshCw',
      color: '#3b82f6',
      difficulty: 'Easy',
      description: 'Design a circular queue (ring buffer) with fixed capacity using an array.',

      introduction: `A circular queue (ring buffer) is a fixed-size data structure that wraps around when the end is reached. It's widely used in operating systems (keyboard buffers), networking (packet queues), and producer-consumer patterns.

The key insight is using modular arithmetic with front and rear pointers to efficiently reuse array space without shifting elements. The tricky part is distinguishing between full and empty states.`,

      coreEntities: [
        { name: 'CircularQueue<T>', description: 'Main class with fixed-size array, front pointer, rear pointer, and size counter' },
        { name: 'Front Pointer', description: 'Index of the first element in the queue' },
        { name: 'Rear Pointer', description: 'Index of the next insertion position' }
      ],

      designPatterns: [
        'Ring Buffer Pattern: Modular arithmetic for index wrapping',
        'Sentinel Pattern: Use size counter to distinguish full vs empty states'
      ],

      implementation: `class CircularQueue:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = 0
        self.rear = 0
        self.size = 0

    def enqueue(self, value) -> bool:
        if self.is_full():
            return False
        self.queue[self.rear] = value
        self.rear = (self.rear + 1) % self.capacity
        self.size += 1
        return True

    def dequeue(self):
        if self.is_empty():
            return None
        value = self.queue[self.front]
        self.queue[self.front] = None
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return value

    def peek(self):
        if self.is_empty():
            return None
        return self.queue[self.front]

    def is_empty(self) -> bool:
        return self.size == 0

    def is_full(self) -> bool:
        return self.size == self.capacity

    def __len__(self) -> int:
        return self.size`
    },
    {
      id: 'library-management-lld',
      isNew: true,
      title: 'Library Management System',
      subtitle: 'Book Lending Platform',
      icon: 'book',
      color: '#8b5cf6',
      difficulty: 'Medium',
      description: 'Design a library management system for book catalog, member management, borrowing, and reservations.',

      introduction: `A library management system handles book cataloging, member registration, borrowing/returning books, and reservation queues. It's a classic OOP design problem that tests your ability to model real-world entities and their relationships.

The key design considerations are: handling concurrent book borrowing, managing reservation queues when books are unavailable, implementing fine calculation for overdue books, and supporting search by title, author, or ISBN.`,

      coreEntities: [
        { name: 'Library', description: 'Singleton managing all operations, holds catalogs and member lists' },
        { name: 'Book', description: 'Book metadata: ISBN, title, author, category' },
        { name: 'BookCopy', description: 'Physical copy of a book with availability status' },
        { name: 'Member', description: 'Library member with borrowing history and active loans' },
        { name: 'Loan', description: 'Tracks borrowed copy, member, dates, and fine' },
        { name: 'Reservation', description: 'Queue entry when all copies are checked out' },
        { name: 'FineCalculator', description: 'Strategy for computing overdue fines' }
      ],

      designPatterns: [
        'Singleton Pattern: Single Library instance managing state',
        'Strategy Pattern: Pluggable fine calculation policies',
        'Observer Pattern: Notify members when reserved book becomes available',
        'Factory Pattern: Create different member types (student, faculty)'
      ],

      implementation: `from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional
from collections import deque

class BookStatus(Enum):
    AVAILABLE = 'available'
    CHECKED_OUT = 'checked_out'
    RESERVED = 'reserved'

class Book:
    def __init__(self, isbn: str, title: str, author: str):
        self.isbn = isbn
        self.title = title
        self.author = author
        self.copies: List['BookCopy'] = []

class BookCopy:
    def __init__(self, copy_id: str, book: Book):
        self.copy_id = copy_id
        self.book = book
        self.status = BookStatus.AVAILABLE
        self.current_loan: Optional['Loan'] = None

class Member:
    def __init__(self, member_id: str, name: str, max_books: int = 5):
        self.member_id = member_id
        self.name = name
        self.max_books = max_books
        self.active_loans: List['Loan'] = []

    def can_borrow(self) -> bool:
        return len(self.active_loans) < self.max_books

class Loan:
    def __init__(self, copy: BookCopy, member: Member, duration_days: int = 14):
        self.copy = copy
        self.member = member
        self.checkout_date = datetime.now()
        self.due_date = self.checkout_date + timedelta(days=duration_days)
        self.return_date: Optional[datetime] = None

    def calculate_fine(self, rate_per_day: float = 0.50) -> float:
        if self.return_date and self.return_date > self.due_date:
            overdue_days = (self.return_date - self.due_date).days
            return overdue_days * rate_per_day
        return 0.0

class Library:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.books: Dict[str, Book] = {}
        self.members: Dict[str, Member] = {}
        self.reservations: Dict[str, deque] = {}  # isbn -> queue of member_ids

    def checkout(self, isbn: str, member_id: str) -> Optional[Loan]:
        book = self.books.get(isbn)
        member = self.members.get(member_id)
        if not book or not member or not member.can_borrow():
            return None

        for copy in book.copies:
            if copy.status == BookStatus.AVAILABLE:
                copy.status = BookStatus.CHECKED_OUT
                loan = Loan(copy, member)
                copy.current_loan = loan
                member.active_loans.append(loan)
                return loan
        return None  # No copies available

    def return_book(self, copy_id: str) -> float:
        for book in self.books.values():
            for copy in book.copies:
                if copy.copy_id == copy_id and copy.current_loan:
                    loan = copy.current_loan
                    loan.return_date = datetime.now()
                    fine = loan.calculate_fine()
                    loan.member.active_loans.remove(loan)
                    copy.status = BookStatus.AVAILABLE
                    copy.current_loan = None
                    # Check reservations
                    isbn = copy.book.isbn
                    if isbn in self.reservations and self.reservations[isbn]:
                        next_member_id = self.reservations[isbn].popleft()
                        self.checkout(isbn, next_member_id)
                    return fine
        return 0.0`
    },
    {
      id: 'locker-allocation',
      isNew: true,
      title: 'Locker Allocation System',
      subtitle: 'Package Delivery Lockers',
      icon: 'lock',
      color: '#f97316',
      difficulty: 'Medium',
      description: 'Design a locker allocation system for package delivery with different locker sizes.',

      introduction: `A locker allocation system (like Amazon Lockers) assigns available lockers to packages based on size compatibility. The system must efficiently match packages to the smallest available locker, handle timeouts for uncollected packages, and support concurrent access.

The key challenge is the allocation strategy: always assign the smallest locker that fits the package to maximize utilization, and handle locker release when packages are picked up or time out.`,

      coreEntities: [
        { name: 'LockerSystem', description: 'Main controller managing all lockers and allocations' },
        { name: 'Locker', description: 'Individual locker with size, status, and access code' },
        { name: 'LockerSize (Enum)', description: 'SMALL, MEDIUM, LARGE, XLARGE' },
        { name: 'Package', description: 'Package with dimensions and assigned locker' },
        { name: 'Allocation', description: 'Tracks package-locker assignment with expiry time' },
        { name: 'AllocationStrategy', description: 'Interface for different allocation algorithms' }
      ],

      designPatterns: [
        'Strategy Pattern: Different allocation strategies (best-fit, first-fit)',
        'Observer Pattern: Notify recipient when package is delivered',
        'State Pattern: Locker states (EMPTY, OCCUPIED, EXPIRED)',
        'Factory Pattern: Generate unique access codes'
      ],

      implementation: `from enum import Enum
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from threading import Lock
import random
import string

class LockerSize(Enum):
    SMALL = 1
    MEDIUM = 2
    LARGE = 3
    XLARGE = 4

class LockerStatus(Enum):
    EMPTY = 'empty'
    OCCUPIED = 'occupied'
    EXPIRED = 'expired'

class Locker:
    def __init__(self, locker_id: str, size: LockerSize):
        self.locker_id = locker_id
        self.size = size
        self.status = LockerStatus.EMPTY
        self.access_code: Optional[str] = None
        self.lock = Lock()

class Package:
    def __init__(self, package_id: str, size: LockerSize):
        self.package_id = package_id
        self.size = size

class Allocation:
    def __init__(self, package: Package, locker: Locker, hours: int = 72):
        self.package = package
        self.locker = locker
        self.access_code = ''.join(random.choices(string.digits, k=6))
        self.created_at = datetime.now()
        self.expires_at = self.created_at + timedelta(hours=hours)

    def is_expired(self) -> bool:
        return datetime.now() > self.expires_at

class LockerSystem:
    def __init__(self):
        self.lockers: Dict[str, Locker] = {}
        self.allocations: Dict[str, Allocation] = {}  # package_id -> Allocation
        self.lock = Lock()

    def add_locker(self, locker: Locker):
        self.lockers[locker.locker_id] = locker

    def allocate(self, package: Package) -> Optional[Allocation]:
        with self.lock:
            # Best-fit: find smallest available locker that fits
            candidates = [
                l for l in self.lockers.values()
                if l.status == LockerStatus.EMPTY and l.size.value >= package.size.value
            ]
            candidates.sort(key=lambda l: l.size.value)

            if not candidates:
                return None

            locker = candidates[0]
            locker.status = LockerStatus.OCCUPIED
            allocation = Allocation(package, locker)
            locker.access_code = allocation.access_code
            self.allocations[package.package_id] = allocation
            return allocation

    def pickup(self, package_id: str, code: str) -> bool:
        allocation = self.allocations.get(package_id)
        if not allocation or allocation.access_code != code:
            return False
        self._release_locker(allocation.locker)
        del self.allocations[package_id]
        return True

    def _release_locker(self, locker: Locker):
        locker.status = LockerStatus.EMPTY
        locker.access_code = None

    def cleanup_expired(self):
        with self.lock:
            expired = [pid for pid, a in self.allocations.items() if a.is_expired()]
            for pid in expired:
                self._release_locker(self.allocations[pid].locker)
                del self.allocations[pid]`
    },
    {
      id: 'queue-using-array',
      isNew: true,
      title: 'Implement Queue using Array',
      subtitle: 'Array-Based Queue',
      icon: 'layers',
      color: '#06b6d4',
      difficulty: 'Easy',
      description: 'Implement a queue data structure using a fixed-size array with enqueue, dequeue, and peek operations.',

      introduction: `Implementing a queue using an array is a fundamental data structure exercise. The naive approach wastes space as elements are dequeued, so the circular array technique is essential for efficient space utilization.

The key insight is using two pointers (front and rear) with modular arithmetic to wrap around the array, creating a ring buffer that reuses freed space.`,

      coreEntities: [
        { name: 'ArrayQueue<T>', description: 'Queue backed by fixed-size array with front and rear indices' },
        { name: 'Front Index', description: 'Points to the first element to be dequeued' },
        { name: 'Rear Index', description: 'Points to the next empty slot for enqueue' }
      ],

      designPatterns: [
        'Ring Buffer Pattern: Circular index wrapping using modulo',
        'Fixed Capacity Pattern: Bounded queue with overflow handling'
      ],

      implementation: `class ArrayQueue:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.array = [None] * capacity
        self.front = 0
        self.rear = 0
        self.size = 0

    def enqueue(self, item) -> bool:
        if self.is_full():
            return False  # or raise exception
        self.array[self.rear] = item
        self.rear = (self.rear + 1) % self.capacity
        self.size += 1
        return True

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        item = self.array[self.front]
        self.array[self.front] = None
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return item

    def peek(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.array[self.front]

    def is_empty(self) -> bool:
        return self.size == 0

    def is_full(self) -> bool:
        return self.size == self.capacity

    def __len__(self) -> int:
        return self.size

    def __str__(self) -> str:
        if self.is_empty():
            return "[]"
        items = []
        idx = self.front
        for _ in range(self.size):
            items.append(str(self.array[idx]))
            idx = (idx + 1) % self.capacity
        return "[" + ", ".join(items) + "]"`
    },
    {
      id: 'memory-allocator',
      isNew: true,
      title: 'Memory Allocator',
      subtitle: 'Dynamic Memory Management',
      icon: 'cpu',
      color: '#ef4444',
      difficulty: 'Hard',
      description: 'Design a memory allocator that manages a contiguous block of memory with malloc and free operations.',

      introduction: `A memory allocator manages a contiguous block of memory, handling allocation and deallocation requests. This problem tests your understanding of memory management, fragmentation, and allocation strategies.

The key challenges are: minimizing fragmentation (both internal and external), choosing an allocation strategy (first-fit, best-fit, worst-fit), and efficiently coalescing freed blocks. A free list tracks available memory blocks.`,

      coreEntities: [
        { name: 'MemoryAllocator', description: 'Main class managing memory pool and free list' },
        { name: 'Block', description: 'Memory block with start address, size, and allocation status' },
        { name: 'FreeList', description: 'Linked list of available memory blocks sorted by address' },
        { name: 'AllocationStrategy', description: 'Interface for first-fit, best-fit, worst-fit algorithms' }
      ],

      designPatterns: [
        'Strategy Pattern: Pluggable allocation algorithms (first-fit, best-fit)',
        'Free List Pattern: Linked list of available blocks for O(n) allocation',
        'Coalescing Pattern: Merge adjacent free blocks to reduce fragmentation'
      ],

      implementation: `class Block:
    def __init__(self, start: int, size: int):
        self.start = start
        self.size = size
        self.is_free = True
        self.next = None
        self.prev = None

class MemoryAllocator:
    def __init__(self, total_size: int):
        self.total_size = total_size
        self.head = Block(0, total_size)
        self.allocated = {}  # start_address -> Block

    def malloc(self, size: int) -> int:
        """Allocate memory using first-fit strategy. Returns start address or -1."""
        block = self.head
        while block:
            if block.is_free and block.size >= size:
                return self._allocate(block, size)
            block = block.next
        return -1  # Out of memory

    def _allocate(self, block: Block, size: int) -> int:
        if block.size > size:
            # Split block: allocate 'size' from start, remainder stays free
            remainder = Block(block.start + size, block.size - size)
            remainder.next = block.next
            remainder.prev = block
            if block.next:
                block.next.prev = remainder
            block.next = remainder
            block.size = size

        block.is_free = False
        self.allocated[block.start] = block
        return block.start

    def free(self, address: int) -> bool:
        """Free allocated memory at given address."""
        block = self.allocated.get(address)
        if not block:
            return False

        block.is_free = True
        del self.allocated[address]
        self._coalesce(block)
        return True

    def _coalesce(self, block: Block):
        """Merge adjacent free blocks."""
        # Merge with next block
        if block.next and block.next.is_free:
            next_block = block.next
            block.size += next_block.size
            block.next = next_block.next
            if next_block.next:
                next_block.next.prev = block

        # Merge with previous block
        if block.prev and block.prev.is_free:
            prev_block = block.prev
            prev_block.size += block.size
            prev_block.next = block.next
            if block.next:
                block.next.prev = prev_block`
    },
    {
      id: 'rock-paper-scissors',
      isNew: true,
      title: 'Rock Paper Scissors',
      subtitle: 'Hand Game',
      icon: 'gamepad',
      color: '#22c55e',
      difficulty: 'Easy',
      description: 'Design the Rock Paper Scissors game with player turns, win detection, and match scoring.',

      introduction: `Rock Paper Scissors is a simple game that demonstrates clean OOP design with enums, strategy pattern for AI opponents, and game state management. The game supports player vs player and player vs computer modes.

The win logic follows a circular pattern: Rock beats Scissors, Scissors beats Paper, Paper beats Rock. The design should be extensible to support variants like Rock-Paper-Scissors-Lizard-Spock.`,

      coreEntities: [
        { name: 'Move (Enum)', description: 'ROCK, PAPER, SCISSORS with beats() method' },
        { name: 'Player (Abstract)', description: 'Base class for HumanPlayer and ComputerPlayer' },
        { name: 'ComputerPlayer', description: 'AI opponent with random or strategic move selection' },
        { name: 'Round', description: 'Single round result with both moves and outcome' },
        { name: 'Game', description: 'Manages rounds, scoring, and best-of-N logic' }
      ],

      designPatterns: [
        'Strategy Pattern: Different AI strategies (random, pattern-based)',
        'Enum Pattern: Moves with built-in comparison logic',
        'Template Method: Game loop with customizable rules'
      ],

      implementation: `from enum import Enum
from abc import ABC, abstractmethod
from random import choice
from typing import List, Optional

class Move(Enum):
    ROCK = 'rock'
    PAPER = 'paper'
    SCISSORS = 'scissors'

    def beats(self, other: 'Move') -> bool:
        return (
            (self == Move.ROCK and other == Move.SCISSORS) or
            (self == Move.SCISSORS and other == Move.PAPER) or
            (self == Move.PAPER and other == Move.ROCK)
        )

class Outcome(Enum):
    WIN = 'win'
    LOSE = 'lose'
    DRAW = 'draw'

class Player(ABC):
    def __init__(self, name: str):
        self.name = name
        self.score = 0

    @abstractmethod
    def make_move(self) -> Move:
        pass

class ComputerPlayer(Player):
    def make_move(self) -> Move:
        return choice(list(Move))

class HumanPlayer(Player):
    def __init__(self, name: str):
        super().__init__(name)
        self._next_move: Optional[Move] = None

    def set_move(self, move: Move):
        self._next_move = move

    def make_move(self) -> Move:
        if self._next_move is None:
            raise ValueError("No move set")
        move = self._next_move
        self._next_move = None
        return move

class Round:
    def __init__(self, move1: Move, move2: Move):
        self.move1 = move1
        self.move2 = move2

    def get_outcome(self) -> Outcome:
        if self.move1 == self.move2:
            return Outcome.DRAW
        return Outcome.WIN if self.move1.beats(self.move2) else Outcome.LOSE

class Game:
    def __init__(self, player1: Player, player2: Player, best_of: int = 3):
        self.player1 = player1
        self.player2 = player2
        self.best_of = best_of
        self.rounds: List[Round] = []
        self.wins_needed = best_of // 2 + 1

    def play_round(self) -> Round:
        m1 = self.player1.make_move()
        m2 = self.player2.make_move()
        round_result = Round(m1, m2)
        outcome = round_result.get_outcome()
        if outcome == Outcome.WIN:
            self.player1.score += 1
        elif outcome == Outcome.LOSE:
            self.player2.score += 1
        self.rounds.append(round_result)
        return round_result

    def is_over(self) -> bool:
        return (self.player1.score >= self.wins_needed or
                self.player2.score >= self.wins_needed)

    def get_winner(self) -> Optional[Player]:
        if not self.is_over():
            return None
        return self.player1 if self.player1.score > self.player2.score else self.player2`
    },
    {
      id: 'notepad-system',
      isNew: true,
      title: 'Notepad System',
      subtitle: 'Text Editor',
      icon: 'document',
      color: '#f59e0b',
      difficulty: 'Medium',
      description: 'Design a notepad/text editor system with note creation, editing, search, and undo/redo support.',

      introduction: `A notepad system models a simple text editor with CRUD operations on notes, undo/redo functionality, and search capabilities. This problem tests your understanding of the Command pattern for undo/redo and efficient text search.

The key design challenge is implementing undo/redo using the Command pattern, where each operation is encapsulated as a reversible command object stored in a history stack.`,

      coreEntities: [
        { name: 'Notepad', description: 'Main application managing notes and command history' },
        { name: 'Note', description: 'Individual note with title, content, timestamps, and tags' },
        { name: 'Command (Abstract)', description: 'Base class for all operations with execute() and undo()' },
        { name: 'InsertCommand', description: 'Inserts text at a position in a note' },
        { name: 'DeleteCommand', description: 'Deletes text range from a note' },
        { name: 'CommandHistory', description: 'Manages undo and redo stacks' }
      ],

      designPatterns: [
        'Command Pattern: Encapsulate operations for undo/redo',
        'Memento Pattern: Snapshot note state for complex undos',
        'Observer Pattern: Auto-save when note content changes',
        'Iterator Pattern: Browse through notes collection'
      ],

      implementation: `from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional

class Note:
    def __init__(self, note_id: str, title: str):
        self.note_id = note_id
        self.title = title
        self.content = ""
        self.tags: List[str] = []
        self.created_at = datetime.now()
        self.updated_at = self.created_at

    def insert_text(self, position: int, text: str):
        self.content = self.content[:position] + text + self.content[position:]
        self.updated_at = datetime.now()

    def delete_text(self, start: int, end: int) -> str:
        deleted = self.content[start:end]
        self.content = self.content[:start] + self.content[end:]
        self.updated_at = datetime.now()
        return deleted

class Command(ABC):
    @abstractmethod
    def execute(self):
        pass

    @abstractmethod
    def undo(self):
        pass

class InsertCommand(Command):
    def __init__(self, note: Note, position: int, text: str):
        self.note = note
        self.position = position
        self.text = text

    def execute(self):
        self.note.insert_text(self.position, self.text)

    def undo(self):
        self.note.delete_text(self.position, self.position + len(self.text))

class DeleteCommand(Command):
    def __init__(self, note: Note, start: int, end: int):
        self.note = note
        self.start = start
        self.end = end
        self.deleted_text = ""

    def execute(self):
        self.deleted_text = self.note.delete_text(self.start, self.end)

    def undo(self):
        self.note.insert_text(self.start, self.deleted_text)

class CommandHistory:
    def __init__(self):
        self.undo_stack: List[Command] = []
        self.redo_stack: List[Command] = []

    def execute(self, command: Command):
        command.execute()
        self.undo_stack.append(command)
        self.redo_stack.clear()

    def undo(self) -> bool:
        if not self.undo_stack:
            return False
        command = self.undo_stack.pop()
        command.undo()
        self.redo_stack.append(command)
        return True

    def redo(self) -> bool:
        if not self.redo_stack:
            return False
        command = self.redo_stack.pop()
        command.execute()
        self.undo_stack.append(command)
        return True

class Notepad:
    def __init__(self):
        self.notes: Dict[str, Note] = {}
        self.history = CommandHistory()
        self._next_id = 1

    def create_note(self, title: str) -> Note:
        note_id = f"note_{self._next_id}"
        self._next_id += 1
        note = Note(note_id, title)
        self.notes[note_id] = note
        return note

    def insert(self, note_id: str, position: int, text: str):
        note = self.notes.get(note_id)
        if note:
            cmd = InsertCommand(note, position, text)
            self.history.execute(cmd)

    def delete(self, note_id: str, start: int, end: int):
        note = self.notes.get(note_id)
        if note:
            cmd = DeleteCommand(note, start, end)
            self.history.execute(cmd)

    def search(self, query: str) -> List[Note]:
        return [n for n in self.notes.values()
                if query.lower() in n.title.lower() or query.lower() in n.content.lower()]`
    },
    {
      id: '2d-vector',
      isNew: true,
      title: '2D Vector Class',
      subtitle: 'Mathematical Vector',
      icon: 'arrowUpDown',
      color: '#06b6d4',
      difficulty: 'Easy',
      description: 'Design a 2D vector class supporting arithmetic operations, dot product, cross product, and transformations.',

      introduction: `A 2D vector class is a fundamental building block in game development, physics simulations, and computer graphics. The design tests your understanding of operator overloading, immutability, and mathematical operations.

The class should support vector arithmetic (add, subtract, scale), dot/cross products, normalization, rotation, and common utility methods like magnitude and angle calculation.`,

      coreEntities: [
        { name: 'Vector2D', description: 'Immutable 2D vector with x, y components and arithmetic operations' },
        { name: 'Magnitude', description: 'Length of the vector computed as sqrt(x^2 + y^2)' },
        { name: 'Unit Vector', description: 'Normalized vector with magnitude 1, preserving direction' }
      ],

      designPatterns: [
        'Immutable Object Pattern: Operations return new vectors instead of mutating',
        'Operator Overloading: Natural mathematical syntax (+, -, *, ==)',
        'Factory Method: Static methods for common vectors (zero, unit_x, unit_y)'
      ],

      implementation: `import math
from typing import Tuple

class Vector2D:
    def __init__(self, x: float = 0.0, y: float = 0.0):
        self._x = x
        self._y = y

    @property
    def x(self) -> float:
        return self._x

    @property
    def y(self) -> float:
        return self._y

    def __add__(self, other: 'Vector2D') -> 'Vector2D':
        return Vector2D(self.x + other.x, self.y + other.y)

    def __sub__(self, other: 'Vector2D') -> 'Vector2D':
        return Vector2D(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> 'Vector2D':
        return Vector2D(self.x * scalar, self.y * scalar)

    def __eq__(self, other) -> bool:
        if not isinstance(other, Vector2D):
            return False
        return math.isclose(self.x, other.x) and math.isclose(self.y, other.y)

    def magnitude(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2)

    def normalize(self) -> 'Vector2D':
        mag = self.magnitude()
        if mag == 0:
            return Vector2D(0, 0)
        return Vector2D(self.x / mag, self.y / mag)

    def dot(self, other: 'Vector2D') -> float:
        return self.x * other.x + self.y * other.y

    def cross(self, other: 'Vector2D') -> float:
        return self.x * other.y - self.y * other.x

    def angle(self) -> float:
        return math.atan2(self.y, self.x)

    def angle_between(self, other: 'Vector2D') -> float:
        cos_angle = self.dot(other) / (self.magnitude() * other.magnitude())
        cos_angle = max(-1, min(1, cos_angle))  # clamp for floating point
        return math.acos(cos_angle)

    def rotate(self, radians: float) -> 'Vector2D':
        cos_r = math.cos(radians)
        sin_r = math.sin(radians)
        return Vector2D(
            self.x * cos_r - self.y * sin_r,
            self.x * sin_r + self.y * cos_r
        )

    def distance_to(self, other: 'Vector2D') -> float:
        return (self - other).magnitude()

    @staticmethod
    def zero() -> 'Vector2D':
        return Vector2D(0, 0)

    @staticmethod
    def from_angle(radians: float, magnitude: float = 1.0) -> 'Vector2D':
        return Vector2D(math.cos(radians) * magnitude, math.sin(radians) * magnitude)

    def __repr__(self) -> str:
        return f"Vector2D({self.x:.2f}, {self.y:.2f})"`
    },
    {
      id: 'access-management',
      isNew: true,
      title: 'Access Management System',
      subtitle: 'Role-Based Access Control',
      icon: 'shield',
      color: '#8b5cf6',
      difficulty: 'Medium',
      description: 'Design a role-based access control (RBAC) system managing users, roles, and permissions.',

      introduction: `An access management system controls who can access what resources in an application. RBAC (Role-Based Access Control) assigns permissions to roles, and roles to users, providing a scalable way to manage authorization.

The key design decisions involve permission inheritance through role hierarchies, handling resource-level permissions, and efficiently checking access for deeply nested permission structures.`,

      coreEntities: [
        { name: 'User', description: 'System user with assigned roles' },
        { name: 'Role', description: 'Named collection of permissions (e.g., Admin, Editor, Viewer)' },
        { name: 'Permission', description: 'Specific action on a resource (e.g., READ:document)' },
        { name: 'Resource', description: 'Protected entity (document, API endpoint, feature)' },
        { name: 'AccessManager', description: 'Central authority for permission checks and role management' }
      ],

      designPatterns: [
        'Composite Pattern: Role hierarchies with inherited permissions',
        'Chain of Responsibility: Permission checks cascade through role hierarchy',
        'Singleton Pattern: Single AccessManager instance',
        'Observer Pattern: Notify dependent services when permissions change'
      ],

      implementation: `from typing import Dict, Set, List, Optional
from enum import Enum
from threading import Lock

class Action(Enum):
    READ = 'read'
    WRITE = 'write'
    DELETE = 'delete'
    ADMIN = 'admin'

class Permission:
    def __init__(self, resource: str, action: Action):
        self.resource = resource
        self.action = action

    def __hash__(self):
        return hash((self.resource, self.action))

    def __eq__(self, other):
        return self.resource == other.resource and self.action == other.action

class Role:
    def __init__(self, name: str):
        self.name = name
        self.permissions: Set[Permission] = set()
        self.parent_roles: List['Role'] = []  # role hierarchy

    def add_permission(self, permission: Permission):
        self.permissions.add(permission)

    def add_parent(self, parent: 'Role'):
        self.parent_roles.append(parent)

    def get_all_permissions(self) -> Set[Permission]:
        """Get permissions including inherited from parent roles."""
        all_perms = set(self.permissions)
        for parent in self.parent_roles:
            all_perms.update(parent.get_all_permissions())
        return all_perms

class User:
    def __init__(self, user_id: str, name: str):
        self.user_id = user_id
        self.name = name
        self.roles: List[Role] = []

    def get_all_permissions(self) -> Set[Permission]:
        perms = set()
        for role in self.roles:
            perms.update(role.get_all_permissions())
        return perms

class AccessManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.users: Dict[str, User] = {}
        self.roles: Dict[str, Role] = {}
        self.lock = Lock()

    def create_role(self, name: str, parent_name: str = None) -> Role:
        with self.lock:
            role = Role(name)
            if parent_name and parent_name in self.roles:
                role.add_parent(self.roles[parent_name])
            self.roles[name] = role
            return role

    def assign_role(self, user_id: str, role_name: str) -> bool:
        user = self.users.get(user_id)
        role = self.roles.get(role_name)
        if not user or not role:
            return False
        if role not in user.roles:
            user.roles.append(role)
        return True

    def check_access(self, user_id: str, resource: str, action: Action) -> bool:
        user = self.users.get(user_id)
        if not user:
            return False
        required = Permission(resource, action)
        return required in user.get_all_permissions()`
    },
    {
      id: 'gpu-credits',
      isNew: true,
      title: 'Design GPU Credits',
      subtitle: 'Cloud GPU Billing',
      icon: 'zap',
      color: '#f97316',
      difficulty: 'Medium',
      description: 'Design a GPU credits system for cloud computing with usage tracking, billing, and quota management.',

      introduction: `A GPU credits system manages the allocation and billing of GPU compute resources in a cloud platform. Users purchase credits and spend them based on GPU type, duration, and priority. The system must handle concurrent usage, prevent overspending, and provide real-time balance updates.

The key challenges are: atomic credit deductions during concurrent GPU usage, handling preemptible vs dedicated instances, rate calculations for different GPU tiers, and graceful handling of credit exhaustion mid-job.`,

      coreEntities: [
        { name: 'Account', description: 'User account with credit balance and usage history' },
        { name: 'CreditLedger', description: 'Double-entry ledger tracking all credit transactions' },
        { name: 'GPUInstance', description: 'Running GPU instance consuming credits over time' },
        { name: 'PricingTier', description: 'Rate card for different GPU types (T4, A100, H100)' },
        { name: 'UsageTracker', description: 'Monitors running instances and deducts credits periodically' },
        { name: 'QuotaManager', description: 'Enforces spending limits and instance quotas' }
      ],

      designPatterns: [
        'Observer Pattern: Notify user when credit balance is low',
        'Strategy Pattern: Different pricing strategies (on-demand, reserved, spot)',
        'Scheduler Pattern: Periodic credit deduction for running instances',
        'Double-Entry Ledger: Every credit movement has balanced debit/credit'
      ],

      implementation: `from enum import Enum
from datetime import datetime
from typing import Dict, List, Optional
from threading import Lock
from dataclasses import dataclass

class GPUType(Enum):
    T4 = ('t4', 0.5)       # $0.50/credit per hour
    A100 = ('a100', 2.0)    # $2.00/credit per hour
    H100 = ('h100', 4.0)    # $4.00/credit per hour

    def __init__(self, gpu_name: str, rate: float):
        self.gpu_name = gpu_name
        self.rate = rate

class InstanceStatus(Enum):
    RUNNING = 'running'
    STOPPED = 'stopped'
    TERMINATED = 'terminated'

@dataclass
class LedgerEntry:
    account_id: str
    amount: float  # positive = credit, negative = debit
    description: str
    timestamp: datetime
    balance_after: float

class Account:
    def __init__(self, account_id: str):
        self.account_id = account_id
        self.balance = 0.0
        self.lock = Lock()
        self.ledger: List[LedgerEntry] = []

    def add_credits(self, amount: float, description: str = "Credit purchase"):
        with self.lock:
            self.balance += amount
            self.ledger.append(LedgerEntry(
                self.account_id, amount, description, datetime.now(), self.balance))

    def deduct_credits(self, amount: float, description: str = "Usage") -> bool:
        with self.lock:
            if self.balance < amount:
                return False
            self.balance -= amount
            self.ledger.append(LedgerEntry(
                self.account_id, -amount, description, datetime.now(), self.balance))
            return True

class GPUInstance:
    def __init__(self, instance_id: str, account: Account, gpu_type: GPUType):
        self.instance_id = instance_id
        self.account = account
        self.gpu_type = gpu_type
        self.status = InstanceStatus.RUNNING
        self.started_at = datetime.now()
        self.last_billed_at = self.started_at

class GPUCreditsSystem:
    def __init__(self):
        self.accounts: Dict[str, Account] = {}
        self.instances: Dict[str, GPUInstance] = {}
        self.lock = Lock()

    def launch_instance(self, account_id: str, gpu_type: GPUType) -> Optional[GPUInstance]:
        account = self.accounts.get(account_id)
        if not account or account.balance < gpu_type.rate:
            return None  # Insufficient credits
        instance = GPUInstance(f"gpu_{len(self.instances)}", account, gpu_type)
        self.instances[instance.instance_id] = instance
        return instance

    def bill_usage(self):
        """Called periodically (e.g., every minute) to deduct credits."""
        now = datetime.now()
        for instance in list(self.instances.values()):
            if instance.status != InstanceStatus.RUNNING:
                continue
            hours = (now - instance.last_billed_at).total_seconds() / 3600
            cost = hours * instance.gpu_type.rate
            if not instance.account.deduct_credits(cost, f"GPU {instance.gpu_type.gpu_name}"):
                instance.status = InstanceStatus.TERMINATED
            else:
                instance.last_billed_at = now`
    },
    {
      id: 'disk-space-manager',
      isNew: true,
      title: 'Disk Space Manager',
      subtitle: 'Storage Block Allocator',
      icon: 'hardDrive',
      color: '#64748b',
      difficulty: 'Medium',
      description: 'Design a disk space manager that allocates and frees blocks of storage with defragmentation support.',

      introduction: `A disk space manager handles the allocation and deallocation of storage blocks on a disk. It's similar to a memory allocator but operates at the block level, tracking which blocks are free and which are allocated to files.

The key challenges are: minimizing fragmentation, efficiently finding contiguous free blocks for large files, and implementing defragmentation to compact allocated blocks.`,

      coreEntities: [
        { name: 'DiskManager', description: 'Central manager tracking block allocation across the disk' },
        { name: 'Block', description: 'Fixed-size storage unit (e.g., 4KB) with allocation status' },
        { name: 'FileEntry', description: 'Metadata mapping a file to its allocated blocks' },
        { name: 'FreeBlockBitmap', description: 'Bitmap tracking free/used status of every block' },
        { name: 'AllocationPolicy', description: 'Strategy for choosing blocks (contiguous, scattered)' }
      ],

      designPatterns: [
        'Bitmap Pattern: Bit array for O(1) block status lookup',
        'Strategy Pattern: Different allocation policies (first-fit, contiguous)',
        'Facade Pattern: DiskManager hides complexity of block management'
      ],

      implementation: `from typing import Dict, List, Optional

class DiskManager:
    def __init__(self, total_blocks: int):
        self.total_blocks = total_blocks
        self.bitmap = [False] * total_blocks  # False = free, True = allocated
        self.files: Dict[str, List[int]] = {}  # filename -> list of block indices
        self.free_count = total_blocks

    def allocate(self, filename: str, num_blocks: int) -> bool:
        """Allocate blocks for a file using first-fit strategy."""
        if num_blocks > self.free_count:
            return False

        allocated = []
        for i in range(self.total_blocks):
            if not self.bitmap[i]:
                allocated.append(i)
                if len(allocated) == num_blocks:
                    break

        if len(allocated) < num_blocks:
            return False

        for block_idx in allocated:
            self.bitmap[block_idx] = True

        self.files[filename] = allocated
        self.free_count -= num_blocks
        return True

    def allocate_contiguous(self, filename: str, num_blocks: int) -> bool:
        """Allocate contiguous blocks for a file."""
        start = self._find_contiguous(num_blocks)
        if start == -1:
            return False

        blocks = list(range(start, start + num_blocks))
        for idx in blocks:
            self.bitmap[idx] = True

        self.files[filename] = blocks
        self.free_count -= num_blocks
        return True

    def _find_contiguous(self, num_blocks: int) -> int:
        """Find first contiguous run of free blocks."""
        count = 0
        start = -1
        for i in range(self.total_blocks):
            if not self.bitmap[i]:
                if count == 0:
                    start = i
                count += 1
                if count == num_blocks:
                    return start
            else:
                count = 0
                start = -1
        return -1

    def free(self, filename: str) -> bool:
        if filename not in self.files:
            return False
        blocks = self.files.pop(filename)
        for idx in blocks:
            self.bitmap[idx] = False
        self.free_count += len(blocks)
        return True

    def defragment(self):
        """Move all allocated blocks to the front of the disk."""
        write_pos = 0
        new_files: Dict[str, List[int]] = {f: [] for f in self.files}

        # Collect all allocated blocks in file order
        for filename, blocks in self.files.items():
            for _ in blocks:
                while self.bitmap[write_pos] and write_pos not in blocks:
                    write_pos += 1
                new_files[filename].append(write_pos)
                write_pos += 1

        # Reset and reallocate
        self.bitmap = [False] * self.total_blocks
        for filename, blocks in new_files.items():
            for idx in blocks:
                self.bitmap[idx] = True
        self.files = new_files

    def get_fragmentation_ratio(self) -> float:
        """Return ratio of fragmented files (non-contiguous blocks)."""
        if not self.files:
            return 0.0
        fragmented = 0
        for blocks in self.files.values():
            if len(blocks) > 1:
                for i in range(1, len(blocks)):
                    if blocks[i] != blocks[i-1] + 1:
                        fragmented += 1
                        break
        return fragmented / len(self.files)`
    },
    {
      id: 'account-balance-tracker',
      isNew: true,
      title: 'Account Balance Tracker',
      subtitle: 'Financial Ledger',
      icon: 'dollarSign',
      color: '#10b981',
      difficulty: 'Easy',
      description: 'Design an account balance tracker with deposits, withdrawals, transfers, and transaction history.',

      introduction: `An account balance tracker maintains financial account balances with thread-safe deposit, withdrawal, and transfer operations. This problem tests your understanding of thread safety, atomicity, and maintaining consistent state across concurrent operations.

The key challenge is ensuring that transfers between accounts are atomic -- either both the debit and credit succeed, or neither does. This prevents money from being lost or created due to partial failures.`,

      coreEntities: [
        { name: 'Account', description: 'Individual account with balance and transaction history' },
        { name: 'Transaction', description: 'Record of a deposit, withdrawal, or transfer' },
        { name: 'BalanceTracker', description: 'Manages multiple accounts and cross-account transfers' },
        { name: 'TransactionType (Enum)', description: 'DEPOSIT, WITHDRAWAL, TRANSFER' }
      ],

      designPatterns: [
        'Thread Safety: Lock-based protection for balance modifications',
        'Atomic Transfer: Lock ordering to prevent deadlocks during transfers',
        'Immutable Transaction: Transaction records cannot be modified after creation'
      ],

      implementation: `from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from threading import Lock

class TransactionType(Enum):
    DEPOSIT = 'deposit'
    WITHDRAWAL = 'withdrawal'
    TRANSFER = 'transfer'

class Transaction:
    def __init__(self, tx_type: TransactionType, amount: float,
                 from_account: str = None, to_account: str = None):
        self.tx_type = tx_type
        self.amount = amount
        self.from_account = from_account
        self.to_account = to_account
        self.timestamp = datetime.now()

class Account:
    def __init__(self, account_id: str, initial_balance: float = 0.0):
        self.account_id = account_id
        self.balance = initial_balance
        self.transactions: List[Transaction] = []
        self.lock = Lock()

    def deposit(self, amount: float) -> bool:
        if amount <= 0:
            return False
        with self.lock:
            self.balance += amount
            self.transactions.append(
                Transaction(TransactionType.DEPOSIT, amount, to_account=self.account_id))
            return True

    def withdraw(self, amount: float) -> bool:
        if amount <= 0:
            return False
        with self.lock:
            if self.balance < amount:
                return False
            self.balance -= amount
            self.transactions.append(
                Transaction(TransactionType.WITHDRAWAL, amount, from_account=self.account_id))
            return True

    def get_balance(self) -> float:
        return self.balance

class BalanceTracker:
    def __init__(self):
        self.accounts: Dict[str, Account] = {}

    def create_account(self, account_id: str, initial_balance: float = 0.0) -> Account:
        account = Account(account_id, initial_balance)
        self.accounts[account_id] = account
        return account

    def transfer(self, from_id: str, to_id: str, amount: float) -> bool:
        from_acc = self.accounts.get(from_id)
        to_acc = self.accounts.get(to_id)
        if not from_acc or not to_acc or amount <= 0:
            return False

        # Lock ordering by account_id to prevent deadlocks
        first, second = sorted([from_acc, to_acc], key=lambda a: a.account_id)
        with first.lock:
            with second.lock:
                if from_acc.balance < amount:
                    return False
                from_acc.balance -= amount
                to_acc.balance += amount
                tx = Transaction(TransactionType.TRANSFER, amount, from_id, to_id)
                from_acc.transactions.append(tx)
                to_acc.transactions.append(tx)
                return True

    def get_total_balance(self) -> float:
        return sum(acc.balance for acc in self.accounts.values())`
    },
    {
      id: 'go-fish',
      isNew: true,
      title: 'Go Fish',
      subtitle: 'Card Game',
      icon: 'gamepad',
      color: '#3b82f6',
      difficulty: 'Medium',
      description: 'Design the Go Fish card game with deck management, hand tracking, and book collection.',

      introduction: `Go Fish is a classic card game where players collect sets of four matching cards (books) by asking opponents for specific ranks. The design involves deck management, hand tracking, turn logic, and win condition detection.

The key OOP concepts demonstrated are: encapsulating game rules in a Game class, separating deck/hand/player concerns, and implementing turn-based logic with proper validation.`,

      coreEntities: [
        { name: 'Card', description: 'Playing card with rank and suit' },
        { name: 'Deck', description: 'Standard 52-card deck with shuffle and draw' },
        { name: 'Hand', description: 'Player hand with cards grouped by rank' },
        { name: 'Player', description: 'Game participant with hand and collected books' },
        { name: 'Game', description: 'Orchestrates turns, validates asks, and detects winner' }
      ],

      designPatterns: [
        'Factory Pattern: Deck creates standard 52-card set',
        'Iterator Pattern: Traverse cards in hand',
        'Template Method: Turn sequence (ask, give/fish, check books)'
      ],

      implementation: `from enum import Enum
from random import shuffle
from typing import List, Optional
from collections import defaultdict

class Suit(Enum):
    HEARTS = 'Hearts'
    DIAMONDS = 'Diamonds'
    CLUBS = 'Clubs'
    SPADES = 'Spades'

class Rank(Enum):
    TWO = '2'; THREE = '3'; FOUR = '4'; FIVE = '5'
    SIX = '6'; SEVEN = '7'; EIGHT = '8'; NINE = '9'
    TEN = '10'; JACK = 'J'; QUEEN = 'Q'; KING = 'K'; ACE = 'A'

class Card:
    def __init__(self, rank: Rank, suit: Suit):
        self.rank = rank
        self.suit = suit

    def __repr__(self):
        return f"{self.rank.value}{self.suit.value[0]}"

class Deck:
    def __init__(self):
        self.cards = [Card(r, s) for r in Rank for s in Suit]
        shuffle(self.cards)

    def draw(self) -> Optional[Card]:
        return self.cards.pop() if self.cards else None

    def is_empty(self) -> bool:
        return len(self.cards) == 0

class Player:
    def __init__(self, name: str):
        self.name = name
        self.hand: List[Card] = []
        self.books: List[Rank] = []

    def has_rank(self, rank: Rank) -> bool:
        return any(c.rank == rank for c in self.hand)

    def give_cards(self, rank: Rank) -> List[Card]:
        given = [c for c in self.hand if c.rank == rank]
        self.hand = [c for c in self.hand if c.rank != rank]
        return given

    def receive_cards(self, cards: List[Card]):
        self.hand.extend(cards)
        self._check_books()

    def _check_books(self):
        counts = defaultdict(list)
        for card in self.hand:
            counts[card.rank].append(card)
        for rank, cards in counts.items():
            if len(cards) == 4:
                self.books.append(rank)
                self.hand = [c for c in self.hand if c.rank != rank]

    def hand_size(self) -> int:
        return len(self.hand)

class GoFishGame:
    def __init__(self, player_names: List[str]):
        self.deck = Deck()
        self.players = [Player(name) for name in player_names]
        self.current_player_idx = 0
        cards_per_player = 7 if len(player_names) <= 3 else 5
        for player in self.players:
            for _ in range(cards_per_player):
                card = self.deck.draw()
                if card:
                    player.receive_cards([card])

    def ask(self, asking_rank: Rank, target_idx: int) -> str:
        asker = self.players[self.current_player_idx]
        target = self.players[target_idx]

        if not asker.has_rank(asking_rank):
            return f"{asker.name} must hold the rank they ask for!"

        if target.has_rank(asking_rank):
            cards = target.give_cards(asking_rank)
            asker.receive_cards(cards)
            return f"{target.name} gave {len(cards)} {asking_rank.value}(s) to {asker.name}"
        else:
            # Go Fish
            card = self.deck.draw()
            if card:
                asker.receive_cards([card])
                got_asked = card.rank == asking_rank
                self.current_player_idx = (self.current_player_idx + 1) % len(self.players)
                return f"Go Fish! {asker.name} drew a card" + (" and got what they asked for!" if got_asked else "")
            self.current_player_idx = (self.current_player_idx + 1) % len(self.players)
            return "Go Fish! Deck is empty"

    def is_over(self) -> bool:
        return self.deck.is_empty() and all(p.hand_size() == 0 for p in self.players)

    def get_winner(self) -> Optional[Player]:
        if not self.is_over():
            return None
        return max(self.players, key=lambda p: len(p.books))`
    },
    {
      id: 'access-control-tree',
      isNew: true,
      title: 'Access Control Tree',
      subtitle: 'Hierarchical Permissions',
      icon: 'gitBranch',
      color: '#8b5cf6',
      difficulty: 'Medium',
      description: 'Design a tree-based access control system where permissions inherit from parent to child nodes.',

      introduction: `An access control tree represents a hierarchical permission structure, like a file system where folder permissions cascade to contained files. Children inherit parent permissions unless explicitly overridden.

The key design challenge is efficient permission resolution: when checking if a user can access a resource, traverse up the tree until an explicit permission is found. This supports both inheritance and overrides.`,

      coreEntities: [
        { name: 'ACLNode', description: 'Tree node representing a resource with optional explicit permissions' },
        { name: 'Permission (Enum)', description: 'READ, WRITE, DELETE, ADMIN with hierarchy' },
        { name: 'ACLEntry', description: 'Maps a user/role to a permission level on a specific node' },
        { name: 'ACLTree', description: 'Tree structure with permission resolution via ancestor traversal' }
      ],

      designPatterns: [
        'Composite Pattern: Tree nodes contain children forming hierarchical structure',
        'Chain of Responsibility: Permission check cascades up to ancestors',
        'Inheritance Pattern: Child nodes inherit parent permissions unless overridden'
      ],

      implementation: `from enum import IntEnum
from typing import Dict, List, Optional, Set

class Permission(IntEnum):
    NONE = 0
    READ = 1
    WRITE = 2
    DELETE = 3
    ADMIN = 4

    def includes(self, other: 'Permission') -> bool:
        return self.value >= other.value

class ACLNode:
    def __init__(self, name: str, parent: 'ACLNode' = None):
        self.name = name
        self.parent = parent
        self.children: Dict[str, 'ACLNode'] = {}
        # Explicit permissions: user_id -> Permission
        self.permissions: Dict[str, Permission] = {}

    def set_permission(self, user_id: str, permission: Permission):
        self.permissions[user_id] = permission

    def remove_permission(self, user_id: str):
        self.permissions.pop(user_id, None)

    def get_explicit_permission(self, user_id: str) -> Optional[Permission]:
        return self.permissions.get(user_id)

    def add_child(self, name: str) -> 'ACLNode':
        child = ACLNode(name, parent=self)
        self.children[name] = child
        return child

class ACLTree:
    def __init__(self, root_name: str = "/"):
        self.root = ACLNode(root_name)

    def resolve_permission(self, node: ACLNode, user_id: str) -> Permission:
        """Walk up the tree to find the effective permission for a user."""
        current = node
        while current is not None:
            explicit = current.get_explicit_permission(user_id)
            if explicit is not None:
                return explicit
            current = current.parent
        return Permission.NONE  # No permission found

    def check_access(self, node: ACLNode, user_id: str,
                     required: Permission) -> bool:
        effective = self.resolve_permission(node, user_id)
        return effective.includes(required)

    def get_node(self, path: str) -> Optional[ACLNode]:
        """Get node by path like '/folder1/subfolder/file'."""
        parts = [p for p in path.split('/') if p]
        current = self.root
        for part in parts:
            if part not in current.children:
                return None
            current = current.children[part]
        return current

    def create_path(self, path: str) -> ACLNode:
        """Create all nodes along the path if they don't exist."""
        parts = [p for p in path.split('/') if p]
        current = self.root
        for part in parts:
            if part not in current.children:
                current.add_child(part)
            current = current.children[part]
        return current

    def list_accessible(self, node: ACLNode, user_id: str,
                        min_permission: Permission = Permission.READ) -> List[str]:
        """List all children accessible by user with at least given permission."""
        result = []
        for name, child in node.children.items():
            if self.check_access(child, user_id, min_permission):
                result.append(name)
        return result`
    },
    {
      id: 'active-users',
      isNew: true,
      title: 'Active Users in N Minutes',
      subtitle: 'Sliding Window Counter',
      icon: 'users',
      color: '#3b82f6',
      difficulty: 'Medium',
      description: 'Design a system to track and query the number of active users within a sliding time window.',

      introduction: `Tracking active users in a sliding time window is a common requirement for dashboards, rate limiting, and analytics. The challenge is efficiently counting unique users who were active in the last N minutes without storing every individual event.

The key data structures are: a sliding window with time-bucketed sets for exact counts at moderate scale, and HyperLogLog for approximate unique counts at massive scale.`,

      coreEntities: [
        { name: 'ActivityTracker', description: 'Main class recording user activity and answering window queries' },
        { name: 'TimeBucket', description: 'Set of user IDs active within a time granularity (e.g., 1 minute)' },
        { name: 'SlidingWindow', description: 'Collection of time buckets spanning the query window' }
      ],

      designPatterns: [
        'Sliding Window Pattern: Time-bucketed counters for efficient range queries',
        'Strategy Pattern: Different counting strategies (exact set, HyperLogLog)',
        'Cleanup Pattern: Periodic removal of expired time buckets'
      ],

      implementation: `from collections import defaultdict
from datetime import datetime, timedelta
from typing import Set, Dict
from threading import Lock
import time

class ActivityTracker:
    def __init__(self, bucket_size_seconds: int = 60):
        self.bucket_size = bucket_size_seconds
        self.buckets: Dict[int, Set[str]] = defaultdict(set)
        self.lock = Lock()

    def _get_bucket_key(self, timestamp: datetime = None) -> int:
        if timestamp is None:
            timestamp = datetime.now()
        epoch = int(timestamp.timestamp())
        return epoch - (epoch % self.bucket_size)

    def record_activity(self, user_id: str, timestamp: datetime = None):
        """Record that a user was active at the given time."""
        with self.lock:
            bucket_key = self._get_bucket_key(timestamp)
            self.buckets[bucket_key].add(user_id)

    def get_active_users(self, window_minutes: int) -> int:
        """Count unique active users in the last N minutes."""
        with self.lock:
            now = datetime.now()
            cutoff = now - timedelta(minutes=window_minutes)
            cutoff_key = self._get_bucket_key(cutoff)

            unique_users: Set[str] = set()
            for bucket_key, users in self.buckets.items():
                if bucket_key >= cutoff_key:
                    unique_users.update(users)

            return len(unique_users)

    def get_active_user_ids(self, window_minutes: int) -> Set[str]:
        """Get the set of unique active user IDs."""
        with self.lock:
            now = datetime.now()
            cutoff = now - timedelta(minutes=window_minutes)
            cutoff_key = self._get_bucket_key(cutoff)

            unique_users: Set[str] = set()
            for bucket_key, users in self.buckets.items():
                if bucket_key >= cutoff_key:
                    unique_users.update(users)

            return unique_users

    def cleanup(self, retain_minutes: int = 60):
        """Remove buckets older than retain_minutes."""
        with self.lock:
            cutoff = datetime.now() - timedelta(minutes=retain_minutes)
            cutoff_key = self._get_bucket_key(cutoff)
            expired = [k for k in self.buckets if k < cutoff_key]
            for k in expired:
                del self.buckets[k]

    def get_activity_histogram(self, window_minutes: int) -> Dict[int, int]:
        """Get count of active users per bucket over the window."""
        with self.lock:
            now = datetime.now()
            cutoff = now - timedelta(minutes=window_minutes)
            cutoff_key = self._get_bucket_key(cutoff)

            histogram = {}
            for bucket_key, users in sorted(self.buckets.items()):
                if bucket_key >= cutoff_key:
                    histogram[bucket_key] = len(users)
            return histogram`
    },
    {
      id: 'actor-component',
      isNew: true,
      title: 'Actor Component Model',
      subtitle: 'Concurrent Message Passing',
      icon: 'cpu',
      color: '#ef4444',
      difficulty: 'Hard',
      description: 'Design an actor-based concurrency model where actors communicate via asynchronous message passing.',

      introduction: `The Actor Model is a concurrency paradigm where independent actors communicate through asynchronous messages. Each actor has a mailbox (message queue), processes messages sequentially, and can create child actors. This eliminates shared mutable state and the need for locks.

Used by frameworks like Akka (Scala/Java) and Erlang/OTP, the actor model is ideal for building fault-tolerant, distributed systems. The key challenges are: implementing the message dispatch loop, handling dead letters, and building supervision hierarchies for fault tolerance.`,

      coreEntities: [
        { name: 'Actor', description: 'Independent computation unit with mailbox and message handler' },
        { name: 'ActorRef', description: 'Handle for sending messages to an actor (hides location)' },
        { name: 'Message', description: 'Immutable data sent between actors' },
        { name: 'Mailbox', description: 'Thread-safe message queue for each actor' },
        { name: 'ActorSystem', description: 'Container managing actor lifecycle and thread pool' },
        { name: 'Supervisor', description: 'Parent actor that handles child failures' }
      ],

      designPatterns: [
        'Actor Pattern: Message-driven concurrency without shared state',
        'Supervisor Pattern: Parent actors handle child failures (restart, stop, escalate)',
        'Location Transparency: ActorRef hides whether actor is local or remote',
        'Tell Pattern: Fire-and-forget async messaging (no blocking)'
      ],

      implementation: `from abc import ABC, abstractmethod
from queue import Queue
from threading import Thread, Event
from typing import Any, Dict, Optional, Callable
from dataclasses import dataclass
import uuid

@dataclass
class Message:
    content: Any
    sender: Optional['ActorRef'] = None

class ActorRef:
    def __init__(self, actor_id: str, mailbox: Queue):
        self.actor_id = actor_id
        self._mailbox = mailbox

    def tell(self, message: Any, sender: 'ActorRef' = None):
        self._mailbox.put(Message(content=message, sender=sender))

class Actor(ABC):
    def __init__(self):
        self.self_ref: Optional[ActorRef] = None
        self.context: Optional['ActorContext'] = None

    @abstractmethod
    def receive(self, message: Message):
        pass

    def create_child(self, actor_class: type, name: str = None) -> ActorRef:
        return self.context.create_actor(actor_class, name)

class ActorContext:
    def __init__(self, system: 'ActorSystem'):
        self.system = system

    def create_actor(self, actor_class: type, name: str = None) -> ActorRef:
        return self.system.create_actor(actor_class, name)

class ActorCell:
    """Internal wrapper managing an actor's lifecycle."""
    def __init__(self, actor: Actor, mailbox: Queue, actor_ref: ActorRef):
        self.actor = actor
        self.mailbox = mailbox
        self.actor_ref = actor_ref
        self._stop_event = Event()
        self._thread: Optional[Thread] = None

    def start(self):
        self._thread = Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self):
        while not self._stop_event.is_set():
            try:
                message = self.mailbox.get(timeout=0.1)
                try:
                    self.actor.receive(message)
                except Exception as e:
                    print(f"Actor {self.actor_ref.actor_id} failed: {e}")
            except Exception:
                continue  # Queue timeout

    def stop(self):
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=2)

class ActorSystem:
    def __init__(self, name: str = "default"):
        self.name = name
        self.actors: Dict[str, ActorCell] = {}
        self._dead_letters: Queue = Queue()

    def create_actor(self, actor_class: type, name: str = None) -> ActorRef:
        actor_id = name or f"{actor_class.__name__}-{uuid.uuid4().hex[:8]}"
        mailbox = Queue()
        actor_ref = ActorRef(actor_id, mailbox)

        actor = actor_class()
        actor.self_ref = actor_ref
        actor.context = ActorContext(self)

        cell = ActorCell(actor, mailbox, actor_ref)
        self.actors[actor_id] = cell
        cell.start()
        return actor_ref

    def stop_actor(self, actor_id: str):
        cell = self.actors.pop(actor_id, None)
        if cell:
            cell.stop()

    def shutdown(self):
        for actor_id in list(self.actors.keys()):
            self.stop_actor(actor_id)

# Example usage:
class EchoActor(Actor):
    def receive(self, message: Message):
        print(f"Echo: {message.content}")
        if message.sender:
            message.sender.tell(f"Echo: {message.content}", self.self_ref)`
    },
  ];

  // Concurrency Topics
