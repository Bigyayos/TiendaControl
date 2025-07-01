import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuración del cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔌 Configuración de Supabase:');
console.log(`Key: ${supabaseKey ? '✅ Configurada' : '❌ No configurada'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las credenciales de Supabase en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('\n🔌 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const { data: testData, error: testError } = await supabase
      .from('Tiendas')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError.message);
      return;
    }
    
    console.log('✅ Conexión exitosa a Supabase');
    
    // Probar consulta a cada tabla
    console.log('\n📊 Verificando tablas disponibles...');
    
    // Tiendas
    try {
      const { data: tiendas, error } = await supabase
        .from('Tiendas')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`  ❌ Error en Tiendas: ${error.message}`);
      } else {
        console.log(`  ✅ Tiendas: ${tiendas.length} registros encontrados`);
        if (tiendas.length > 0) {
          console.log(`     Ejemplo: ${tiendas[0].nombre || tiendas[0].name}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error en Tiendas: ${error.message}`);
    }
    
    // Empleados
    try {
      const { data: empleados, error } = await supabase
        .from('Empleados')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`  ❌ Error en Empleados: ${error.message}`);
      } else {
        console.log(`  ✅ Empleados: ${empleados.length} registros encontrados`);
        if (empleados.length > 0) {
          console.log(`     Ejemplo: ${empleados[0].nombre || empleados[0].name}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error en Empleados: ${error.message}`);
    }
    
    // Ventas
    try {
      const { data: ventas, error } = await supabase
        .from('Ventas')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`  ❌ Error en Ventas: ${error.message}`);
      } else {
        console.log(`  ✅ Ventas: ${ventas.length} registros encontrados`);
        if (ventas.length > 0) {
          console.log(`     Ejemplo: €${ventas[0].monto || ventas[0].amount}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error en Ventas: ${error.message}`);
    }
    
    // Objetivos
    try {
      const { data: objetivos, error } = await supabase
        .from('Objetivos')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`  ❌ Error en Objetivos: ${error.message}`);
      } else {
        console.log(`  ✅ Objetivos: ${objetivos.length} registros encontrados`);
        if (objetivos.length > 0) {
          console.log(`     Ejemplo: €${objetivos[0].objetivo || objetivos[0].target}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error en Objetivos: ${error.message}`);
    }
    
    console.log('\n🎉 Prueba de conexión completada exitosamente');
    console.log('✅ El proyecto está listo para usar Supabase');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.log('\n💡 Verifica:');
    console.log('  1. Que las credenciales en .env sean correctas');
    console.log('  2. Que las tablas existan en tu base de datos de Supabase');
    console.log('  3. Que tengas permisos de lectura en las tablas');
  }
}

testSupabaseConnection(); 