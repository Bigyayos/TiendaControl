import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStoreSchema, insertEmployeeSchema, insertSaleSchema, insertObjectiveSchema, updateObjectiveSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stores routes
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stores" });
    }
  });

  app.get("/api/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const store = await storage.getStore(id);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: "Error fetching store" });
    }
  });

  app.post("/api/stores", async (req, res) => {
    try {
      const data = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(data);
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid store data" });
    }
  });

  app.put("/api/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertStoreSchema.partial().parse(req.body);
      const store = await storage.updateStore(id, data);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      res.status(400).json({ message: "Invalid store data" });
    }
  });

  app.delete("/api/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStore(id);
      if (!deleted) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting store" });
    }
  });

  // Employees routes
  app.get("/api/employees", async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const employees = storeId 
        ? await storage.getEmployeesByStore(storeId)
        : await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Error fetching employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const data = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(data);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, data);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting employee" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const sales = storeId 
        ? await storage.getSalesByStore(storeId)
        : await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const data = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(data);
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSaleSchema.partial().parse(req.body);
      const sale = await storage.updateSale(id, data);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSale(id);
      if (!deleted) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting sale" });
    }
  });

  // Objectives routes
  app.get("/api/objectives", async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const objectives = storeId 
        ? await storage.getObjectivesByStore(storeId)
        : await storage.getObjectives();
      res.json(objectives);
    } catch (error) {
      res.status(500).json({ message: "Error fetching objectives" });
    }
  });

  app.post("/api/objectives", async (req, res) => {
    try {
      const data = insertObjectiveSchema.parse(req.body);
      const objective = await storage.createObjective(data);
      res.status(201).json(objective);
    } catch (error) {
      res.status(400).json({ message: "Invalid objective data" });
    }
  });

  app.put("/api/objectives/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = updateObjectiveSchema.parse(req.body);
      const objective = await storage.updateObjective(id, data);
      if (!objective) {
        return res.status(404).json({ message: "Objective not found" });
      }
      res.json(objective);
    } catch (error) {
      console.error('❌ Error en PUT /api/objectives/:id:', error);
      res.status(400).json({ message: "Invalid objective data", error: (error as Error).message });
    }
  });

  app.delete("/api/objectives/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteObjective(id);
      if (!deleted) {
        return res.status(404).json({ message: "Objective not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting objective" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stores = await storage.getStores();
      const sales = await storage.getSales();
      const employees = await storage.getEmployees();
      const objectives = await storage.getObjectives();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= today && saleDate < tomorrow;
      });

      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const weekSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= thisWeekStart;
      });

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= thisMonthStart;
      });

      const activeStores = stores.filter(store => store.isActive);

      const stats = {
        todaysSales: todaysSales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0),
        weekSales: weekSales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0),
        monthSales: monthSales.reduce((sum, sale) => sum + parseFloat(sale.amount), 0),
        totalStores: stores.length,
        activeStores: activeStores.length,
        totalEmployees: employees.length,
        activeEmployees: employees.filter(emp => emp.isActive).length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
