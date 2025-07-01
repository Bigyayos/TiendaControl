import { 
  stores, 
  employees, 
  sales, 
  objectives,
  type Store, 
  type InsertStore,
  type Employee,
  type InsertEmployee,
  type Sale,
  type InsertSale,
  type Objective,
  type InsertObjective
} from "@shared/schema";

// Importar la nueva clase de almacenamiento de Supabase
import { SupabaseStorage } from "./supabase-storage";

export interface IStorage {
  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployeesByStore(storeId: number): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Sales
  getSales(): Promise<Sale[]>;
  getSalesByStore(storeId: number): Promise<Sale[]>;
  getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  deleteSale(id: number): Promise<boolean>;

  // Objectives
  getObjectives(): Promise<Objective[]>;
  getObjectivesByStore(storeId: number): Promise<Objective[]>;
  getObjective(id: number): Promise<Objective | undefined>;
  createObjective(objective: InsertObjective): Promise<Objective>;
  updateObjective(id: number, objective: Partial<InsertObjective>): Promise<Objective | undefined>;
  deleteObjective(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private stores: Map<number, Store>;
  private employees: Map<number, Employee>;
  private sales: Map<number, Sale>;
  private objectives: Map<number, Objective>;
  private currentStoreId: number;
  private currentEmployeeId: number;
  private currentSaleId: number;
  private currentObjectiveId: number;

  constructor() {
    this.stores = new Map();
    this.employees = new Map();
    this.sales = new Map();
    this.objectives = new Map();
    this.currentStoreId = 1;
    this.currentEmployeeId = 1;
    this.currentSaleId = 1;
    this.currentObjectiveId = 1;
    
    // Add sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample stores
    const sampleStores = [
      { name: "Ayala", address: "Calle Serrano 45, Madrid", manager: "Ana García", employees: 8, isActive: true, monthlyObjective: "35000" },
      { name: "San Sebastian", address: "Calle Mayor 12, San Sebastian", manager: "Carlos López", employees: 6, isActive: true, monthlyObjective: "28000" },
      { name: "Sevilla", address: "Calle Sierpes 23, Sevilla", manager: "María Ruiz", employees: 7, isActive: true, monthlyObjective: "30000" },
      { name: "Málaga", address: "Calle Larios 15, Málaga", manager: "Pedro Sánchez", employees: 5, isActive: true, monthlyObjective: "25000" },
      { name: "Marbella", address: "Puerto Banús, Marbella", manager: "Laura Martín", employees: 4, isActive: true, monthlyObjective: "22000" },
      { name: "Doha", address: "The Pearl District, Doha", manager: "Ahmed Al-Rashid", employees: 6, isActive: true, monthlyObjective: "32000" },
      { name: "Perú", address: "Av. Larco 345, Lima", manager: "Elena Rodríguez", employees: 5, isActive: true, monthlyObjective: "26000" }
    ];

    sampleStores.forEach(store => {
      const id = this.currentStoreId++;
      this.stores.set(id, {
        id,
        name: store.name,
        address: store.address,
        manager: store.manager,
        employees: store.employees,
        isActive: store.isActive,
        monthlyObjective: store.monthlyObjective,
        createdAt: new Date(),
      });
    });

    // Sample employees
    const sampleEmployees = [
      // Ayala (Store 1)
      { name: "Ana García", email: "ana.garcia@tienda.com", role: "manager", storeId: 1, isActive: true },
      { name: "Roberto Silva", email: "roberto.silva@tienda.com", role: "vendedor", storeId: 1, isActive: true },
      { name: "Carmen Delgado", email: "carmen.delgado@tienda.com", role: "vendedor", storeId: 1, isActive: true },
      { name: "Miguel Ángel", email: "miguel.angel@tienda.com", role: "vendedor", storeId: 1, isActive: true },
      
      // San Sebastian (Store 2)
      { name: "Carlos López", email: "carlos.lopez@tienda.com", role: "manager", storeId: 2, isActive: true },
      { name: "Iker Zubizarreta", email: "iker.zubizarreta@tienda.com", role: "vendedor", storeId: 2, isActive: true },
      { name: "Amaia Etxeberria", email: "amaia.etxeberria@tienda.com", role: "vendedor", storeId: 2, isActive: true },
      
      // Sevilla (Store 3)
      { name: "María Ruiz", email: "maria.ruiz@tienda.com", role: "manager", storeId: 3, isActive: true },
      { name: "Antonio Morales", email: "antonio.morales@tienda.com", role: "vendedor", storeId: 3, isActive: true },
      { name: "Rocío Fernández", email: "rocio.fernandez@tienda.com", role: "vendedor", storeId: 3, isActive: true },
      
      // Málaga (Store 4)
      { name: "Pedro Sánchez", email: "pedro.sanchez@tienda.com", role: "manager", storeId: 4, isActive: true },
      { name: "Isabel Jiménez", email: "isabel.jimenez@tienda.com", role: "vendedor", storeId: 4, isActive: true },
      
      // Marbella (Store 5)
      { name: "Laura Martín", email: "laura.martin@tienda.com", role: "manager", storeId: 5, isActive: true },
      { name: "Francisco Costa", email: "francisco.costa@tienda.com", role: "vendedor", storeId: 5, isActive: true },
      
      // Doha (Store 6)
      { name: "Ahmed Al-Rashid", email: "ahmed.alrashid@tienda.com", role: "manager", storeId: 6, isActive: true },
      { name: "Fatima Al-Zahra", email: "fatima.alzahra@tienda.com", role: "vendedor", storeId: 6, isActive: true },
      { name: "Omar Hassan", email: "omar.hassan@tienda.com", role: "vendedor", storeId: 6, isActive: true },
      
      // Perú (Store 7)
      { name: "Elena Rodríguez", email: "elena.rodriguez@tienda.com", role: "manager", storeId: 7, isActive: true },
      { name: "Carlos Mendoza", email: "carlos.mendoza@tienda.com", role: "vendedor", storeId: 7, isActive: true },
      { name: "Lucía Vargas", email: "lucia.vargas@tienda.com", role: "vendedor", storeId: 7, isActive: true }
    ];

    sampleEmployees.forEach(employee => {
      const id = this.currentEmployeeId++;
      this.employees.set(id, {
        id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        storeId: employee.storeId,
        isActive: employee.isActive,
        createdAt: new Date(),
      });
    });

    // Sample sales for the current month
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const sampleSales = [
      // Ayala
      { storeId: 1, employeeId: 2, amount: "2150", date: new Date(thisMonth.getTime() + 1 * 24 * 60 * 60 * 1000) },
      { storeId: 1, employeeId: 3, amount: "1980", date: new Date(thisMonth.getTime() + 2 * 24 * 60 * 60 * 1000) },
      { storeId: 1, employeeId: 4, amount: "1650", date: new Date(thisMonth.getTime() + 3 * 24 * 60 * 60 * 1000) },
      
      // San Sebastian
      { storeId: 2, employeeId: 6, amount: "1750", date: new Date(thisMonth.getTime() + 4 * 24 * 60 * 60 * 1000) },
      { storeId: 2, employeeId: 7, amount: "1420", date: new Date(thisMonth.getTime() + 5 * 24 * 60 * 60 * 1000) },
      
      // Sevilla
      { storeId: 3, employeeId: 9, amount: "1900", date: new Date(thisMonth.getTime() + 6 * 24 * 60 * 60 * 1000) },
      { storeId: 3, employeeId: 10, amount: "1550", date: new Date(thisMonth.getTime() + 7 * 24 * 60 * 60 * 1000) },
      
      // Málaga
      { storeId: 4, employeeId: 12, amount: "1300", date: new Date(thisMonth.getTime() + 8 * 24 * 60 * 60 * 1000) },
      
      // Marbella
      { storeId: 5, employeeId: 14, amount: "1100", date: new Date(thisMonth.getTime() + 9 * 24 * 60 * 60 * 1000) },
      
      // Doha
      { storeId: 6, employeeId: 16, amount: "2200", date: new Date(thisMonth.getTime() + 10 * 24 * 60 * 60 * 1000) },
      { storeId: 6, employeeId: 17, amount: "1850", date: new Date(thisMonth.getTime() + 11 * 24 * 60 * 60 * 1000) },
      
      // Perú
      { storeId: 7, employeeId: 19, amount: "1400", date: new Date(thisMonth.getTime() + 12 * 24 * 60 * 60 * 1000) },
      { storeId: 7, employeeId: 20, amount: "1250", date: new Date(thisMonth.getTime() + 13 * 24 * 60 * 60 * 1000) },
      
      // Ventas más recientes
      { storeId: 1, employeeId: 2, amount: "1890", date: new Date() },
      { storeId: 6, employeeId: 16, amount: "2100", date: new Date() },
    ];

    sampleSales.forEach(sale => {
      const id = this.currentSaleId++;
      this.sales.set(id, {
        id,
        storeId: sale.storeId,
        employeeId: sale.employeeId,
        amount: sale.amount,
        date: sale.date,
        createdAt: new Date(),
      });
    });

    // Sample objectives
    const sampleObjectives = [
      { storeId: 1, period: "mensual", target: "35000", startDate: thisMonth, endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0) },
      { storeId: 2, period: "mensual", target: "28000", startDate: thisMonth, endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0) },
      { storeId: 3, period: "mensual", target: "30000", startDate: thisMonth, endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0) },
      { storeId: 4, period: "mensual", target: "25000", startDate: thisMonth, endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0) },
      { storeId: 5, period: "mensual", target: "22000", startDate: thisMonth, endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0) },
      { storeId: 6, period: "mensual", target: "32000", startDate: thisMonth, endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0) },
      { storeId: 7, period: "mensual", target: "26000", startDate: thisMonth, endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0) },
    ];

    sampleObjectives.forEach(objective => {
      const id = this.currentObjectiveId++;
      this.objectives.set(id, {
        id,
        storeId: objective.storeId,
        period: objective.period,
        target: objective.target,
        startDate: objective.startDate,
        endDate: objective.endDate,
        createdAt: new Date(),
      });
    });
  }

  // Stores
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = this.currentStoreId++;
    const store: Store = {
      id,
      name: insertStore.name,
      address: insertStore.address,
      manager: insertStore.manager,
      employees: insertStore.employees || 0,
      isActive: insertStore.isActive ?? true,
      monthlyObjective: insertStore.monthlyObjective || "0",
      createdAt: new Date(),
    };
    this.stores.set(id, store);
    return store;
  }

  async updateStore(id: number, updateData: Partial<InsertStore>): Promise<Store | undefined> {
    const existing = this.stores.get(id);
    if (!existing) return undefined;

    const updated: Store = { ...existing, ...updateData };
    this.stores.set(id, updated);
    return updated;
  }

  async deleteStore(id: number): Promise<boolean> {
    return this.stores.delete(id);
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployeesByStore(storeId: number): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.storeId === storeId);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const employee: Employee = {
      id,
      name: insertEmployee.name,
      email: insertEmployee.email,
      role: insertEmployee.role,
      storeId: insertEmployee.storeId || null,
      isActive: insertEmployee.isActive ?? true,
      createdAt: new Date(),
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;

    const updated: Employee = { ...existing, ...updateData };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async getSalesByStore(storeId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(sale => sale.storeId === storeId);
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const sale: Sale = {
      id,
      storeId: insertSale.storeId,
      employeeId: insertSale.employeeId || null,
      amount: insertSale.amount,
      date: insertSale.date,
      createdAt: new Date(),
    };
    this.sales.set(id, sale);
    return sale;
  }

  async updateSale(id: number, updateData: Partial<InsertSale>): Promise<Sale | undefined> {
    const existing = this.sales.get(id);
    if (!existing) return undefined;

    const updated: Sale = { ...existing, ...updateData };
    this.sales.set(id, updated);
    return updated;
  }

  async deleteSale(id: number): Promise<boolean> {
    return this.sales.delete(id);
  }

  // Objectives
  async getObjectives(): Promise<Objective[]> {
    return Array.from(this.objectives.values());
  }

  async getObjectivesByStore(storeId: number): Promise<Objective[]> {
    return Array.from(this.objectives.values()).filter(obj => obj.storeId === storeId);
  }

  async getObjective(id: number): Promise<Objective | undefined> {
    return this.objectives.get(id);
  }

  async createObjective(insertObjective: InsertObjective): Promise<Objective> {
    const id = this.currentObjectiveId++;
    const objective: Objective = {
      ...insertObjective,
      id,
      createdAt: new Date(),
    };
    this.objectives.set(id, objective);
    return objective;
  }

  async updateObjective(id: number, updateData: Partial<InsertObjective>): Promise<Objective | undefined> {
    const existing = this.objectives.get(id);
    if (!existing) return undefined;

    const updated: Objective = { ...existing, ...updateData };
    this.objectives.set(id, updated);
    return updated;
  }

  async deleteObjective(id: number): Promise<boolean> {
    return this.objectives.delete(id);
  }
}

// Cambiar la exportación para usar Supabase en lugar de memoria local
// Hacer la instanciación lazy para evitar problemas con variables de entorno
let _storage: IStorage | null = null;

export const storage: IStorage = {
  // Stores
  async getStores() {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getStores();
  },
  async getStore(id: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getStore(id);
  },
  async createStore(store: InsertStore) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.createStore(store);
  },
  async updateStore(id: number, store: Partial<InsertStore>) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.updateStore(id, store);
  },
  async deleteStore(id: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.deleteStore(id);
  },

  // Employees
  async getEmployees() {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getEmployees();
  },
  async getEmployeesByStore(storeId: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getEmployeesByStore(storeId);
  },
  async getEmployee(id: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getEmployee(id);
  },
  async createEmployee(employee: InsertEmployee) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.createEmployee(employee);
  },
  async updateEmployee(id: number, employee: Partial<InsertEmployee>) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.updateEmployee(id, employee);
  },
  async deleteEmployee(id: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.deleteEmployee(id);
  },

  // Sales
  async getSales() {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getSales();
  },
  async getSalesByStore(storeId: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getSalesByStore(storeId);
  },
  async getSalesByDateRange(startDate: Date, endDate: Date) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getSalesByDateRange(startDate, endDate);
  },
  async getSale(id: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getSale(id);
  },
  async createSale(sale: InsertSale) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.createSale(sale);
  },
  async updateSale(id: number, sale: Partial<InsertSale>) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.updateSale(id, sale);
  },
  async deleteSale(id: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.deleteSale(id);
  },

  // Objectives
  async getObjectives() {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getObjectives();
  },
  async getObjectivesByStore(storeId: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getObjectivesByStore(storeId);
  },
  async getObjective(id: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.getObjective(id);
  },
  async createObjective(objective: InsertObjective) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.createObjective(objective);
  },
  async updateObjective(id: number, objective: Partial<InsertObjective>) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.updateObjective(id, objective);
  },
  async deleteObjective(id: number) {
    if (!_storage) _storage = new SupabaseStorage();
    return _storage.deleteObjective(id);
  }
};
