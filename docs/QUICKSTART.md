# AI Vault Quickstart

Get the foundation running in 30 minutes.

## Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+
- Wrangler CLI: `npm install -g wrangler`

## Step 1: Cloudflare Setup

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create vault
# Note the database_id from output

# Create R2 bucket
wrangler r2 bucket create vault-files

# Create Vectorize index (for RAG)
wrangler vectorize create vault-memory --dimensions=1024 --metric=cosine
```

## Step 2: Configure Project

Create `wrangler.toml` in project root:

```toml
name = "ivantsukev-vault"
compatibility_date = "2024-12-01"
pages_build_output_dir = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "vault"
database_id = "YOUR_DATABASE_ID_HERE"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "vault-files"

[[vectorize]]
binding = "VECTORS"
index_name = "vault-memory"

[vars]
ENVIRONMENT = "production"
```

## Step 3: Initialize Database

```bash
# Run the schema
wrangler d1 execute vault --file=./schemas/001_initial.sql

# Verify tables created
wrangler d1 execute vault --command="SELECT name FROM sqlite_master WHERE type='table'"
```

## Step 4: Create First API Endpoint

Create `functions/api/ideas.ts`:

```typescript
interface Env {
  DB: D1Database;
  VAULT_API_KEY: string;
}

// Simple auth check
function isAuthorized(request: Request, env: Env): boolean {
  const key = request.headers.get('X-API-Key');
  return key === env.VAULT_API_KEY;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!isAuthorized(context.request, context.env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { results } = await context.env.DB.prepare(
    'SELECT * FROM ideas ORDER BY created_at DESC LIMIT 50'
  ).all();

  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!isAuthorized(context.request, context.env)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await context.request.json() as { content: string; source?: string };
  const id = crypto.randomUUID();

  await context.env.DB.prepare(
    'INSERT INTO ideas (id, content, source) VALUES (?, ?, ?)'
  ).bind(id, body.content, body.source || 'text').run();

  return Response.json({ id, content: body.content }, { status: 201 });
};
```

## Step 5: Add API Key Secret

```bash
# Set the secret for production
wrangler pages secret put VAULT_API_KEY
# Enter a strong random key when prompted

# For local dev, create .dev.vars
echo "VAULT_API_KEY=dev-secret-key-123" > .dev.vars
```

## Step 6: Test Locally

```bash
# Start Astro with Cloudflare adapter
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:4321/api/ideas \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key-123" \
  -d '{"content": "First test idea"}'

# List ideas
curl http://localhost:4321/api/ideas \
  -H "X-API-Key: dev-secret-key-123"
```

## Step 7: Add Cloudflare Adapter to Astro

```bash
npx astro add cloudflare
```

Update `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://ivantsukev.com',
  output: 'hybrid', // Enable SSR for API routes
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [tailwind(), sitemap()]
});
```

## Step 8: Deploy

```bash
# Build and deploy
npm run build
wrangler pages deploy ./dist
```

## Next: Add AI Integration

Create `functions/api/agents/expand.ts`:

```typescript
interface Env {
  DB: D1Database;
  AI: Ai;
  VAULT_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { ideaId } = await context.request.json() as { ideaId: string };

  // Get the idea
  const idea = await context.env.DB.prepare(
    'SELECT * FROM ideas WHERE id = ?'
  ).bind(ideaId).first();

  if (!idea) {
    return new Response('Idea not found', { status: 404 });
  }

  // Use Workers AI to expand
  const response = await context.env.AI.run('@cf/meta/llama-3.1-70b-instruct', {
    messages: [
      {
        role: 'system',
        content: 'You are a helpful writing assistant. Expand the given idea into a detailed outline for a blog post. Write in Bulgarian.'
      },
      {
        role: 'user',
        content: idea.content as string
      }
    ]
  });

  // Save as draft
  const draftId = crypto.randomUUID();
  await context.env.DB.prepare(
    'INSERT INTO drafts (id, idea_id, type, content, status) VALUES (?, ?, ?, ?, ?)'
  ).bind(draftId, ideaId, 'blog', response.response, 'draft').run();

  // Update idea status
  await context.env.DB.prepare(
    'UPDATE ideas SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind('drafted', ideaId).run();

  return Response.json({ draftId, content: response.response });
};
```

## File Structure After Setup

```
ivantsukev.com/
├── functions/
│   └── api/
│       ├── ideas.ts          ✓ Created
│       └── agents/
│           └── expand.ts     ✓ Created
├── schemas/
│   └── 001_initial.sql       ✓ Created
├── wrangler.toml             ✓ Created
├── .dev.vars                  ✓ Created (gitignored)
└── astro.config.mjs          ✓ Updated
```

## Testing the Full Flow

```bash
# 1. Capture an idea
curl -X POST http://localhost:4321/api/ideas \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key-123" \
  -d '{"content": "Как AI променя начина, по който работим"}'

# Response: {"id": "abc123", "content": "..."}

# 2. Expand idea into draft
curl -X POST http://localhost:4321/api/agents/expand \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key-123" \
  -d '{"ideaId": "abc123"}'

# Response: {"draftId": "xyz789", "content": "...expanded outline..."}
```

## What's Next

1. **Build Vault UI** - React islands for idea capture and draft review
2. **Add Memory System** - Import your existing 18 articles into Vectorize
3. **Claude Integration** - Use AI Gateway for higher quality writing
4. **Social Generation** - Add social media content agent
