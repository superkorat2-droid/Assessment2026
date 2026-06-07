-- Create school_assessments table
CREATE TABLE IF NOT EXISTS school_assessments (
  dmc_code VARCHAR(20) PRIMARY KEY,
  school_name VARCHAR(255) NOT NULL,
  district VARCHAR(100) NOT NULL,
  school_group VARCHAR(100) NOT NULL,
  assessor_name VARCHAR(255),
  
  -- Statuses for the 4 evaluation areas
  status_form_1 VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'draft', 'completed'
  status_form_2 VARCHAR(20) DEFAULT 'pending' NOT NULL,
  status_form_3 VARCHAR(20) DEFAULT 'pending' NOT NULL,
  status_form_4 VARCHAR(20) DEFAULT 'pending' NOT NULL,
  
  -- JSONB raw data for the 4 forms
  data_form_1 JSONB DEFAULT '{}'::JSONB NOT NULL,
  data_form_2 JSONB DEFAULT '{}'::JSONB NOT NULL,
  data_form_3 JSONB DEFAULT '{}'::JSONB NOT NULL,
  data_form_4 JSONB DEFAULT '{}'::JSONB NOT NULL,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexing for quick lookups and search
CREATE INDEX IF NOT EXISTS idx_school_assessments_district ON school_assessments(district);
CREATE INDEX IF NOT EXISTS idx_school_assessments_school_group ON school_assessments(school_group);
CREATE INDEX IF NOT EXISTS idx_school_assessments_status_form_1 ON school_assessments(status_form_1);
CREATE INDEX IF NOT EXISTS idx_school_assessments_status_form_2 ON school_assessments(status_form_2);
CREATE INDEX IF NOT EXISTS idx_school_assessments_status_form_3 ON school_assessments(status_form_3);
CREATE INDEX IF NOT EXISTS idx_school_assessments_status_form_4 ON school_assessments(status_form_4);
