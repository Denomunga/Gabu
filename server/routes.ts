import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Authentication
  setupAuth(app);

  // Helper middleware for role checking
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const filters = {
      category: req.query.category as string,
      isFeatured: req.query.isFeatured === 'true',
      isTrending: req.query.isTrending === 'true',
      search: req.query.search as string,
    };
    const products = await storage.getProducts(filters);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post(api.products.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.products.update.path, requireAdmin, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.sendStatus(204);
  });

  // === SERVICES ===
  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.get(api.services.get.path, async (req, res) => {
    const service = await storage.getService(Number(req.params.id));
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.post(api.services.create.path, requireAdmin, async (req, res) => {
    const input = api.services.create.input.parse(req.body);
    const service = await storage.createService(input);
    res.status(201).json(service);
  });

  app.patch(api.services.update.path, requireAdmin, async (req, res) => {
    const input = api.services.update.input.parse(req.body);
    const service = await storage.updateService(Number(req.params.id), input);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.delete(api.services.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteService(Number(req.params.id));
    res.sendStatus(204);
  });

  // === NEWS ===
  app.get(api.news.list.path, async (req, res) => {
    const news = await storage.getNews();
    res.json(news);
  });

  app.post(api.news.create.path, requireAdmin, async (req, res) => {
    const input = api.news.create.input.parse(req.body);
    const item = await storage.createNews(input);
    res.status(201).json(item);
  });

  app.delete(api.news.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteNews(Number(req.params.id));
    res.sendStatus(204);
  });

  // === ORDERS ===
  app.post(api.orders.create.path, async (req, res) => {
    const input = api.orders.create.input.parse(req.body);
    // If authenticated, link to user
    const orderData = { ...input, userId: req.user?.id };
    const order = await storage.createOrder(orderData);
    res.status(201).json(order);
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      const orders = await storage.getOrders();
      res.json(orders);
    } else {
      const orders = await storage.getOrders(req.user.id);
      res.json(orders);
    }
  });

  // === APPOINTMENTS ===
  app.post(api.appointments.create.path, async (req, res) => {
    const input = api.appointments.create.input.parse(req.body);
    // If authenticated, link to user
    const apptData = { ...input, userId: req.user?.id };
    const appointment = await storage.createAppointment(apptData);
    res.status(201).json(appointment);
  });

  app.get(api.appointments.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      const appts = await storage.getAppointments();
      res.json(appts);
    } else {
      const appts = await storage.getAppointments(req.user.id);
      res.json(appts);
    }
  });

  // === REVIEWS ===
  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.reviews.create.input.parse(req.body);
    const review = await storage.createReview({ ...input, userId: req.user.id });
    res.status(201).json(review);
  });

  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviews(Number(req.params.productId));
    res.json(reviews);
  });

  return httpServer;
}
