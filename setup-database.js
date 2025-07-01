import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🔍 Verificando tablas existentes...');
    
    // Listar todas las tablas
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('Usando método alternativo para listar tablas...');
      // Método alternativo
      const { data: pgTables, error: pgError } = await supabase
        .rpc('get_tables');
      
      if (pgError) {
        console.log('No se pueden listar las tablas automáticamente.');
        console.log('Verificando tablas específicas...');
      }
    }
    
    console.log('\n📋 Verificando tablas específicas...');
    
    // Verificar cada tabla individualmente
    const requiredTables = ['Tiendas', 'Empleados', 'Ventas', 'Objetivos', 'Usuarios_Sistema'];
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${tableName}: No existe`);
        } else {
          console.log(`  ✅ ${tableName}: Existe`);
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: No existe`);
      }
    }
    
    console.log('\n💡 Para crear las tablas faltantes:');
    console.log('1. Ve a tu panel de Supabase');
    console.log('2. Navega a SQL Editor');
    console.log('3. Ejecuta los siguientes comandos SQL:');
    
    console.log('\n📝 SQL para crear las tablas:');
    console.log(`
-- Crear tabla Tiendas
CREATE TABLE IF NOT EXISTS "Tiendas" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  gerente VARCHAR(255),
  empleados INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT true,
  objetivo_mensual VARCHAR(50) DEFAULT '0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla Empleados
CREATE TABLE IF NOT EXISTS "Empleados" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  rol VARCHAR(100) DEFAULT 'vendedor',
  tienda_id INTEGER REFERENCES "Tiendas"(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla Ventas
CREATE TABLE IF NOT EXISTS "Ventas" (
  id SERIAL PRIMARY KEY,
  tienda_id INTEGER REFERENCES "Tiendas"(id),
  empleado_id INTEGER REFERENCES "Empleados"(id),
  monto VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla Objetivos
CREATE TABLE IF NOT EXISTS "Objetivos" (
  id SERIAL PRIMARY KEY,
  tienda_id INTEGER REFERENCES "Tiendas"(id),
  periodo VARCHAR(50) DEFAULT 'mensual',
  objetivo VARCHAR(50) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla Usuarios_Sistema (si no existe)
CREATE TABLE IF NOT EXISTS "Usuarios_Sistema" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  rol VARCHAR(100) DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `);
    
    console.log('\n🎯 Después de crear las tablas, ejecuta:');
    console.log('node test-supabase.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase(); 