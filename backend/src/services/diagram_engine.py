#!/usr/bin/env python3
"""
Capra Diagram Engine - Generates cloud architecture diagrams using mingrammer/diagrams library.
Replaces Mermaid flowcharts with enterprise-grade PNG diagrams with real cloud provider icons.

Flow: Interview question → Claude API → Python code → sandboxed exec → PNG
"""

import os
import sys
import json
import uuid
import re
import subprocess
import tempfile
import argparse
from dataclasses import dataclass, asdict
from typing import Optional
from pathlib import Path

try:
    from anthropic import Anthropic
except ImportError:
    print("Error: anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
    sys.exit(1)


@dataclass
class DiagramResult:
    """Result from diagram generation."""
    image_path: str
    python_code: str
    explanation: str
    cloud_provider: str
    question: str
    success: bool = True
    error: Optional[str] = None


# System prompt for Claude to generate diagram code
SYSTEM_PROMPT = """You are a DETAILED cloud architecture diagram generator for an interview preparation tool called Capra.

Your job: Given a system design interview question, generate Python code using the `diagrams` library (by mingrammer) that creates a COMPREHENSIVE, INTERVIEW-READY cloud architecture diagram that shows PRODUCTION-GRADE detail.

INTERVIEW CONTEXT: This diagram will be used in system design interviews where interviewers will ask deep-dive questions. The diagram MUST show enough detail to support technical discussions about:
- Data flow and request paths
- Caching strategies
- Database choices and replication
- Message queues and async processing
- CDN and edge caching
- Load balancing strategies
- Monitoring and observability
- Security boundaries

CRITICAL RULES:
1. ONLY output valid Python code — no markdown, no explanations, no backticks, no ```python blocks.
2. Use the correct cloud provider icons based on the specified provider.
3. Use `show=False` — diagrams will be rendered server-side.
4. Use the provided `filename` variable: filename=DIAGRAM_FILENAME
5. Use the provided format variable: outformat=DIAGRAM_FORMAT
6. Use direction="LR" for most diagrams (left-to-right flow).
7. Group related services into Clusters — VPCs, subnets, AZs, regions, logical tiers.

DETAIL REQUIREMENTS (IMPORTANT - interviewers will deep dive):
8. Show 25-40 nodes for comprehensive coverage - include ALL key components.
9. Include data stores: Primary DB, Read replicas, Cache (Redis/Memcached), Object storage.
10. Include message queues: Kafka/SQS/Pub-Sub for async processing.
11. Include CDN, WAF, Load Balancers at ingress.
12. Include worker services for background jobs.
13. Include search services (Elasticsearch) if relevant.
14. Include monitoring/logging stack (Prometheus, Grafana, CloudWatch).
15. Show both sync and async data flows with Edge labels.
16. Use Edge(label="...") liberally - label ALL important connections with data types/protocols.
17. Use Edge(style="dashed") for monitoring/logging/metrics paths.
18. Show read vs write paths separately when relevant.
19. Include API Gateway, Service Mesh if microservices architecture.
20. Show multiple availability zones for HA where appropriate.

NETWORKING COMPONENTS (CRITICAL - always include):
21. Show VPC/VNet boundaries with proper subnets (public/private).
22. Include DNS (Route53/Cloud DNS) at the entry point.
23. Show Internet Gateway and NAT Gateway for outbound traffic.
24. Include Firewall/Security Groups/WAF for security boundaries.
25. Show VPN/Direct Connect/ExpressRoute for hybrid cloud if relevant.
26. Include internal load balancers between tiers.
27. Show service mesh (Istio/Envoy) for microservices communication.
28. Label network paths: "HTTPS", "gRPC", "TCP", "Internal VPC".

MESSAGING & EVENT-DRIVEN (CRITICAL for async patterns):
29. Show SNS topics for fan-out pub/sub notifications (labeled with event types).
30. Show SQS queues for decoupled async processing (with DLQ for failures).
31. Show EventBridge/CloudWatch Events for event routing and rules.
32. Show Kafka/Kinesis for high-throughput streaming if relevant.
33. Label message flows: "Events", "Commands", "Notifications", "Retry Queue".
34. Show the pattern: Producer → SNS → SQS → Consumer/Worker.
35. Include Dead Letter Queues (DLQ) for failed message handling.

SECURITY COMPONENTS (CRITICAL - interviewers will deep dive):
36. Show IAM roles/policies for service-to-service auth.
37. Show KMS for encryption keys (data at rest, in transit).
38. Show Secrets Manager/Parameter Store for credentials.
39. Show Certificate Manager (ACM) for TLS certificates.
40. Show WAF rules, Shield for DDoS protection.
41. Show VPC endpoints/PrivateLink for private connectivity.
42. Show security boundaries between tiers (DMZ, trusted zones).
43. Label auth flows: "IAM Role", "JWT", "mTLS", "API Key".

MONITORING & OBSERVABILITY (CRITICAL):
44. Show CloudWatch/Stackdriver/Azure Monitor for metrics.
45. Show X-Ray/Cloud Trace for distributed tracing.
46. Show centralized logging (CloudWatch Logs, ELK, Splunk).
47. Show alerting (PagerDuty, OpsGenie, SNS alerts).
48. Show dashboards (Grafana, CloudWatch Dashboards).
49. Show health checks and synthetic monitoring.
50. Label monitoring paths with dashed lines.

MULTI-CLOUD & HYBRID CONNECTIVITY (if relevant):
51. Show VPN tunnels between clouds (AWS-GCP, AWS-Azure).
52. Show cloud interconnect (Direct Connect, ExpressRoute, Cloud Interconnect).
53. Show Transit Gateway/Cloud Router for multi-VPC routing.
54. Show on-premises data center with hybrid connectivity.
55. Show cross-cloud service integration (e.g., GCP BigQuery + AWS S3).
56. Label bandwidth and latency requirements.

EDGE CASES & RESILIENCE (CRITICAL for senior interviews):
57. Show circuit breakers for fault tolerance.
58. Show retry queues and exponential backoff paths.
59. Show disaster recovery (DR) region with replication.
60. Show failover paths (active-passive or active-active).
61. Show rate limiting and throttling at API Gateway.
62. Show bulkhead patterns for isolation.
63. Show graceful degradation paths.

Add meaningful labels with annotations showing purpose:
- "Redis\\n(Session + Cache)"
- "Kafka\\n(Event Stream)"
- "PostgreSQL\\n(Primary, Multi-AZ)"
- "S3\\n(User Uploads)"
- "CloudFront\\n(Static + API Cache)"

IMPORT REFERENCE:

GCP:
from diagrams.gcp.compute import GKE, GCE, Run, Functions
from diagrams.gcp.database import Spanner, SQL, Memorystore, Firestore, BigQuery
from diagrams.gcp.network import LoadBalancing, CDN, DNS, Armor, VPC
from diagrams.gcp.storage import GCS, Filestore
from diagrams.gcp.ml import AIPlatform, AutoML
from diagrams.gcp.analytics import BigQuery, Dataflow, PubSub, Dataproc, Composer
from diagrams.gcp.security import Iam, KMS
from diagrams.gcp.operations import Monitoring, Logging

AWS:
from diagrams.aws.compute import EC2, ECS, EKS, Lambda, Fargate
from diagrams.aws.database import RDS, Aurora, DynamoDB, ElastiCache, Redshift
from diagrams.aws.network import ELB, ALB, NLB, CloudFront, Route53, VPC, APIGateway
from diagrams.aws.storage import S3, EFS, FSx
from diagrams.aws.ml import Sagemaker
from diagrams.aws.analytics import Kinesis, Athena, EMRCluster, Glue
from diagrams.aws.security import IAM, KMS, WAF
from diagrams.aws.integration import SQS, SNS, Eventbridge
from diagrams.aws.management import Cloudwatch

Azure:
from diagrams.azure.compute import AKS, VM, FunctionApps, ContainerInstances
from diagrams.azure.database import CosmosDb, SQLDatabases, CacheForRedis
from diagrams.azure.network import LoadBalancers, FrontDoors, ApplicationGateway, VirtualNetworks
from diagrams.azure.storage import StorageAccounts, BlobStorage, DataLakeStorage
from diagrams.azure.analytics import Databricks, EventHubs, SynapseAnalytics
from diagrams.azure.security import KeyVaults
from diagrams.azure.monitor import Monitor

Kubernetes:
from diagrams.k8s.compute import Pod, Deploy, RS, Job, STS
from diagrams.k8s.network import Ing, SVC
from diagrams.k8s.storage import PV, PVC, SC
from diagrams.k8s.clusterconfig import HPA

Generic (for multi-cloud):
from diagrams.generic.compute import Rack
from diagrams.generic.database import SQL as GenericSQL
from diagrams.generic.network import Firewall
from diagrams.generic.storage import Storage
from diagrams.onprem.client import Users, Client
from diagrams.onprem.network import Internet

Example output format (this is the ONLY thing you should output):

from diagrams import Diagram, Cluster, Edge
from diagrams.gcp.compute import GKE
from diagrams.gcp.network import LoadBalancing
from diagrams.gcp.database import SQL

with Diagram("GKE Architecture", filename=DIAGRAM_FILENAME, outformat=DIAGRAM_FORMAT, show=False, direction="LR"):
    lb = LoadBalancing("Load Balancer")
    with Cluster("GKE Cluster"):
        gke = GKE("GKE")
    db = SQL("Cloud SQL")
    lb >> gke >> db
"""

USER_PROMPT_OVERVIEW = """Generate a CLEAN, EXPLAINABLE Python diagram for this system design interview question:

Question: {question}
Cloud Provider: {cloud_provider}

OVERVIEW DIAGRAM REQUIREMENTS (for initial interview explanation):
- 10-15 nodes MAXIMUM - keep it simple and explainable
- Show ONLY the core components: Users, CDN, Load Balancer, App Servers, Cache, Database, Storage
- Use clear left-to-right flow (direction="LR")
- Group into 3 clusters max: Ingress, Application, Data
- Label key connections only: "HTTPS", "Read/Write", "Cache"
- NO security details, NO monitoring, NO edge cases
- This diagram should be explainable in 2-3 minutes

Remember: ONLY output valid Python code. Use filename=DIAGRAM_FILENAME and outformat=DIAGRAM_FORMAT and show=False. Use real {cloud_provider} service icons. Keep it SIMPLE and CLEAR."""

USER_PROMPT_DETAILED = """Generate a COMPREHENSIVE Python diagram for this system design interview question:

Question: {question}
Cloud Provider: {cloud_provider}
Difficulty: {difficulty}
Category: {category}

REQUIREMENTS FOR INTERVIEW-READY DIAGRAM:
- 25-40 nodes showing ALL major components (not a simplified overview)
- Include: Load Balancers, CDN, API Gateway, Application Servers, Caches, Databases (primary + replicas), Message Queues, Workers, Object Storage, Search, Monitoring
- Show data flow with labeled edges (e.g., "REST API", "gRPC", "Events", "Metrics")
- Group into logical clusters: Ingress, Application Tier, Data Tier, Async Processing, Observability
- Show both read and write paths if different
- Include HA/redundancy where appropriate

NETWORKING (MUST INCLUDE):
- VPC with public/private subnets
- DNS (Route53/Cloud DNS) at entry
- Internet Gateway, NAT Gateway
- Firewalls/WAF/Security Groups
- Internal load balancers between tiers
- Label all network paths with protocols

MESSAGING (MUST INCLUDE for async):
- SNS topics for fan-out notifications
- SQS queues for async processing with DLQ
- EventBridge for event routing
- Show pattern: Producer → SNS → SQS → Worker
- Label message types (Events, Commands, etc.)

SECURITY (MUST INCLUDE):
- IAM roles for service auth
- KMS for encryption, Secrets Manager for credentials
- WAF, Shield for DDoS protection
- VPC endpoints/PrivateLink for private access
- Label auth: "IAM Role", "JWT", "mTLS"

MONITORING (MUST INCLUDE):
- CloudWatch/Prometheus for metrics
- X-Ray/Jaeger for distributed tracing
- Centralized logging (ELK/CloudWatch Logs)
- Alerting (PagerDuty, SNS alerts)
- Health checks, dashboards

MULTI-CLOUD & ON-PREM (if relevant):
- VPN/Direct Connect to on-premises
- Cross-cloud connectivity (Transit Gateway)
- Hybrid architecture patterns
- DR region with replication

EDGE CASES & RESILIENCE:
- Circuit breakers, retry queues
- Failover paths (DR region)
- Rate limiting at API Gateway
- Graceful degradation paths

Remember: ONLY output valid Python code. Use filename=DIAGRAM_FILENAME and outformat=DIAGRAM_FORMAT and show=False. Use real {cloud_provider} service icons. This diagram must support deep-dive interview questions."""

RETRY_PROMPT_TEMPLATE = """The previous diagram code failed with this error:
{error_message}

Original code:
{original_code}

Fix the code. Common issues: wrong import paths, nonexistent node names, syntax errors.
Output ONLY the fixed Python code.
Use filename=DIAGRAM_FILENAME and outformat=DIAGRAM_FORMAT and show=False."""


# Security patterns to block
BLOCKED_PATTERNS = [
    r'\bos\.system\b',
    r'\bsubprocess\b',
    r'\b__import__\b',
    r'\beval\s*\(',
    r'\bexec\s*\(',
    r'\bopen\s*\(',
    r'\bshutil\b',
    r'\brequests\b',
    r'\burllib\b',
    r'\bsocket\b',
    r'\bimport\s+sys\b',
    r'\bsys\.',
    r'\bcompile\s*\(',
    r'\bglobals\s*\(',
    r'\blocals\s*\(',
    r'\bgetattr\s*\(',
    r'\bsetattr\s*\(',
    r'\bdelattr\s*\(',
    r'\b__builtins__\b',
    r'\b__class__\b',
    r'\b__bases__\b',
    r'\b__subclasses__\b',
]


def detect_cloud_provider(question: str) -> str:
    """Auto-detect cloud provider from question text."""
    question_lower = question.lower()

    gcp_keywords = ['gcp', 'gke', 'cloud spanner', 'bigquery', 'pub/sub', 'pubsub', 'tpu',
                    'google cloud', 'cloud run', 'cloud functions', 'gcs', 'memorystore',
                    'cloud sql', 'dataflow', 'dataproc', 'vertex ai', 'anthos']
    aws_keywords = ['aws', 'eks', 'ec2', 's3', 'lambda', 'dynamodb', 'amazon', 'rds',
                    'aurora', 'elasticache', 'cloudfront', 'route53', 'sagemaker',
                    'kinesis', 'sqs', 'sns', 'fargate', 'ecs']
    azure_keywords = ['azure', 'aks', 'cosmos', 'blob storage', 'synapse', 'microsoft',
                      'azure functions', 'event hubs', 'service bus', 'azure sql']

    gcp_count = sum(1 for kw in gcp_keywords if kw in question_lower)
    aws_count = sum(1 for kw in aws_keywords if kw in question_lower)
    azure_count = sum(1 for kw in azure_keywords if kw in question_lower)

    if gcp_count > aws_count and gcp_count > azure_count:
        return 'gcp'
    elif aws_count > gcp_count and aws_count > azure_count:
        return 'aws'
    elif azure_count > gcp_count and azure_count > aws_count:
        return 'azure'
    else:
        # Default to GCP or multi-cloud
        return 'gcp'


def sanitize_code(code: str) -> str:
    """Security check - block dangerous patterns."""
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, code, re.IGNORECASE):
            raise SecurityError(f"Blocked dangerous pattern: {pattern}")

    # Check imports - only allow diagrams package
    import_lines = re.findall(r'^(?:from|import)\s+(\S+)', code, re.MULTILINE)
    for imp in import_lines:
        if not imp.startswith('diagrams'):
            raise SecurityError(f"Blocked non-diagrams import: {imp}")

    return code


class SecurityError(Exception):
    """Raised when code contains blocked patterns."""
    pass


class CapraDiagramEngine:
    """
    Generates cloud architecture diagrams using mingrammer/diagrams library.
    Flow: Interview question → Claude API → Python code → sandboxed exec → PNG
    """

    def __init__(self, anthropic_api_key: str, output_dir: str = "/tmp/capra_diagrams"):
        self.client = Anthropic(api_key=anthropic_api_key)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.model = "claude-sonnet-4-20250514"

    def generate(
        self,
        question: str,
        cloud_provider: str = "auto",
        difficulty: str = "medium",
        category: str = "System Design",
        output_format: str = "png",
        detail_level: str = "overview"  # "overview" or "detailed"
    ) -> DiagramResult:
        """Generate a cloud architecture diagram from a system design question."""

        # Auto-detect cloud provider if needed
        if cloud_provider == "auto" or not cloud_provider:
            cloud_provider = detect_cloud_provider(question)

        # Generate unique filename
        diagram_id = f"capra_{uuid.uuid4().hex[:12]}"
        output_path = self.output_dir / diagram_id

        # Select prompt based on detail level
        if detail_level == "detailed":
            user_prompt = USER_PROMPT_DETAILED.format(
                question=question,
                cloud_provider=cloud_provider.upper(),
                difficulty=difficulty,
                category=category
            )
        else:
            # Default to overview (simple, explainable)
            user_prompt = USER_PROMPT_OVERVIEW.format(
                question=question,
                cloud_provider=cloud_provider.upper()
            )

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}]
            )

            python_code = response.content[0].text.strip()

            # Remove any markdown code blocks if present
            python_code = re.sub(r'^```python\s*\n?', '', python_code)
            python_code = re.sub(r'^```\s*\n?', '', python_code)
            python_code = re.sub(r'\n?```\s*$', '', python_code)
            python_code = python_code.strip()

        except Exception as e:
            return DiagramResult(
                image_path="",
                python_code="",
                explanation="",
                cloud_provider=cloud_provider,
                question=question,
                success=False,
                error=f"Claude API error: {str(e)}"
            )

        # Try to execute the code with retries
        max_retries = 2
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                # Sanitize code
                sanitize_code(python_code)

                # Execute code
                image_path = self._execute_diagram_code(
                    python_code,
                    str(output_path),
                    output_format
                )

                return DiagramResult(
                    image_path=image_path,
                    python_code=python_code,
                    explanation=f"Architecture diagram for: {question[:100]}...",
                    cloud_provider=cloud_provider,
                    question=question,
                    success=True
                )

            except (SecurityError, Exception) as e:
                last_error = str(e)

                if attempt < max_retries:
                    # Retry with error context
                    retry_prompt = RETRY_PROMPT_TEMPLATE.format(
                        error_message=last_error,
                        original_code=python_code
                    )

                    try:
                        response = self.client.messages.create(
                            model=self.model,
                            max_tokens=2048,
                            system=SYSTEM_PROMPT,
                            messages=[{"role": "user", "content": retry_prompt}]
                        )
                        python_code = response.content[0].text.strip()
                        python_code = re.sub(r'^```python\s*\n?', '', python_code)
                        python_code = re.sub(r'^```\s*\n?', '', python_code)
                        python_code = re.sub(r'\n?```\s*$', '', python_code)
                        python_code = python_code.strip()
                    except:
                        pass  # Continue with retry loop

        return DiagramResult(
            image_path="",
            python_code=python_code,
            explanation="",
            cloud_provider=cloud_provider,
            question=question,
            success=False,
            error=f"Failed after {max_retries + 1} attempts: {last_error}"
        )

    def _execute_diagram_code(
        self,
        code: str,
        output_path: str,
        output_format: str
    ) -> str:
        """Execute diagram code in sandboxed subprocess."""

        # Inject variables at the top of the code
        injected_code = f'''DIAGRAM_FILENAME = "{output_path}"
DIAGRAM_FORMAT = "{output_format}"

{code}
'''

        # Write to temp file
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix='.py',
            delete=False,
            dir=self.output_dir
        ) as f:
            f.write(injected_code)
            temp_file = f.name

        try:
            # Execute with timeout
            result = subprocess.run(
                [sys.executable, temp_file],
                capture_output=True,
                text=True,
                timeout=60,
                cwd=str(self.output_dir)
            )

            if result.returncode != 0:
                raise RuntimeError(f"Diagram generation failed: {result.stderr}")

            # Check if output file exists
            expected_file = f"{output_path}.{output_format}"
            if not os.path.exists(expected_file):
                raise RuntimeError(f"Output file not created: {expected_file}")

            return expected_file

        finally:
            # Cleanup temp file
            try:
                os.unlink(temp_file)
            except:
                pass


def main():
    """CLI interface for diagram generation."""
    parser = argparse.ArgumentParser(description='Generate cloud architecture diagrams')
    parser.add_argument('--question', '-q', required=True, help='System design question')
    parser.add_argument('--provider', '-p', default='auto', help='Cloud provider (gcp/aws/azure/auto)')
    parser.add_argument('--difficulty', '-d', default='medium', help='Difficulty level')
    parser.add_argument('--category', '-c', default='System Design', help='Category')
    parser.add_argument('--format', '-f', default='png', help='Output format (png/svg)')
    parser.add_argument('--output-dir', '-o', default='/tmp/capra_diagrams', help='Output directory')
    parser.add_argument('--api-key', '-k', help='Anthropic API key (or set ANTHROPIC_API_KEY env)')
    parser.add_argument('--detail-level', '-l', default='overview', choices=['overview', 'detailed'],
                        help='Diagram detail level: overview (simple) or detailed (comprehensive)')

    args = parser.parse_args()

    # Get API key
    api_key = args.api_key or os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print(json.dumps({
            "success": False,
            "error": "ANTHROPIC_API_KEY not set"
        }))
        sys.exit(1)

    # Generate diagram
    engine = CapraDiagramEngine(api_key, args.output_dir)
    result = engine.generate(
        question=args.question,
        cloud_provider=args.provider,
        difficulty=args.difficulty,
        category=args.category,
        output_format=args.format,
        detail_level=args.detail_level
    )

    # Output as JSON
    print(json.dumps(asdict(result)))


if __name__ == '__main__':
    main()
