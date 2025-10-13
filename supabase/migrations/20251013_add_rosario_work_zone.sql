-- Add Rosario as a specific work zone within Santa Fe province
-- Rosario is a major city that should have its own zone

INSERT INTO public.work_zones (name, province_id, zone_type) 
SELECT 'Rosario', p.id, 'city' FROM public.provinces p WHERE p.code = 'SF'
ON CONFLICT DO NOTHING;
