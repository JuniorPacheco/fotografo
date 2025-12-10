-- ============================================
-- Script SQL para poblar la base de datos
-- Ejecutar este script en DBeaver o cualquier cliente SQL
-- ============================================

-- 1. Crear usuario administrador (si no existe)
-- Email: admin@admin.com
-- Password: elmasteradmin (hasheada con bcrypt)
INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@admin.com',
  '$2a$10$6rIB3zLfru.qZ5svOBYKZehLeeCP.6o/JJ9AfNZpoSaUmobrt4bCO', -- Hash de 'elmasteradmin'
  'Administrator',
  'OWNER',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 2. Crear paquetes por defecto (si no existen)
-- Usamos INSERT con ON CONFLICT para evitar duplicados basados en el nombre

-- Paquete Básico
INSERT INTO packages (id, name, "suggestedPrice", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Paquete Básico',
  150000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete Básico' AND "deletedAt" IS NULL
);

-- Paquete Estándar
INSERT INTO packages (id, name, "suggestedPrice", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Paquete Estándar',
  300000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete Estándar' AND "deletedAt" IS NULL
);

-- Paquete Premium
INSERT INTO packages (id, name, "suggestedPrice", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Paquete Premium',
  500000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete Premium' AND "deletedAt" IS NULL
);

-- Paquete Deluxe
INSERT INTO packages (id, name, "suggestedPrice", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Paquete Deluxe',
  750000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete Deluxe' AND "deletedAt" IS NULL
);

-- Paquete Boda
INSERT INTO packages (id, name, "suggestedPrice", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Paquete Boda',
  1200000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete Boda' AND "deletedAt" IS NULL
);

-- Paquete Quinceañera
INSERT INTO packages (id, name, "suggestedPrice", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Paquete Quinceañera',
  1000000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete Quinceañera' AND "deletedAt" IS NULL
);

-- Paquete Graduación
INSERT INTO packages (id, name, "suggestedPrice", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Paquete Graduación',
  400000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete Graduación' AND "deletedAt" IS NULL
);

-- Paquete Familiar
INSERT INTO packages (id, name, "suggestedPrice", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Paquete Familiar',
  250000.00,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM packages WHERE name = 'Paquete Familiar' AND "deletedAt" IS NULL
);

-- ============================================
-- Verificación (opcional - ejecutar después para confirmar)
-- ============================================

-- Verificar usuario admin creado
SELECT id, email, name, role, "isActive", "createdAt" 
FROM users 
WHERE email = 'admin@admin.com';

-- Verificar paquetes creados
SELECT id, name, "suggestedPrice", "createdAt" 
FROM packages 
WHERE "deletedAt" IS NULL 
ORDER BY "suggestedPrice" ASC;

