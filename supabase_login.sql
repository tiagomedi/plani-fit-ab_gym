-- =========================================================
--  AB Gym Planner — Tabla de administradores con login seguro
--  Ejecutar en: Supabase → SQL Editor → New Query
-- =========================================================

-- 1. Extensión para hash de contraseñas (bcrypt)
-- En Supabase, pgcrypto se instala en el schema 'extensions'
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  username     text        UNIQUE NOT NULL,
  password_hash text       NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- 3. Row Level Security: nadie puede leer/escribir directamente desde el cliente
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_sin_acceso_directo"
  ON admins FOR ALL
  USING (false);

-- 4. Función segura de verificación (SECURITY DEFINER bypassa RLS internamente)
CREATE OR REPLACE FUNCTION verificar_login(p_username text, p_password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admins
    WHERE username     = p_username
      AND password_hash = crypt(p_password, password_hash)
  );
$$;

-- 5. Insertar usuario admin2026
INSERT INTO admins (username, password_hash)
VALUES (
  'admin2026',
  extensions.crypt('Mem$%^2026', extensions.gen_salt('bf'))
)
ON CONFLICT (username) DO NOTHING;
