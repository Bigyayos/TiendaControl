import { createClient } from '@supabase/supabase-js';
import { 
  type Store, 
  type InsertStore,
  type Employee,
  type InsertEmployee,
  type Sale,
  type InsertSale,
  type Objective,
  type InsertObjective
} from "@shared/schema";

export class SupabaseStorage {
  private supabase: any;

  constructor() {
    // Configuración del cliente de Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log('🔧 Configuración de Supabase:');
    console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada');
    console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ No configurada');

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Error: Faltan las credenciales de Supabase');
      console.error('Asegúrate de que .env esté en el directorio raíz del proyecto');
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Stores (Tiendas)
  async getStores(): Promise<Store[]> {
    const { data, error } = await this.supabase
      .from('Tiendas')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }

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

  async getStore(id: number): Promise<Store | undefined> {
    const { data, error } = await this.supabase
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
  }

  async createStore(store: InsertStore): Promise<Store> {
    const { data, error } = await this.supabase
      .from('Tiendas')
      .insert({
        nombre: store.name,
        direccion: store.address,
        gerente: store.manager,
        empleados: store.employees,
        activa: store.isActive,
        objetivo_mensual: store.monthlyObjective
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating store:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.nombre,
      address: data.direccion,
      manager: data.gerente,
      employees: data.empleados,
      isActive: data.activa,
      monthlyObjective: data.objetivo_mensual,
      createdAt: data.created_at
    };
  }

  async updateStore(id: number, store: Partial<InsertStore>): Promise<Store | undefined> {
    const updateData: any = {};
    
    if (store.name !== undefined) updateData.nombre = store.name;
    if (store.address !== undefined) updateData.direccion = store.address;
    if (store.manager !== undefined) updateData.gerente = store.manager;
    if (store.employees !== undefined) updateData.empleados = store.employees;
    if (store.isActive !== undefined) updateData.activa = store.isActive;
    if (store.monthlyObjective !== undefined) updateData.objetivo_mensual = store.monthlyObjective;

    const { data, error } = await this.supabase
      .from('Tiendas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.nombre,
      address: data.direccion,
      manager: data.gerente,
      employees: data.empleados,
      isActive: data.activa,
      monthlyObjective: data.objetivo_mensual,
      createdAt: data.created_at
    };
  }

  async deleteStore(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('Tiendas')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Employees (Empleados)
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await this.supabase
      .from('Empleados')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

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

  async getEmployeesByStore(storeId: number): Promise<Employee[]> {
    const { data, error } = await this.supabase
      .from('Empleados')
      .select('*')
      .eq('tienda_id', storeId)
      .order('id');

    if (error) {
      console.error('Error fetching employees by store:', error);
      throw error;
    }

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

  async getEmployee(id: number): Promise<Employee | undefined> {
    const { data, error } = await this.supabase
      .from('Empleados')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.nombre || data.name,
      email: data.email,
      role: data.rol || data.role,
      storeId: data.tienda_id || data.store_id,
      isActive: data.activo || data.is_active || data.isActive,
      createdAt: data.created_at || data.createdAt
    };
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const { data, error } = await this.supabase
      .from('Empleados')
      .insert({
        nombre: employee.name,
        email: employee.email,
        rol: employee.role,
        tienda_id: employee.storeId,
        activo: employee.isActive
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.nombre,
      email: data.email,
      role: data.rol,
      storeId: data.tienda_id,
      isActive: data.activo,
      createdAt: data.created_at
    };
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const updateData: any = {};
    
    if (employee.name !== undefined) updateData.nombre = employee.name;
    if (employee.email !== undefined) updateData.email = employee.email;
    if (employee.role !== undefined) updateData.rol = employee.role;
    if (employee.storeId !== undefined) updateData.tienda_id = employee.storeId;
    if (employee.isActive !== undefined) updateData.activo = employee.isActive;

    const { data, error } = await this.supabase
      .from('Empleados')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.nombre,
      email: data.email,
      role: data.rol,
      storeId: data.tienda_id,
      isActive: data.activo,
      createdAt: data.created_at
    };
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('Empleados')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Sales (Ventas)
  async getSales(): Promise<Sale[]> {
    const { data, error } = await this.supabase
      .from('Ventas')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }

    return data.map(row => ({
      id: row.id,
      storeId: row.tienda_id || row.store_id,
      employeeId: row.empleado_id || row.employee_id,
      amount: row.monto || row.amount,
      date: row.fecha || row.date,
      createdAt: row.created_at || row.createdAt
    }));
  }

  async getSalesByStore(storeId: number): Promise<Sale[]> {
    const { data, error } = await this.supabase
      .from('Ventas')
      .select('*')
      .eq('tienda_id', storeId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching sales by store:', error);
      throw error;
    }

    return data.map(row => ({
      id: row.id,
      storeId: row.tienda_id || row.store_id,
      employeeId: row.empleado_id || row.employee_id,
      amount: row.monto || row.amount,
      date: row.fecha || row.date,
      createdAt: row.created_at || row.createdAt
    }));
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const { data, error } = await this.supabase
      .from('Ventas')
      .select('*')
      .gte('fecha', startDate.toISOString())
      .lte('fecha', endDate.toISOString())
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching sales by date range:', error);
      throw error;
    }

    return data.map(row => ({
      id: row.id,
      storeId: row.tienda_id || row.store_id,
      employeeId: row.empleado_id || row.employee_id,
      amount: row.monto || row.amount,
      date: row.fecha || row.date,
      createdAt: row.created_at || row.createdAt
    }));
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const { data, error } = await this.supabase
      .from('Ventas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      storeId: data.tienda_id || data.store_id,
      employeeId: data.empleado_id || data.employee_id,
      amount: data.monto || data.amount,
      date: data.fecha || data.date,
      createdAt: data.created_at || data.createdAt
    };
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const { data, error } = await this.supabase
      .from('Ventas')
      .insert({
        tienda_id: sale.storeId,
        empleado_id: sale.employeeId,
        monto: sale.amount,
        fecha: sale.date
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sale:', error);
      throw error;
    }

    return {
      id: data.id,
      storeId: data.tienda_id,
      employeeId: data.empleado_id,
      amount: data.monto,
      date: data.fecha,
      createdAt: data.created_at
    };
  }

  async updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined> {
    const updateData: any = {};
    
    if (sale.storeId !== undefined) updateData.tienda_id = sale.storeId;
    if (sale.employeeId !== undefined) updateData.empleado_id = sale.employeeId;
    if (sale.amount !== undefined) updateData.monto = sale.amount;
    if (sale.date !== undefined) updateData.fecha = sale.date;

    const { data, error } = await this.supabase
      .from('Ventas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      storeId: data.tienda_id,
      employeeId: data.empleado_id,
      amount: data.monto,
      date: data.fecha,
      createdAt: data.created_at
    };
  }

  async deleteSale(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('Ventas')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Objectives (Objetivos)
  async getObjectives(): Promise<Objective[]> {
    const { data, error } = await this.supabase
      .from('Objetivos')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching objectives:', error);
      throw error;
    }

    return data.map(row => ({
      id: row.id,
      storeId: row.tienda_id || row.store_id,
      period: row.tipo || row.periodo || row.period,
      target: row.monto || row.objetivo || row.target,
      startDate: row.fecha_inicio || row.start_date,
      endDate: row.fecha_fin || row.end_date,
      createdAt: row.created_at || row.createdAt
    }));
  }

  async getObjectivesByStore(storeId: number): Promise<Objective[]> {
    const { data, error } = await this.supabase
      .from('Objetivos')
      .select('*')
      .eq('tienda_id', storeId)
      .order('id');

    if (error) {
      console.error('Error fetching objectives by store:', error);
      throw error;
    }

    return data.map(row => ({
      id: row.id,
      storeId: row.tienda_id || row.store_id,
      period: row.tipo || row.periodo || row.period,
      target: row.monto || row.objetivo || row.target,
      startDate: row.fecha_inicio || row.start_date,
      endDate: row.fecha_fin || row.end_date,
      createdAt: row.created_at || row.createdAt
    }));
  }

  async getObjective(id: number): Promise<Objective | undefined> {
    const { data, error } = await this.supabase
      .from('Objetivos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      storeId: data.tienda_id || data.store_id,
      period: data.tipo || data.periodo || data.period,
      target: data.monto || data.objetivo || data.target,
      startDate: data.fecha_inicio || data.start_date,
      endDate: data.fecha_fin || data.end_date,
      createdAt: data.created_at || data.createdAt
    };
  }

  async createObjective(objective: InsertObjective): Promise<Objective> {
    const { data, error } = await this.supabase
      .from('Objetivos')
      .insert({
        tienda_id: objective.storeId,
        tipo: objective.period,
        monto: objective.target,
        fecha_inicio: objective.startDate,
        fecha_fin: objective.endDate
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating objective:', error);
      throw error;
    }

    return {
      id: data.id,
      storeId: data.tienda_id,
      period: data.tipo,
      target: data.monto,
      startDate: data.fecha_inicio,
      endDate: data.fecha_fin,
      createdAt: data.created_at
    };
  }

  async updateObjective(id: number, objective: Partial<InsertObjective>): Promise<Objective | undefined> {
    const updateData: any = {};
    
    if (objective.storeId !== undefined) updateData.tienda_id = objective.storeId;
    if (objective.period !== undefined) updateData.tipo = objective.period;
    if (objective.target !== undefined) updateData.monto = objective.target;
    if (objective.startDate !== undefined) updateData.fecha_inicio = objective.startDate;
    if (objective.endDate !== undefined) updateData.fecha_fin = objective.endDate;

    const { data, error } = await this.supabase
      .from('Objetivos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      storeId: data.tienda_id,
      period: data.tipo,
      target: data.monto,
      startDate: data.fecha_inicio,
      endDate: data.fecha_fin,
      createdAt: data.created_at
    };
  }

  async deleteObjective(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('Objetivos')
      .delete()
      .eq('id', id);

    return !error;
  }
} 