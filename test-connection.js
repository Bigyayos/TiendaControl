import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Configuración de la conexión a Supabase usando URL completa
const connectionString = 'postgresql://postgres:Pab305290Ban@@db.lmitonmckoomqcorgnkj.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a Supabase');
    
    // Probar consulta a las tablas
    console.log('\n📊 Verificando tablas disponibles...');
    
    // Listar tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('Tiendas', 'Empleados', 'Ventas', 'Objetivos', 'Usuarios_Sistema')
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Probar consulta a cada tabla
    console.log('\n🔍 Probando consultas a las tablas...');
    
    // Tiendas
    try {
      const tiendasResult = await client.query('SELECT COUNT(*) as count FROM "Tiendas"');
      console.log(`  ✅ Tiendas: ${tiendasResult.rows[0].count} registros`);
    } catch (error) {
      console.log(`  ❌ Error en Tiendas: ${error.message}`);
    }
    
    // Empleados
    try {
      const empleadosResult = await client.query('SELECT COUNT(*) as count FROM "Empleados"');
      console.log(`  ✅ Empleados: ${empleadosResult.rows[0].count} registros`);
    } catch (error) {
      console.log(`  ❌ Error en Empleados: ${error.message}`);
    }
    
    // Ventas
    try {
      const ventasResult = await client.query('SELECT COUNT(*) as count FROM "Ventas"');
      console.log(`  ✅ Ventas: ${ventasResult.rows[0].count} registros`);
    } catch (error) {
      console.log(`  ❌ Error en Ventas: ${error.message}`);
    }
    
    // Objetivos
    try {
      const objetivosResult = await client.query('SELECT COUNT(*) as count FROM "Objetivos"');
      console.log(`  ✅ Objetivos: ${objetivosResult.rows[0].count} registros`);
    } catch (error) {
      console.log(`  ❌ Error en Objetivos: ${error.message}`);
    }
    
    client.release();
    console.log('\n🎉 Prueba de conexión completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Asegúrate de:');
    console.log('  1. Tener la contraseña correcta en config.env');
    console.log('  2. Que la base de datos esté accesible');
    console.log('  3. Que las credenciales sean correctas');
  } finally {
    await pool.end();
  }
}

testConnection(); 