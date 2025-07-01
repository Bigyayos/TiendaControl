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
      
      if (error) throw error;
      
      return data.map(row => ({
        id: row.id,
        name: row.nombre || row.name,
        address: row.direccion || row.address,
        manager: row.gerente || row.manager || 'Por asignar',
        employees: row.empleados || row.employees || 0,
        isActive: row.activa || row.is_active || row.isActive,
        monthlyObjective: row.objetivo_mensual || row.monthly_objective || row.monthlyObjective || '0',
        createdAt: row.created_at || row.createdAt
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
        name: data.nombre || data.name,
        address: data.direccion || data.address,
        manager: data.gerente || data.manager || 'Por asignar',
        employees: data.empleados || data.employees || 0,
        isActive: data.activa || data.is_active || data.isActive,
        monthlyObjective: data.objetivo_mensual || data.monthly_objective || data.monthlyObjective || '0',
        createdAt: data.created_at || data.createdAt
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
      
      if (error) throw error;
      
      return data.map(row => ({
        id: row.id,
        name: row.nombre || row.name,
        email: row.email,
        role: row.rol || row.role,
        storeId: row.tienda_id || row.store_id,
        isActive: row.activo || row.is_active || row.isActive,
        createdAt: row.created_at || row.createdAt
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
      
      if (error) throw error;
      
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
    queryFn: async (): Promise<Objective[]> => {
      const { data, error } = await supabase
        .from('Objetivos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(row => ({
        id: row.id,
        storeId: row.tienda_id || row.store_id,
        target: row.objetivo || row.target,
        month: row.mes || row.month,
        createdAt: row.created_at || row.createdAt
      }));
    }
  });
} 