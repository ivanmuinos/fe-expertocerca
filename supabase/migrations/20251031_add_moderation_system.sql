-- Sistema de moderación y baneos
-- Registra violaciones de políticas de contenido y gestiona baneos de usuarios

-- Tabla para registrar violaciones de contenido
CREATE TABLE IF NOT EXISTS public.content_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type text NOT NULL, -- 'adult', 'violence', 'weapon', 'racy', etc.
  severity text NOT NULL, -- 'low', 'medium', 'high', 'critical'
  image_data jsonb, -- Detalles de la imagen rechazada (opcional)
  moderation_details jsonb, -- Resultado completo de la moderación
  created_at timestamptz DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_content_violations_user_id ON public.content_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_violations_created_at ON public.content_violations(created_at DESC);

-- Agregar campos de moderación a la tabla profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS banned_at timestamptz,
ADD COLUMN IF NOT EXISTS banned_until timestamptz, -- NULL = ban permanente
ADD COLUMN IF NOT EXISTS violation_count integer DEFAULT 0;

-- Comentarios
COMMENT ON TABLE public.content_violations IS 'Registra violaciones de políticas de contenido por usuario';
COMMENT ON COLUMN public.profiles.is_banned IS 'Usuario baneado (temporal o permanente)';
COMMENT ON COLUMN public.profiles.ban_reason IS 'Razón del baneo';
COMMENT ON COLUMN public.profiles.banned_at IS 'Fecha del baneo';
COMMENT ON COLUMN public.profiles.banned_until IS 'Fecha de fin del baneo (NULL = permanente)';
COMMENT ON COLUMN public.profiles.violation_count IS 'Contador de violaciones de contenido';

-- RLS Policies
ALTER TABLE public.content_violations ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver todas las violaciones
CREATE POLICY "Admins can view all violations"
ON public.content_violations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Los usuarios pueden ver sus propias violaciones
CREATE POLICY "Users can view their own violations"
ON public.content_violations
FOR SELECT
USING (auth.uid() = user_id);

-- Solo el sistema puede insertar violaciones (desde el backend)
CREATE POLICY "System can insert violations"
ON public.content_violations
FOR INSERT
WITH CHECK (true);

-- Función para verificar si un usuario está baneado
CREATE OR REPLACE FUNCTION public.is_user_banned(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN is_banned = false THEN false
      WHEN banned_until IS NULL THEN true -- Ban permanente
      WHEN banned_until > now() THEN true -- Ban temporal activo
      ELSE false -- Ban temporal expirado
    END
  FROM profiles
  WHERE user_id = check_user_id;
$$;

-- Función para obtener información del ban
CREATE OR REPLACE FUNCTION public.get_ban_info(check_user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'is_banned', is_banned,
    'ban_reason', ban_reason,
    'banned_at', banned_at,
    'banned_until', banned_until,
    'is_permanent', (is_banned AND banned_until IS NULL),
    'violation_count', violation_count
  )
  FROM profiles
  WHERE user_id = check_user_id;
$$;
