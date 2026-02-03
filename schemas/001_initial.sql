-- AI Vault Database Schema
-- Run with: wrangler d1 execute vault --file=./schemas/001_initial.sql

-- Ideas: Raw captured thoughts
CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'text', -- 'voice', 'text', 'import', 'url'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  status TEXT DEFAULT 'new', -- 'new', 'processing', 'drafted', 'archived'
  metadata TEXT -- JSON string
);

CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_created ON ideas(created_at DESC);

-- Drafts: AI-generated content
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  idea_id TEXT REFERENCES ideas(id),
  type TEXT NOT NULL, -- 'blog', 'social_x', 'social_linkedin', 'book', 'newsletter'
  title TEXT,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published'
  language TEXT DEFAULT 'bg',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  published_at DATETIME,
  metadata TEXT -- JSON: tags, permalink, etc.
);

CREATE INDEX idx_drafts_status ON drafts(status);
CREATE INDEX idx_drafts_type ON drafts(type);
CREATE INDEX idx_drafts_idea ON drafts(idea_id);

-- Memory: Knowledge base entries (articles, notes, references)
CREATE TABLE IF NOT EXISTS memory (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL, -- 'article', 'note', 'url', 'pdf', 'book', 'conversation'
  source_id TEXT, -- Original ID if imported (e.g., article permalink)
  source_url TEXT, -- URL if applicable
  title TEXT,
  content TEXT NOT NULL,
  summary TEXT,
  language TEXT DEFAULT 'bg',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT -- JSON
);

CREATE INDEX idx_memory_source_type ON memory(source_type);
CREATE INDEX idx_memory_source_id ON memory(source_id);

-- Chunks: Text segments for RAG retrieval
CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  memory_id TEXT NOT NULL REFERENCES memory(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding_id TEXT, -- Reference to Vectorize vector ID
  position INTEGER NOT NULL, -- Order within the source
  token_count INTEGER,
  metadata TEXT -- JSON
);

CREATE INDEX idx_chunks_memory ON chunks(memory_id);
CREATE INDEX idx_chunks_embedding ON chunks(embedding_id);

-- Agent Runs: Execution history for debugging/analytics
CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  agent_type TEXT NOT NULL, -- 'writer', 'expander', 'social', 'researcher', 'image'
  trigger_type TEXT, -- 'manual', 'pipeline', 'scheduled'
  input_ref TEXT, -- Reference to idea_id or draft_id
  input_data TEXT, -- JSON of input parameters
  output_data TEXT, -- JSON of output
  status TEXT NOT NULL, -- 'running', 'completed', 'failed'
  error_message TEXT,
  model_used TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  duration_ms INTEGER,
  cost_usd REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE INDEX idx_agent_runs_type ON agent_runs(agent_type);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_created ON agent_runs(created_at DESC);

-- Social Posts: Generated social media content
CREATE TABLE IF NOT EXISTS social_posts (
  id TEXT PRIMARY KEY,
  draft_id TEXT REFERENCES drafts(id),
  platform TEXT NOT NULL, -- 'x', 'linkedin', 'instagram', 'facebook', 'tiktok'
  content TEXT NOT NULL,
  thread_position INTEGER, -- For X threads: 1, 2, 3...
  media_urls TEXT, -- JSON array of URLs
  hashtags TEXT, -- JSON array
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'posted', 'failed'
  scheduled_at DATETIME,
  posted_at DATETIME,
  platform_post_id TEXT, -- ID from the platform after posting
  engagement_data TEXT, -- JSON: likes, shares, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);

CREATE INDEX idx_social_platform ON social_posts(platform);
CREATE INDEX idx_social_status ON social_posts(status);
CREATE INDEX idx_social_draft ON social_posts(draft_id);

-- Images: AI-generated images
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  draft_id TEXT REFERENCES drafts(id),
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model TEXT, -- 'flux', 'sdxl', 'dalle3'
  r2_key TEXT, -- Path in R2 bucket
  url TEXT, -- Public URL if available
  width INTEGER,
  height INTEGER,
  status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);

CREATE INDEX idx_images_draft ON images(draft_id);
CREATE INDEX idx_images_status ON images(status);

-- Tags: Taxonomy for content
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  usage_count INTEGER DEFAULT 0
);

-- Content-Tag relationships
CREATE TABLE IF NOT EXISTS content_tags (
  content_type TEXT NOT NULL, -- 'draft', 'memory', 'idea'
  content_id TEXT NOT NULL,
  tag_id TEXT NOT NULL REFERENCES tags(id),
  PRIMARY KEY (content_type, content_id, tag_id)
);

CREATE INDEX idx_content_tags_tag ON content_tags(tag_id);
