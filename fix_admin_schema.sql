-- RUN THIS IN SUPABASE SQL EDITOR TO FIX "GAGAL MENYIMPAN" ERRROR

DO $$
BEGIN
    -- 1. HEADER CUSTOMIZATION COLUMNS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'header_font_weight') THEN
        ALTER TABLE school_settings ADD COLUMN header_font_weight TEXT DEFAULT 'bold';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'header_letter_spacing') THEN
        ALTER TABLE school_settings ADD COLUMN header_letter_spacing TEXT DEFAULT 'normal';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'header_bg_opacity') THEN
        ALTER TABLE school_settings ADD COLUMN header_bg_opacity NUMERIC DEFAULT 0.8;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'header_blur') THEN
        ALTER TABLE school_settings ADD COLUMN header_blur INTEGER DEFAULT 10;
    END IF;

    -- 2. SECTION ORDER (Optional, but preventing errors if frontend sends it)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'section_order') THEN
        ALTER TABLE school_settings ADD COLUMN section_order JSONB DEFAULT '["hero", "features", "dates", "videos", "cta"]';
    END IF;

    -- 3. BANK & PAYMENT INFO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'bank_name') THEN
        ALTER TABLE school_settings ADD COLUMN bank_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'bank_account_number') THEN
        ALTER TABLE school_settings ADD COLUMN bank_account_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'bank_account_holder') THEN
        ALTER TABLE school_settings ADD COLUMN bank_account_holder TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'registration_fee') THEN
        ALTER TABLE school_settings ADD COLUMN registration_fee NUMERIC DEFAULT 0;
    END IF;

    -- 4. DESCRIPTIONS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'fullday_description') THEN
        ALTER TABLE school_settings ADD COLUMN fullday_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'boarding_description') THEN
        ALTER TABLE school_settings ADD COLUMN boarding_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'online_description') THEN
        ALTER TABLE school_settings ADD COLUMN online_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'offline_description') THEN
        ALTER TABLE school_settings ADD COLUMN offline_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'school_settings' AND column_name = 'offline_message') THEN
        ALTER TABLE school_settings ADD COLUMN offline_message TEXT;
    END IF;

END $$;
