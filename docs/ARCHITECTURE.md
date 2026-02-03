# AI Vault Architecture

## Vision

Transform this personal site into an AI-powered knowledge system that:
- Captures ideas and turns them into content
- Orchestrates AI agents for writing, research, and content creation
- Maintains a semantic memory of all your work
- Automates the pipeline from idea → draft → publish

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI VAULT SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────────────────┐│
│  │   INPUTS    │    │   AI CORE    │    │           OUTPUTS               ││
│  ├─────────────┤    ├──────────────┤    ├─────────────────────────────────┤│
│  │ • Voice     │───▶│ Orchestrator │───▶│ • Blog drafts (Markdown)       ││
│  │ • Text      │    │     ▼        │    │ • Social posts (X, LinkedIn)   ││
│  │ • Images    │    │ Agent Pool   │    │ • Images (AI generated)        ││
│  │ • URLs      │    │     ▼        │    │ • Book chapters                ││
│  │ • PDFs      │    │ Memory/RAG   │    │ • Newsletter content           ││
│  └─────────────┘    └──────────────┘    └─────────────────────────────────┘│
│                            │                                                │
│                            ▼                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        STORAGE LAYER                                  │  │
│  │  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌──────────────────┐   │  │
│  │  │ D1 (SQL) │  │ R2 (Blob) │  │ Vectorize  │  │ KV (Key-Value)   │   │  │
│  │  │ Metadata │  │ Files     │  │ Embeddings │  │ Cache/Sessions   │   │  │
│  │  └──────────┘  └───────────┘  └────────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure (Proposed)

```
ivantsukev.com/
├── src/                          # Astro frontend (existing)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── vault/               # New: Private vault UI
│   │   │   ├── index.astro      # Dashboard
│   │   │   ├── ideas.astro      # Ideas capture
│   │   │   ├── drafts.astro     # Content drafts
│   │   │   └── memory.astro     # Knowledge base browser
│   │   └── api/                 # API routes (Astro endpoints)
│   │       └── [...path].ts     # Proxy to workers if needed
│   ├── content/
│   │   ├── statii/              # Published articles (existing)
│   │   ├── drafts/              # AI-generated drafts (gitignored)
│   │   └── ideas/               # Raw ideas (optional local)
│   └── components/
│       └── vault/               # Vault-specific components
│           ├── IdeaCapture.tsx  # React island for idea input
│           ├── DraftEditor.tsx  # Markdown editor
│           └── AgentStatus.tsx  # Agent orchestration status
│
├── workers/                     # Cloudflare Workers
│   ├── orchestrator/            # Main AI orchestration worker
│   │   ├── src/
│   │   │   ├── index.ts         # Worker entry
│   │   │   ├── agents/          # Agent definitions
│   │   │   │   ├── writer.ts    # Blog writing agent
│   │   │   │   ├── social.ts    # Social media agent
│   │   │   │   ├── researcher.ts # Research/summarize agent
│   │   │   │   └── image.ts     # Image generation agent
│   │   │   ├── pipelines/       # Multi-step workflows
│   │   │   │   ├── idea-to-draft.ts
│   │   │   │   ├── draft-to-publish.ts
│   │   │   │   └── content-repurpose.ts
│   │   │   └── memory/          # RAG and context management
│   │   │       ├── embeddings.ts
│   │   │       └── retrieval.ts
│   │   └── wrangler.toml
│   │
│   └── ingest/                  # Content ingestion worker
│       ├── src/
│       │   ├── index.ts
│       │   ├── parsers/         # URL, PDF, image parsers
│       │   └── processors/      # Text extraction, chunking
│       └── wrangler.toml
│
├── functions/                   # Cloudflare Pages Functions (alternative)
│   └── api/                     # Simpler API endpoints
│       ├── ideas.ts
│       ├── drafts.ts
│       └── agents/
│           └── [action].ts
│
├── schemas/                     # D1 database schemas
│   ├── 001_initial.sql
│   ├── 002_ideas.sql
│   ├── 003_content.sql
│   └── 004_memory.sql
│
├── scripts/                     # CLI tools and utilities
│   ├── seed-memory.ts           # Import existing content to memory
│   ├── sync-drafts.ts           # Pull drafts from D1 to local
│   └── publish.ts               # Promote draft to published
│
└── docs/
    ├── ARCHITECTURE.md          # This file
    └── WORKFLOWS.md             # Pipeline documentation
```

## Technology Stack

### Frontend (Astro + Islands)
- **Astro 5.x**: Static site generation for public pages
- **React Islands**: Interactive components for vault UI
- **Authentication**: Cloudflare Access or simple API key for private routes

### Backend (Cloudflare)
| Service | Purpose | Use Case |
|---------|---------|----------|
| **Pages** | Static hosting + Functions | Public site + API |
| **Workers** | Serverless compute | Agent orchestration |
| **D1** | SQLite database | Metadata, ideas, drafts |
| **R2** | Object storage | Files, images, PDFs |
| **Vectorize** | Vector database | Semantic search, RAG |
| **Workers AI** | LLM inference | Text generation |
| **AI Gateway** | LLM routing | External models (Claude, GPT) |
| **KV** | Key-value store | Sessions, cache |
| **Queues** | Async jobs | Background processing |
| **Durable Objects** | Stateful workers | Long-running agents |

### AI Models
- **Primary**: Claude (via AI Gateway) for complex writing
- **Fast**: Workers AI (Llama) for quick tasks
- **Images**: Flux/SDXL via Workers AI or external APIs
- **Embeddings**: Workers AI embedding models for vectorize

## Data Models

### D1 Schema (Core Tables)

```sql
-- Ideas: Raw captured thoughts
CREATE TABLE ideas (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT, -- 'voice', 'text', 'import'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  status TEXT DEFAULT 'new', -- 'new', 'processing', 'drafted', 'archived'
  metadata JSON
);

-- Drafts: AI-generated content
CREATE TABLE drafts (
  id TEXT PRIMARY KEY,
  idea_id TEXT REFERENCES ideas(id),
  type TEXT NOT NULL, -- 'blog', 'social', 'book', 'newsletter'
  title TEXT,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  published_at DATETIME,
  metadata JSON
);

-- Memory: Knowledge base entries
CREATE TABLE memory (
  id TEXT PRIMARY KEY,
  source_type TEXT, -- 'article', 'note', 'url', 'pdf', 'conversation'
  source_id TEXT,
  title TEXT,
  content TEXT NOT NULL,
  summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON
);

-- Chunks: For RAG retrieval
CREATE TABLE chunks (
  id TEXT PRIMARY KEY,
  memory_id TEXT REFERENCES memory(id),
  content TEXT NOT NULL,
  embedding_id TEXT, -- Reference to Vectorize
  position INTEGER,
  metadata JSON
);

-- Agent Runs: Execution history
CREATE TABLE agent_runs (
  id TEXT PRIMARY KEY,
  agent_type TEXT NOT NULL,
  input JSON,
  output JSON,
  status TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Social Posts: Generated social content
CREATE TABLE social_posts (
  id TEXT PRIMARY KEY,
  draft_id TEXT REFERENCES drafts(id),
  platform TEXT, -- 'x', 'linkedin', 'instagram', 'facebook'
  content TEXT NOT NULL,
  media_urls JSON,
  status TEXT DEFAULT 'draft',
  scheduled_at DATETIME,
  posted_at DATETIME,
  metadata JSON
);
```

## Pipelines

### 1. Idea → Draft Pipeline

```
┌─────────┐    ┌───────────┐    ┌──────────┐    ┌─────────┐    ┌───────────┐
│  Idea   │───▶│  Expand   │───▶│ Research │───▶│  Write  │───▶│   Draft   │
│ Capture │    │  (Claude) │    │   (RAG)  │    │ (Claude)│    │  Review   │
└─────────┘    └───────────┘    └──────────┘    └─────────┘    └───────────┘
     │                                                               │
     │         Context from your existing articles                   │
     │         and notes enhances every step                         │
     └───────────────────────────────────────────────────────────────┘
```

**Steps:**
1. **Capture**: Save raw idea to D1
2. **Expand**: Use Claude to elaborate the idea, ask clarifying questions
3. **Research**: Query Vectorize for related content from your memory
4. **Write**: Generate full draft with your voice/style
5. **Review**: Present draft for editing or approval

### 2. Content Repurpose Pipeline

```
┌──────────┐    ┌───────────┐    ┌─────────────────────────────────┐
│  Source  │───▶│  Analyze  │───▶│         Generate                │
│ (Article)│    │  Content  │    │  • X thread                     │
└──────────┘    └───────────┘    │  • LinkedIn post                │
                                 │  • Instagram caption            │
                                 │  • Newsletter blurb             │
                                 │  • Image prompts                │
                                 └─────────────────────────────────┘
```

### 3. Memory Ingestion Pipeline

```
┌─────────┐    ┌───────────┐    ┌──────────┐    ┌───────────┐
│  Input  │───▶│   Parse   │───▶│   Chunk  │───▶│  Embed &  │
│URL/PDF/ │    │ Extract   │    │   Text   │    │   Store   │
│ Text    │    │           │    │          │    │           │
└─────────┘    └───────────┘    └──────────┘    └───────────┘
```

## API Endpoints

### Pages Functions (`/functions/api/`)

```typescript
// POST /api/ideas - Capture new idea
// GET  /api/ideas - List ideas
// GET  /api/ideas/:id - Get idea details

// POST /api/drafts - Create draft (manual)
// GET  /api/drafts - List drafts
// PUT  /api/drafts/:id - Update draft
// POST /api/drafts/:id/publish - Promote to content

// POST /api/agents/expand - Expand an idea
// POST /api/agents/write - Generate content
// POST /api/agents/social - Generate social posts
// POST /api/agents/image - Generate image

// POST /api/memory/ingest - Add to knowledge base
// GET  /api/memory/search - Semantic search
// GET  /api/memory/context - Get context for topic

// POST /api/pipelines/idea-to-draft - Run full pipeline
// POST /api/pipelines/repurpose - Repurpose content
```

## Agent Definitions

### Writer Agent
```typescript
interface WriterAgent {
  model: 'claude-sonnet' | 'claude-opus';
  systemPrompt: string; // Your writing voice
  context: {
    recentArticles: string[];  // Your style examples
    relatedMemory: string[];   // RAG results
    targetLength: number;
    language: 'bg' | 'en';
  };
  output: {
    title: string;
    content: string;
    tags: string[];
    summary: string;
  };
}
```

### Social Agent
```typescript
interface SocialAgent {
  platforms: ('x' | 'linkedin' | 'instagram')[];
  sourceContent: string;
  constraints: {
    x: { maxLength: 280, threadMax: 10 };
    linkedin: { maxLength: 3000 };
    instagram: { maxLength: 2200 };
  };
  output: {
    platform: string;
    posts: string[];
    hashtags: string[];
    imagePrompts?: string[];
  };
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up D1 database with core schemas
- [ ] Create basic Pages Functions for CRUD
- [ ] Build simple vault UI with idea capture
- [ ] Integrate Cloudflare AI Gateway

### Phase 2: Memory System (Week 3-4)
- [ ] Set up Vectorize index
- [ ] Implement content ingestion worker
- [ ] Import existing 18 articles as memory
- [ ] Build semantic search API

### Phase 3: Agents (Week 5-6)
- [ ] Implement Writer agent with your voice
- [ ] Build Idea → Draft pipeline
- [ ] Create draft review UI
- [ ] Add manual publish flow

### Phase 4: Automation (Week 7-8)
- [ ] Social media content generation
- [ ] Image generation integration
- [ ] Content repurpose pipeline
- [ ] Queues for background processing

### Phase 5: Polish (Week 9+)
- [ ] Voice input (Whisper API)
- [ ] Mobile-friendly capture
- [ ] Analytics dashboard
- [ ] Scheduled publishing

## Security Considerations

### Authentication
```typescript
// Protect vault routes with Cloudflare Access
// or simple API key for personal use
const VAULT_API_KEY = env.VAULT_API_KEY;

async function authenticate(request: Request): Promise<boolean> {
  const key = request.headers.get('X-API-Key');
  return key === VAULT_API_KEY;
}
```

### Data Protection
- All vault routes behind authentication
- API keys stored in Cloudflare secrets
- R2 bucket with private access only
- D1 database not publicly accessible

## Cost Estimation (Cloudflare)

| Service | Free Tier | Expected Usage | Est. Cost |
|---------|-----------|----------------|-----------|
| Pages | Unlimited | - | $0 |
| D1 | 5GB, 5M reads | Light | $0 |
| R2 | 10GB, 1M reads | Moderate | $0-5 |
| Vectorize | 5M queries | Light | $0 |
| Workers AI | Pay-per-use | ~$10-20/mo | $10-20 |
| AI Gateway | Free routing | - | $0 |
| KV | 1GB | Light | $0 |

**External AI (if needed):**
- Claude API: ~$20-50/mo depending on usage
- Image generation: ~$10-20/mo

## Configuration Files to Add

### `wrangler.toml` (Workers config)
```toml
name = "vault-orchestrator"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "vault"
database_id = "xxx"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "vault-files"

[[vectorize]]
binding = "VECTORS"
index_name = "vault-memory"

[ai]
binding = "AI"
```

### Environment Variables
```bash
# .dev.vars (local development)
VAULT_API_KEY=your-secret-key
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx # for embeddings if needed
```

## Next Steps

1. **Immediate**: Create D1 database and basic schema
2. **This week**: Set up Pages Functions structure
3. **Soon**: Build idea capture UI
4. **Then**: Implement first agent (Writer)

Start small, iterate fast. The foundation is solid for expansion.
