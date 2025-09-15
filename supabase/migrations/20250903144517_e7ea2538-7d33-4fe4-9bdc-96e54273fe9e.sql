-- Solo agregar más variedad a los datos existentes sin crear duplicados
-- Actualizar professional_profiles existentes con más diversidad

UPDATE professional_profiles SET 
  trade_name = CASE id::text
    WHEN (SELECT id::text FROM professional_profiles ORDER BY id LIMIT 1 OFFSET 0) THEN 'Jardinero'
    WHEN (SELECT id::text FROM professional_profiles ORDER BY id LIMIT 1 OFFSET 1) THEN 'Mecánico' 
    WHEN (SELECT id::text FROM professional_profiles ORDER BY id LIMIT 1 OFFSET 2) THEN 'Técnico AC'
    ELSE trade_name
  END,
  description = CASE id::text
    WHEN (SELECT id::text FROM professional_profiles ORDER BY id LIMIT 1 OFFSET 0) THEN 'Diseño y mantenimiento de jardines. Poda, césped y paisajismo profesional.'
    WHEN (SELECT id::text FROM professional_profiles ORDER BY id LIMIT 1 OFFSET 1) THEN 'Reparación integral de vehículos. Mecánica general y diagnóstico computarizado.'
    WHEN (SELECT id::text FROM professional_profiles ORDER BY id LIMIT 1 OFFSET 2) THEN 'Instalación y reparación de aires acondicionados. Service y mantenimiento.'
    ELSE description
  END
WHERE id IN (SELECT id FROM professional_profiles ORDER BY id LIMIT 3);

-- Actualizar ubicaciones en profiles para más variedad
UPDATE profiles SET 
  location_city = CASE 
    WHEN location_city IS NULL OR location_city = '' THEN 'Buenos Aires'
    ELSE location_city
  END,
  location_province = CASE 
    WHEN location_province IS NULL OR location_province = '' THEN 'CABA'
    ELSE location_province
  END
WHERE id IN (SELECT id FROM profiles LIMIT 10);