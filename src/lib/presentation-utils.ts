// Presentation utilities for generating high-class presentations

import { PresentationData, PresentationSlide, SlideContent } from '@/components/presentation/HighClassPresentation';

// ============================================================
// TYPES FOR AI GENERATION
// ============================================================

export interface AIGeneratedPresentation {
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; color: string }>;
  slides: Array<{
    title: string;
    subtitle?: string;
    layout?: 'title' | 'content' | 'split' | 'grid' | 'code-focus' | 'comparison';
    items?: Array<{
      title?: string;
      description?: string;
    }>;
    code?: {
      content: string;
      language?: string;
      runOn?: string;
      isConfig?: boolean;
    };
    alert?: {
      type: 'info' | 'warning' | 'danger' | 'success';
      content: string;
    };
    table?: {
      headers: string[];
      rows: string[][];
    };
    serverBadges?: Array<{
      hostname: string;
      ip?: string;
      role?: string;
    }>;
    directories?: Array<{
      title: string;
      path: string;
      color: string;
    }>;
    ports?: Array<{
      label: string;
      port: string;
      color: string;
    }>;
    trafficFlow?: Array<{
      label: string;
      color: string;
    }>;
    comparison?: Array<{
      title: string;
      description?: string;
      items?: string[];
      color: string;
    }>;
    steps?: Array<{
      title: string;
      description: string;
      code?: string;
    }>;
    speakerNotes?: string;
    badges?: Array<{ label: string; color: string }>;
  }>;
}

// ============================================================
// CONVERSION FUNCTION
// ============================================================

export function convertToPresentation(input: AIGeneratedPresentation): PresentationData {
  const slides: PresentationSlide[] = input.slides.map((slide, idx) => {
    const content: SlideContent[] = [];

    // Add items as text
    if (slide.items && slide.items.length > 0) {
      slide.items.forEach(item => {
        if (item.title && item.description) {
          content.push({
            type: 'text',
            content: `<strong class="text-white">${item.title}:</strong> ${item.description}`
          });
        } else if (item.description) {
          content.push({
            type: 'text',
            content: item.description
          });
        }
      });
    }

    // Add alert
    if (slide.alert) {
      content.push({
        type: 'alert',
        alertType: slide.alert.type,
        content: slide.alert.content
      });
    }

    // Add server badges
    if (slide.serverBadges && slide.serverBadges.length > 0) {
      content.push({
        type: 'server-badge',
        items: slide.serverBadges.map(sb => ({
          title: sb.hostname,
          value: sb.ip,
          color: sb.role || 'slate'
        }))
      });
    }

    // Add steps
    if (slide.steps && slide.steps.length > 0) {
      slide.steps.forEach((step, stepIdx) => {
        content.push({
          type: 'step',
          stepNumber: stepIdx + 1,
          items: [{ title: step.title }],
          content: step.description
        });

        if (step.code) {
          content.push({
            type: 'code',
            content: step.code,
            language: 'bash'
          });
        }
      });
    }

    // Add code block
    if (slide.code) {
      content.push({
        type: slide.code.isConfig ? 'config' : 'code',
        content: slide.code.content,
        language: slide.code.language,
        runOn: slide.code.runOn
      });
    }

    // Add table
    if (slide.table) {
      content.push({
        type: 'table',
        headers: slide.table.headers,
        rows: slide.table.rows
      });
    }

    // Add directories
    if (slide.directories && slide.directories.length > 0) {
      content.push({
        type: 'directory',
        items: slide.directories.map(d => ({
          title: d.title,
          path: d.path,
          color: d.color
        }))
      });
    }

    // Add ports
    if (slide.ports && slide.ports.length > 0) {
      content.push({
        type: 'ports',
        items: slide.ports.map(p => ({
          title: p.label,
          value: p.port,
          color: p.color
        }))
      });
    }

    // Add traffic flow
    if (slide.trafficFlow && slide.trafficFlow.length > 0) {
      content.push({
        type: 'traffic-flow',
        items: slide.trafficFlow.map(t => ({
          title: t.label,
          color: t.color
        }))
      });
    }

    // Add comparison grid
    if (slide.comparison && slide.comparison.length > 0) {
      content.push({
        type: 'grid',
        items: slide.comparison.map(c => ({
          title: c.title,
          description: c.description,
          path: c.items?.join('|'),
          color: c.color
        }))
      });
    }

    return {
      id: `slide-${idx + 1}`,
      title: slide.title,
      subtitle: slide.subtitle,
      layout: slide.layout || 'content',
      content,
      speakerNotes: slide.speakerNotes,
      badges: slide.badges
    };
  });

  return {
    id: `pres-${Date.now()}`,
    title: input.title,
    subtitle: input.subtitle,
    badges: input.badges,
    slides,
    theme: 'dark'
  };
}

// ============================================================
// SAMPLE PRESENTATION (Patroni HA Style)
// ============================================================

export const samplePatroniPresentation: AIGeneratedPresentation = {
  title: "Patroni HA",
  subtitle: "Workshop Runbook",
  badges: [
    { label: "PostgreSQL 15", color: "green" },
    { label: "etcd", color: "violet" },
    { label: "HAProxy", color: "sky" },
    { label: "pgBackRest", color: "amber" }
  ],
  slides: [
    {
      title: "Architecture Overview",
      subtitle: "Enterprise Multi-Region Setup with HAProxy, etcd & pgBackRest",
      comparison: [
        {
          title: "🟢 Primary Datacenter (Atlanta)",
          items: [
            "<strong>patroni-atl-01</strong> - Primary PostgreSQL 15",
            "<strong>patroni-atl-02</strong> - Sync Standby",
            "<strong>etcd</strong> - Leader Election & DCS",
            "HAProxy on each node (5000/5001)",
            "Streaming Replication"
          ],
          color: "emerald"
        },
        {
          title: "🟠 DR Site (Dallas)",
          items: [
            "<strong>patroni-dfw-01</strong> - Async Replica",
            "<code class='text-red-400'>nofailover: true</code>",
            "Will not be elected leader automatically",
            "WAN Replication (~20ms latency)",
            "pgBackRest for backups"
          ],
          color: "orange"
        }
      ],
      speakerNotes: "Start by explaining the high-level architecture. Emphasize the difference between the primary datacenter and DR site."
    },
    {
      title: "Server Inventory",
      table: {
        headers: ["Hostname", "Role", "Private IP", "Region", "Components"],
        rows: [
          ["patroni-atl-01", "Primary", "10.0.1.10", "NYC1 (ATL)", "PostgreSQL 15, Patroni, HAProxy, pgBackRest"],
          ["patroni-atl-02", "Standby", "10.0.1.11", "NYC1 (ATL)", "PostgreSQL 15, Patroni, HAProxy, pgBackRest"],
          ["etcd-atl-01", "etcd", "172.20.66.127", "NYC1 (ATL)", "etcd (Leader Election, Config Store, DCS)"],
          ["patroni-dfw-01", "DR Replica", "10.0.2.10", "SFO1 (DFW)", "PostgreSQL 15, Patroni, HAProxy, pgBackRest"],
          ["app-atl-01", "App Server", "10.0.1.30", "NYC1 (ATL)", "Mattermost"]
        ]
      }
    },
    {
      title: "Directory Structure",
      directories: [
        { title: "DATA", path: "/opt/pgsql/data", color: "emerald" },
        { title: "LOG", path: "/opt/pgsql/log", color: "violet" },
        { title: "WAL", path: "/opt/pgsql/wal", color: "sky" },
        { title: "ARCH", path: "/opt/pgsql/archive", color: "amber" },
        { title: "BACKUP", path: "/opt/pgsql/backup", color: "orange" },
        { title: "TBSPC", path: "/opt/pgsql/tbspc", color: "cyan" }
      ]
    },
    {
      title: "Port Reference",
      ports: [
        { label: "PostgreSQL", port: "5432", color: "emerald" },
        { label: "HAProxy R/W", port: "5000", color: "teal" },
        { label: "HAProxy R/O", port: "5001", color: "sky" },
        { label: "R/W Health", port: "5002", color: "emerald" },
        { label: "R/O Health", port: "5003", color: "sky" },
        { label: "Patroni API", port: "8008", color: "violet" },
        { label: "etcd Client", port: "2379", color: "violet" },
        { label: "HAProxy Stats", port: "7000", color: "amber" }
      ]
    },
    {
      title: "Traffic Flow",
      trafficFlow: [
        { label: "Mattermost", color: "teal" },
        { label: "HAProxy :5000", color: "sky" },
        { label: "Primary PG :5432", color: "emerald" }
      ]
    },
    {
      title: "etcd Cluster Setup",
      serverBadges: [
        { hostname: "etcd-atl-01", ip: "172.20.66.127", role: "etcd" }
      ],
      alert: {
        type: "info",
        content: "etcd is the distributed configuration store for Patroni. It handles leader election, configuration storage, and DCS coordination."
      },
      steps: [
        {
          title: "Install etcd",
          description: "Download and install etcd 3.5.x from GitHub releases",
          code: `ETCD_VER=v3.5.11
wget https://github.com/etcd-io/etcd/releases/download/\${ETCD_VER}/etcd-\${ETCD_VER}-linux-amd64.tar.gz
tar xzf etcd-\${ETCD_VER}-linux-amd64.tar.gz
sudo mv etcd-\${ETCD_VER}-linux-amd64/etcd* /usr/local/bin/
etcd --version`
        }
      ]
    },
    {
      title: "PostgreSQL Installation",
      alert: {
        type: "warning",
        content: "Install PostgreSQL but DO NOT initialize or start it. Patroni will handle database initialization."
      },
      code: {
        content: `# Add PostgreSQL APT repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Import repository key
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Install PostgreSQL 15
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# IMPORTANT: Disable the default service
sudo systemctl stop postgresql
sudo systemctl disable postgresql`,
        language: "bash",
        runOn: "ALL DB Nodes"
      }
    },
    {
      title: "Patroni Configuration",
      serverBadges: [
        { hostname: "patroni-atl-01", ip: "10.0.1.10", role: "primary" }
      ],
      alert: {
        type: "warning",
        content: "Each node has a unique configuration. Pay close attention to name, IP addresses, and connect_address settings."
      },
      code: {
        content: `scope: postgres_cluster
namespace: /patroni/
name: patroni-atl-01

restapi:
  listen: 0.0.0.0:8008
  connect_address: 10.0.1.10:8008

etcd:
  hosts: 172.20.66.127:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    postgresql:
      use_pg_rewind: true
      use_slots: true
      parameters:
        max_connections: 500
        shared_buffers: 2GB
        wal_level: replica`,
        language: "yaml",
        isConfig: true
      }
    },
    {
      title: "HAProxy Setup",
      comparison: [
        {
          title: "Port 5000 - Read/Write",
          description: "Routes to current PRIMARY only",
          items: ["Health check: /primary"],
          color: "emerald"
        },
        {
          title: "Port 5001 - Read Only",
          description: "Routes to REPLICAS (round-robin)",
          items: ["Health check: /replica"],
          color: "sky"
        }
      ]
    },
    {
      title: "DR Node Setup",
      serverBadges: [
        { hostname: "patroni-dfw-01", ip: "10.0.2.10", role: "dr" }
      ],
      alert: {
        type: "danger",
        content: "Critical: This node has nofailover: true - it will NOT be elected leader automatically."
      },
      code: {
        content: `tags:
  nofailover: true       # CRITICAL: Cannot become primary automatically
  noloadbalance: false   # Can still serve read traffic
  clonefrom: false
  nosync: true           # Async replication (WAN latency)`,
        language: "yaml",
        isConfig: true
      }
    },
    {
      title: "Verify Cluster Status",
      code: {
        content: `# Check cluster
patronictl -c /etc/patroni/patroni.yml list

# Expected output:
# + Cluster: postgres_cluster --------+---------+-----------+----+-----------+
# | Member          | Host      | Role    | State     | TL | Lag in MB |
# +-----------------+-----------+---------+-----------+----+-----------+
# | patroni-atl-01  | 10.0.1.10 | Leader  | running   |  1 |           |
# | patroni-atl-02  | 10.0.1.11 | Replica | streaming |  1 |         0 |
# +-----------------+-----------+---------+-----------+----+-----------+`,
        language: "bash"
      },
      speakerNotes: "This is the expected healthy state. Point out the Leader designation and streaming replication status."
    },
    {
      title: "Day-2 Operations",
      subtitle: "Common Patroni commands for cluster management",
      code: {
        content: `# List cluster status
patronictl -c /etc/patroni/patroni.yml list

# Switchover (planned)
patronictl -c /etc/patroni/patroni.yml switchover

# Failover (emergency)
patronictl -c /etc/patroni/patroni.yml failover

# Reinitialize failed replica
patronictl -c /etc/patroni/patroni.yml reinit postgres_cluster patroni-atl-02

# Pause/Resume automatic failover
patronictl -c /etc/patroni/patroni.yml pause
patronictl -c /etc/patroni/patroni.yml resume`,
        language: "bash"
      }
    }
  ]
};

// ============================================================
// AI PROMPT FOR GENERATING PRESENTATIONS
// ============================================================

export const PRESENTATION_GENERATION_PROMPT = `You are creating a high-class technical presentation/runbook. Generate content in this JSON format:

{
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "badges": [
    { "label": "Tech 1", "color": "green" },
    { "label": "Tech 2", "color": "violet" }
  ],
  "slides": [
    {
      "title": "Slide Title",
      "subtitle": "Optional slide subtitle",
      "layout": "content",
      
      // Choose from these content types:
      
      // 1. Comparison Grid (two columns)
      "comparison": [
        {
          "title": "Option A",
          "description": "Description",
          "items": ["Point 1", "Point 2"],
          "color": "emerald"
        },
        {
          "title": "Option B",
          "items": ["Point 1", "Point 2"],
          "color": "orange"
        }
      ],
      
      // 2. Code Block
      "code": {
        "content": "# Your code here",
        "language": "bash",
        "runOn": "ALL Nodes",
        "isConfig": false
      },
      
      // 3. Alert Box
      "alert": {
        "type": "info|warning|danger|success",
        "content": "Alert message"
      },
      
      // 4. Server Badges
      "serverBadges": [
        { "hostname": "server-01", "ip": "10.0.1.10", "role": "primary" }
      ],
      
      // 5. Table
      "table": {
        "headers": ["Col 1", "Col 2"],
        "rows": [["a", "b"], ["c", "d"]]
      },
      
      // 6. Directory Grid
      "directories": [
        { "title": "DATA", "path": "/data", "color": "emerald" }
      ],
      
      // 7. Port Reference
      "ports": [
        { "label": "HTTP", "port": "80", "color": "sky" }
      ],
      
      // 8. Traffic Flow
      "trafficFlow": [
        { "label": "Client", "color": "teal" },
        { "label": "Server", "color": "emerald" }
      ],
      
      // 9. Step-by-step
      "steps": [
        {
          "title": "Step Title",
          "description": "Step description",
          "code": "optional code"
        }
      ],
      
      "speakerNotes": "Notes for the presenter"
    }
  ]
}

Available colors: green, emerald, violet, purple, sky, blue, amber, orange, teal, cyan, red, rose, slate

Available role colors for serverBadges: primary, leader, standby, replica, dr, etcd, app

Alert types: info (blue), warning (amber), danger (red), success (green)

Create visually appealing slides with a mix of content types. Use code blocks for commands, comparison grids for architecture, tables for inventories, and alerts for important notes.`;

