import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Tipos de datos
export interface Store {
  id: number;
  name: string;
  address: string;
  manager: string;
  employees: number;
  isActive: boolean;
  monthlyObjective: string;
  createdAt: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  storeId: number;
  isActive: boolean;
  createdAt: string;
}

export interface Sale {
  id: number;
  storeId: number;
  employeeId: number;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Objective {
  id: number;
  storeId: number;
  target: number;
  month: string;
  createdAt: string;
}

// Hooks para Tiendas
export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async (): Promise<Store[]> => {
      const { data, error } = await supabase
        .from('Tiendas')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('❌ Error en consulta Tiendas:', error);
        throw error;
      }
      
      console.log('✅ Tiendas cargadas:', data?.length || 0, 'registros');
      
      return data.map(row => ({
        id: row.id,
        name: row.nombre,
        address: row.direccion,
        manager: row.telefono || 'Por asignar',
        employees: 0, // No disponible en la BD
        isActive: row.activa,
        monthlyObjective: '0', // No disponible en la BD
        createdAt: row.created_at
      }));
    }
  });
}

export function useStore(id: number) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: async (): Promise<Store | undefined> => {
      const { data, error } = await supabase
        .from('Tiendas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) return undefined;
      
      return {
        id: data.id,
        name: data.nombre,
        address: data.direccion,
        manager: data.telefono || 'Por asignar',
        employees: 0, // No disponible en la BD
        isActive: data.activa,
        monthlyObjective: '0', // No disponible en la BD
        createdAt: data.created_at
      };
    },
    enabled: !!id
  });
}

// Hooks para Empleados
export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<Employee[]> => {
      const { data, error } = await supabase
        .from('Empleados')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('❌ Error en consulta Empleados:', error);
        throw error;
      }
      
      console.log('✅ Empleados cargados:', data?.length || 0, 'registros');
      
      return data.map(row => ({
        id: row.id,
        name: `${row.nombre} ${row.apellidos}`,
        email: row.email,
        role: row.rol,
        storeId: row.tienda_id,
        isActive: row.activo,
        createdAt: row.created_at
      }));
    }
  });
}

// Hooks para Ventas
export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from('Ventas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error en consulta Ventas:', error);
        throw error;
      }
      
      console.log('✅ Ventas cargadas:', data?.length || 0, 'registros');
      
      return data.map(row => ({
        id: row.id,
        storeId: row.tienda_id || row.store_id,
        employeeId: row.empleado_id || row.employee_id,
        amount: row.monto || row.amount,
        date: row.fecha || row.date,
        createdAt: row.created_at || row.createdAt
      }));
    }
  });
}

// Hooks para Objetivos
export function useObjectives() {
  return useQuery({
    queryKey: ['objectives'],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from('Objetivos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error en consulta Objetivos:', error);
        throw error;
      }
      
      console.log('✅ Objetivos cargados:', data?.length || 0, 'registros');
      
      return data.map(row => ({
        id: row.id,
        storeId: row.tienda_id,
        period: row.tipo,
        target: Number(row.monto),
        startDate: row.fecha_inicio,
        endDate: row.fecha_fin,
        isActive: row.activo,
        createdAt: row.created_at
      }));
    }
  });
} 