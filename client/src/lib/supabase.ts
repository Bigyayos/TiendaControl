import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crear un cliente mock si no hay variables de entorno
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: new Error('Variables de entorno no configuradas') }),
    update: () => Promise.resolve({ data: null, error: new Error('Variables de entorno no configuradas') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Variables de entorno no configuradas') }),
    eq: () => Promise.resolve({ data: null, error: new Error('Variables de entorno no configuradas') }),
    order: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: new Error('Variables de entorno no configuradas') })
  })
});

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient(); 