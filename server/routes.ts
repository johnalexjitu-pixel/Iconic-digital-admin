import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Stats
  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Customers
  app.get("/api/customers", async (_req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id", async (req, res) => {
    const customer = await storage.getCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  });

  app.post("/api/customers", async (req, res) => {
    const customer = await storage.createCustomer(req.body);
    res.json(customer);
  });

  app.patch("/api/customers/:id", async (req, res) => {
    const customer = await storage.updateCustomer(req.params.id, req.body);
    res.json(customer);
  });

  // Withdrawals
  app.get("/api/withdrawals", async (_req, res) => {
    const withdrawals = await storage.getWithdrawals();
    res.json(withdrawals);
  });

  app.get("/api/withdrawals/:id", async (req, res) => {
    const withdrawal = await storage.getWithdrawal(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    res.json(withdrawal);
  });

  app.post("/api/withdrawals", async (req, res) => {
    const withdrawal = await storage.createWithdrawal(req.body);
    res.json(withdrawal);
  });

  app.patch("/api/withdrawals/:id", async (req, res) => {
    const withdrawal = await storage.updateWithdrawal(req.params.id, req.body);
    res.json(withdrawal);
  });

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post("/api/products", async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.json(product);
  });

  // Admins
  app.get("/api/admins", async (_req, res) => {
    const admins = await storage.getAdmins();
    res.json(admins);
  });

  app.get("/api/admins/:id", async (req, res) => {
    const admin = await storage.getAdmin(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  });

  // Daily Check-ins
  app.get("/api/daily-check-ins", async (_req, res) => {
    const checkIns = await storage.getDailyCheckIns();
    res.json(checkIns);
  });

  app.patch("/api/daily-check-ins/:id", async (req, res) => {
    const checkIn = await storage.updateDailyCheckIn(req.params.id, req.body);
    res.json(checkIn);
  });

  // VIP Levels
  app.get("/api/vip-levels", async (_req, res) => {
    const levels = await storage.getVipLevels();
    res.json(levels);
  });

  app.get("/api/vip-levels/:id", async (req, res) => {
    const level = await storage.getVipLevel(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "VIP level not found" });
    }
    res.json(level);
  });

  const httpServer = createServer(app);
  return httpServer;
}
