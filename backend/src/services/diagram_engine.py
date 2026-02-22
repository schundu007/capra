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
SYSTEM_PROMPT = """You are a cloud architecture diagram generator for an interview preparation tool called Capra.

Your job: Given a system design interview question, generate Python code using the `diagrams` library (by mingrammer) that creates a professional cloud architecture diagram.

CRITICAL RULES:
1. ONLY output valid Python code — no markdown, no explanations, no backticks, no ```python blocks.
2. Use the correct cloud provider icons based on the specified provider.
3. Use `show=False` — diagrams will be rendered server-side.
4. Use the provided `filename` variable: filename=DIAGRAM_FILENAME
5. Use the provided format variable: outformat=DIAGRAM_FORMAT
6. Keep diagrams clean — use hub-and-spoke patterns, NOT point-to-point spaghetti.
7. Group related services into Clusters — VPCs, subnets, AZs, regions, logical tiers.
8. Limit connections — use 1 arrow between clusters, not individual node-to-node lines.
9. Use direction="LR" or direction="TB" based on complexity.
10. Maximum 15-20 nodes — summarize, don't enumerate every microservice.
11. Add meaningful labels with brief annotations (e.g., "Redis\\n(Session Cache)").
12. Maximum 8-10 connection lines in the entire diagram.
13. Use Edge(label="...") for important connections, Edge(style="dashed") for monitoring/logging.
14. Start with required imports, then the Diagram context manager.

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

USER_PROMPT_TEMPLATE = """Generate a Python diagram for this interview question:

Question: {question}
Cloud Provider: {cloud_provider}
Difficulty: {difficulty}
Category: {category}

Remember: ONLY output valid Python code. Use filename=DIAGRAM_FILENAME and outformat=DIAGRAM_FORMAT and show=False. Keep it clean: max 15-20 nodes, hub-and-spoke connections, proper clustering. Use real {cloud_provider} service icons."""

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
        output_format: str = "png"
    ) -> DiagramResult:
        """Generate a cloud architecture diagram from a system design question."""

        # Auto-detect cloud provider if needed
        if cloud_provider == "auto" or not cloud_provider:
            cloud_provider = detect_cloud_provider(question)

        # Generate unique filename
        diagram_id = f"capra_{uuid.uuid4().hex[:12]}"
        output_path = self.output_dir / diagram_id

        # Call Claude to generate diagram code
        user_prompt = USER_PROMPT_TEMPLATE.format(
            question=question,
            cloud_provider=cloud_provider.upper(),
            difficulty=difficulty,
            category=category
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
        output_format=args.format
    )

    # Output as JSON
    print(json.dumps(asdict(result)))


if __name__ == '__main__':
    main()
