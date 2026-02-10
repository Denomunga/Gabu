import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "./shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Authentication
  setupAuth(app);

  const requireAuth = (req: any, res: any, next: any) => {
    if (!(req.isAuthenticated && req.isAuthenticated()) && !req.user) {
      return res.sendStatus(401);
    }
    next();
  };

  // Helper middleware for role checking
  const requireAdmin = (req: any, res: any, next: any) => {
    const isAuth = (req.isAuthenticated && req.isAuthenticated()) || !!req.user;
    const role = req.user?.role;
    if (!isAuth || (role !== 'admin' && role !== 'super_admin')) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  app.get(api.settings.get.path, async (_req: any, res: any) => {
    const settings = await storage.getSiteSettings();
    if (!settings) {
      return res.json({
        id: 0,
        defaultWhatsappNumber: "254700000000",
        showUrgentBanner: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    res.json(settings);
  });

  app.put(api.settings.upsert.path, requireAdmin, async (req: any, res: any) => {
    const input = api.settings.upsert.input.parse(req.body);
    const settings = await storage.upsertSiteSettings(input);
    res.json(settings);
  });

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req: any, res: any) => {
    const filters = {
      category: req.query.category as string,
      isFeatured: req.query.isFeatured === 'true',
      isTrending: req.query.isTrending === 'true',
      search: req.query.search as string,
    };
    const products = await storage.getProducts(filters);
    res.json(products);
  });

  app.get(api.products.get.path, async (req: any, res: any) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.post(api.products.create.path, requireAdmin, async (req: any, res: any) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.issues[0]?.message || "Invalid input" });
      }
      throw err;
    }
  });

  app.patch(api.products.update.path, requireAdmin, async (req: any, res: any) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.issues[0]?.message || "Invalid input" });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, requireAdmin, async (req: any, res: any) => {
    await storage.deleteProduct(Number(req.params.id));
    res.sendStatus(204);
  });

  // === SERVICES ===
  app.get(api.services.list.path, async (_req: any, res: any) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.get(api.services.get.path, async (req: any, res: any) => {
    const service = await storage.getService(Number(req.params.id));
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.post(api.services.create.path, requireAdmin, async (req: any, res: any) => {
    const input = api.services.create.input.parse(req.body);
    const service = await storage.createService(input);
    res.status(201).json(service);
  });

  app.patch(api.services.update.path, requireAdmin, async (req: any, res: any) => {
    const input = api.services.update.input.parse(req.body);
    const service = await storage.updateService(Number(req.params.id), input);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.delete(api.services.delete.path, requireAdmin, async (req: any, res: any) => {
    await storage.deleteService(Number(req.params.id));
    res.sendStatus(204);
  });

  // === NEWS ===
  app.get(api.news.list.path, async (_req: any, res: any) => {
    const news = await storage.getNews();
    res.json(news);
  });

  app.get(api.news.get.path, async (req: any, res: any) => {
    const item = await storage.getNewsItem(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "News not found" });
    res.json(item);
  });

  app.post(api.news.create.path, requireAdmin, async (req: any, res: any) => {
    const input = api.news.create.input.parse(req.body);
    const item = await storage.createNews(input);
    res.status(201).json(item);
  });

  app.patch(api.news.update.path, requireAdmin, async (req: any, res: any) => {
    const input = api.news.update.input.parse(req.body);
    const item = await storage.updateNews(Number(req.params.id), input);
    if (!item) return res.status(404).json({ message: "News not found" });
    res.json(item);
  });

  app.delete(api.news.delete.path, requireAdmin, async (req: any, res: any) => {
    await storage.deleteNews(Number(req.params.id));
    res.sendStatus(204);
  });

  app.get(api.favorites.list.path, requireAuth, async (req: any, res: any) => {
    const items = await storage.getFavorites(req.user.id);
    res.json(items);
  });

  // === USER PROFILE ===
  app.put("/api/users/profile", requireAuth, async (req: any, res: any) => {
    try {
      const payload = req.body as Partial<any>;
      // prevent role changes from client
      delete payload.role;
      const updated = await storage.updateUser(req.user.id, payload);
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Avatar upload
  const avatarsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

  const avatarStorage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, avatarsDir);
    },
    filename: function (_req, file, cb) {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
      cb(null, name);
    }
  });

  const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      cb(null, allowed.includes(file.mimetype));
    }
  });

  app.post("/api/users/avatar", requireAuth, avatarUpload.single("avatar"), async (req: any, res: any) => {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    const publicPath = `/uploads/avatars/${file.filename}`;
    const updated = await storage.updateUser(req.user.id, { avatarUrl: publicPath } as any);
    res.status(201).json({ url: publicPath, user: updated });
  });

  app.post(api.favorites.add.path, requireAuth, async (req: any, res: any) => {
    const input = api.favorites.add.input.parse(req.body);
    const created = await storage.addFavorite(req.user.id, input);
    res.status(201).json(created);
  });

  app.delete(api.favorites.remove.path, requireAuth, async (req: any, res: any) => {
    await storage.deleteFavorite(req.user.id, Number(req.params.id));
    res.sendStatus(204);
  });

  app.get(api.serviceOffices.list.path, async (_req: any, res: any) => {
    const offices = await storage.getServiceOffices();
    res.json(offices);
  });

  app.post(api.serviceOffices.create.path, requireAdmin, async (req: any, res: any) => {
    const input = api.serviceOffices.create.input.parse(req.body);
    const office = await storage.createServiceOffice(input);
    res.status(201).json(office);
  });

  app.patch(api.serviceOffices.update.path, requireAdmin, async (req: any, res: any) => {
    const input = api.serviceOffices.update.input.parse(req.body);
    const office = await storage.updateServiceOffice(Number(req.params.id), input);
    if (!office) return res.status(404).json({ message: "Office not found" });
    res.json(office);
  });

  app.delete(api.serviceOffices.delete.path, requireAdmin, async (req: any, res: any) => {
    await storage.deleteServiceOffice(Number(req.params.id));
    res.sendStatus(204);
  });

  app.get(api.locations.counties.path, async (_req: any, res: any) => {
    const counties = await storage.getKenyaCounties();
    res.json(counties);
  });

  app.get(api.locations.subCounties.path, async (req: any, res: any) => {
    const subCounties = await storage.getKenyaSubCounties(Number(req.params.countyId));
    res.json(subCounties);
  });

  app.get(api.locations.areas.path, async (req: any, res: any) => {
    const areas = await storage.getKenyaAreas(Number(req.params.subCountyId));
    res.json(areas);
  });

  app.post(api.newsletter.subscribe.path, async (req: any, res: any) => {
    try {
      const input = api.newsletter.subscribe.input.parse(req.body);
      const subscriber = await storage.subscribeNewsletter(input);
      res.status(201).json(subscriber);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.issues[0]?.message || "Invalid input" });
      }
      throw err;
    }
  });

  app.post(api.emailChange.request.path, requireAuth, async (req: any, res: any) => {
    const input = api.emailChange.request.input.parse(req.body);
    const request = await storage.createEmailChangeRequest(req.user.id, input);
    res.status(201).json(request);
  });

  app.get(api.emailChange.list.path, requireAdmin, async (_req: any, res: any) => {
    const items = await storage.getEmailChangeRequests();
    res.json(items);
  });

  app.post(api.emailChange.review.path, requireAdmin, async (req: any, res: any) => {
    const input = api.emailChange.review.input.parse(req.body);
    const updated = await storage.reviewEmailChangeRequest(Number(req.params.id), input.status);
    if (!updated) return res.status(404).json({ message: "Request not found" });
    res.json(updated);
  });

  // === ORDERS ===
  app.post(api.orders.create.path, async (req: any, res: any) => {
    const input = api.orders.create.input.parse(req.body);
    // If authenticated, link to user
    const orderData = { ...input, userId: req.user?.id };
    const order = await storage.createOrder(orderData);
    res.status(201).json(order);
  });

  app.get(api.orders.list.path, async (req: any, res: any) => {
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
  app.post(api.appointments.create.path, async (req: any, res: any) => {
    const input = api.appointments.create.input.parse(req.body);
    // If authenticated, link to user
    const apptData = { ...input, userId: req.user?.id };
    const appointment = await storage.createAppointment(apptData);
    res.status(201).json(appointment);
  });

  app.get(api.appointments.list.path, async (req: any, res: any) => {
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
  app.post(api.reviews.create.path, async (req: any, res: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.reviews.create.input.parse(req.body);
    const review = await storage.createReview({ ...input, userId: req.user.id });
    res.status(201).json(review);
  });

  app.get(api.reviews.list.path, async (req: any, res: any) => {
    const reviews = await storage.getReviews(Number(req.params.productId));
    res.json(reviews);
  });

  return httpServer;
}
