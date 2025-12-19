-- Create delivery_zones table
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area TEXT NOT NULL,
    delivery_time TEXT NOT NULL,
    fee TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.delivery_zones
    FOR SELECT USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access" ON public.delivery_zones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Insert initial data
INSERT INTO public.delivery_zones (area, delivery_time, fee, display_order)
VALUES 
    ('Galali, Muharraq', 'Same Day', 'Free (orders BD 20+)', 1),
    ('Hidd, Arad, Busaiteen', 'Same Day', 'BD 1.500', 2),
    ('Manama, Juffair, Seef', 'Next Day', 'BD 1.500', 3),
    ('Riffa, Isa Town', 'Next Day', 'BD 2.000', 4),
    ('All Other Areas', '1-2 Days', 'BD 2.500', 5);
