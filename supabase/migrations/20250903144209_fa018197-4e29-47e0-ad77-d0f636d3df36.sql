-- Insertar datos de prueba para profiles
INSERT INTO profiles (user_id, full_name, first_name, last_name, phone, whatsapp_phone, avatar_url, location_city, location_province, bio, skills) VALUES
-- Electricistas
('11111111-1111-1111-1111-111111111111', 'Carlos Rodríguez', 'Carlos', 'Rodríguez', '+5491134567890', '+5491134567890', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Buenos Aires', 'CABA', 'Electricista con más de 15 años de experiencia en instalaciones residenciales y comerciales', ARRAY['Instalaciones eléctricas', 'Automatización', 'Tableros eléctricos']),
('22222222-2222-2222-2222-222222222222', 'Miguel Fernández', 'Miguel', 'Fernández', '+5491123456789', '+5491123456789', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'San Isidro', 'GBA Norte', 'Especialista en sistemas eléctricos modernos y energía solar', ARRAY['Paneles solares', 'Smart home', 'Mantenimiento']),
('33333333-3333-3333-3333-333333333333', 'Roberto Silva', 'Roberto', 'Silva', '+5491145678901', '+5491145678901', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'La Plata', 'Buenos Aires', 'Electricista matriculado con especialización en industrial', ARRAY['Instalaciones industriales', 'Motores', 'Iluminación LED']),

-- Plomeros
('44444444-4444-4444-4444-444444444444', 'Juan Martínez', 'Juan', 'Martínez', '+5491156789012', '+5491156789012', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face', 'Palermo', 'CABA', 'Plomero con 20 años de experiencia en todo tipo de instalaciones', ARRAY['Destapaciones', 'Instalaciones de gas', 'Calefacción']),
('55555555-5555-5555-5555-555555555555', 'Pedro García', 'Pedro', 'García', '+5491167890123', '+5491167890123', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', 'Tigre', 'GBA Norte', 'Especialista en reparaciones de urgencia 24hs', ARRAY['Emergencias', 'Calderas', 'Termotanques']),
('66666666-6666-6666-6666-666666666666', 'Luis López', 'Luis', 'López', '+5491178901234', '+5491178901234', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop&crop=face', 'Quilmes', 'GBA Sur', 'Plomero gasista matriculado con certificación oficial', ARRAY['Gas natural', 'Instalaciones sanitarias', 'Radiadores']),

-- Carpinteros
('77777777-7777-7777-7777-777777777777', 'Fernando Ruiz', 'Fernando', 'Ruiz', '+5491189012345', '+5491189012345', 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face', 'Villa Crespo', 'CABA', 'Carpintero especialista en muebles a medida y restauración', ARRAY['Muebles a medida', 'Restauración', 'Carpintería fina']),
('88888888-8888-8888-8888-888888888888', 'Diego Morales', 'Diego', 'Morales', '+5491190123456', '+5491190123456', 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face', 'San Martín', 'GBA Norte', 'Construcción en seco y carpintería de obra', ARRAY['Durlock', 'Techos', 'Estructuras']),
('99999999-9999-9999-9999-999999999999', 'Alberto Castro', 'Alberto', 'Castro', '+5491101234567', '+5491101234567', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face', 'Lomas de Zamora', 'GBA Sur', 'Especialista en decks y pérgolas de madera', ARRAY['Decks', 'Pérgolas', 'Madera tratada']),

-- Pintores
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sebastián Vega', 'Sebastián', 'Vega', '+5491112345678', '+5491112345678', 'https://images.unsplash.com/photo-1578774204375-3e2d99bfd93a?w=150&h=150&fit=crop&crop=face', 'Belgrano', 'CABA', 'Pintor profesional con técnicas decorativas avanzadas', ARRAY['Pintura decorativa', 'Empapelado', 'Restauración']),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Matías Torres', 'Matías', 'Torres', '+5491123456789', '+5491123456789', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', 'Vicente López', 'GBA Norte', 'Especialista en fachadas y pintura exterior', ARRAY['Fachadas', 'Impermeabilización', 'Pintura industrial']),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Alejandro Paz', 'Alejandro', 'Paz', '+5491134567890', '+5491134567890', 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=150&h=150&fit=crop&crop=face', 'Lanús', 'GBA Sur', 'Pintor con especialización en acabados premium', ARRAY['Acabados especiales', 'Texturas', 'Color design']);

-- Insertar datos de prueba para professional_profiles
INSERT INTO professional_profiles (user_id, trade_name, description, years_experience, hourly_rate, whatsapp_phone, work_phone) VALUES
-- Electricistas
('11111111-1111-1111-1111-111111111111', 'Electricista', 'Instalaciones eléctricas residenciales y comerciales. Trabajos con garantía y materiales de primera calidad.', 15, 8500, '+5491134567890', '+5491134567890'),
('22222222-2222-2222-2222-222222222222', 'Electricista', 'Sistemas eléctricos modernos, domótica y energía solar. Presupuestos sin cargo.', 10, 9200, '+5491123456789', '+5491123456789'),
('33333333-3333-3333-3333-333333333333', 'Electricista', 'Electricista matriculado para instalaciones industriales y residenciales. Urgencias 24hs.', 12, 7800, '+5491145678901', '+5491145678901'),

-- Plomeros
('44444444-4444-4444-4444-444444444444', 'Plomero', 'Plomería integral: destapaciones, instalaciones, reparaciones. Servicio de emergencia las 24 horas.', 20, 7500, '+5491156789012', '+5491156789012'),
('55555555-5555-5555-5555-555555555555', 'Plomero', 'Especialista en calderas, termotanques y sistemas de calefacción. Reparaciones urgentes.', 8, 8000, '+5491167890123', '+5491167890123'),
('66666666-6666-6666-6666-666666666666', 'Plomero', 'Plomero gasista matriculado. Instalaciones de gas, sanitarios y sistemas de calefacción.', 18, 9500, '+5491178901234', '+5491178901234'),

-- Carpinteros
('77777777-7777-7777-7777-777777777777', 'Carpintero', 'Muebles a medida, placard, cocinas integrales. Diseño personalizado y carpintería fina.', 14, 8200, '+5491189012345', '+5491189012345'),
('88888888-8888-8888-8888-888888888888', 'Carpintero', 'Construcción en seco, durlock, techos y estructuras. Trabajos prolijos y en tiempo.', 11, 7200, '+5491190123456', '+5491190123456'),
('99999999-9999-9999-9999-999999999999', 'Carpintero', 'Especialista en trabajos exteriores: decks, pérgolas, gazebos. Madera tratada y natural.', 16, 8800, '+5491101234567', '+5491101234567'),

-- Pintores
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pintor', 'Pintura decorativa, empapelado, técnicas especiales. Transformamos tu hogar con arte.', 13, 6500, '+5491112345678', '+5491112345678'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pintor', 'Pintura de fachadas, impermeabilización y trabajos en altura. Equipos profesionales.', 9, 7000, '+5491123456789', '+5491123456789'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Pintor', 'Acabados premium, texturas especiales y asesoramiento en color. Calidad garantizada.', 17, 7800, '+5491134567890', '+5491134567890');