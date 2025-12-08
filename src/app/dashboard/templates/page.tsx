'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Database, 
  Cloud, 
  Server, 
  Container, 
  Lock, 
  Search,
  Eye,
  Plus,
  X,
  Loader2,
  HardDrive,
  Zap
} from "lucide-react";

// Template data with full runbook content
const templates = [
  {
    id: 'postgres-ha-patroni',
    title: 'PostgreSQL HA with Patroni',
    description: 'Enterprise-grade high availability PostgreSQL cluster using Patroni, etcd, and HAProxy',
    icon: Database,
    category: 'Database',
    color: 'from-teal-500 to-emerald-500',
    tags: ['PostgreSQL', 'Patroni', 'HA', 'etcd'],
    difficulty: 'Advanced',
    estimatedTime: '2-3 hours',
    sections: [
      {
        id: 'sec_overview',
        title: 'Overview',
        blocks: [
          {
            id: 'blk_arch',
            type: 'twocolumn',
            leftTitle: 'Primary Datacenter',
            leftColor: 'emerald',
            leftContent: '<ul><li><strong>patroni-01</strong> - Primary PostgreSQL</li><li><strong>patroni-02</strong> - Sync Standby</li><li><strong>etcd-01</strong> - Consensus</li></ul>',
            rightTitle: 'DR Site',
            rightColor: 'amber',
            rightContent: '<ul><li><strong>patroni-03</strong> - Async Replica</li><li>WAN Replication</li><li>pgBackRest Backups</li></ul>'
          },
          {
            id: 'blk_servers',
            type: 'servertable',
            servers: [
              { hostname: 'patroni-01', role: 'Primary', roleColor: 'green', ip: '10.0.1.10', region: 'us-east-1', components: 'PostgreSQL 15, Patroni, HAProxy' },
              { hostname: 'patroni-02', role: 'Sync Standby', roleColor: 'blue', ip: '10.0.1.11', region: 'us-east-1', components: 'PostgreSQL 15, Patroni, HAProxy' },
              { hostname: 'patroni-03', role: 'Async Replica', roleColor: 'amber', ip: '10.0.2.10', region: 'us-west-2', components: 'PostgreSQL 15, Patroni' },
              { hostname: 'etcd-01', role: 'etcd', roleColor: 'violet', ip: '10.0.1.20', region: 'us-east-1', components: 'etcd 3.5' }
            ]
          },
          {
            id: 'blk_ports',
            type: 'portref',
            ports: [
              { name: 'PostgreSQL', port: '5432', color: 'teal' },
              { name: 'HAProxy R/W', port: '5000', color: 'green' },
              { name: 'HAProxy R/O', port: '5001', color: 'blue' },
              { name: 'Patroni API', port: '8008', color: 'amber' },
              { name: 'etcd Client', port: '2379', color: 'violet' }
            ]
          }
        ]
      },
      {
        id: 'sec_prereq',
        title: 'Prerequisites',
        blocks: [
          {
            id: 'blk_req_table',
            type: 'table',
            tableData: {
              headers: ['Requirement', 'Specification'],
              rows: [
                ['Operating System', 'Ubuntu 22.04 LTS'],
                ['RAM', '8GB minimum per node'],
                ['Storage', '100GB SSD'],
                ['Network', 'Private network between nodes']
              ]
            }
          },
          {
            id: 'blk_step1',
            type: 'step',
            title: 'Update System Packages',
            content: 'Ensure all nodes are updated with the latest security patches.',
            tags: ['All Nodes']
          },
          {
            id: 'blk_code1',
            type: 'code',
            language: 'bash',
            content: '# Update package lists and upgrade\nsudo apt update && sudo apt upgrade -y\n\n# Install common dependencies\nsudo apt install -y wget curl gnupg2 lsb-release',
            tags: ['All Nodes']
          }
        ]
      },
      {
        id: 'sec_install',
        title: 'Install PostgreSQL & Patroni',
        blocks: [
          {
            id: 'blk_step2',
            type: 'step',
            title: 'Add PostgreSQL Repository',
            content: 'Add the official PostgreSQL APT repository for the latest version.',
            tags: ['All Nodes']
          },
          {
            id: 'blk_code2',
            type: 'code',
            language: 'bash',
            content: '# Add PostgreSQL repository\nsudo sh -c \'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list\'\n\n# Import repository key\nwget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -\n\n# Update and install PostgreSQL\nsudo apt update\nsudo apt install -y postgresql-15 postgresql-contrib-15',
            tags: ['All Nodes']
          },
          {
            id: 'blk_step3',
            type: 'step',
            title: 'Install Patroni',
            content: 'Install Patroni and its dependencies using pip.',
            tags: ['All Nodes']
          },
          {
            id: 'blk_code3',
            type: 'code',
            language: 'bash',
            content: '# Install Python and pip\nsudo apt install -y python3-pip python3-dev\n\n# Install Patroni with etcd support\nsudo pip3 install patroni[etcd] psycopg2-binary',
            tags: ['All Nodes']
          }
        ]
      },
      {
        id: 'sec_verify',
        title: 'Verification',
        blocks: [
          {
            id: 'blk_step_v1',
            type: 'step',
            title: 'Check Cluster Status',
            content: 'Verify the Patroni cluster is healthy and all nodes are connected.',
            tags: ['Any Node']
          },
          {
            id: 'blk_code_v1',
            type: 'code',
            language: 'bash',
            content: '# Check Patroni cluster status\npatronictl -c /etc/patroni/patroni.yml list\n\n# Check PostgreSQL replication\nsudo -u postgres psql -c "SELECT * FROM pg_stat_replication;"',
            tags: ['Primary']
          }
        ]
      }
    ]
  },
  {
    id: 'kubernetes-deployment',
    title: 'Kubernetes Application Deployment',
    description: 'Deploy containerized applications to Kubernetes with best practices',
    icon: Container,
    category: 'DevOps',
    color: 'from-sky-500 to-blue-500',
    tags: ['Kubernetes', 'Docker', 'Deployment', 'Helm'],
    difficulty: 'Intermediate',
    estimatedTime: '1-2 hours',
    sections: [
      {
        id: 'sec_overview',
        title: 'Overview',
        blocks: [
          {
            id: 'blk_info',
            type: 'info',
            content: 'This runbook covers deploying a containerized application to Kubernetes including ConfigMaps, Secrets, Deployments, and Services.'
          },
          {
            id: 'blk_infocards',
            type: 'infocards',
            infocards: [
              { title: 'NAMESPACE', content: 'production', color: 'blue' },
              { title: 'REPLICAS', content: '3', color: 'green' },
              { title: 'IMAGE', content: 'app:v1.0.0', color: 'violet' }
            ]
          }
        ]
      },
      {
        id: 'sec_deploy',
        title: 'Deploy Application',
        blocks: [
          {
            id: 'blk_step1',
            type: 'step',
            title: 'Create Namespace',
            content: 'Create a dedicated namespace for the application.',
            tags: ['kubectl']
          },
          {
            id: 'blk_code1',
            type: 'code',
            language: 'bash',
            content: '# Create namespace\nkubectl create namespace production\n\n# Set as default context\nkubectl config set-context --current --namespace=production',
            tags: ['kubectl']
          },
          {
            id: 'blk_step2',
            type: 'step',
            title: 'Apply Deployment',
            content: 'Deploy the application with the specified replica count.',
            tags: ['kubectl']
          },
          {
            id: 'blk_code2',
            type: 'code',
            language: 'yaml',
            content: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: myapp\n  namespace: production\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: myapp\n  template:\n    metadata:\n      labels:\n        app: myapp\n    spec:\n      containers:\n      - name: myapp\n        image: myapp:v1.0.0\n        ports:\n        - containerPort: 8080',
            tags: ['kubectl']
          }
        ]
      }
    ]
  },
  {
    id: 'docker-compose-stack',
    title: 'Docker Compose Full Stack',
    description: 'Multi-container application with web server, API, database, and cache',
    icon: Container,
    category: 'DevOps',
    color: 'from-blue-500 to-indigo-500',
    tags: ['Docker', 'Compose', 'Nginx', 'Redis'],
    difficulty: 'Beginner',
    estimatedTime: '30-45 min',
    sections: [
      {
        id: 'sec_overview',
        title: 'Stack Overview',
        blocks: [
          {
            id: 'blk_ports',
            type: 'portref',
            ports: [
              { name: 'Nginx (Web)', port: '80', color: 'green' },
              { name: 'API Server', port: '3000', color: 'blue' },
              { name: 'PostgreSQL', port: '5432', color: 'teal' },
              { name: 'Redis', port: '6379', color: 'red' }
            ]
          },
          {
            id: 'blk_dirs',
            type: 'infocards',
            infocards: [
              { title: 'APP', content: './app', color: 'blue' },
              { title: 'NGINX', content: './nginx', color: 'green' },
              { title: 'DATA', content: './data/postgres', color: 'teal' }
            ]
          }
        ]
      },
      {
        id: 'sec_setup',
        title: 'Setup & Deploy',
        blocks: [
          {
            id: 'blk_step1',
            type: 'step',
            title: 'Create Docker Compose File',
            content: 'Create the docker-compose.yml with all services defined.',
            tags: ['Local']
          },
          {
            id: 'blk_code1',
            type: 'code',
            language: 'yaml',
            content: 'version: "3.8"\n\nservices:\n  nginx:\n    image: nginx:alpine\n    ports:\n      - "80:80"\n    volumes:\n      - ./nginx/nginx.conf:/etc/nginx/nginx.conf\n    depends_on:\n      - api\n\n  api:\n    build: ./app\n    environment:\n      - DATABASE_URL=postgresql://postgres:secret@db:5432/app\n      - REDIS_URL=redis://redis:6379\n    depends_on:\n      - db\n      - redis\n\n  db:\n    image: postgres:15-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: app\n    volumes:\n      - ./data/postgres:/var/lib/postgresql/data\n\n  redis:\n    image: redis:alpine',
            tags: ['Local']
          },
          {
            id: 'blk_step2',
            type: 'step',
            title: 'Start the Stack',
            content: 'Build and start all containers.',
            tags: ['Local']
          },
          {
            id: 'blk_code2',
            type: 'code',
            language: 'bash',
            content: '# Build and start in detached mode\ndocker-compose up -d --build\n\n# Check status\ndocker-compose ps\n\n# View logs\ndocker-compose logs -f',
            tags: ['Local']
          }
        ]
      }
    ]
  },
  {
    id: 'aws-ec2-setup',
    title: 'AWS EC2 Instance Setup',
    description: 'Launch, configure, and secure EC2 instances with best practices',
    icon: Cloud,
    category: 'Cloud',
    color: 'from-orange-500 to-amber-500',
    tags: ['AWS', 'EC2', 'Security Groups', 'IAM'],
    difficulty: 'Intermediate',
    estimatedTime: '1 hour',
    sections: [
      {
        id: 'sec_prereq',
        title: 'Prerequisites',
        blocks: [
          {
            id: 'blk_table',
            type: 'table',
            tableData: {
              headers: ['Item', 'Value'],
              rows: [
                ['AWS CLI', 'v2.x installed and configured'],
                ['IAM Permissions', 'EC2FullAccess or equivalent'],
                ['Key Pair', 'SSH key pair created in target region'],
                ['VPC', 'Default or custom VPC configured']
              ]
            }
          }
        ]
      },
      {
        id: 'sec_launch',
        title: 'Launch Instance',
        blocks: [
          {
            id: 'blk_step1',
            type: 'step',
            title: 'Create Security Group',
            content: 'Create a security group with necessary inbound rules.',
            tags: ['AWS CLI']
          },
          {
            id: 'blk_code1',
            type: 'code',
            language: 'bash',
            content: '# Create security group\naws ec2 create-security-group \\\n  --group-name web-server-sg \\\n  --description "Web server security group"\n\n# Allow SSH\naws ec2 authorize-security-group-ingress \\\n  --group-name web-server-sg \\\n  --protocol tcp \\\n  --port 22 \\\n  --cidr 0.0.0.0/0\n\n# Allow HTTP\naws ec2 authorize-security-group-ingress \\\n  --group-name web-server-sg \\\n  --protocol tcp \\\n  --port 80 \\\n  --cidr 0.0.0.0/0',
            tags: ['AWS CLI']
          },
          {
            id: 'blk_step2',
            type: 'step',
            title: 'Launch EC2 Instance',
            content: 'Launch an Ubuntu instance with the created security group.',
            tags: ['AWS CLI']
          },
          {
            id: 'blk_code2',
            type: 'code',
            language: 'bash',
            content: '# Launch EC2 instance\naws ec2 run-instances \\\n  --image-id ami-0c55b159cbfafe1f0 \\\n  --instance-type t3.medium \\\n  --key-name my-key-pair \\\n  --security-groups web-server-sg \\\n  --tag-specifications \'ResourceType=instance,Tags=[{Key=Name,Value=web-server}]\' \\\n  --count 1',
            tags: ['AWS CLI']
          }
        ]
      }
    ]
  },
  {
    id: 'nginx-reverse-proxy',
    title: 'Nginx Reverse Proxy',
    description: 'Configure Nginx as a reverse proxy with SSL termination',
    icon: Server,
    category: 'Web Server',
    color: 'from-green-500 to-emerald-500',
    tags: ['Nginx', 'SSL', 'Proxy', 'Let\'s Encrypt'],
    difficulty: 'Intermediate',
    estimatedTime: '45 min',
    sections: [
      {
        id: 'sec_install',
        title: 'Install Nginx',
        blocks: [
          {
            id: 'blk_step1',
            type: 'step',
            title: 'Install Nginx',
            content: 'Install Nginx from the official Ubuntu repository.',
            tags: ['All Servers']
          },
          {
            id: 'blk_code1',
            type: 'code',
            language: 'bash',
            content: '# Install Nginx\nsudo apt update\nsudo apt install -y nginx\n\n# Start and enable\nsudo systemctl start nginx\nsudo systemctl enable nginx',
            tags: ['All Servers']
          }
        ]
      },
      {
        id: 'sec_config',
        title: 'Configure Reverse Proxy',
        blocks: [
          {
            id: 'blk_step2',
            type: 'step',
            title: 'Create Server Block',
            content: 'Configure Nginx to proxy requests to the backend application.',
            tags: ['Proxy Server']
          },
          {
            id: 'blk_code2',
            type: 'code',
            language: 'bash',
            content: 'server {\n    listen 80;\n    server_name example.com;\n\n    location / {\n        proxy_pass http://localhost:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection \'upgrade\';\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_cache_bypass $http_upgrade;\n    }\n}',
            tags: ['Proxy Server']
          },
          {
            id: 'blk_step3',
            type: 'step',
            title: 'Install SSL Certificate',
            content: 'Use Certbot to obtain and configure Let\'s Encrypt SSL certificate.',
            tags: ['Proxy Server']
          },
          {
            id: 'blk_code3',
            type: 'code',
            language: 'bash',
            content: '# Install Certbot\nsudo apt install -y certbot python3-certbot-nginx\n\n# Obtain certificate\nsudo certbot --nginx -d example.com -d www.example.com\n\n# Test auto-renewal\nsudo certbot renew --dry-run',
            tags: ['Proxy Server']
          }
        ]
      }
    ]
  },
  {
    id: 'ssl-certificate-setup',
    title: 'SSL/TLS Certificate Management',
    description: 'Generate, install, and manage SSL certificates',
    icon: Lock,
    category: 'Security',
    color: 'from-violet-500 to-purple-500',
    tags: ['SSL', 'TLS', 'Certificates', 'Security'],
    difficulty: 'Beginner',
    estimatedTime: '30 min',
    sections: [
      {
        id: 'sec_overview',
        title: 'Certificate Types',
        blocks: [
          {
            id: 'blk_table',
            type: 'table',
            tableData: {
              headers: ['Type', 'Use Case', 'Validity'],
              rows: [
                ['Let\'s Encrypt', 'Public websites', '90 days'],
                ['Self-Signed', 'Internal/Dev', 'Custom'],
                ['Commercial CA', 'Enterprise', '1-2 years']
              ]
            }
          }
        ]
      },
      {
        id: 'sec_letsencrypt',
        title: 'Let\'s Encrypt Setup',
        blocks: [
          {
            id: 'blk_step1',
            type: 'step',
            title: 'Install Certbot',
            content: 'Install Certbot and the appropriate plugin for your web server.',
            tags: ['Web Server']
          },
          {
            id: 'blk_code1',
            type: 'code',
            language: 'bash',
            content: '# For Nginx\nsudo apt install certbot python3-certbot-nginx\n\n# For Apache\nsudo apt install certbot python3-certbot-apache\n\n# Standalone\nsudo apt install certbot',
            tags: ['Web Server']
          }
        ]
      }
    ]
  },
  {
    id: 'pgbackrest-backup',
    title: 'pgBackRest Backup & Recovery',
    description: 'Enterprise PostgreSQL backup with pgBackRest to S3',
    icon: HardDrive,
    category: 'Database',
    color: 'from-cyan-500 to-teal-500',
    tags: ['PostgreSQL', 'pgBackRest', 'S3', 'Backup'],
    difficulty: 'Advanced',
    estimatedTime: '1-2 hours',
    sections: [
      {
        id: 'sec_overview',
        title: 'Backup Strategy',
        blocks: [
          {
            id: 'blk_table',
            type: 'table',
            tableData: {
              headers: ['Backup Type', 'Frequency', 'Retention'],
              rows: [
                ['Full', 'Weekly (Sunday)', '4 weeks'],
                ['Differential', 'Daily', '7 days'],
                ['Incremental', 'Hourly', '24 hours'],
                ['WAL Archive', 'Continuous', '7 days']
              ]
            }
          }
        ]
      },
      {
        id: 'sec_install',
        title: 'Install pgBackRest',
        blocks: [
          {
            id: 'blk_step1',
            type: 'step',
            title: 'Install pgBackRest',
            content: 'Install pgBackRest from PostgreSQL repository.',
            tags: ['DB Servers']
          },
          {
            id: 'blk_code1',
            type: 'code',
            language: 'bash',
            content: '# Install pgBackRest\nsudo apt install -y pgbackrest\n\n# Create configuration directory\nsudo mkdir -p /etc/pgbackrest\nsudo chown postgres:postgres /etc/pgbackrest',
            tags: ['DB Servers']
          }
        ]
      }
    ]
  },
  {
    id: 'incident-response',
    title: 'Incident Response Playbook',
    description: 'Structured approach to handling production incidents',
    icon: Zap,
    category: 'Operations',
    color: 'from-red-500 to-rose-500',
    tags: ['Incident', 'On-Call', 'Response', 'Postmortem'],
    difficulty: 'Intermediate',
    estimatedTime: 'Ongoing',
    sections: [
      {
        id: 'sec_severity',
        title: 'Severity Levels',
        blocks: [
          {
            id: 'blk_table',
            type: 'table',
            tableData: {
              headers: ['Level', 'Description', 'Response Time'],
              rows: [
                ['SEV1', 'Complete outage', '< 15 minutes'],
                ['SEV2', 'Major degradation', '< 30 minutes'],
                ['SEV3', 'Minor impact', '< 2 hours'],
                ['SEV4', 'Low priority', 'Next business day']
              ]
            }
          }
        ]
      },
      {
        id: 'sec_response',
        title: 'Response Steps',
        blocks: [
          {
            id: 'blk_step1',
            type: 'step',
            title: 'Acknowledge & Assess',
            content: 'Acknowledge the alert and perform initial assessment of impact.',
            tags: ['On-Call']
          },
          {
            id: 'blk_step2',
            type: 'step',
            title: 'Communicate',
            content: 'Update status page and notify stakeholders.',
            tags: ['On-Call']
          },
          {
            id: 'blk_warning',
            type: 'warning',
            content: 'Never make changes to production without documenting them first. All changes should be reversible.'
          }
        ]
      }
    ]
  }
];

const categories = ['All', 'Database', 'DevOps', 'Cloud', 'Web Server', 'Security', 'Operations'];

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: typeof templates[0]) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/runbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          sections: template.sections,
          is_public: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/runbooks/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to create runbook:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <BookOpen className="text-sky-400" />
          Browse Templates
        </h1>
        <p className="text-slate-400">
          Start with a pre-built template and customize it to your needs. Click any template to preview or use it.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <p className="text-sm text-slate-500 mb-4">
        Showing {filteredTemplates.length} of {templates.length} templates
      </p>

      {/* Templates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredTemplates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.03 }}
            className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <template.icon size={24} className="text-white" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                template.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {template.difficulty}
              </span>
            </div>
            
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {template.category}
            </span>
            <h3 className="text-lg font-semibold text-white mt-1 mb-2">
              {template.title}
            </h3>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{template.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="px-2 py-0.5 text-slate-500 text-xs">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 mb-4">
              ⏱ {template.estimatedTime}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewTemplate(template)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => handleUseTemplate(template)}
                disabled={isCreating}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-sm text-white font-medium hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Use
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No templates found matching your criteria.</p>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${previewTemplate.color} flex items-center justify-center`}>
                    <previewTemplate.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{previewTemplate.title}</h2>
                    <p className="text-sm text-slate-400">{previewTemplate.category} • {previewTemplate.estimatedTime}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <p className="text-slate-300 mb-6">{previewTemplate.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {previewTemplate.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Sections Preview */}
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                  Sections Included ({previewTemplate.sections.length})
                </h3>
                <div className="space-y-2">
                  {previewTemplate.sections.map((section, i) => (
                    <div key={section.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span className="text-white">{section.title}</span>
                      <span className="text-xs text-slate-500 ml-auto">
                        {section.blocks.length} blocks
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-800/50">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="flex-1 px-4 py-3 bg-slate-700 rounded-lg text-white font-medium hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  disabled={isCreating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                >
                  {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Use This Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
