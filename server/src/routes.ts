import express, { Express, Request, Response } from "express";
import { z } from "zod";
import {
  User,
  Product,
  Service,
  ServiceOffice,
  News,
  Order,
  Appointment,
  Review,
  Favorite,
  NewsletterSubscriber,
  SiteSettings,
  KenyaCounty,
  Page,
  KenyaSubCounty,
  KenyaArea,
} from "./db.js";
import {
  hashPassword,
  authenticateUser,
  generateToken,
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
  comparePasswords,
} from "./auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function registerRoutes(app: Express) {
  // Serve uploaded files
  const uploadsServeDir = path.resolve(process.cwd(), "public", "uploads");
  console.log("Static serve directory:", uploadsServeDir);
  if (!fs.existsSync(uploadsServeDir)) {
    console.log("Creating static serve directory...");
    fs.mkdirSync(uploadsServeDir, { recursive: true });
  }
  console.log("Static serve directory exists:", fs.existsSync(uploadsServeDir));
  app.use("/uploads", express.static(uploadsServeDir));
  app.use("/images", express.static(uploadsServeDir));

  // ===== AUTH ROUTES =====
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);

      // Check if user exists
      let existingUser = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const user = new User({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
      });

      await user.save();

      const token = generateToken(user._id.toString(), user.role);

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await authenticateUser(data.email, data.password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user._id.toString(), user.role);

      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== USER ROUTES =====
  app.get("/api/users/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await User.findById((req as any).userId);
      res.json({
        id: user?._id,
        username: user?.username,
        email: user?.email,
        phone: user?.phone,
        role: user?.role,
        avatarUrl: user?.avatarUrl,
        county: user?.county,
        subCounty: user?.subCounty,
        area: user?.area,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/users/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const { username, phone, county, subCounty, area, avatarUrl } = req.body;
      const user = await User.findByIdAndUpdate(
        (req as any).userId,
        { username, phone, county, subCounty, area, avatarUrl },
        { new: true }
      );
      res.json({
        message: "Profile updated",
        user: {
          id: user?._id,
          username: user?.username,
          email: user?.email,
          role: user?.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== PRODUCT ROUTES =====
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const { category, trending, featured, search } = req.query;
      let filter: any = {};

      if (category) filter.category = category;
      if (trending === "true") filter.isTrending = true;
      if (featured === "true") filter.isFeatured = true;
      if (search) filter.name = { $regex: search, $options: "i" };

      const products = await Product.find(filter).sort({ createdAt: -1 });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", requireAdmin, async (req: Request, res: Response) => {
    try {
      console.log("Product creation request body:", req.body);
      const product = new Product(req.body);
      console.log("Product before save:", product);
      await product.save();
      console.log("Product after save:", product);
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Product creation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: "Product deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== SERVICE ROUTES =====
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const { trending, featured } = req.query;
      let filter: any = {};

      if (trending === "true") filter.isTrending = true;
      if (featured === "true") filter.isFeatured = true;

      const services = await Service.find(filter).sort({ createdAt: -1 });
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/services", requireAdmin, async (req: Request, res: Response) => {
    try {
      const service = new Service(req.body);
      await service.save();
      res.status(201).json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/services/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/services/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await Service.findByIdAndDelete(req.params.id);
      res.json({ message: "Service deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== SERVICE OFFICE ROUTES =====
  app.get("/api/service-offices", async (req: Request, res: Response) => {
    try {
      const offices = await ServiceOffice.find({ isActive: true });
      res.json(offices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/service-offices", requireAdmin, async (req: Request, res: Response) => {
    try {
      const office = new ServiceOffice(req.body);
      await office.save();
      res.status(201).json(office);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/service-offices/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const office = await ServiceOffice.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(office);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/service-offices/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await ServiceOffice.findByIdAndDelete(req.params.id);
      res.json({ message: "Service office deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== NEWS ROUTES =====
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const { type, urgent } = req.query;
      let filter: any = {};

      if (type) filter.type = type;
      if (urgent === "true") filter.isUrgent = true;

      const news = await News.find(filter).sort({ createdAt: -1 });
      res.json(news);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/news/:id", async (req: Request, res: Response) => {
    try {
      const newsItem = await News.findById(req.params.id);
      if (!newsItem) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json(newsItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/news", requireAdmin, async (req: Request, res: Response) => {
    try {
      const newsItem = new News(req.body);
      await newsItem.save();
      res.status(201).json(newsItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/news/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const newsItem = await News.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json(newsItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/news/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await News.findByIdAndDelete(req.params.id);
      res.json({ message: "News deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== PAGES ROUTES =====
  app.get("/api/pages", async (req: Request, res: Response) => {
    try {
      const pages = await Page.find().sort({ createdAt: -1 });
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pages/:slug", async (req: Request, res: Response) => {
    try {
      const page = await Page.findOne({ slug: req.params.slug });
      if (!page) return res.status(404).json({ message: "Page not found" });
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pages", requireAdmin, async (req: Request, res: Response) => {
    try {
      const page = new Page(req.body);
      await page.save();
      res.status(201).json(page);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/pages/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/pages/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      await Page.findByIdAndDelete(req.params.id);
      res.json({ message: "Page deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== REVIEWS ROUTES =====
  app.get("/api/reviews/:productId", async (req: Request, res: Response) => {
    try {
      const reviews = await Review.find({ productId: req.params.productId })
        .populate("userId", "username avatarUrl")
        .sort({ createdAt: -1 });
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const { productId, rating, comment } = req.body;
      const review = new Review({
        userId: (req as any).userId,
        productId,
        rating,
        comment,
      });
      await review.save();

      // Update product rating
      const reviews = await Review.find({ productId });
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        reviewsCount: reviews.length,
      });

      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== FAVORITES ROUTES =====
  app.get("/api/favorites", requireAuth, async (req: Request, res: Response) => {
    try {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const userId = (req as any).userId;
      const favorites = await Favorite.find({ userId });
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/favorites", requireAuth, async (req: Request, res: Response) => {
    try {
      const { productId, serviceId } = req.body;
      const userId = (req as any).userId;

      if (!productId && !serviceId) {
        return res.status(400).json({ message: "productId or serviceId is required" });
      }

      const query: any = { userId };
      if (productId) query.productId = productId;
      if (serviceId) query.serviceId = serviceId;

      const existing = await Favorite.findOne(query);
      if (existing) {
        return res.status(200).json(existing);
      }

      const favorite = new Favorite({
        userId,
        productId,
        serviceId,
      });

      await favorite.save();
      res.status(201).json(favorite);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/favorites/:productId", requireAuth, async (req: Request, res: Response) => {
    try {
      console.log("Delete favorite request - productId:", req.params.productId);
      console.log("Delete favorite request - userId:", (req as any).userId);
      
      const userId = (req as any).userId;
      const productId = req.params.productId;

      const result = await Favorite.deleteMany({
        userId,
        productId,
      });

      console.log("Delete result:", result);

      if (!result?.deletedCount) {
        console.log("No favorite found to delete");
        return res.status(404).json({ message: "Favorite not found" });
      }

      res.json({ message: "Favorite removed", deletedCount: result.deletedCount });
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ===== ORDERS ROUTES =====
  app.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const orders = await Order.find({ userId: (req as any).userId }).sort({
        createdAt: -1,
      });
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", requireAuth, async (req: Request, res: Response) => {
    try {
      const { items, deliveryInfo } = req.body;
      const totalAmount = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      const order = new Order({
        userId: (req as any).userId,
        items,
        totalAmount,
        deliveryInfo,
      });

      await order.save();
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== APPOINTMENTS ROUTES =====
  app.get("/api/appointments", requireAuth, async (req: Request, res: Response) => {
    try {
      const appointments = await Appointment.find({
        userId: (req as any).userId,
      })
        .populate("serviceId")
        .populate("officeId")
        .sort({ createdAt: -1 });
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/appointments", requireAuth, async (req: Request, res: Response) => {
    try {
      const { serviceId, date, officeId, location } = req.body;
      const appointment = new Appointment({
        userId: (req as any).userId,
        serviceId,
        date,
        officeId,
        location,
      });

      await appointment.save();
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== NEWSLETTER ROUTES =====
  app.post("/api/newsletter/subscribe", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      let subscriber = await NewsletterSubscriber.findOne({ email });

      if (!subscriber) {
        subscriber = new NewsletterSubscriber({ email });
        await subscriber.save();
      }

      res.status(201).json({ message: "Subscribed successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== LOCATION ROUTES =====
  app.get("/api/locations/counties", async (req: Request, res: Response) => {
    try {
      const counties = await KenyaCounty.find();
      res.json(counties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/locations/sub-counties/:countyId", async (req: Request, res: Response) => {
    try {
      const subCounties = await KenyaSubCounty.find({
        countyId: req.params.countyId,
      });
      res.json(subCounties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/locations/areas/:subCountyId", async (req: Request, res: Response) => {
    try {
      const areas = await KenyaArea.find({
        subCountyId: req.params.subCountyId,
      });
      res.json(areas);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== SETTINGS ROUTES =====
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = new SiteSettings({
          defaultWhatsappNumber: "+254700000000",
          showUrgentBanner: true,
        });
        await settings.save();
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/settings", requireAdmin, async (req: Request, res: Response) => {
    try {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = new SiteSettings(req.body);
      } else {
        Object.assign(settings, req.body);
      }
      await settings.save();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== UPLOADS: ensure directory and setup multer with validation =====
  const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
  console.log("Uploads directory path:", uploadsDir);
  if (!fs.existsSync(uploadsDir)) {
    console.log("Creating uploads directory...");
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  console.log("Uploads directory exists:", fs.existsSync(uploadsDir));

  // allowed mime types and extensions
  const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  const storage = multer.diskStorage({
    destination: (req: Request, _file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) => cb(null, uploadsDir),
    filename: (req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeExt = ALLOWED_EXT.includes(ext) ? ext : ".jpg";
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
      cb(null, unique);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (!ALLOWED_MIME.includes(file.mimetype)) return cb(new Error("Invalid file type"));
      cb(null, true);
    },
  });

  // Upload single file
  app.post("/api/upload", requireAdmin, upload.single("file"), async (req: Request, res: Response) => {
    try {
      console.log("Upload request received");
      console.log("Request headers:", req.headers);
      console.log("Request file:", (req as any).file);
      
      const uploaded = (req as any).file as Express.Multer.File | undefined;
      if (!uploaded) {
        console.log("No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      console.log("File details:", {
        originalname: uploaded.originalname,
        filename: uploaded.filename,
        path: uploaded.path,
        size: uploaded.size,
        mimetype: uploaded.mimetype
      });
      
      const url = `/images/${uploaded.filename}`;
      const absoluteUrl = `${req.protocol}://${req.get("host")}${url}`;
      console.log("Generated URL:", url);
      console.log("Generated absolute URL:", absoluteUrl);
      console.log("Uploads directory:", uploadsDir);
      console.log("File exists on disk:", fs.existsSync(path.join(uploadsDir, uploaded.filename)));
      
      res.status(201).json({ url, absoluteUrl });
    } catch (error: any) {
      console.error("Upload error details:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  });

  // List uploaded files (admin)
  app.get("/api/uploads/list", requireAdmin, async (_req: Request, res: Response) => {
    try {
      const files = fs.readdirSync(uploadsDir).map((name) => {
        const full = path.join(uploadsDir, name);
        const stat = fs.statSync(full);
        return {
          filename: name,
          url: `/images/${name}`,
          size: stat.size,
          createdAt: stat.birthtime,
        };
      });
      res.json(files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete uploaded file (admin) — validate filename with Zod
  app.delete("/api/uploads/:filename", requireAdmin, async (req: Request, res: Response) => {
    try {
      const schema = z.object({ filename: z.string().regex(/^[0-9\-]+-\d+\.[a-z0-9]+$/i) });
      const { filename } = schema.parse(req.params);
      const target = path.resolve(uploadsDir, filename);
      if (!target.startsWith(uploadsDir)) return res.status(400).json({ message: "Invalid filename" });
      if (!fs.existsSync(target)) return res.status(404).json({ message: "File not found" });
      fs.unlinkSync(target);
      res.json({ message: "Deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ===== ADMIN USER MANAGEMENT =====
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id/role", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ===== ADMIN DASHBOARD ANALYTICS =====
  app.get("/api/admin/analytics", requireAdmin, async (req: Request, res: Response) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalProducts = await Product.countDocuments();
      const totalServices = await Service.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalAppointments = await Appointment.countDocuments();
      const totalRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      res.json({
        totalUsers,
        totalProducts,
        totalServices,
        totalOrders,
        totalAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
