import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno de manera explícita
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('🔧 Cargando variables de entorno...');
console.log('Archivo .env encontrado:', result.parsed ? '✅ Sí' : '❌ No');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Error: Variables de entorno no cargadas correctamente');
  process.exit(1);
}

// Solo importar el servidor después de verificar las variables
import './index';

