-- Migration: 012_sync_course_nft_supply.sql
-- Purpose: Resynchronize course_nft_collections.current_supply with the actual
--          maximum token_id present in course_nfts for each collection. This
--          ensures atomic token ID generation aligns with existing data.

-- Set current_supply to the max token_id (or 0 if none) for each collection
UPDATE course_nft_collections c
SET current_supply = sub.max_token_id
FROM (
  SELECT collection_id, COALESCE(MAX(token_id), 0) AS max_token_id
  FROM course_nfts
  GROUP BY collection_id
) sub
WHERE c.id = sub.collection_id
  AND (c.current_supply IS DISTINCT FROM sub.max_token_id);

-- Ensure current_supply never exceeds max_supply (safety check)
UPDATE course_nft_collections
SET current_supply = GREATEST(0, LEAST(current_supply, max_supply));

-- Optional: set any negative or NULL values to 0 (defensive)
UPDATE course_nft_collections
SET current_supply = 0
WHERE current_supply IS NULL OR current_supply < 0;


