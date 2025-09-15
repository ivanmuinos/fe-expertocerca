-- Primero vamos a insertar algunos usuarios de prueba en auth.users (simulando que ya existen)
-- En lugar de insertar directamente, vamos a usar datos que ya existen o crear perfiles ficticios más simples

-- Insertar algunos perfiles de prueba simples sin referencias a usuarios específicos
-- Usaremos un enfoque diferente: solo agregar más variedad a los datos existentes

-- Actualizar algunos perfiles existentes con más variedad
UPDATE profiles SET 
  location_city = 'Córdoba', 
  location_province = 'Córdoba',
  skills = ARRAY['Electricidad industrial', 'Automatización', 'PLC']
WHERE full_name IS NULL AND id IN (
  SELECT id FROM profiles LIMIT 1
);

-- Agregar más variedad a los professional_profiles existentes
UPDATE professional_profiles SET 
  trade_name = CASE 
    WHEN trade_name = 'Electricista' THEN 'Técnico AC'
    WHEN trade_name = 'Plomero' THEN 'Gasista'  
    WHEN trade_name = 'Carpintero' THEN 'Albañil'
    ELSE trade_name
  END,
  description = CASE
    WHEN trade_name = 'Electricista' THEN 'Instalación y reparación de equipos de aire acondicionado. Service completo.'
    WHEN trade_name = 'Plomero' THEN 'Instalaciones de gas natural y envasado. Matriculado y habilitado.'
    WHEN trade_name = 'Carpintero' THEN 'Construcción y reformas integrales. Albañilería tradicional y moderna.'
    ELSE description
  END,
  years_experience = years_experience + (RANDOM() * 5)::INTEGER
WHERE id IN (
  SELECT id FROM professional_profiles ORDER BY RANDOM() LIMIT 5
);