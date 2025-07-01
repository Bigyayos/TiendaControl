import { Pool } from 'pg';

// Lista de posibles URLs de Supabase para probar
const possibleUrls = [
  'postgresql://postgres:Pab305290Ban@@db.lmitonmckoomqcorgnkj.supabase.co:5432/postgres',
  'postgresql://postgres:Pab305290Ban@@lmitonmckoomqcorgnkj.supabase.co:5432/postgres',
  'postgresql://postgres:Pab305290Ban@@db.lmitonmckoomqcorgnkj.supabase.co:6543/postgres',
  'postgresql://postgres:Pab305290Ban@@lmitonmckoomqcorgnkj.supabase.co:6543/postgres'
];

async function testUrl(url) {
  const pool = new Pool({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log(`🔌 Probando: ${url}`);
    const client = await pool.connect();
    console.log(`✅ Conexión exitosa!`);
    
    // Probar una consulta simple
    const result = await client.query('SELECT current_database() as db_name, current_user as user_name');
    console.log(`📊 Base de datos: ${result.rows[0].db_name}`);
    console.log(`👤 Usuario: ${result.rows[0].user_name}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    await pool.end();
    return false;
  }
}

async function testAllUrls() {
  console.log('🚀 Probando diferentes URLs de Supabase...\n');
  
  for (const url of possibleUrls) {
    const success = await testUrl(url);
    if (success) {
      console.log(`\n🎉 ¡URL correcta encontrada: ${url}`);
      return url;
    }
    console.log('');
  }
  
  console.log('❌ No se pudo conectar con ninguna URL');
  console.log('\n💡 Verifica en tu panel de Supabase:');
  console.log('   1. Ve a Settings > Database');
  console.log('   2. Busca "Connection string" o "Host"');
  console.log('   3. Asegúrate de que la URL sea correcta');
  
  return null;
}

testAllUrls(); 