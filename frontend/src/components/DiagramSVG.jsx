import React from 'react';

// Color theme
const COLORS = {
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#8b5cf6',
  warning: '#f59e0b',
  error: '#ef4444',
  cyan: '#06b6d4',
  gray: '#64748b',
  text: '#e2e8f0',
  textLight: '#94a3b8',
  bg: '#1e293b'
};

// Helper components
const Box = ({ x, y, width, height, label, color = COLORS.primary, fontSize = 11 }) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={`${color}25`}
      stroke={color}
      strokeWidth="2"
      rx="4"
    />
    <text
      x={x + width / 2}
      y={y + height / 2 + 4}
      textAnchor="middle"
      fill="#ffffff"
      fontSize={fontSize}
      fontFamily="system-ui, -apple-system, sans-serif"
      fontWeight="500"
    >
      {label}
    </text>
  </g>
);

const Diamond = ({ x, y, size, label, color = COLORS.warning }) => (
  <g>
    <polygon
      points={`${x + size/2},${y} ${x + size},${y + size/2} ${x + size/2},${y + size} ${x},${y + size/2}`}
      fill={`${color}25`}
      stroke={color}
      strokeWidth="2"
    />
    <text
      x={x + size / 2}
      y={y + size / 2 + 4}
      textAnchor="middle"
      fill="#ffffff"
      fontSize="11"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontWeight="500"
    >
      {label}
    </text>
  </g>
);

const Arrow = ({ x1, y1, x2, y2, color = COLORS.primary }) => (
  <g>
    <defs>
      <marker
        id={`arrowhead-${color.replace('#', '')}`}
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill={color} />
      </marker>
    </defs>
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth="2"
      markerEnd={`url(#arrowhead-${color.replace('#', '')})`}
    />
  </g>
);

const Label = ({ x, y, text, color = COLORS.textLight, fontSize = 9 }) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontSize={fontSize}
    fontFamily="system-ui, -apple-system, sans-serif"
  >
    {text}
  </text>
);

// Diagram templates
const diagrams = {
  singleServer: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <Box x={30} y={60} width={90} height={50} label="Users" color={COLORS.secondary} />
      <Arrow x1={130} y1={85} x2={180} y2={85} />
      <Box x={190} y={30} width={180} height={110} label="" color={COLORS.primary} />
      <text x={280} y={55} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Single Server</text>
      <Box x={210} y={70} width={65} height={35} label="Web" color={COLORS.gray} />
      <Box x={285} y={70} width={65} height={35} label="DB" color={COLORS.gray} />
    </svg>
  ),

  loadBalancer: (
    <svg viewBox="0 0 420 200" className="w-full h-auto">
      <Box x={20} y={75} width={80} height={45} label="Users" color={COLORS.secondary} />
      <Arrow x1={110} y1={97} x2={145} y2={97} />
      <Diamond x={155} y={72} size={50} label="LB" color={COLORS.warning} />
      <Arrow x1={215} y1={82} x2={270} y2={55} />
      <Arrow x1={215} y1={97} x2={270} y2={97} />
      <Arrow x1={215} y1={112} x2={270} y2={140} />
      <Box x={280} y={35} width={90} height={35} label="Server 1" color={COLORS.primary} />
      <Box x={280} y={80} width={90} height={35} label="Server 2" color={COLORS.primary} />
      <Box x={280} y={125} width={90} height={35} label="Server 3" color={COLORS.primary} />
    </svg>
  ),

  singleDatabase: (
    <svg viewBox="0 0 400 160" className="w-full h-auto">
      <Box x={30} y={50} width={100} height={50} label="App Server" color={COLORS.primary} />
      <Arrow x1={140} y1={75} x2={190} y2={75} />
      <Box x={200} y={35} width={150} height={80} label="" color={COLORS.secondary} />
      <text x={275} y={60} textAnchor="middle" fill={COLORS.secondary} fontSize="12" fontWeight="600">Database</text>
      <Box x={220} y={75} width={50} height={28} label="Data" color={COLORS.gray} fontSize={10} />
      <Box x={280} y={75} width={50} height={28} label="Index" color={COLORS.gray} fontSize={10} />
    </svg>
  ),

  shardedDatabase: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <Box x={20} y={65} width={80} height={45} label="App" color={COLORS.primary} />
      <Arrow x1={110} y1={87} x2={145} y2={87} />
      <Box x={155} y={55} width={95} height={60} label="Shard Router" color={COLORS.warning} fontSize={10} />
      <Arrow x1={260} y1={70} x2={300} y2={45} />
      <Arrow x1={260} y1={85} x2={300} y2={85} />
      <Arrow x1={260} y1={100} x2={300} y2={125} />
      <Box x={310} y={25} width={80} height={35} label="Shard 1" color={COLORS.secondary} />
      <Box x={310} y={70} width={80} height={35} label="Shard 2" color={COLORS.secondary} />
      <Box x={310} y={115} width={80} height={35} label="Shard 3" color={COLORS.secondary} />
    </svg>
  ),

  simpleCache: (
    <svg viewBox="0 0 320 160" className="w-full h-auto">
      <Box x={20} y={55} width={80} height={45} label="App" color={COLORS.primary} />
      <Arrow x1={110} y1={65} x2={160} y2={45} />
      <Arrow x1={110} y1={90} x2={160} y2={115} />
      <Box x={170} y={25} width={100} height={40} label="Cache" color={COLORS.error} />
      <Box x={170} y={95} width={100} height={40} label="Database" color={COLORS.secondary} />
      <Label x={125} y={50} text="read" />
      <Label x={125} y={115} text="write" />
    </svg>
  ),

  multiTierCache: (
    <svg viewBox="0 0 460 140" className="w-full h-auto">
      <Box x={20} y={45} width={70} height={45} label="Client" color={COLORS.secondary} />
      <Arrow x1={100} y1={67} x2={135} y2={67} />
      <Box x={145} y={35} width={70} height={65} label="L1 Local" color={COLORS.error} fontSize={10} />
      <Arrow x1={225} y1={67} x2={260} y2={67} />
      <Box x={270} y={35} width={70} height={65} label="L2 Redis" color={COLORS.warning} fontSize={10} />
      <Arrow x1={350} y1={67} x2={385} y2={67} />
      <Box x={395} y={45} width={70} height={45} label="Database" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  simpleQueue: (
    <svg viewBox="0 0 460 140" className="w-full h-auto">
      <Box x={20} y={45} width={90} height={45} label="Producer" color={COLORS.secondary} />
      <Arrow x1={120} y1={67} x2={165} y2={67} />
      <Box x={175} y={35} width={110} height={65} label="Message Queue" color={COLORS.accent} fontSize={10} />
      <Arrow x1={295} y1={67} x2={340} y2={67} />
      <Box x={350} y={45} width={90} height={45} label="Consumer" color={COLORS.primary} />
    </svg>
  ),

  distributedQueue: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <Box x={15} y={25} width={70} height={30} label="Prod 1" color={COLORS.secondary} fontSize={10} />
      <Box x={15} y={65} width={70} height={30} label="Prod 2" color={COLORS.secondary} fontSize={10} />
      <Box x={15} y={105} width={70} height={30} label="Prod 3" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={95} y1={40} x2={135} y2={70} />
      <Arrow x1={95} y1={80} x2={135} y2={80} />
      <Arrow x1={95} y1={120} x2={135} y2={90} />
      <Box x={145} y={50} width={120} height={60} label="Kafka Cluster" color={COLORS.accent} fontSize={11} />
      <Arrow x1={275} y1={65} x2={315} y2={40} />
      <Arrow x1={275} y1={80} x2={315} y2={80} />
      <Arrow x1={275} y1={95} x2={315} y2={120} />
      <Box x={325} y={25} width={70} height={30} label="Cons 1" color={COLORS.primary} fontSize={10} />
      <Box x={325} y={65} width={70} height={30} label="Cons 2" color={COLORS.primary} fontSize={10} />
      <Box x={325} y={105} width={70} height={30} label="Cons 3" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  apiGateway: (
    <svg viewBox="0 0 400 180" className="w-full h-auto">
      <Box x={15} y={65} width={70} height={45} label="Client" color={COLORS.secondary} />
      <Arrow x1={95} y1={87} x2={130} y2={87} />
      <Box x={140} y={45} width={90} height={85} label="API Gateway" color={COLORS.warning} fontSize={11} />
      <Arrow x1={240} y1={65} x2={280} y2={40} />
      <Arrow x1={240} y1={87} x2={280} y2={87} />
      <Arrow x1={240} y1={110} x2={280} y2={135} />
      <Box x={290} y={20} width={85} height={35} label="Auth Svc" color={COLORS.primary} fontSize={10} />
      <Box x={290} y={70} width={85} height={35} label="User Svc" color={COLORS.primary} fontSize={10} />
      <Box x={290} y={120} width={85} height={35} label="Order Svc" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  simpleMicroservices: (
    <svg viewBox="0 0 380 180" className="w-full h-auto">
      <Box x={15} y={65} width={70} height={45} label="Client" color={COLORS.secondary} />
      <Arrow x1={95} y1={87} x2={125} y2={87} />
      <Box x={135} y={25} width={70} height={35} label="Svc A" color={COLORS.primary} fontSize={10} />
      <Box x={135} y={70} width={70} height={35} label="Svc B" color={COLORS.accent} fontSize={10} />
      <Box x={135} y={115} width={70} height={35} label="Svc C" color={COLORS.warning} fontSize={10} />
      <Arrow x1={215} y1={42} x2={255} y2={42} />
      <Arrow x1={215} y1={87} x2={255} y2={87} />
      <Arrow x1={215} y1={132} x2={255} y2={132} />
      <Box x={265} y={25} width={65} height={35} label="DB A" color={COLORS.gray} fontSize={10} />
      <Box x={265} y={70} width={65} height={35} label="DB B" color={COLORS.gray} fontSize={10} />
      <Box x={265} y={115} width={65} height={35} label="DB C" color={COLORS.gray} fontSize={10} />
    </svg>
  ),

  urlShortener: (
    <svg viewBox="0 0 360 160" className="w-full h-auto">
      <Box x={15} y={55} width={70} height={45} label="Client" color={COLORS.secondary} />
      <Arrow x1={95} y1={77} x2={130} y2={77} />
      <Box x={140} y={45} width={85} height={65} label="API Server" color={COLORS.primary} fontSize={11} />
      <Arrow x1={235} y1={60} x2={275} y2={40} />
      <Arrow x1={235} y1={95} x2={275} y2={115} />
      <Box x={285} y={20} width={75} height={40} label="Counter" color={COLORS.warning} fontSize={10} />
      <Box x={285} y={95} width={75} height={40} label="Database" color={COLORS.accent} fontSize={10} />
    </svg>
  ),

  fanoutOnWrite: (
    <svg viewBox="0 0 360" className="w-full h-auto">
      <Box x={15} y={55} width={70} height={45} label="User Post" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={95} y1={77} x2={130} y2={77} />
      <Box x={140} y={40} width={90} height={75} label="Fan-out Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={240} y1={55} x2={280} y2={30} />
      <Arrow x1={240} y1={77} x2={280} y2={77} />
      <Arrow x1={240} y1={100} x2={280} y2={125} />
      <Box x={290} y={10} width={70} height={35} label="Cache F1" color={COLORS.error} fontSize={10} />
      <Box x={290} y={60} width={70} height={35} label="Cache F2" color={COLORS.error} fontSize={10} />
      <Box x={290} y={110} width={70} height={35} label="Cache F3" color={COLORS.error} fontSize={10} />
    </svg>
  ),

  rideSharing: (
    <svg viewBox="0 0 460 160" className="w-full h-auto">
      <Box x={15} y={30} width={60} height={35} label="Rider" color={COLORS.secondary} fontSize={10} />
      <Box x={15} y={90} width={60} height={35} label="Driver" color={COLORS.warning} fontSize={10} />
      <Arrow x1={85} y1={47} x2={125} y2={67} />
      <Arrow x1={85} y1={107} x2={125} y2={87} />
      <Box x={135} y={45} width={95} height={65} label="Matching" color={COLORS.primary} fontSize={11} />
      <Arrow x1={240} y1={77} x2={285} y2={77} />
      <Box x={295} y={45} width={85} height={65} label="Location Svc" color={COLORS.accent} fontSize={10} />
      <Arrow x1={390} y1={77} x2={420} y2={77} />
      <Box x={430} y={55} width={60} height={45} label="Redis" color={COLORS.error} fontSize={10} />
    </svg>
  ),

  simpleChat: (
    <svg viewBox="0 0 420 160" className="w-full h-auto">
      <Box x={20} y={25} width={75} height={40} label="Client 1" color={COLORS.secondary} fontSize={10} />
      <Box x={20} y={90} width={75} height={40} label="Client 2" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={105} y1={45} x2={155} y2={70} />
      <Arrow x1={105} y1={110} x2={155} y2={85} />
      <Box x={165} y={45} width={110} height={65} label="WebSocket Srv" color={COLORS.primary} fontSize={10} />
      <Arrow x1={285} y1={77} x2={330} y2={77} />
      <Box x={340} y={55} width={80} height={45} label="Database" color={COLORS.warning} fontSize={10} />
    </svg>
  ),

  distributedChat: (
    <svg viewBox="0 0 460 180" className="w-full h-auto">
      <Box x={15} y={65} width={65} height={45} label="Clients" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={90} y1={87} x2={125} y2={87} />
      <Box x={135} y={25} width={65} height={35} label="WS 1" color={COLORS.primary} fontSize={10} />
      <Box x={135} y={70} width={65} height={35} label="WS 2" color={COLORS.primary} fontSize={10} />
      <Box x={135} y={115} width={65} height={35} label="WS 3" color={COLORS.primary} fontSize={10} />
      <Arrow x1={210} y1={42} x2={250} y2={72} />
      <Arrow x1={210} y1={87} x2={250} y2={87} />
      <Arrow x1={210} y1={132} x2={250} y2={102} />
      <Box x={260} y={60} width={90} height={55} label="Redis Pub/Sub" color={COLORS.error} fontSize={10} />
      <Arrow x1={360} y1={87} x2={395} y2={87} />
      <Box x={405} y={60} width={70} height={55} label="Cassandra" color={COLORS.accent} fontSize={10} />
    </svg>
  ),

  videoStreaming: (
    <svg viewBox="0 0 540 140" className="w-full h-auto">
      <Box x={10} y={45} width={65} height={45} label="Upload" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={85} y1={67} x2={115} y2={67} />
      <Box x={125} y={35} width={80} height={65} label="Transcode" color={COLORS.warning} fontSize={10} />
      <Arrow x1={215} y1={67} x2={245} y2={67} />
      <Box x={255} y={45} width={55} height={45} label="S3" color={COLORS.accent} fontSize={10} />
      <Arrow x1={320} y1={67} x2={350} y2={67} />
      <Box x={360} y={45} width={55} height={45} label="CDN" color={COLORS.primary} fontSize={10} />
      <Arrow x1={425} y1={67} x2={455} y2={67} />
      <Box x={465} y={45} width={65} height={45} label="Client" color={COLORS.secondary} fontSize={10} />
    </svg>
  ),

  notificationSystem: (
    <svg viewBox="0 0 360 180" className="w-full h-auto">
      <Box x={15} y={65} width={70} height={45} label="Trigger" color={COLORS.secondary} />
      <Arrow x1={95} y1={87} x2={130} y2={87} />
      <Box x={140} y={45} width={95} height={85} label="Notification Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={245} y1={60} x2={285} y2={30} />
      <Arrow x1={245} y1={87} x2={285} y2={87} />
      <Arrow x1={245} y1={115} x2={285} y2={145} />
      <Box x={295} y={10} width={60} height={35} label="Push" color={COLORS.accent} fontSize={10} />
      <Box x={295} y={70} width={60} height={35} label="Email" color={COLORS.warning} fontSize={10} />
      <Box x={295} y={130} width={60} height={35} label="SMS" color={COLORS.error} fontSize={10} />
    </svg>
  ),

  rateLimiter: (
    <svg viewBox="0 0 360 160" className="w-full h-auto">
      <Box x={15} y={55} width={70} height={45} label="Request" color={COLORS.secondary} />
      <Arrow x1={95} y1={77} x2={130} y2={77} />
      <Box x={140} y={45} width={90} height={65} label="Rate Limiter" color={COLORS.error} fontSize={10} />
      <Arrow x1={240} y1={60} x2={280} y2={40} />
      <Arrow x1={240} y1={95} x2={280} y2={115} />
      <Box x={290} y={20} width={70} height={40} label="Redis" color={COLORS.warning} fontSize={10} />
      <Box x={290} y={95} width={70} height={40} label="API Svc" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  searchEngine: (
    <svg viewBox="0 0 380 160" className="w-full h-auto">
      <Box x={15} y={55} width={65} height={45} label="Query" color={COLORS.secondary} />
      <Arrow x1={90} y1={77} x2={125} y2={77} />
      <Box x={135} y={45} width={95} height={65} label="Search Svc" color={COLORS.primary} fontSize={11} />
      <Arrow x1={240} y1={60} x2={280} y2={35} />
      <Arrow x1={240} y1={95} x2={280} y2={120} />
      <Box x={290} y={15} width={100} height={40} label="Elasticsearch" color={COLORS.warning} fontSize={10} />
      <Box x={290} y={100} width={100} height={40} label="Index Shards" color={COLORS.accent} fontSize={10} />
    </svg>
  ),

  ecommerce: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <Box x={15} y={65} width={60} height={45} label="Client" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={85} y1={87} x2={110} y2={87} />
      <Box x={120} y={65} width={55} height={45} label="CDN" color={COLORS.cyan} fontSize={10} />
      <Arrow x1={185} y1={87} x2={210} y2={87} />
      <Box x={220} y={65} width={55} height={45} label="LB" color={COLORS.warning} fontSize={10} />
      <Arrow x1={285} y1={72} x2={315} y2={45} />
      <Arrow x1={285} y1={87} x2={315} y2={87} />
      <Arrow x1={285} y1={102} x2={315} y2={130} />
      <Box x={325} y={25} width={75} height={35} label="Product" color={COLORS.primary} fontSize={10} />
      <Box x={325} y={70} width={75} height={35} label="Order" color={COLORS.primary} fontSize={10} />
      <Box x={325} y={115} width={75} height={35} label="Payment" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  keyValueStore: (
    <svg viewBox="0 0 360 180" className="w-full h-auto">
      <Box x={15} y={65} width={65} height={45} label="Client" color={COLORS.secondary} />
      <Arrow x1={90} y1={87} x2={125} y2={87} />
      <Box x={135} y={50} width={90} height={75} label="Coordinator" color={COLORS.warning} fontSize={10} />
      <Arrow x1={235} y1={65} x2={275} y2={35} />
      <Arrow x1={235} y1={87} x2={275} y2={87} />
      <Arrow x1={235} y1={110} x2={275} y2={140} />
      <Box x={285} y={15} width={70} height={35} label="Node 1" color={COLORS.primary} fontSize={10} />
      <Box x={285} y={70} width={70} height={35} label="Node 2" color={COLORS.primary} fontSize={10} />
      <Box x={285} y={125} width={70} height={35} label="Node 3" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  // Concurrency patterns
  producerConsumer: (
    <svg viewBox="0 0 420 160" className="w-full h-auto">
      <Box x={15} y={25} width={80} height={35} label="Producer 1" color={COLORS.secondary} fontSize={10} />
      <Box x={15} y={70} width={80} height={35} label="Producer 2" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={105} y1={42} x2={145} y2={65} />
      <Arrow x1={105} y1={87} x2={145} y2={87} />
      <Box x={155} y={50} width={110} height={60} label="Buffer Queue" color={COLORS.accent} fontSize={11} />
      <Arrow x1={275} y1={65} x2={315} y2={42} />
      <Arrow x1={275} y1={95} x2={315} y2={112} />
      <Box x={325} y={25} width={85} height={35} label="Consumer 1" color={COLORS.primary} fontSize={10} />
      <Box x={325} y={95} width={85} height={35} label="Consumer 2" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  concurrencyFundamentals: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={25} textAnchor="middle" fill={COLORS.primary} fontSize="14" fontWeight="600">Process vs Thread</text>
      <rect x={30} y={45} width={160} height={110} fill={`${COLORS.secondary}15`} stroke={COLORS.secondary} strokeWidth="2" rx="4" />
      <text x={110} y={65} textAnchor="middle" fill={COLORS.secondary} fontSize="12" fontWeight="600">PROCESS</text>
      <Box x={45} y={80} width={130} height={30} label="Own Memory Space" color={COLORS.gray} fontSize={10} />
      <text x={50} y={130} fill={COLORS.textLight} fontSize="10">• Isolated</text>
      <text x={50} y={145} fill={COLORS.textLight} fontSize="10">• Higher overhead</text>
      <rect x={220} y={45} width={170} height={110} fill={`${COLORS.primary}15`} stroke={COLORS.primary} strokeWidth="2" rx="4" />
      <text x={305} y={65} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">THREADS</text>
      <Box x={235} y={80} width={140} height={25} label="Shared Memory" color={COLORS.gray} fontSize={10} />
      <Box x={240} y={115} width={40} height={28} label="T1" color={COLORS.primary} fontSize={10} />
      <Box x={290} y={115} width={40} height={28} label="T2" color={COLORS.primary} fontSize={10} />
      <Box x={340} y={115} width={40} height={28} label="T3" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  // LLD patterns
  lruCache: (
    <svg viewBox="0 0 420 210" className="w-full h-auto">
      <text x={210} y={25} textAnchor="middle" fill={COLORS.primary} fontSize="14" fontWeight="600">LRU Cache</text>
      <rect x={30} y={45} width={360} height={55} fill={`${COLORS.secondary}15`} stroke={COLORS.secondary} strokeWidth="2" rx="4" />
      <text x={210} y={65} textAnchor="middle" fill={COLORS.secondary} fontSize="11" fontWeight="500">HashMap&lt;Key, Node*&gt;</text>
      <Box x={50} y={75} width={90} height={20} label="key1 → Node*" color={COLORS.gray} fontSize={9} />
      <Box x={160} y={75} width={90} height={20} label="key2 → Node*" color={COLORS.gray} fontSize={9} />
      <Box x={270} y={75} width={90} height={20} label="key3 → Node*" color={COLORS.gray} fontSize={9} />
      <Arrow x1={95} y1={105} x2={95} y2={130} />
      <Arrow x1={205} y1={105} x2={205} y2={130} />
      <Arrow x1={315} y1={105} x2={315} y2={130} />
      <rect x={30} y={135} width={360} height={60} fill={`${COLORS.primary}15`} stroke={COLORS.primary} strokeWidth="2" rx="4" />
      <text x={210} y={152} textAnchor="middle" fill={COLORS.primary} fontSize="11" fontWeight="500">Doubly Linked List</text>
      <Box x={45} y={165} width={55} height={25} label="HEAD" color={COLORS.gray} fontSize={9} />
      <Arrow x1={110} y1={177} x2={130} y2={177} />
      <Box x={140} y={165} width={50} height={25} label="MRU" color={COLORS.primary} fontSize={9} />
      <Arrow x1={200} y1={177} x2={220} y2={177} />
      <Box x={230} y={165} width={50} height={25} label="LRU" color={COLORS.error} fontSize={9} />
      <Arrow x1={290} y1={177} x2={310} y2={177} />
      <Box x={320} y={165} width={55} height={25} label="TAIL" color={COLORS.gray} fontSize={9} />
    </svg>
  ),

  parkingLot: (
    <svg viewBox="0 0 440 180" className="w-full h-auto">
      <text x={220} y={25} textAnchor="middle" fill={COLORS.primary} fontSize="14" fontWeight="600">Parking Lot System</text>
      <Box x={30} y={55} width={95} height={50} label="Entry/Exit" color={COLORS.secondary} />
      <Arrow x1={135} y1={80} x2={175} y2={80} />
      <Box x={185} y={45} width={110} height={70} label="Controller" color={COLORS.primary} />
      <Arrow x1={305} y1={60} x2={340} y2={45} />
      <Arrow x1={305} y1={80} x2={340} y2={80} />
      <Arrow x1={305} y1={100} x2={340} y2={115} />
      <Box x={350} y={25} width={80} height={35} label="Floor 1" color={COLORS.warning} fontSize={10} />
      <Box x={350} y={65} width={80} height={35} label="Floor 2" color={COLORS.accent} fontSize={10} />
      <Box x={350} y={105} width={80} height={35} label="Floor 3" color={COLORS.error} fontSize={10} />
      <Box x={185} y={130} width={110} height={40} label="Ticket System" color={COLORS.cyan} fontSize={10} />
    </svg>
  ),

  elevatorSystem: (
    <svg viewBox="0 0 440 200" className="w-full h-auto">
      <text x={220} y={25} textAnchor="middle" fill={COLORS.primary} fontSize="14" fontWeight="600">Elevator System</text>
      <rect x={30} y={45} width={80} height={130} fill={`${COLORS.gray}15`} stroke={COLORS.gray} strokeWidth="2" rx="4" />
      <text x={70} y={62} textAnchor="middle" fill={COLORS.text} fontSize="10">Building</text>
      <Box x={40} y={72} width={60} height={22} label="F5" color={COLORS.secondary} fontSize={9} />
      <Box x={40} y={99} width={60} height={22} label="F4" color={COLORS.gray} fontSize={9} />
      <Box x={40} y={126} width={60} height={22} label="F3" color={COLORS.gray} fontSize={9} />
      <Box x={40} y={153} width={60} height={22} label="F2" color={COLORS.gray} fontSize={9} />
      <Arrow x1={120} y1={110} x2={160} y2={110} />
      <Box x={170} y={65} width={115} height={95} label="Controller" color={COLORS.primary} />
      <text x={227} y={130} textAnchor="middle" fill={COLORS.textLight} fontSize="9">SCAN / LOOK</text>
      <Arrow x1={295} y1={90} x2={330} y2={70} />
      <Arrow x1={295} y1={112} x2={330} y2={112} />
      <Arrow x1={295} y1={134} x2={330} y2={155} />
      <Box x={340} y={50} width={80} height={35} label="Elevator 1" color={COLORS.secondary} fontSize={10} />
      <Box x={340} y={95} width={80} height={35} label="Elevator 2" color={COLORS.warning} fontSize={10} />
      <Box x={340} y={140} width={80} height={35} label="Elevator 3" color={COLORS.accent} fontSize={10} />
    </svg>
  ),

  threadPool: (
    <svg viewBox="0 0 360 180" className="w-full h-auto">
      <Box x={15} y={65} width={70} height={45} label="Tasks" color={COLORS.secondary} />
      <Arrow x1={95} y1={87} x2={130} y2={87} />
      <Box x={140} y={50} width={90} height={75} label="Task Queue" color={COLORS.accent} />
      <Arrow x1={240} y1={65} x2={275} y2={40} />
      <Arrow x1={240} y1={87} x2={275} y2={87} />
      <Arrow x1={240} y1={110} x2={275} y2={135} />
      <Box x={285} y={20} width={70} height={35} label="Worker 1" color={COLORS.primary} fontSize={10} />
      <Box x={285} y={70} width={70} height={35} label="Worker 2" color={COLORS.primary} fontSize={10} />
      <Box x={285} y={120} width={70} height={35} label="Worker 3" color={COLORS.primary} fontSize={10} />
    </svg>
  )
};

export default function DiagramSVG({ template, className = '' }) {
  const diagram = diagrams[template];

  if (!diagram) {
    return (
      <div className={`p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 ${className}`}>
        <p className="text-yellow-400 text-sm">Diagram template "{template}" not found</p>
      </div>
    );
  }

  return (
    <div
      className={`diagram-svg p-4 rounded-lg ${className}`}
      style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      {diagram}
    </div>
  );
}
