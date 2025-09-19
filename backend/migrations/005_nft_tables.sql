-- Migration: 005_nft_tables.sql
-- Description: Create tables for NFT system (membership and course NFTs)

-- Create membership_nfts table
CREATE TABLE IF NOT EXISTS membership_nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(44) NOT NULL, -- Solana addresses are 44 characters
    nft_mint_address VARCHAR(44) UNIQUE NOT NULL,
    nft_metadata_uri TEXT NOT NULL,
    transaction_signature VARCHAR(88), -- Solana transaction signatures are 88 characters
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'minted', 'transferred', 'burned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    minted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_nft_collections table
CREATE TABLE IF NOT EXISTS course_nft_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_email VARCHAR(255) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    collection_mint_address VARCHAR(44) UNIQUE NOT NULL,
    collection_metadata_uri TEXT NOT NULL,
    max_supply INTEGER NOT NULL CHECK (max_supply > 0 AND max_supply <= 10000),
    current_supply INTEGER NOT NULL DEFAULT 0 CHECK (current_supply >= 0 AND current_supply <= max_supply),
    price_edutoken BIGINT NOT NULL CHECK (price_edutoken > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    transaction_signature VARCHAR(88),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'minted', 'transferred', 'burned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    minted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_nfts table
CREATE TABLE IF NOT EXISTS course_nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES course_nft_collections(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_email VARCHAR(255),
    owner_wallet_address VARCHAR(44),
    nft_mint_address VARCHAR(44) UNIQUE NOT NULL,
    nft_metadata_uri TEXT NOT NULL,
    token_id INTEGER NOT NULL, -- Unique token ID within the collection
    transaction_signature VARCHAR(88),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'minted', 'transferred', 'burned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    minted_at TIMESTAMP WITH TIME ZONE,
    transferred_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, token_id) -- Ensure unique token IDs within each collection
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membership_nfts_user_id ON membership_nfts(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_nfts_user_email ON membership_nfts(user_email);
CREATE INDEX IF NOT EXISTS idx_membership_nfts_wallet_address ON membership_nfts(wallet_address);
CREATE INDEX IF NOT EXISTS idx_membership_nfts_status ON membership_nfts(status);

CREATE INDEX IF NOT EXISTS idx_course_nft_collections_creator_id ON course_nft_collections(creator_id);
CREATE INDEX IF NOT EXISTS idx_course_nft_collections_creator_email ON course_nft_collections(creator_email);
CREATE INDEX IF NOT EXISTS idx_course_nft_collections_course_id ON course_nft_collections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_nft_collections_status ON course_nft_collections(status);
CREATE INDEX IF NOT EXISTS idx_course_nft_collections_is_active ON course_nft_collections(is_active);

CREATE INDEX IF NOT EXISTS idx_course_nfts_collection_id ON course_nfts(collection_id);
CREATE INDEX IF NOT EXISTS idx_course_nfts_owner_id ON course_nfts(owner_id);
CREATE INDEX IF NOT EXISTS idx_course_nfts_owner_email ON course_nfts(owner_email);
CREATE INDEX IF NOT EXISTS idx_course_nfts_owner_wallet_address ON course_nfts(owner_wallet_address);
CREATE INDEX IF NOT EXISTS idx_course_nfts_status ON course_nfts(status);
CREATE INDEX IF NOT EXISTS idx_course_nfts_token_id ON course_nfts(collection_id, token_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_membership_nfts_updated_at 
    BEFORE UPDATE ON membership_nfts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_nft_collections_updated_at 
    BEFORE UPDATE ON course_nft_collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_nfts_updated_at 
    BEFORE UPDATE ON course_nfts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE membership_nfts IS 'Stores membership NFTs given to new users who connect and verify their wallets';
COMMENT ON TABLE course_nft_collections IS 'Stores course NFT collections created by course creators';
COMMENT ON TABLE course_nfts IS 'Stores individual NFTs from course collections';

COMMENT ON COLUMN membership_nfts.user_email IS 'Primary identifier for the user (in case they switch email addresses)';
COMMENT ON COLUMN course_nft_collections.creator_email IS 'Primary identifier for the creator (in case they switch email addresses)';
COMMENT ON COLUMN course_nfts.owner_email IS 'Primary identifier for the owner (in case they switch email addresses)';
COMMENT ON COLUMN course_nft_collections.max_supply IS 'Maximum number of NFTs that can be minted in this collection';
COMMENT ON COLUMN course_nft_collections.current_supply IS 'Current number of NFTs minted in this collection';
COMMENT ON COLUMN course_nfts.token_id IS 'Unique token ID within the collection (1-based indexing)';
