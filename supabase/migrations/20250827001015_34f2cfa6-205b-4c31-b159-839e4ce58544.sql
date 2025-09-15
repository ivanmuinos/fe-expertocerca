-- Crear tabla para provincias argentinas
CREATE TABLE public.provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE, -- Código de 2-3 letras
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para zonas/regiones dentro de provincias (como GBA Norte, Sur, Oeste)
CREATE TABLE public.work_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  province_id UUID REFERENCES public.provinces(id) ON DELETE CASCADE,
  zone_type TEXT NOT NULL DEFAULT 'region', -- 'region', 'metropolitan', 'city', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name, province_id)
);

-- Crear tabla many-to-many para las zonas donde cada profesional trabaja
CREATE TABLE public.professional_work_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  work_zone_id UUID REFERENCES public.work_zones(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(professional_profile_id, work_zone_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_work_zones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para provinces (lectura pública)
CREATE POLICY "Anyone can view provinces" ON public.provinces FOR SELECT USING (true);

-- Políticas RLS para work_zones (lectura pública)
CREATE POLICY "Anyone can view work zones" ON public.work_zones FOR SELECT USING (true);

-- Políticas RLS para professional_work_zones
CREATE POLICY "Users can view their own work zones" 
ON public.professional_work_zones FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.professional_profiles pp 
    WHERE pp.id = professional_profile_id AND pp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own work zones" 
ON public.professional_work_zones FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.professional_profiles pp 
    WHERE pp.id = professional_profile_id AND pp.user_id = auth.uid()
  )
);

-- Insertar todas las provincias argentinas
INSERT INTO public.provinces (name, code) VALUES 
('Buenos Aires', 'BA'),
('Ciudad Autónoma de Buenos Aires', 'CABA'),
('Catamarca', 'CT'),
('Chaco', 'CC'),
('Chubut', 'CH'),
('Córdoba', 'CB'),
('Corrientes', 'CN'),
('Entre Ríos', 'ER'),
('Formosa', 'FM'),
('Jujuy', 'JY'),
('La Pampa', 'LP'),
('La Rioja', 'LR'),
('Mendoza', 'MZ'),
('Misiones', 'MN'),
('Neuquén', 'NQ'),
('Río Negro', 'RN'),
('Salta', 'SA'),
('San Juan', 'SJ'),
('San Luis', 'SL'),
('Santa Cruz', 'SC'),
('Santa Fe', 'SF'),
('Santiago del Estero', 'SE'),
('Tierra del Fuego', 'TF'),
('Tucumán', 'TM');

-- Insertar zonas para Buenos Aires (GBA y otras regiones)
INSERT INTO public.work_zones (name, province_id, zone_type) 
SELECT 'GBA Norte', p.id, 'metropolitan' FROM public.provinces p WHERE p.code = 'BA'
UNION ALL
SELECT 'GBA Sur', p.id, 'metropolitan' FROM public.provinces p WHERE p.code = 'BA'
UNION ALL
SELECT 'GBA Oeste', p.id, 'metropolitan' FROM public.provinces p WHERE p.code = 'BA'
UNION ALL
SELECT 'La Plata y alrededores', p.id, 'metropolitan' FROM public.provinces p WHERE p.code = 'BA'
UNION ALL
SELECT 'Interior de Buenos Aires', p.id, 'region' FROM public.provinces p WHERE p.code = 'BA';

-- Insertar CABA como zona única
INSERT INTO public.work_zones (name, province_id, zone_type)
SELECT 'Ciudad Autónoma de Buenos Aires', p.id, 'city' FROM public.provinces p WHERE p.code = 'CABA';

-- Para otras provincias, insertar la provincia completa como zona de trabajo
INSERT INTO public.work_zones (name, province_id, zone_type)
SELECT p.name, p.id, 'province' 
FROM public.provinces p 
WHERE p.code NOT IN ('BA', 'CABA');