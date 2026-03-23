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
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">YouTube/Video Streaming</text>
      {/* Upload Pipeline */}
      <rect x={10} y={30} width={500} height={70} fill={`${COLORS.warning}10`} stroke={COLORS.warning} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.warning} fontSize="10" fontWeight="500">UPLOAD & TRANSCODE</text>
      <Box x={20} y={55} width={65} height={35} label="Chunked" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={95} y1={72} x2={115} y2={72} />
      <Box x={125} y={55} width={55} height={35} label="S3 Raw" color={COLORS.gray} fontSize={9} />
      <Arrow x1={190} y1={72} x2={210} y2={72} />
      <Box x={220} y={50} width={90} height={45} label="GPU Workers" color={COLORS.warning} fontSize={9} />
      <text x={265} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">360p→4K parallel</text>
      <Arrow x1={320} y1={72} x2={340} y2={72} />
      <Box x={350} y={55} width={70} height={35} label="HLS/DASH" color={COLORS.accent} fontSize={9} />
      <Arrow x1={430} y1={72} x2={450} y2={72} />
      <Box x={460} y={55} width={45} height={35} label="CDN" color={COLORS.cyan} fontSize={9} />
      {/* Streaming */}
      <rect x={10} y={110} width={500} height={80} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={125} fill={COLORS.primary} fontSize="10" fontWeight="500">ADAPTIVE BITRATE STREAMING</text>
      <Box x={20} y={135} width={60} height={40} label="Client" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={90} y1={155} x2={115} y2={155} />
      <Box x={125} y={135} width={80} height={40} label="Edge CDN" color={COLORS.cyan} fontSize={9} />
      <Arrow x1={215} y1={155} x2={240} y2={155} />
      <Box x={250} y={135} width={90} height={40} label="Manifest Svc" color={COLORS.primary} fontSize={9} />
      <Arrow x1={350} y1={145} x2={375} y2={135} />
      <Arrow x1={350} y1={165} x2={375} y2={175} />
      <Box x={385} y={120} width={55} height={30} label="Rec ML" color={COLORS.error} fontSize={9} />
      <Box x={385} y={160} width={55} height={25} label="Analytics" color={COLORS.gray} fontSize={9} />
      <Box x={455} y={135} width={50} height={40} label="Kafka" color={COLORS.accent} fontSize={9} />
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
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Search Engine (Google-scale)</text>
      {/* Query Path */}
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.primary} fontSize="10" fontWeight="500">QUERY PATH</text>
      <Box x={20} y={55} width={50} height={35} label="Query" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={80} y1={72} x2={100} y2={72} />
      <Box x={110} y={55} width={60} height={35} label="Parse" color={COLORS.gray} fontSize={9} />
      <Arrow x1={180} y1={72} x2={200} y2={72} />
      <Box x={210} y={55} width={55} height={35} label="Spell" color={COLORS.warning} fontSize={9} />
      <Arrow x1={275} y1={72} x2={295} y2={72} />
      <Box x={305} y={55} width={60} height={35} label="Expand" color={COLORS.accent} fontSize={9} />
      <Arrow x1={375} y1={72} x2={395} y2={72} />
      <Box x={405} y={50} width={95} height={45} label="Index Shards" color={COLORS.primary} fontSize={9} />
      <text x={452} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">1000s servers</text>
      {/* Index & Ranking */}
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.warning}10`} stroke={COLORS.warning} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.warning} fontSize="10" fontWeight="500">RANKING PIPELINE</text>
      <Box x={20} y={140} width={80} height={35} label="BM25 + PR" color={COLORS.gray} fontSize={9} />
      <text x={60} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">10K docs</text>
      <Arrow x1={110} y1={157} x2={135} y2={157} />
      <Box x={145} y={140} width={80} height={35} label="ML Ranker" color={COLORS.error} fontSize={9} />
      <text x={185} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">1K docs</text>
      <Arrow x1={235} y1={157} x2={260} y2={157} />
      <Box x={270} y={140} width={90} height={35} label="Personalize" color={COLORS.accent} fontSize={9} />
      <text x={315} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">100 results</text>
      <Arrow x1={370} y1={157} x2={395} y2={157} />
      <Box x={405} y={140} width={95} height={35} label="Results + Ads" color={COLORS.secondary} fontSize={9} />
    </svg>
  ),

  ecommerce: (
    <svg viewBox="0 0 520 220" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Amazon E-commerce Architecture</text>
      {/* Frontend */}
      <rect x={10} y={30} width={500} height={55} fill={`${COLORS.cyan}10`} stroke={COLORS.cyan} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.cyan} fontSize="10" fontWeight="500">FRONTEND</text>
      <Box x={20} y={55} width={55} height={25} label="Client" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={85} y1={67} x2={105} y2={67} />
      <Box x={115} y={55} width={50} height={25} label="CDN" color={COLORS.cyan} fontSize={9} />
      <Arrow x1={175} y1={67} x2={195} y2={67} />
      <Box x={205} y={55} width={55} height={25} label="Gateway" color={COLORS.warning} fontSize={9} />
      <Arrow x1={270} y1={67} x2={290} y2={67} />
      <Box x={300} y={55} width={55} height={25} label="Search" color={COLORS.primary} fontSize={9} />
      <Box x={365} y={55} width={55} height={25} label="Cart Svc" color={COLORS.error} fontSize={9} />
      <Box x={430} y={55} width={70} height={25} label="User Svc" color={COLORS.primary} fontSize={9} />
      {/* Services */}
      <rect x={10} y={95} width={500} height={60} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={110} fill={COLORS.primary} fontSize="10" fontWeight="500">MICROSERVICES</text>
      <Box x={20} y={118} width={70} height={28} label="Product Svc" color={COLORS.primary} fontSize={8} />
      <Box x={100} y={118} width={70} height={28} label="Inventory" color={COLORS.warning} fontSize={8} />
      <Box x={180} y={118} width={65} height={28} label="Order Svc" color={COLORS.accent} fontSize={8} />
      <Box x={255} y={118} width={70} height={28} label="Payment" color={COLORS.error} fontSize={8} />
      <Box x={335} y={118} width={80} height={28} label="Shipping" color={COLORS.cyan} fontSize={8} />
      <Box x={425} y={118} width={75} height={28} label="Recommend" color={COLORS.secondary} fontSize={8} />
      {/* Data */}
      <rect x={10} y={165} width={500} height={50} fill={`${COLORS.gray}10`} stroke={COLORS.gray} strokeWidth="1" rx="4" />
      <text x={20} y={180} fill={COLORS.gray} fontSize="10" fontWeight="500">DATA LAYER</text>
      <Box x={20} y={190} width={70} height={20} label="DynamoDB" color={COLORS.gray} fontSize={8} />
      <Box x={100} y={190} width={70} height={20} label="Elasticsearch" color={COLORS.warning} fontSize={8} />
      <Box x={180} y={190} width={55} height={20} label="Redis" color={COLORS.error} fontSize={8} />
      <Box x={245} y={190} width={55} height={20} label="S3" color={COLORS.gray} fontSize={8} />
      <Box x={310} y={190} width={65} height={20} label="Kafka" color={COLORS.accent} fontSize={8} />
      <Box x={385} y={190} width={115} height={20} label="Checkout Saga (SQS)" color={COLORS.primary} fontSize={8} />
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
  ),

  // Additional System Design Templates
  restApi: (
    <svg viewBox="0 0 420 160" className="w-full h-auto">
      <Box x={20} y={55} width={70} height={45} label="Client" color={COLORS.secondary} />
      <Arrow x1={100} y1={77} x2={140} y2={77} />
      <Box x={150} y={40} width={100} height={75} label="REST API" color={COLORS.primary} />
      <text x={200} y={90} textAnchor="middle" fill={COLORS.textLight} fontSize="9">CRUD</text>
      <Arrow x1={260} y1={55} x2={300} y2={35} />
      <Arrow x1={260} y1={77} x2={300} y2={77} />
      <Arrow x1={260} y1={100} x2={300} y2={120} />
      <Box x={310} y={15} width={80} height={35} label="GET" color={COLORS.primary} fontSize={10} />
      <Box x={310} y={60} width={80} height={35} label="POST/PUT" color={COLORS.warning} fontSize={10} />
      <Box x={310} y={105} width={80} height={35} label="DELETE" color={COLORS.error} fontSize={10} />
    </svg>
  ),

  globalLoadBalancer: (
    <svg viewBox="0 0 440 180" className="w-full h-auto">
      <Box x={20} y={65} width={70} height={45} label="Users" color={COLORS.secondary} />
      <Arrow x1={100} y1={87} x2={140} y2={87} />
      <Box x={150} y={55} width={80} height={65} label="GeoDNS" color={COLORS.warning} fontSize={10} />
      <Arrow x1={240} y1={70} x2={280} y2={35} />
      <Arrow x1={240} y1={87} x2={280} y2={87} />
      <Arrow x1={240} y1={105} x2={280} y2={140} />
      <Box x={290} y={15} width={90} height={35} label="US-West LB" color={COLORS.primary} fontSize={9} />
      <Box x={290} y={70} width={90} height={35} label="US-East LB" color={COLORS.primary} fontSize={9} />
      <Box x={290} y={125} width={90} height={35} label="EU-West LB" color={COLORS.primary} fontSize={9} />
      <Box x={395} y={15} width={40} height={35} label="S1" color={COLORS.gray} fontSize={9} />
      <Box x={395} y={70} width={40} height={35} label="S2" color={COLORS.gray} fontSize={9} />
      <Box x={395} y={125} width={40} height={35} label="S3" color={COLORS.gray} fontSize={9} />
    </svg>
  ),

  rateLimiterAdvanced: (
    <svg viewBox="0 0 460 160" className="w-full h-auto">
      <Box x={15} y={55} width={60} height={45} label="Client" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={85} y1={77} x2={115} y2={77} />
      <Box x={125} y={45} width={70} height={65} label="CDN Edge" color={COLORS.cyan} fontSize={10} />
      <Arrow x1={205} y1={77} x2={235} y2={77} />
      <Box x={245} y={45} width={85} height={65} label="API Gateway" color={COLORS.warning} fontSize={10} />
      <Arrow x1={340} y1={60} x2={375} y2={40} />
      <Arrow x1={340} y1={95} x2={375} y2={115} />
      <Box x={385} y={20} width={70} height={40} label="Redis" color={COLORS.error} fontSize={10} />
      <Box x={385} y={95} width={70} height={40} label="Services" color={COLORS.primary} fontSize={10} />
    </svg>
  ),

  serviceMesh: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Service Mesh (Istio)</text>
      <Box x={20} y={45} width={80} height={50} label="Gateway" color={COLORS.warning} fontSize={10} />
      <Arrow x1={110} y1={70} x2={140} y2={70} />
      <rect x={150} y={35} width={250} height={130} fill={`${COLORS.accent}10`} stroke={COLORS.accent} strokeWidth="1" strokeDasharray="4" rx="4" />
      <text x={275} y={52} textAnchor="middle" fill={COLORS.accent} fontSize="10">Mesh Control Plane</text>
      <Box x={170} y={65} width={70} height={40} label="Svc A" color={COLORS.primary} fontSize={10} />
      <Box x={170} y={115} width={70} height={40} label="Proxy" color={COLORS.gray} fontSize={9} />
      <Box x={310} y={65} width={70} height={40} label="Svc B" color={COLORS.primary} fontSize={10} />
      <Box x={310} y={115} width={70} height={40} label="Proxy" color={COLORS.gray} fontSize={9} />
      <Arrow x1={250} y1={85} x2={300} y2={85} />
    </svg>
  ),

  sessionAuth: (
    <svg viewBox="0 0 420 160" className="w-full h-auto">
      <Box x={20} y={55} width={70} height={45} label="Client" color={COLORS.secondary} />
      <Arrow x1={100} y1={77} x2={140} y2={77} />
      <Box x={150} y={45} width={90} height={65} label="Auth Service" color={COLORS.primary} fontSize={10} />
      <Arrow x1={250} y1={60} x2={290} y2={40} />
      <Arrow x1={250} y1={95} x2={290} y2={115} />
      <Box x={300} y={20} width={90} height={40} label="Session Store" color={COLORS.error} fontSize={10} />
      <Box x={300} y={95} width={90} height={40} label="User DB" color={COLORS.accent} fontSize={10} />
      <Label x={130} y={45} text="login" fontSize={9} />
      <Label x={260} y={35} text="store session" fontSize={8} />
    </svg>
  ),

  jwtAuth: (
    <svg viewBox="0 0 440 160" className="w-full h-auto">
      <Box x={15} y={55} width={65} height={45} label="Client" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={90} y1={77} x2={125} y2={77} />
      <Box x={135} y={45} width={80} height={65} label="Auth Svc" color={COLORS.warning} fontSize={10} />
      <Arrow x1={225} y1={77} x2={265} y2={77} />
      <Box x={275} y={45} width={75} height={65} label="API Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={360} y1={77} x2={395} y2={77} />
      <Box x={405} y={55} width={40} height={45} label="DB" color={COLORS.accent} fontSize={10} />
      <Label x={150} y={40} text="JWT Token" fontSize={8} />
      <Label x={285} y={40} text="Verify JWT" fontSize={8} />
    </svg>
  ),

  observability: (
    <svg viewBox="0 0 460 180" className="w-full h-auto">
      <Box x={20} y={25} width={70} height={35} label="Service 1" color={COLORS.primary} fontSize={10} />
      <Box x={20} y={70} width={70} height={35} label="Service 2" color={COLORS.primary} fontSize={10} />
      <Box x={20} y={115} width={70} height={35} label="Service 3" color={COLORS.primary} fontSize={10} />
      <Arrow x1={100} y1={42} x2={140} y2={65} />
      <Arrow x1={100} y1={87} x2={140} y2={87} />
      <Arrow x1={100} y1={132} x2={140} y2={110} />
      <Box x={150} y={60} width={90} height={60} label="Collector" color={COLORS.warning} fontSize={10} />
      <Arrow x1={250} y1={75} x2={290} y2={45} />
      <Arrow x1={250} y1={90} x2={290} y2={90} />
      <Arrow x1={250} y1={105} x2={290} y2={135} />
      <Box x={300} y={25} width={80} height={35} label="Prometheus" color={COLORS.error} fontSize={9} />
      <Box x={300} y={75} width={80} height={35} label="Jaeger" color={COLORS.accent} fontSize={9} />
      <Box x={300} y={120} width={80} height={35} label="ELK Stack" color={COLORS.cyan} fontSize={9} />
      <Box x={400} y={60} width={55} height={60} label="Grafana" color={COLORS.primary} fontSize={9} />
    </svg>
  ),

  urlShortenerAdvanced: (
    <svg viewBox="0 0 420 160" className="w-full h-auto">
      <Box x={15} y={55} width={65} height={45} label="Client" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={90} y1={77} x2={125} y2={77} />
      <Box x={135} y={45} width={75} height={65} label="Web Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={220} y1={60} x2={260} y2={35} />
      <Arrow x1={220} y1={95} x2={260} y2={120} />
      <Box x={270} y={15} width={90} height={40} label="ZooKeeper" color={COLORS.warning} fontSize={9} />
      <text x={315} y={45} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Range Alloc</text>
      <Box x={270} y={100} width={55} height={40} label="Cache" color={COLORS.error} fontSize={10} />
      <Box x={340} y={100} width={55} height={40} label="DB" color={COLORS.accent} fontSize={10} />
    </svg>
  ),

  hybridFanout: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <Box x={15} y={65} width={65} height={45} label="Tweet" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={90} y1={87} x2={125} y2={87} />
      <Diamond x={135} y={62} size={50} label="Check" color={COLORS.warning} />
      <Arrow x1={195} y1={72} x2={235} y2={45} />
      <Arrow x1={195} y1={102} x2={235} y2={130} />
      <Box x={245} y={25} width={85} height={40} label="Fan-out Write" color={COLORS.primary} fontSize={9} />
      <text x={287} y={55} textAnchor="middle" fill={COLORS.textLight} fontSize="8">&lt;10K followers</text>
      <Box x={245} y={110} width={85} height={40} label="Celebrity Cache" color={COLORS.error} fontSize={9} />
      <text x={287} y={140} textAnchor="middle" fill={COLORS.textLight} fontSize="8">&gt;10K followers</text>
      <Box x={350} y={65} width={60} height={45} label="Timeline" color={COLORS.accent} fontSize={10} />
      <Arrow x1={340} y1={45} x2={350} y2={75} />
      <Arrow x1={340} y1={130} x2={350} y2={100} />
    </svg>
  ),

  cellBasedArch: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <Box x={15} y={30} width={60} height={35} label="Rider" color={COLORS.secondary} fontSize={10} />
      <Box x={15} y={110} width={60} height={35} label="Driver" color={COLORS.warning} fontSize={10} />
      <Arrow x1={85} y1={47} x2={115} y2={70} />
      <Arrow x1={85} y1={127} x2={115} y2={105} />
      <Box x={125} y={55} width={70} height={70} label="Gateway" color={COLORS.primary} fontSize={10} />
      <Arrow x1={205} y1={75} x2={235} y2={45} />
      <Arrow x1={205} y1={90} x2={235} y2={90} />
      <Arrow x1={205} y1={105} x2={235} y2={135} />
      <Box x={245} y={25} width={65} height={35} label="Cell A" color={COLORS.accent} fontSize={10} />
      <Box x={245} y={75} width={65} height={35} label="Cell B" color={COLORS.accent} fontSize={10} />
      <Box x={245} y={120} width={65} height={35} label="Cell C" color={COLORS.accent} fontSize={10} />
      <Box x={330} y={55} width={70} height={70} label="Redis Geo" color={COLORS.error} fontSize={10} />
    </svg>
  ),

  instagram: (
    <svg viewBox="0 0 520 220" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Instagram Architecture</text>
      {/* Upload Pipeline */}
      <rect x={10} y={30} width={500} height={70} fill={`${COLORS.secondary}10`} stroke={COLORS.secondary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.secondary} fontSize="10" fontWeight="500">UPLOAD PIPELINE</text>
      <Box x={20} y={55} width={55} height={35} label="Upload" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={85} y1={72} x2={110} y2={72} />
      <Box x={120} y={55} width={55} height={35} label="S3 Raw" color={COLORS.gray} fontSize={9} />
      <Arrow x1={185} y1={72} x2={210} y2={72} />
      <Box x={220} y={55} width={70} height={35} label="Processor" color={COLORS.warning} fontSize={9} />
      <Arrow x1={300} y1={72} x2={325} y2={72} />
      <Box x={335} y={50} width={45} height={22} label="150px" color={COLORS.gray} fontSize={8} />
      <Box x={385} y={50} width={45} height={22} label="640px" color={COLORS.gray} fontSize={8} />
      <Box x={435} y={50} width={55} height={22} label="1080px" color={COLORS.gray} fontSize={8} />
      <Arrow x1={400} y1={80} x2={400} y2={100} />
      {/* Feed & Stories */}
      <rect x={10} y={110} width={245} height={100} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={125} fill={COLORS.primary} fontSize="10" fontWeight="500">FEED (Hybrid Push/Pull)</text>
      <Box x={20} y={135} width={65} height={30} label="Fan-out" color={COLORS.primary} fontSize={9} />
      <Arrow x1={95} y1={150} x2={120} y2={140} />
      <Arrow x1={95} y1={150} x2={120} y2={160} />
      <Box x={130} y={130} width={50} height={22} label="Push" color={COLORS.accent} fontSize={8} />
      <Box x={130} y={158} width={50} height={22} label="Pull" color={COLORS.warning} fontSize={8} />
      <Box x={190} y={140} width={55} height={30} label="ML Rank" color={COLORS.error} fontSize={9} />
      {/* Stories */}
      <rect x={265} y={110} width={245} height={100} fill={`${COLORS.error}10`} stroke={COLORS.error} strokeWidth="1" rx="4" />
      <text x={275} y={125} fill={COLORS.error} fontSize="10" fontWeight="500">STORIES (24h TTL)</text>
      <Box x={275} y={135} width={70} height={30} label="Redis SS" color={COLORS.error} fontSize={9} />
      <Arrow x1={355} y1={150} x2={385} y2={150} />
      <Box x={395} y={135} width={55} height={30} label="CDN" color={COLORS.cyan} fontSize={9} />
      <text x={275} y={185} fill={COLORS.textLight} fontSize="8">ZREMRANGEBYSCORE cleanup</text>
    </svg>
  ),

  netflix: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Netflix Architecture</text>
      {/* Content Ingestion */}
      <rect x={10} y={30} width={240} height={75} fill={`${COLORS.warning}10`} stroke={COLORS.warning} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.warning} fontSize="10" fontWeight="500">CONTENT INGESTION</text>
      <Box x={20} y={55} width={50} height={35} label="Studio" color={COLORS.warning} fontSize={9} />
      <Arrow x1={80} y1={72} x2={100} y2={72} />
      <Box x={110} y={55} width={60} height={35} label="Encode" color={COLORS.accent} fontSize={9} />
      <Arrow x1={180} y1={72} x2={200} y2={72} />
      <Box x={210} y={55} width={35} height={35} label="S3" color={COLORS.gray} fontSize={9} />
      {/* Streaming */}
      <rect x={260} y={30} width={250} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={270} y={45} fill={COLORS.primary} fontSize="10" fontWeight="500">ADAPTIVE STREAMING</text>
      <Box x={270} y={55} width={55} height={35} label="Client" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={335} y1={72} x2={355} y2={72} />
      <Box x={365} y={55} width={65} height={35} label="CDN/OCA" color={COLORS.cyan} fontSize={9} />
      <Arrow x1={440} y1={72} x2={460} y2={72} />
      <Box x={470} y={55} width={35} height={35} label="HLS" color={COLORS.gray} fontSize={9} />
      {/* Backend Services */}
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.secondary}10`} stroke={COLORS.secondary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.secondary} fontSize="10" fontWeight="500">MICROSERVICES (Zuul Gateway)</text>
      <Box x={20} y={140} width={65} height={35} label="Gateway" color={COLORS.warning} fontSize={9} />
      <Arrow x1={95} y1={157} x2={115} y2={157} />
      <Box x={125} y={140} width={65} height={35} label="User Svc" color={COLORS.primary} fontSize={9} />
      <Box x={200} y={140} width={75} height={35} label="Content Svc" color={COLORS.primary} fontSize={9} />
      <Box x={285} y={140} width={55} height={35} label="Rec ML" color={COLORS.error} fontSize={9} />
      <Box x={350} y={140} width={70} height={35} label="Playback" color={COLORS.accent} fontSize={9} />
      <Box x={430} y={140} width={70} height={35} label="Cassandra" color={COLORS.gray} fontSize={9} />
    </svg>
  ),

  whatsapp: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">WhatsApp Architecture (Erlang/BEAM)</text>
      {/* Connection Layer */}
      <rect x={10} y={30} width={500} height={70} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.primary} fontSize="10" fontWeight="500">CONNECTION LAYER (2M conn/server)</text>
      <Box x={20} y={55} width={55} height={35} label="User A" color={COLORS.secondary} fontSize={9} />
      <Box x={85} y={55} width={55} height={35} label="User B" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={150} y1={72} x2={180} y2={72} />
      <Box x={190} y={50} width={90} height={45} label="Ejabberd WS" color={COLORS.primary} fontSize={9} />
      <Arrow x1={290} y1={72} x2={320} y2={72} />
      <Box x={330} y={55} width={80} height={35} label="Routing Svc" color={COLORS.warning} fontSize={9} />
      <Arrow x1={420} y1={72} x2={450} y2={72} />
      <Box x={460} y={55} width={45} height={35} label="E2EE" color={COLORS.error} fontSize={9} />
      {/* Storage Layer */}
      <rect x={10} y={110} width={500} height={80} fill={`${COLORS.accent}10`} stroke={COLORS.accent} strokeWidth="1" rx="4" />
      <text x={20} y={125} fill={COLORS.accent} fontSize="10" fontWeight="500">STORAGE (Mnesia + SQLite sync)</text>
      <Box x={20} y={135} width={70} height={40} label="Mnesia DB" color={COLORS.warning} fontSize={9} />
      <text x={25} y={170} fill={COLORS.textLight} fontSize="7">User presence</text>
      <Box x={110} y={135} width={80} height={40} label="Msg Queue" color={COLORS.accent} fontSize={9} />
      <text x={115} y={170} fill={COLORS.textLight} fontSize="7">Offline delivery</text>
      <Box x={210} y={135} width={90} height={40} label="Media S3" color={COLORS.gray} fontSize={9} />
      <text x={215} y={170} fill={COLORS.textLight} fontSize="7">30-day retention</text>
      <Box x={320} y={135} width={80} height={40} label="Group Svc" color={COLORS.primary} fontSize={9} />
      <Box x={420} y={135} width={80} height={40} label="Status Svc" color={COLORS.secondary} fontSize={9} />
    </svg>
  ),

  dropbox: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Dropbox Architecture (Block-level Sync)</text>
      {/* Sync Client */}
      <rect x={10} y={30} width={150} height={160} fill={`${COLORS.secondary}10`} stroke={COLORS.secondary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.secondary} fontSize="10" fontWeight="500">SYNC CLIENT</text>
      <Box x={20} y={55} width={60} height={30} label="Watcher" color={COLORS.secondary} fontSize={9} />
      <Box x={90} y={55} width={60} height={30} label="Chunker" color={COLORS.warning} fontSize={9} />
      <text x={25} y={100} fill={COLORS.textLight} fontSize="8">4MB blocks</text>
      <Box x={20} y={110} width={130} height={30} label="Hash (SHA-256)" color={COLORS.gray} fontSize={9} />
      <Box x={20} y={150} width={130} height={30} label="Delta Sync" color={COLORS.accent} fontSize={9} />
      {/* Backend */}
      <rect x={170} y={30} width={340} height={160} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={180} y={45} fill={COLORS.primary} fontSize="10" fontWeight="500">BACKEND SERVICES</text>
      <Box x={180} y={55} width={80} height={35} label="Block Svc" color={COLORS.primary} fontSize={9} />
      <Arrow x1={270} y1={72} x2={300} y2={72} />
      <Box x={310} y={55} width={90} height={35} label="Dedup Check" color={COLORS.error} fontSize={9} />
      <Arrow x1={410} y1={72} x2={435} y2={72} />
      <Box x={445} y={55} width={55} height={35} label="S3" color={COLORS.gray} fontSize={9} />
      <Box x={180} y={100} width={80} height={35} label="Metadata" color={COLORS.warning} fontSize={9} />
      <Arrow x1={270} y1={117} x2={300} y2={117} />
      <Box x={310} y={100} width={60} height={35} label="MySQL" color={COLORS.gray} fontSize={9} />
      <Box x={380} y={100} width={60} height={35} label="Edgestore" color={COLORS.accent} fontSize={9} />
      <Box x={180} y={145} width={80} height={35} label="Notif Svc" color={COLORS.cyan} fontSize={9} />
      <Arrow x1={270} y1={162} x2={300} y2={162} />
      <Box x={310} y={145} width={90} height={35} label="Long-poll WS" color={COLORS.secondary} fontSize={9} />
    </svg>
  ),

  googleDocs: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Google Docs (Operational Transform)</text>
      {/* Client Layer */}
      <rect x={10} y={30} width={150} height={160} fill={`${COLORS.secondary}10`} stroke={COLORS.secondary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.secondary} fontSize="10" fontWeight="500">CLIENTS</text>
      <Box x={20} y={55} width={55} height={30} label="User A" color={COLORS.secondary} fontSize={9} />
      <Box x={85} y={55} width={55} height={30} label="User B" color={COLORS.warning} fontSize={9} />
      <Box x={20} y={95} width={120} height={35} label="Local Operations" color={COLORS.gray} fontSize={9} />
      <Box x={20} y={140} width={120} height={40} label="Optimistic UI" color={COLORS.accent} fontSize={9} />
      <text x={25} y={175} fill={COLORS.textLight} fontSize="7">Immediate feedback</text>
      {/* OT Server */}
      <rect x={170} y={30} width={170} height={160} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={180} y={45} fill={COLORS.primary} fontSize="10" fontWeight="500">COLLAB SERVER</text>
      <Box x={180} y={55} width={70} height={35} label="OT Engine" color={COLORS.primary} fontSize={9} />
      <Box x={260} y={55} width={70} height={35} label="Transform" color={COLORS.warning} fontSize={9} />
      <Box x={180} y={100} width={150} height={35} label="Operation Log" color={COLORS.accent} fontSize={9} />
      <text x={255} y={125} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Ordered sequence</text>
      <Box x={180} y={145} width={150} height={35} label="Broadcast to clients" color={COLORS.error} fontSize={9} />
      {/* Storage */}
      <rect x={350} y={30} width={160} height={160} fill={`${COLORS.gray}10`} stroke={COLORS.gray} strokeWidth="1" rx="4" />
      <text x={360} y={45} fill={COLORS.gray} fontSize="10" fontWeight="500">STORAGE</text>
      <Box x={360} y={55} width={70} height={35} label="Doc Store" color={COLORS.gray} fontSize={9} />
      <Box x={440} y={55} width={60} height={35} label="Bigtable" color={COLORS.accent} fontSize={9} />
      <Box x={360} y={100} width={140} height={35} label="Version History" color={COLORS.warning} fontSize={9} />
      <Box x={360} y={145} width={140} height={35} label="Snapshot (periodic)" color={COLORS.secondary} fontSize={9} />
    </svg>
  ),

  typeahead: (
    <svg viewBox="0 0 420 160" className="w-full h-auto">
      <Box x={15} y={55} width={70} height={45} label="Search Box" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={95} y1={77} x2={135} y2={77} />
      <Box x={145} y={45} width={90} height={65} label="Typeahead Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={245} y1={60} x2={285} y2={35} />
      <Arrow x1={245} y1={95} x2={285} y2={120} />
      <Box x={295} y={15} width={90} height={40} label="Trie Cache" color={COLORS.error} fontSize={9} />
      <Box x={295} y={100} width={90} height={40} label="Analytics" color={COLORS.accent} fontSize={9} />
      <text x={340} y={45} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Prefix Tree</text>
    </svg>
  ),

  webCrawler: (
    <svg viewBox="0 0 480 160" className="w-full h-auto">
      <Box x={10} y={55} width={70} height={45} label="URL Frontier" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={90} y1={77} x2={120} y2={77} />
      <Box x={130} y={45} width={75} height={65} label="Crawlers" color={COLORS.primary} fontSize={10} />
      <Arrow x1={215} y1={77} x2={245} y2={77} />
      <Box x={255} y={45} width={65} height={65} label="Parser" color={COLORS.warning} fontSize={10} />
      <Arrow x1={330} y1={60} x2={360} y2={35} />
      <Arrow x1={330} y1={95} x2={360} y2={120} />
      <Box x={370} y={15} width={70} height={40} label="Index" color={COLORS.accent} fontSize={9} />
      <Box x={370} y={100} width={70} height={40} label="URL Store" color={COLORS.gray} fontSize={9} />
      <Arrow x1={440} y1={120} x2={50} y2={120} color={COLORS.gray} />
    </svg>
  ),

  pastebin: (
    <svg viewBox="0 0 380 160" className="w-full h-auto">
      <Box x={15} y={55} width={65} height={45} label="Client" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={90} y1={77} x2={125} y2={77} />
      <Box x={135} y={45} width={85} height={65} label="API Server" color={COLORS.primary} fontSize={10} />
      <Arrow x1={230} y1={60} x2={265} y2={35} />
      <Arrow x1={230} y1={95} x2={265} y2={120} />
      <Box x={275} y={15} width={80} height={40} label="Key Gen Svc" color={COLORS.warning} fontSize={9} />
      <Box x={275} y={100} width={80} height={40} label="Object Store" color={COLORS.accent} fontSize={9} />
    </svg>
  ),

  ticketBooking: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Ticket Booking System</text>
      <Box x={20} y={55} width={70} height={45} label="User" color={COLORS.secondary} />
      <Arrow x1={100} y1={77} x2={140} y2={77} />
      <Box x={150} y={45} width={90} height={65} label="Booking Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={250} y1={60} x2={290} y2={35} />
      <Arrow x1={250} y1={95} x2={290} y2={120} />
      <Box x={300} y={15} width={90} height={40} label="Seat Lock" color={COLORS.error} fontSize={9} />
      <text x={345} y={45} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Redis TTL</text>
      <Box x={300} y={100} width={90} height={40} label="Payment" color={COLORS.warning} fontSize={9} />
      <Box x={150} y={130} width={90} height={40} label="Event DB" color={COLORS.accent} fontSize={10} />
    </svg>
  ),

  librarySystem: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Library Management</text>
      <Box x={20} y={60} width={70} height={45} label="Member" color={COLORS.secondary} />
      <Arrow x1={100} y1={82} x2={140} y2={82} />
      <Box x={150} y={50} width={95} height={65} label="Library Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={255} y1={65} x2={295} y2={40} />
      <Arrow x1={255} y1={82} x2={295} y2={82} />
      <Arrow x1={255} y1={100} x2={295} y2={125} />
      <Box x={305} y={20} width={85} height={35} label="Book Catalog" color={COLORS.accent} fontSize={9} />
      <Box x={305} y={65} width={85} height={35} label="Loan Tracker" color={COLORS.warning} fontSize={9} />
      <Box x={305} y={110} width={85} height={35} label="Fine System" color={COLORS.error} fontSize={9} />
    </svg>
  ),

  atmSystem: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">ATM System</text>
      <Box x={20} y={60} width={70} height={50} label="ATM" color={COLORS.secondary} />
      <Arrow x1={100} y1={85} x2={140} y2={85} />
      <Box x={150} y={50} width={95} height={70} label="ATM Controller" color={COLORS.primary} fontSize={10} />
      <Arrow x1={255} y1={65} x2={295} y2={40} />
      <Arrow x1={255} y1={85} x2={295} y2={85} />
      <Arrow x1={255} y1={105} x2={295} y2={130} />
      <Box x={305} y={20} width={85} height={35} label="Card Reader" color={COLORS.warning} fontSize={9} />
      <Box x={305} y={68} width={85} height={35} label="Bank API" color={COLORS.accent} fontSize={9} />
      <Box x={305} y={115} width={85} height={35} label="Cash Disp" color={COLORS.gray} fontSize={9} />
    </svg>
  ),

  vendingMachine: (
    <svg viewBox="0 0 380 180" className="w-full h-auto">
      <text x={190} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Vending Machine</text>
      <Box x={20} y={60} width={70} height={45} label="User" color={COLORS.secondary} />
      <Arrow x1={100} y1={82} x2={140} y2={82} />
      <Box x={150} y={45} width={100} height={75} label="State Machine" color={COLORS.primary} fontSize={10} />
      <text x={200} y={100} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Idle→Select→Pay→Dispense</text>
      <Arrow x1={260} y1={65} x2={295} y2={45} />
      <Arrow x1={260} y1={100} x2={295} y2={120} />
      <Box x={305} y={25} width={65} height={35} label="Inventory" color={COLORS.warning} fontSize={9} />
      <Box x={305} y={105} width={65} height={35} label="Payment" color={COLORS.accent} fontSize={9} />
    </svg>
  ),

  snakeLadder: (
    <svg viewBox="0 0 380 180" className="w-full h-auto">
      <text x={190} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Snake & Ladder</text>
      <rect x={30} y={45} width={130} height={110} fill={`${COLORS.accent}15`} stroke={COLORS.accent} strokeWidth="2" rx="4" />
      <text x={95} y={65} textAnchor="middle" fill={COLORS.accent} fontSize="11" fontWeight="500">10x10 Board</text>
      <Box x={45} y={80} width={45} height={25} label="Snake" color={COLORS.error} fontSize={9} />
      <Box x={100} y={80} width={45} height={25} label="Ladder" color={COLORS.primary} fontSize={9} />
      <Box x={45} y={115} width={100} height={30} label="Cells 1-100" color={COLORS.gray} fontSize={9} />
      <Arrow x1={170} y1={100} x2={210} y2={100} />
      <Box x={220} y={55} width={90} height={90} label="Game Engine" color={COLORS.primary} fontSize={10} />
      <text x={265} y={115} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Turn-based</text>
      <Box x={330} y={75} width={45} height={50} label="Dice" color={COLORS.warning} fontSize={10} />
    </svg>
  ),

  ticTacToe: (
    <svg viewBox="0 0 380 180" className="w-full h-auto">
      <text x={190} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Tic Tac Toe</text>
      <rect x={30} y={45} width={100} height={110} fill={`${COLORS.accent}15`} stroke={COLORS.accent} strokeWidth="2" rx="4" />
      <text x={80} y={65} textAnchor="middle" fill={COLORS.accent} fontSize="11" fontWeight="500">3x3 Board</text>
      <line x1={60} y1={80} x2={60} y2={140} stroke={COLORS.gray} strokeWidth="2" />
      <line x1={100} y1={80} x2={100} y2={140} stroke={COLORS.gray} strokeWidth="2" />
      <line x1={40} y1={100} x2={120} y2={100} stroke={COLORS.gray} strokeWidth="2" />
      <line x1={40} y1={120} x2={120} y2={120} stroke={COLORS.gray} strokeWidth="2" />
      <Arrow x1={140} y1={100} x2={180} y2={100} />
      <Box x={190} y={50} width={100} height={100} label="Game Logic" color={COLORS.primary} fontSize={10} />
      <text x={240} y={115} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Win Check</text>
      <Box x={310} y={50} width={55} height={45} label="Player" color={COLORS.secondary} fontSize={9} />
      <Box x={310} y={105} width={55} height={45} label="Player" color={COLORS.warning} fontSize={9} />
    </svg>
  ),

  chess: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Chess Game</text>
      <rect x={20} y={45} width={100} height={110} fill={`${COLORS.gray}15`} stroke={COLORS.gray} strokeWidth="2" rx="4" />
      <text x={70} y={65} textAnchor="middle" fill={COLORS.text} fontSize="11" fontWeight="500">8x8 Board</text>
      <Box x={35} y={80} width={70} height={25} label="32 Pieces" color={COLORS.accent} fontSize={9} />
      <Box x={35} y={115} width={70} height={30} label="Move Rules" color={COLORS.warning} fontSize={9} />
      <Arrow x1={130} y1={100} x2={170} y2={100} />
      <Box x={180} y={45} width={100} height={110} label="Game Engine" color={COLORS.primary} fontSize={10} />
      <text x={230} y={90} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Validate</text>
      <text x={230} y={105} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Check/Mate</text>
      <text x={230} y={120} textAnchor="middle" fill={COLORS.textLight} fontSize="8">State</text>
      <Box x={300} y={55} width={80} height={35} label="White" color={COLORS.secondary} fontSize={10} />
      <Box x={300} y={105} width={80} height={35} label="Black" color={COLORS.gray} fontSize={10} />
    </svg>
  ),

  hotelBooking: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Hotel Booking</text>
      <Box x={20} y={60} width={70} height={45} label="Guest" color={COLORS.secondary} />
      <Arrow x1={100} y1={82} x2={140} y2={82} />
      <Box x={150} y={50} width={95} height={65} label="Booking Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={255} y1={65} x2={290} y2={40} />
      <Arrow x1={255} y1={82} x2={290} y2={82} />
      <Arrow x1={255} y1={100} x2={290} y2={125} />
      <Box x={300} y={20} width={90} height={35} label="Room Inv" color={COLORS.accent} fontSize={9} />
      <Box x={300} y={65} width={90} height={35} label="Reservation" color={COLORS.warning} fontSize={9} />
      <Box x={300} y={110} width={90} height={35} label="Payment" color={COLORS.error} fontSize={9} />
    </svg>
  ),

  carRental: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Car Rental System</text>
      <Box x={20} y={60} width={70} height={45} label="Customer" color={COLORS.secondary} />
      <Arrow x1={100} y1={82} x2={140} y2={82} />
      <Box x={150} y={50} width={95} height={65} label="Rental Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={255} y1={65} x2={290} y2={40} />
      <Arrow x1={255} y1={82} x2={290} y2={82} />
      <Arrow x1={255} y1={100} x2={290} y2={125} />
      <Box x={300} y={20} width={90} height={35} label="Vehicle Inv" color={COLORS.accent} fontSize={9} />
      <Box x={300} y={65} width={90} height={35} label="Reservation" color={COLORS.warning} fontSize={9} />
      <Box x={300} y={110} width={90} height={35} label="Billing" color={COLORS.error} fontSize={9} />
    </svg>
  ),

  airlineBooking: (
    <svg viewBox="0 0 460 180" className="w-full h-auto">
      <text x={230} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Airline Booking</text>
      <Box x={15} y={60} width={70} height={45} label="Traveler" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={95} y1={82} x2={130} y2={82} />
      <Box x={140} y={50} width={85} height={65} label="Search Svc" color={COLORS.primary} fontSize={10} />
      <Arrow x1={235} y1={82} x2={270} y2={82} />
      <Box x={280} y={50} width={85} height={65} label="Booking Svc" color={COLORS.warning} fontSize={10} />
      <Arrow x1={375} y1={65} x2={405} y2={45} />
      <Arrow x1={375} y1={100} x2={405} y2={120} />
      <Box x={415} y={25} width={50} height={35} label="Seats" color={COLORS.accent} fontSize={9} />
      <Box x={415} y={105} width={50} height={35} label="Payment" color={COLORS.error} fontSize={9} />
    </svg>
  ),

  stockExchange: (
    <svg viewBox="0 0 460 180" className="w-full h-auto">
      <text x={230} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Stock Exchange</text>
      <Box x={15} y={55} width={65} height={40} label="Buyers" color={COLORS.primary} fontSize={10} />
      <Box x={15} y={100} width={65} height={40} label="Sellers" color={COLORS.error} fontSize={10} />
      <Arrow x1={90} y1={75} x2={130} y2={85} />
      <Arrow x1={90} y1={120} x2={130} y2={100} />
      <Box x={140} y={55} width={95} height={75} label="Order Book" color={COLORS.warning} fontSize={10} />
      <text x={187} y={105} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Price-Time FIFO</text>
      <Arrow x1={245} y1={92} x2={285} y2={92} />
      <Box x={295} y={55} width={90} height={75} label="Match Engine" color={COLORS.accent} fontSize={10} />
      <Arrow x1={395} y1={92} x2={425} y2={92} />
      <Box x={435} y={70} width={35} height={45} label="Trade" color={COLORS.gray} fontSize={9} />
    </svg>
  ),

  cricketScoreboard: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Cricket Scoreboard</text>
      <Box x={20} y={55} width={80} height={50} label="Match Input" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={110} y1={80} x2={150} y2={80} />
      <Box x={160} y={45} width={100} height={70} label="Score Engine" color={COLORS.primary} fontSize={10} />
      <text x={210} y={90} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Ball-by-Ball</text>
      <Arrow x1={270} y1={65} x2={305} y2={45} />
      <Arrow x1={270} y1={95} x2={305} y2={115} />
      <Box x={315} y={25} width={85} height={35} label="Live Score" color={COLORS.warning} fontSize={9} />
      <Box x={315} y={100} width={85} height={35} label="Stats DB" color={COLORS.accent} fontSize={9} />
    </svg>
  ),

  logAggregator: (
    <svg viewBox="0 0 460 160" className="w-full h-auto">
      <Box x={15} y={25} width={65} height={30} label="App 1" color={COLORS.primary} fontSize={10} />
      <Box x={15} y={65} width={65} height={30} label="App 2" color={COLORS.primary} fontSize={10} />
      <Box x={15} y={105} width={65} height={30} label="App 3" color={COLORS.primary} fontSize={10} />
      <Arrow x1={90} y1={40} x2={130} y2={65} />
      <Arrow x1={90} y1={80} x2={130} y2={80} />
      <Arrow x1={90} y1={120} x2={130} y2={95} />
      <Box x={140} y={50} width={85} height={60} label="Log Shipper" color={COLORS.warning} fontSize={10} />
      <Arrow x1={235} y1={80} x2={275} y2={80} />
      <Box x={285} y={50} width={70} height={60} label="Kafka" color={COLORS.accent} fontSize={10} />
      <Arrow x1={365} y1={80} x2={400} y2={80} />
      <Box x={410} y={45} width={55} height={70} label="Elastic" color={COLORS.secondary} fontSize={9} />
    </svg>
  ),

  taskScheduler: (
    <svg viewBox="0 0 420 160" className="w-full h-auto">
      <Box x={20} y={55} width={75} height={45} label="Task Queue" color={COLORS.secondary} />
      <Arrow x1={105} y1={77} x2={145} y2={77} />
      <Box x={155} y={45} width={100} height={65} label="Scheduler" color={COLORS.primary} fontSize={10} />
      <text x={205} y={90} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Cron/Delay</text>
      <Arrow x1={265} y1={60} x2={305} y2={35} />
      <Arrow x1={265} y1={95} x2={305} y2={120} />
      <Box x={315} y={15} width={80} height={35} label="Worker Pool" color={COLORS.accent} fontSize={9} />
      <Box x={315} y={100} width={80} height={35} label="Result Store" color={COLORS.warning} fontSize={9} />
    </svg>
  ),

  socialGraph: (
    <svg viewBox="0 0 420 180" className="w-full h-auto">
      <text x={210} y={20} textAnchor="middle" fill={COLORS.primary} fontSize="12" fontWeight="600">Social Graph</text>
      <Box x={20} y={65} width={70} height={45} label="User" color={COLORS.secondary} />
      <Arrow x1={100} y1={87} x2={140} y2={87} />
      <Box x={150} y={55} width={90} height={65} label="Graph API" color={COLORS.primary} fontSize={10} />
      <Arrow x1={250} y1={70} x2={290} y2={45} />
      <Arrow x1={250} y1={105} x2={290} y2={130} />
      <Box x={300} y={25} width={90} height={40} label="Neo4j" color={COLORS.accent} fontSize={10} />
      <text x={345} y={55} textAnchor="middle" fill={COLORS.textLight} fontSize="8">Relationships</text>
      <Box x={300} y={110} width={90} height={40} label="Cache" color={COLORS.error} fontSize={10} />
    </svg>
  ),

  contentModeration: (
    <svg viewBox="0 0 460 160" className="w-full h-auto">
      <Box x={15} y={55} width={70} height={45} label="Content" color={COLORS.secondary} />
      <Arrow x1={95} y1={77} x2={135} y2={77} />
      <Box x={145} y={45} width={80} height={65} label="ML Filter" color={COLORS.warning} fontSize={10} />
      <Arrow x1={235} y1={77} x2={275} y2={77} />
      <Diamond x={285} y={52} size={50} label="Safe?" color={COLORS.primary} />
      <Arrow x1={345} y1={62} x2={385} y2={40} />
      <Arrow x1={345} y1={92} x2={385} y2={115} />
      <Box x={395} y={20} width={60} height={35} label="Publish" color={COLORS.primary} fontSize={9} />
      <Box x={395} y={100} width={60} height={35} label="Review" color={COLORS.error} fontSize={9} />
    </svg>
  ),

  paymentGateway: (
    <svg viewBox="0 0 460 160" className="w-full h-auto">
      <Box x={15} y={55} width={65} height={45} label="Merchant" color={COLORS.secondary} fontSize={10} />
      <Arrow x1={90} y1={77} x2={130} y2={77} />
      <Box x={140} y={45} width={90} height={65} label="Payment GW" color={COLORS.warning} fontSize={10} />
      <Arrow x1={240} y1={60} x2={280} y2={35} />
      <Arrow x1={240} y1={77} x2={280} y2={77} />
      <Arrow x1={240} y1={95} x2={280} y2={120} />
      <Box x={290} y={15} width={75} height={35} label="Fraud Check" color={COLORS.error} fontSize={9} />
      <Box x={290} y={60} width={75} height={35} label="Card Network" color={COLORS.primary} fontSize={9} />
      <Box x={290} y={105} width={75} height={35} label="Bank" color={COLORS.accent} fontSize={9} />
      <Box x={385} y={55} width={65} height={45} label="Ledger" color={COLORS.gray} fontSize={10} />
    </svg>
  ),

  // Distributed Rate Limiter
  distributedRateLimiter: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Distributed Rate Limiter</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.error}10`} stroke={COLORS.error} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.error} fontSize="10" fontWeight="500">RATE LIMITING LAYER</text>
      <Box x={20} y={55} width={60} height={35} label="Client" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={90} y1={72} x2={115} y2={72} />
      <Box x={125} y={55} width={80} height={35} label="API Gateway" color={COLORS.warning} fontSize={9} />
      <Arrow x1={215} y1={72} x2={240} y2={72} />
      <Box x={250} y={50} width={100} height={45} label="Rate Limit Svc" color={COLORS.error} fontSize={9} />
      <text x={300} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Token Bucket / Sliding Window</text>
      <Arrow x1={360} y1={72} x2={385} y2={72} />
      <Box x={395} y={55} width={55} height={35} label="Redis" color={COLORS.accent} fontSize={9} />
      <Arrow x1={460} y1={72} x2={485} y2={72} />
      <Box x={460} y={55} width={45} height={35} label="API" color={COLORS.primary} fontSize={9} />
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">DISTRIBUTED SYNC</text>
      <Box x={20} y={140} width={90} height={35} label="Local Counter" color={COLORS.gray} fontSize={9} />
      <Arrow x1={120} y1={157} x2={145} y2={157} />
      <Box x={155} y={140} width={100} height={35} label="Gossip Protocol" color={COLORS.accent} fontSize={9} />
      <Arrow x1={265} y1={157} x2={290} y2={157} />
      <Box x={300} y={140} width={90} height={35} label="Redis Cluster" color={COLORS.error} fontSize={9} />
      <Arrow x1={400} y1={157} x2={425} y2={157} />
      <Box x={435} y={140} width={70} height={35} label="Sync Mgr" color={COLORS.primary} fontSize={9} />
    </svg>
  ),

  // Yelp Location-Based Service
  yelp: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Yelp Location-Based Service</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.secondary}10`} stroke={COLORS.secondary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.secondary} fontSize="10" fontWeight="500">LOCATION SEARCH</text>
      <Box x={20} y={55} width={55} height={35} label="Mobile" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={85} y1={72} x2={110} y2={72} />
      <Box x={120} y={55} width={80} height={35} label="API Gateway" color={COLORS.warning} fontSize={9} />
      <Arrow x1={210} y1={72} x2={235} y2={72} />
      <Box x={245} y={55} width={90} height={35} label="Search Svc" color={COLORS.primary} fontSize={9} />
      <Arrow x1={345} y1={72} x2={370} y2={72} />
      <Box x={380} y={50} width={120} height={45} label="Elasticsearch Geo" color={COLORS.accent} fontSize={9} />
      <text x={440} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Geohash indexing</text>
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.warning}10`} stroke={COLORS.warning} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.warning} fontSize="10" fontWeight="500">DATA LAYER</text>
      <Box x={20} y={140} width={80} height={35} label="Business DB" color={COLORS.gray} fontSize={9} />
      <Box x={110} y={140} width={70} height={35} label="Reviews" color={COLORS.warning} fontSize={9} />
      <Box x={190} y={140} width={70} height={35} label="Photos" color={COLORS.cyan} fontSize={9} />
      <Box x={270} y={140} width={80} height={35} label="QuadTree" color={COLORS.primary} fontSize={9} />
      <text x={310} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Spatial index</text>
      <Box x={360} y={140} width={60} height={35} label="Redis" color={COLORS.error} fontSize={9} />
      <Box x={430} y={140} width={70} height={35} label="CDN" color={COLORS.cyan} fontSize={9} />
    </svg>
  ),

  // Tinder Dating App
  tinder: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Tinder Dating App</text>
      <rect x={10} y={30} width={240} height={160} fill={`${COLORS.error}10`} stroke={COLORS.error} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.error} fontSize="10" fontWeight="500">MATCHING ENGINE</text>
      <Box x={20} y={55} width={55} height={30} label="User A" color={COLORS.secondary} fontSize={9} />
      <Box x={85} y={55} width={55} height={30} label="User B" color={COLORS.warning} fontSize={9} />
      <Arrow x1={60} y1={95} x2={100} y2={110} />
      <Arrow x1={112} y1={95} x2={100} y2={110} />
      <Box x={50} y={110} width={100} height={35} label="Geo Match" color={COLORS.error} fontSize={9} />
      <text x={100} y={140} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Nearby + Preferences</text>
      <Box x={160} y={110} width={80} height={35} label="ML Rank" color={COLORS.accent} fontSize={9} />
      <Box x={20} y={155} width={110} height={30} label="Redis Geospatial" color={COLORS.error} fontSize={9} />
      <Box x={140} y={155} width={100} height={30} label="Swipe Queue" color={COLORS.warning} fontSize={9} />
      <rect x={260} y={30} width={250} height={160} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={270} y={45} fill={COLORS.primary} fontSize="10" fontWeight="500">REAL-TIME LAYER</text>
      <Box x={270} y={55} width={80} height={35} label="WebSocket" color={COLORS.primary} fontSize={9} />
      <Arrow x1={360} y1={72} x2={385} y2={72} />
      <Box x={395} y={55} width={100} height={35} label="Match Notify" color={COLORS.accent} fontSize={9} />
      <Box x={270} y={100} width={80} height={35} label="Chat Svc" color={COLORS.secondary} fontSize={9} />
      <Box x={360} y={100} width={70} height={35} label="Kafka" color={COLORS.warning} fontSize={9} />
      <Box x={440} y={100} width={60} height={35} label="Push" color={COLORS.cyan} fontSize={9} />
      <Box x={270} y={145} width={110} height={35} label="Profile Photos" color={COLORS.gray} fontSize={9} />
      <Box x={390} y={145} width={110} height={35} label="S3 + CDN" color={COLORS.cyan} fontSize={9} />
    </svg>
  ),

  // Spotify Music Streaming
  spotify: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Spotify Music Streaming</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.primary} fontSize="10" fontWeight="500">AUDIO STREAMING</text>
      <Box x={20} y={55} width={55} height={35} label="Client" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={85} y1={72} x2={110} y2={72} />
      <Box x={120} y={55} width={70} height={35} label="Edge CDN" color={COLORS.cyan} fontSize={9} />
      <Arrow x1={200} y1={72} x2={225} y2={72} />
      <Box x={235} y={55} width={90} height={35} label="Audio Server" color={COLORS.primary} fontSize={9} />
      <Arrow x1={335} y1={72} x2={360} y2={72} />
      <Box x={370} y={50} width={130} height={45} label="Ogg Vorbis 320kbps" color={COLORS.gray} fontSize={9} />
      <text x={435} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Pre-buffer + gapless</text>
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.accent}10`} stroke={COLORS.accent} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.accent} fontSize="10" fontWeight="500">PERSONALIZATION</text>
      <Box x={20} y={140} width={80} height={35} label="User Svc" color={COLORS.secondary} fontSize={9} />
      <Box x={110} y={140} width={90} height={35} label="Rec Engine" color={COLORS.accent} fontSize={9} />
      <text x={155} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Collaborative filtering</text>
      <Box x={210} y={140} width={80} height={35} label="Playlist Svc" color={COLORS.warning} fontSize={9} />
      <Box x={300} y={140} width={70} height={35} label="Search" color={COLORS.primary} fontSize={9} />
      <Box x={380} y={140} width={60} height={35} label="Kafka" color={COLORS.error} fontSize={9} />
      <Box x={450} y={140} width={55} height={35} label="Analytics" color={COLORS.gray} fontSize={9} />
    </svg>
  ),

  // Airbnb
  airbnb: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Airbnb Architecture</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.error}10`} stroke={COLORS.error} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.error} fontSize="10" fontWeight="500">SEARCH & BOOKING</text>
      <Box x={20} y={55} width={60} height={35} label="Guest" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={90} y1={72} x2={115} y2={72} />
      <Box x={125} y={55} width={90} height={35} label="Search Svc" color={COLORS.primary} fontSize={9} />
      <Arrow x1={225} y1={72} x2={250} y2={72} />
      <Box x={260} y={50} width={110} height={45} label="Elasticsearch Geo" color={COLORS.accent} fontSize={9} />
      <text x={315} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Availability + Pricing</text>
      <Arrow x1={380} y1={72} x2={405} y2={72} />
      <Box x={415} y={55} width={90} height={35} label="Booking Svc" color={COLORS.error} fontSize={9} />
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.warning}10`} stroke={COLORS.warning} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.warning} fontSize="10" fontWeight="500">HOST & PAYMENT</text>
      <Box x={20} y={140} width={70} height={35} label="Host Svc" color={COLORS.warning} fontSize={9} />
      <Box x={100} y={140} width={80} height={35} label="Calendar" color={COLORS.gray} fontSize={9} />
      <Box x={190} y={140} width={90} height={35} label="Payment Svc" color={COLORS.error} fontSize={9} />
      <Box x={290} y={140} width={80} height={35} label="Messaging" color={COLORS.primary} fontSize={9} />
      <Box x={380} y={140} width={60} height={35} label="Review" color={COLORS.accent} fontSize={9} />
      <Box x={450} y={140} width={55} height={35} label="CDN" color={COLORS.cyan} fontSize={9} />
    </svg>
  ),

  // DoorDash Food Delivery
  doordash: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">DoorDash Food Delivery</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.error}10`} stroke={COLORS.error} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.error} fontSize="10" fontWeight="500">ORDER FLOW</text>
      <Box x={20} y={55} width={60} height={35} label="Customer" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={90} y1={72} x2={115} y2={72} />
      <Box x={125} y={55} width={70} height={35} label="Order Svc" color={COLORS.error} fontSize={9} />
      <Arrow x1={205} y1={72} x2={230} y2={72} />
      <Box x={240} y={55} width={80} height={35} label="Restaurant" color={COLORS.warning} fontSize={9} />
      <Arrow x1={330} y1={72} x2={355} y2={72} />
      <Box x={365} y={50} width={135} height={45} label="Dispatch Engine" color={COLORS.primary} fontSize={9} />
      <text x={432} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">ML Assignment</text>
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">DASHER LAYER</text>
      <Box x={20} y={140} width={80} height={35} label="Dasher App" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={110} y1={157} x2={135} y2={157} />
      <Box x={145} y={140} width={90} height={35} label="Location Svc" color={COLORS.cyan} fontSize={9} />
      <text x={190} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Real-time GPS</text>
      <Box x={245} y={140} width={70} height={35} label="ETA Svc" color={COLORS.accent} fontSize={9} />
      <Box x={325} y={140} width={70} height={35} label="Payment" color={COLORS.error} fontSize={9} />
      <Box x={405} y={140} width={95} height={35} label="Redis Geospatial" color={COLORS.warning} fontSize={9} />
    </svg>
  ),

  // Twitter Trending Topics
  twitterTrending: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Twitter Trending Topics</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.cyan}10`} stroke={COLORS.cyan} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.cyan} fontSize="10" fontWeight="500">INGESTION PIPELINE</text>
      <Box x={20} y={55} width={60} height={35} label="Tweets" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={90} y1={72} x2={115} y2={72} />
      <Box x={125} y={55} width={70} height={35} label="Kafka" color={COLORS.warning} fontSize={9} />
      <Arrow x1={205} y1={72} x2={230} y2={72} />
      <Box x={240} y={50} width={110} height={45} label="Hashtag Extract" color={COLORS.primary} fontSize={9} />
      <text x={295} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">NLP + Entity</text>
      <Arrow x1={360} y1={72} x2={385} y2={72} />
      <Box x={395} y={55} width={110} height={35} label="Count-Min Sketch" color={COLORS.accent} fontSize={9} />
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">TRENDING COMPUTE</text>
      <Box x={20} y={140} width={90} height={35} label="Storm/Flink" color={COLORS.error} fontSize={9} />
      <text x={65} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Stream processing</text>
      <Box x={120} y={140} width={90} height={35} label="Time Decay" color={COLORS.warning} fontSize={9} />
      <Box x={220} y={140} width={80} height={35} label="Geo Filter" color={COLORS.cyan} fontSize={9} />
      <Box x={310} y={140} width={90} height={35} label="Top-K Heap" color={COLORS.primary} fontSize={9} />
      <Box x={410} y={140} width={95} height={35} label="Redis Sorted Set" color={COLORS.error} fontSize={9} />
    </svg>
  ),

  // Facebook News Feed
  facebookFeed: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Facebook News Feed</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.secondary}10`} stroke={COLORS.secondary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.secondary} fontSize="10" fontWeight="500">FEED AGGREGATION</text>
      <Box x={20} y={55} width={60} height={35} label="User" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={90} y1={72} x2={115} y2={72} />
      <Box x={125} y={55} width={75} height={35} label="Feed Svc" color={COLORS.primary} fontSize={9} />
      <Arrow x1={210} y1={72} x2={235} y2={72} />
      <Box x={245} y={50} width={90} height={45} label="Aggregator" color={COLORS.warning} fontSize={9} />
      <text x={290} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Friends + Groups</text>
      <Arrow x1={345} y1={72} x2={370} y2={72} />
      <Box x={380} y={55} width={120} height={35} label="ML Ranker (EdgeRank)" color={COLORS.accent} fontSize={9} />
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">STORAGE LAYER</text>
      <Box x={20} y={140} width={70} height={35} label="TAO" color={COLORS.gray} fontSize={9} />
      <text x={55} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Graph store</text>
      <Box x={100} y={140} width={80} height={35} label="Feed Cache" color={COLORS.error} fontSize={9} />
      <Box x={190} y={140} width={70} height={35} label="MySQL" color={COLORS.gray} fontSize={9} />
      <Box x={270} y={140} width={80} height={35} label="Memcached" color={COLORS.error} fontSize={9} />
      <Box x={360} y={140} width={60} height={35} label="Kafka" color={COLORS.warning} fontSize={9} />
      <Box x={430} y={140} width={70} height={35} label="Scribe" color={COLORS.accent} fontSize={9} />
    </svg>
  ),

  // Distributed ID Generator
  distributedId: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Distributed ID Generator (Snowflake)</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.warning}10`} stroke={COLORS.warning} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.warning} fontSize="10" fontWeight="500">SNOWFLAKE ID STRUCTURE (64 bits)</text>
      <Box x={20} y={55} width={80} height={35} label="Timestamp" color={COLORS.warning} fontSize={9} />
      <text x={60} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">41 bits</text>
      <Box x={110} y={55} width={90} height={35} label="Datacenter ID" color={COLORS.primary} fontSize={9} />
      <text x={155} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">5 bits</text>
      <Box x={210} y={55} width={90} height={35} label="Machine ID" color={COLORS.accent} fontSize={9} />
      <text x={255} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">5 bits</text>
      <Box x={310} y={55} width={90} height={35} label="Sequence" color={COLORS.error} fontSize={9} />
      <text x={355} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">12 bits (4096/ms)</text>
      <Box x={410} y={55} width={95} height={35} label="= 64-bit ID" color={COLORS.gray} fontSize={9} />
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">ID SERVICE CLUSTER</text>
      <Box x={20} y={140} width={80} height={35} label="ZooKeeper" color={COLORS.accent} fontSize={9} />
      <text x={60} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Coordination</text>
      <Box x={110} y={140} width={80} height={35} label="ID Svc 1" color={COLORS.primary} fontSize={9} />
      <Box x={200} y={140} width={80} height={35} label="ID Svc 2" color={COLORS.primary} fontSize={9} />
      <Box x={290} y={140} width={80} height={35} label="ID Svc N" color={COLORS.primary} fontSize={9} />
      <Arrow x1={380} y1={157} x2={405} y2={157} />
      <Box x={415} y={140} width={90} height={35} label="Load Balancer" color={COLORS.warning} fontSize={9} />
    </svg>
  ),

  // Google News Aggregator
  googleNews: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Google News Aggregator</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.warning}10`} stroke={COLORS.warning} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.warning} fontSize="10" fontWeight="500">CONTENT INGESTION</text>
      <Box x={20} y={55} width={70} height={35} label="RSS/Atom" color={COLORS.gray} fontSize={9} />
      <Arrow x1={100} y1={72} x2={125} y2={72} />
      <Box x={135} y={55} width={70} height={35} label="Crawler" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={215} y1={72} x2={240} y2={72} />
      <Box x={250} y={50} width={100} height={45} label="NLP Pipeline" color={COLORS.primary} fontSize={9} />
      <text x={300} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Entity extraction</text>
      <Arrow x1={360} y1={72} x2={385} y2={72} />
      <Box x={395} y={55} width={110} height={35} label="Dedup + Cluster" color={COLORS.accent} fontSize={9} />
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">PERSONALIZATION</text>
      <Box x={20} y={140} width={80} height={35} label="User Profile" color={COLORS.secondary} fontSize={9} />
      <Box x={110} y={140} width={80} height={35} label="Topic Model" color={COLORS.warning} fontSize={9} />
      <Box x={200} y={140} width={90} height={35} label="Freshness Rank" color={COLORS.error} fontSize={9} />
      <Box x={300} y={140} width={80} height={35} label="Diversity" color={COLORS.accent} fontSize={9} />
      <Box x={390} y={140} width={110} height={35} label="Personalized Feed" color={COLORS.primary} fontSize={9} />
    </svg>
  ),

  // Gaming Leaderboard
  leaderboard: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Gaming Leaderboard</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.error}10`} stroke={COLORS.error} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.error} fontSize="10" fontWeight="500">SCORE INGESTION</text>
      <Box x={20} y={55} width={70} height={35} label="Game Srv" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={100} y1={72} x2={125} y2={72} />
      <Box x={135} y={55} width={70} height={35} label="Kafka" color={COLORS.warning} fontSize={9} />
      <Arrow x1={215} y1={72} x2={240} y2={72} />
      <Box x={250} y={50} width={110} height={45} label="Score Processor" color={COLORS.primary} fontSize={9} />
      <text x={305} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Validate + Update</text>
      <Arrow x1={370} y1={72} x2={395} y2={72} />
      <Box x={405} y={50} width={100} height={45} label="Redis Sorted Set" color={COLORS.error} fontSize={9} />
      <text x={455} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">ZADD, ZRANK</text>
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">LEADERBOARD QUERIES</text>
      <Box x={20} y={140} width={90} height={35} label="Top N Query" color={COLORS.accent} fontSize={9} />
      <text x={65} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">ZREVRANGE</text>
      <Box x={120} y={140} width={90} height={35} label="User Rank" color={COLORS.warning} fontSize={9} />
      <text x={165} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">ZREVRANK</text>
      <Box x={220} y={140} width={90} height={35} label="Around Me" color={COLORS.primary} fontSize={9} />
      <Box x={320} y={140} width={80} height={35} label="Segmented" color={COLORS.gray} fontSize={9} />
      <Box x={410} y={140} width={95} height={35} label="Time-based" color={COLORS.cyan} fontSize={9} />
    </svg>
  ),

  // Google Maps
  googleMaps: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Google Maps Architecture</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.primary} fontSize="10" fontWeight="500">TILE SERVING & ROUTING</text>
      <Box x={20} y={55} width={55} height={35} label="Client" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={85} y1={72} x2={110} y2={72} />
      <Box x={120} y={55} width={70} height={35} label="Tile CDN" color={COLORS.cyan} fontSize={9} />
      <Arrow x1={200} y1={72} x2={225} y2={72} />
      <Box x={235} y={50} width={100} height={45} label="Vector Tiles" color={COLORS.gray} fontSize={9} />
      <text x={285} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">z/x/y.pbf</text>
      <Arrow x1={345} y1={72} x2={370} y2={72} />
      <Box x={380} y={50} width={125} height={45} label="Routing Engine" color={COLORS.primary} fontSize={9} />
      <text x={442} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Dijkstra/A*</text>
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.warning}10`} stroke={COLORS.warning} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.warning} fontSize="10" fontWeight="500">DATA LAYER</text>
      <Box x={20} y={140} width={80} height={35} label="Road Graph" color={COLORS.warning} fontSize={9} />
      <Box x={110} y={140} width={80} height={35} label="POI Index" color={COLORS.accent} fontSize={9} />
      <Box x={200} y={140} width={90} height={35} label="Traffic Live" color={COLORS.error} fontSize={9} />
      <text x={245} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">GPS data</text>
      <Box x={300} y={140} width={70} height={35} label="Geocoder" color={COLORS.primary} fontSize={9} />
      <Box x={380} y={140} width={60} height={35} label="Places" color={COLORS.gray} fontSize={9} />
      <Box x={450} y={140} width={55} height={35} label="ETA ML" color={COLORS.accent} fontSize={9} />
    </svg>
  ),

  // Zoom Video Conferencing
  zoom: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">Zoom Video Conferencing</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.cyan}10`} stroke={COLORS.cyan} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.cyan} fontSize="10" fontWeight="500">MEDIA PLANE</text>
      <Box x={20} y={55} width={60} height={35} label="User A" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={90} y1={72} x2={115} y2={72} />
      <Box x={125} y={50} width={110} height={45} label="SFU (Selective)" color={COLORS.primary} fontSize={9} />
      <text x={180} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Forwarding Unit</text>
      <Arrow x1={245} y1={72} x2={270} y2={72} />
      <Box x={280} y={55} width={100} height={35} label="Media Router" color={COLORS.cyan} fontSize={9} />
      <Arrow x1={390} y1={72} x2={415} y2={72} />
      <Box x={425} y={55} width={80} height={35} label="User B, C, D" color={COLORS.warning} fontSize={9} />
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">SIGNALING & CONTROL</text>
      <Box x={20} y={140} width={90} height={35} label="WebRTC Sig" color={COLORS.accent} fontSize={9} />
      <text x={65} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">ICE/STUN/TURN</text>
      <Box x={120} y={140} width={80} height={35} label="Meeting Svc" color={COLORS.primary} fontSize={9} />
      <Box x={210} y={140} width={70} height={35} label="Auth Svc" color={COLORS.warning} fontSize={9} />
      <Box x={290} y={140} width={80} height={35} label="Recording" color={COLORS.gray} fontSize={9} />
      <Box x={380} y={140} width={60} height={35} label="Chat" color={COLORS.secondary} fontSize={9} />
      <Box x={450} y={140} width={55} height={35} label="Screen" color={COLORS.cyan} fontSize={9} />
    </svg>
  ),

  // LinkedIn
  linkedin: (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text x={260} y={18} textAnchor="middle" fill={COLORS.primary} fontSize="13" fontWeight="600">LinkedIn Architecture</text>
      <rect x={10} y={30} width={500} height={75} fill={`${COLORS.secondary}10`} stroke={COLORS.secondary} strokeWidth="1" rx="4" />
      <text x={20} y={45} fill={COLORS.secondary} fontSize="10" fontWeight="500">PROFESSIONAL NETWORK</text>
      <Box x={20} y={55} width={60} height={35} label="Member" color={COLORS.secondary} fontSize={9} />
      <Arrow x1={90} y1={72} x2={115} y2={72} />
      <Box x={125} y={55} width={80} height={35} label="Graph Svc" color={COLORS.primary} fontSize={9} />
      <text x={165} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Connections</text>
      <Arrow x1={215} y1={72} x2={240} y2={72} />
      <Box x={250} y={55} width={80} height={35} label="Feed Svc" color={COLORS.warning} fontSize={9} />
      <Arrow x1={340} y1={72} x2={365} y2={72} />
      <Box x={375} y={50} width={130} height={45} label="ML Personalization" color={COLORS.accent} fontSize={9} />
      <text x={440} y={85} textAnchor="middle" fill={COLORS.textLight} fontSize="7">People You May Know</text>
      <rect x={10} y={115} width={500} height={75} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="1" rx="4" />
      <text x={20} y={130} fill={COLORS.primary} fontSize="10" fontWeight="500">DATA INFRASTRUCTURE</text>
      <Box x={20} y={140} width={70} height={35} label="Espresso" color={COLORS.gray} fontSize={9} />
      <text x={55} y={170} textAnchor="middle" fill={COLORS.textLight} fontSize="7">Document DB</text>
      <Box x={100} y={140} width={60} height={35} label="Voldemort" color={COLORS.error} fontSize={9} />
      <Box x={170} y={140} width={60} height={35} label="Kafka" color={COLORS.warning} fontSize={9} />
      <Box x={240} y={140} width={80} height={35} label="Search Svc" color={COLORS.primary} fontSize={9} />
      <Box x={330} y={140} width={70} height={35} label="Msg Svc" color={COLORS.secondary} fontSize={9} />
      <Box x={410} y={140} width={95} height={35} label="Jobs/Rec Engine" color={COLORS.accent} fontSize={9} />
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
