-- Add form-specific assessor columns to school_assessments
ALTER TABLE school_assessments
ADD COLUMN IF NOT EXISTS assessor_form_1 VARCHAR(255),
ADD COLUMN IF NOT EXISTS assessor_form_2 VARCHAR(255),
ADD COLUMN IF NOT EXISTS assessor_form_3 VARCHAR(255),
ADD COLUMN IF NOT EXISTS assessor_form_4 VARCHAR(255);
