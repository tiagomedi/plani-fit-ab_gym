-- =========================================================
--  AB Gym Planner — Tabla de alumnos
--  Ejecutar en: Supabase → SQL Editor → New Query
-- =========================================================

-- 1. Tabla de alumnos y sus planes
CREATE TABLE IF NOT EXISTS alumnos (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text        NOT NULL,
  objetivo   text,
  nivel      text,
  num_dias   text,
  dias       jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alumnos_nombre_idx ON alumnos (nombre);

-- 2. Row Level Security
-- La app ya no tiene login propio: el acceso a la tabla queda abierto
-- a quien tenga la anon key (uso interno de entrenadores).
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alumnos_acceso_anon"
  ON alumnos FOR ALL
  USING (true)
  WITH CHECK (true);
