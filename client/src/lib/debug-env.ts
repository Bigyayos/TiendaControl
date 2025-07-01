// Debug para verificar variables de entorno en el frontend
export function debugEnvironmentVariables() {
  console.log('🔍 Debug: Variables de entorno del frontend');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
  
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.log('✅ Todas las variables de entorno están configuradas');
    return true;
  } else {
    console.log('❌ Faltan variables de entorno');
    return false;
  }
} 