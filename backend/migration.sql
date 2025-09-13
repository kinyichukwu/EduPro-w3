-- Add missing columns to existing tables (re-run after schema revert)

-- Add columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS processing_status TEXT CHECK (processing_status IN ('queued','processing','completed','failed')) DEFAULT 'queued';

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS error TEXT;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS size BIGINT;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS checksum TEXT;

-- Add title column to chats table
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_chunks_created_at ON chunks(created_at);
