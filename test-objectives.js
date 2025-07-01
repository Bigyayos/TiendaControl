import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testObjectives() {
  try {
    console.log('🔍 Probando tabla de Objetivos...\n');
    
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión...');
    const { data: testData, error: testError } = await supabase
      .from('Objetivos')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error de conexión:', testError.message);
      return;
    }
    console.log('✅ Conexión exitosa\n');
    
    // 2. Contar registros
    console.log('2️⃣ Contando registros...');
    const { count, error: countError } = await supabase
      .from('Objetivos')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error contando registros:', countError.message);
    } else {
      console.log(`✅ Total de objetivos: ${count}\n`);
    }
    
    // 3. Obtener todos los objetivos
    console.log('3️⃣ Obteniendo todos los objetivos...');
    const { data: objectives, error: objectivesError } = await supabase
      .from('Objetivos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (objectivesError) {
      console.error('❌ Error obteniendo objetivos:', objectivesError.message);
    } else {
      console.log(`✅ Objetivos obtenidos: ${objectives?.length || 0}`);
      if (objectives && objectives.length > 0) {
        console.log('📋 Primer objetivo:');
        console.log(JSON.stringify(objectives[0], null, 2));
        
        // Mostrar todos los tipos únicos
        const tiposUnicos = [...new Set(objectives.map(obj => obj.tipo))];
        console.log('📋 Tipos únicos en la BD:', tiposUnicos);
      }
    }
    
    // 4. Obtener tiendas para verificar relación
    console.log('\n4️⃣ Verificando tiendas...');
    const { data: stores, error: storesError } = await supabase
      .from('Tiendas')
      .select('*')
      .order('id');
    
    if (storesError) {
      console.error('❌ Error obteniendo tiendas:', storesError.message);
    } else {
      console.log(`✅ Tiendas obtenidas: ${stores?.length || 0}`);
      if (stores && stores.length > 0) {
        console.log('📋 Primera tienda:');
        console.log(JSON.stringify(stores[0], null, 2));
      }
    }
    
    // 5. Probar inserción con valores válidos
    console.log('\n5️⃣ Probando inserción con valores válidos...');
    const testObjective = {
      tienda_id: stores?.[0]?.id || 1,
      tipo: 'mensual', // Usar un valor válido
      monto: 1000,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-12-31',
      activo: true
    };
    
    const { data: newObjective, error: insertError } = await supabase
      .from('Objetivos')
      .insert(testObjective)
      .select();
    
    if (insertError) {
      console.error('❌ Error insertando objetivo:', insertError.message);
    } else {
      console.log('✅ Objetivo insertado correctamente:');
      console.log(JSON.stringify(newObjective?.[0], null, 2));
      
      // Eliminar el objetivo de prueba
      if (newObjective?.[0]?.id) {
        const { error: deleteError } = await supabase
          .from('Objetivos')
          .delete()
          .eq('id', newObjective[0].id);
        
        if (deleteError) {
          console.error('⚠️ Error eliminando objetivo de prueba:', deleteError.message);
        } else {
          console.log('✅ Objetivo de prueba eliminado');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testObjectives(); 