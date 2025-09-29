-- Migration: 013_relax_amount_paid_lamports.sql
-- Purpose: Relax NOT NULL constraint for legacy column amount_paid_lamports in course_purchases,
--          and default it to 0 to prevent NOT NULL violations from older flows.

-- If the column exists, make it nullable and set default 0
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'course_purchases' AND column_name = 'amount_paid_lamports'
  ) THEN
    -- Drop NOT NULL if present
    BEGIN
      ALTER TABLE course_purchases ALTER COLUMN amount_paid_lamports DROP NOT NULL;
    EXCEPTION WHEN others THEN
      -- ignore if constraint not present
      NULL;
    END;

    -- Set default to 0
    ALTER TABLE course_purchases ALTER COLUMN amount_paid_lamports SET DEFAULT 0;

    -- Backfill NULLs to 0
    UPDATE course_purchases SET amount_paid_lamports = 0 WHERE amount_paid_lamports IS NULL;
  END IF;
END $$;


