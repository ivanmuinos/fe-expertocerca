-- Crear más variedad de datos de prueba trabajando con usuarios existentes
-- Vamos a duplicar y variar los datos existentes para tener más contenido

-- Primero, crear copias de professional_profiles existentes con diferentes oficios
INSERT INTO professional_profiles (user_id, trade_name, description, years_experience, hourly_rate, whatsapp_phone, work_phone)
SELECT 
  user_id,
  CASE (ROW_NUMBER() OVER ())::INTEGER % 12
    WHEN 1 THEN 'Jardinero'
    WHEN 2 THEN 'Mecánico'
    WHEN 3 THEN 'Cerrajero'
    WHEN 4 THEN 'Soldador'
    WHEN 5 THEN 'Techista'
    WHEN 6 THEN 'Técnico AC'
    WHEN 7 THEN 'Gasista'
    WHEN 8 THEN 'Albañil'
    WHEN 9 THEN 'Pintor'
    WHEN 10 THEN 'Electricista'
    WHEN 11 THEN 'Plomero'
    ELSE 'Carpintero'
  END,
  CASE (ROW_NUMBER() OVER ())::INTEGER % 12
    WHEN 1 THEN 'Diseño y mantenimiento de jardines. Poda, césped y paisajismo profesional.'
    WHEN 2 THEN 'Reparación integral de vehículos. Mecánica general y diagnóstico computarizado.'
    WHEN 3 THEN 'Apertura de puertas, cambio de cerraduras, duplicado de llaves y seguridad.'
    WHEN 4 THEN 'Soldadura eléctrica y autógena. Estructuras metálicas y reparaciones.'
    WHEN 5 THEN 'Reparación e impermeabilización de techos. Especialista en filtraciones.'
    WHEN 6 THEN 'Instalación y reparación de aires acondicionados. Service y mantenimiento.'
    WHEN 7 THEN 'Instalaciones de gas natural y envasado. Matriculado oficial.'
    WHEN 8 THEN 'Construcción y reformas. Revoque, mampostería y trabajos generales.'
    WHEN 9 THEN 'Pintura interior y exterior. Acabados decorativos y restauración.'
    WHEN 10 THEN 'Instalaciones eléctricas completas. Tableros y automatización.'
    WHEN 11 THEN 'Plomería integral. Destapaciones, instalaciones y reparaciones.'
    ELSE 'Carpintería en general. Muebles, estructuras y trabajos a medida.'
  END,
  (5 + (RANDOM() * 15))::INTEGER, -- Entre 5 y 20 años de experiencia
  (6000 + (RANDOM() * 4000))::NUMERIC, -- Entre $6000 y $10000 por hora
  whatsapp_phone,
  work_phone
FROM professional_profiles 
WHERE id IN (SELECT id FROM professional_profiles LIMIT 10);

-- Actualizar profiles existentes con más variedad en ubicaciones
UPDATE profiles SET 
  location_city = CASE (RANDOM() * 15)::INTEGER
    WHEN 0 THEN 'Buenos Aires'
    WHEN 1 THEN 'Córdoba'
    WHEN 2 THEN 'Rosario'
    WHEN 3 THEN 'La Plata'
    WHEN 4 THEN 'Mar del Plata'
    WHEN 5 THEN 'Tigre'
    WHEN 6 THEN 'San Isidro'
    WHEN 7 THEN 'Vicente López'
    WHEN 8 THEN 'Quilmes'
    WHEN 9 THEN 'Lanús'
    WHEN 10 THEN 'Lomas de Zamora'
    WHEN 11 THEN 'San Martín'
    WHEN 12 THEN 'Palermo'
    WHEN 13 THEN 'Belgrano'
    WHEN 14 THEN 'Villa Crespo'
    ELSE 'Recoleta'
  END,
  location_province = CASE 
    WHEN location_city IN ('Córdoba', 'Rosario') THEN 'Córdoba'
    WHEN location_city = 'Mar del Plata' THEN 'Buenos Aires'
    WHEN location_city IN ('Buenos Aires', 'Palermo', 'Belgrano', 'Villa Crespo', 'Recoleta') THEN 'CABA'
    WHEN location_city IN ('Tigre', 'San Isidro', 'Vicente López', 'San Martín') THEN 'GBA Norte'
    WHEN location_city IN ('Quilmes', 'Lanús', 'Lomas de Zamora') THEN 'GBA Sur'
    ELSE 'Buenos Aires'
  END,
  skills = CASE (RANDOM() * 8)::INTEGER
    WHEN 0 THEN ARRAY['Instalaciones', 'Reparaciones', 'Mantenimiento']
    WHEN 1 THEN ARRAY['Urgencias 24hs', 'Garantía', 'Presupuesto gratis']
    WHEN 2 THEN ARRAY['Trabajo prolijo', 'Materiales incluidos', 'Experiencia']
    WHEN 3 THEN ARRAY['Matriculado', 'Habilitado', 'Seguro responsabilidad']
    WHEN 4 THEN ARRAY['Diseño personalizado', 'Asesoramiento', 'Calidad premium']
    WHEN 5 THEN ARRAY['Equipos modernos', 'Técnicas avanzadas', 'Certificado']
    WHEN 6 THEN ARRAY['Servicio rápido', 'Atención profesional', 'Limpieza']
    ELSE ARRAY['Especialista', 'Años de experiencia', 'Recomendado']
  END
WHERE id IN (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 20);

-- Agregar nombres más realistas a profiles que no los tienen
UPDATE profiles SET 
  full_name = CASE (RANDOM() * 20)::INTEGER
    WHEN 0 THEN 'Carlos Rodríguez'
    WHEN 1 THEN 'Miguel Fernández'
    WHEN 2 THEN 'Roberto Silva'
    WHEN 3 THEN 'Juan Martínez'
    WHEN 4 THEN 'Pedro García'
    WHEN 5 THEN 'Luis López'
    WHEN 6 THEN 'Fernando Ruiz'
    WHEN 7 THEN 'Diego Morales'
    WHEN 8 THEN 'Alberto Castro'
    WHEN 9 THEN 'Sebastián Vega'
    WHEN 10 THEN 'Matías Torres'
    WHEN 11 THEN 'Alejandro Paz'
    WHEN 12 THEN 'Andrés Herrera'
    WHEN 13 THEN 'Daniel Romero'
    WHEN 14 THEN 'Marcelo Sánchez'
    WHEN 15 THEN 'Pablo Gutiérrez'
    WHEN 16 THEN 'Raúl Jiménez'
    WHEN 17 THEN 'Gustavo Molina'
    WHEN 18 THEN 'Ernesto Vargas'
    ELSE 'Oscar Mendoza'
  END
WHERE full_name IS NULL;