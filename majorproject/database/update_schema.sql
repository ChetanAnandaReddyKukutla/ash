-- Add approved column to profile table
ALTER TABLE public.profile ADD COLUMN approved BOOLEAN DEFAULT FALSE;

-- Create complaints table
CREATE TABLE public.complaints (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    complainant VARCHAR(50) NOT NULL,
    complaint_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraints if needed
-- ALTER TABLE public.complaints ADD CONSTRAINT fk_complaints_product 
-- FOREIGN KEY (product_id) REFERENCES public.product(serialnumber);

-- Create indexes for better performance
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at);
CREATE INDEX idx_profile_approved ON public.profile(approved);
CREATE INDEX idx_profile_role ON public.profile(role);

-- Update existing manufacturers to be approved by default (optional)
-- UPDATE public.profile SET approved = TRUE WHERE role = 'manufacturer';
