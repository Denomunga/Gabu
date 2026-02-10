import { 
  favorites,
  type User,
  type InsertUser,
  type Product,
  type Service,
  type ServiceOffice,
  type SiteSettings,
  type News,
  type Order,
  type Appointment,
  type Review,
  type NewsletterSubscriber,
  type EmailChangeRequest,
  type KenyaCounty,
  type KenyaSubCounty,
  type KenyaArea,
  type InsertProduct,
  type InsertService,
  type InsertServiceOffice,
  type InsertSiteSettings,
  type InsertNews,
  type InsertOrder,
  type InsertAppointment,
  type InsertReview,
  type InsertNewsletterSubscriber,
  type InsertEmailChangeRequest
} from "./shared/schema";
import { getMongoDb, getNextId } from "./mongo";
import type { Collection, Document } from "mongodb";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collection<T extends Document>(name: string): Collection<T> {
  return getMongoDb().collection<T>(name);
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(filters?: { category?: string, isFeatured?: boolean, isTrending?: boolean, search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  getNews(): Promise<News[]>;
  getNewsItem(id: number): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: number, news: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: number): Promise<void>;

  getSiteSettings(): Promise<SiteSettings | undefined>;
  upsertSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings>;

  getFavorites(userId: number): Promise<(typeof favorites.$inferSelect)[]>;
  addFavorite(userId: number, data: { productId?: number; serviceId?: number }): Promise<(typeof favorites.$inferSelect)>;
  deleteFavorite(userId: number, favoriteId: number): Promise<void>;

  getServiceOffices(): Promise<ServiceOffice[]>;
  createServiceOffice(data: InsertServiceOffice): Promise<ServiceOffice>;
  updateServiceOffice(id: number, data: Partial<InsertServiceOffice>): Promise<ServiceOffice | undefined>;
  deleteServiceOffice(id: number): Promise<void>;

  getKenyaCounties(): Promise<KenyaCounty[]>;
  getKenyaSubCounties(countyId: number): Promise<KenyaSubCounty[]>;
  getKenyaAreas(subCountyId: number): Promise<KenyaArea[]>;

  subscribeNewsletter(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;

  createEmailChangeRequest(userId: number, data: InsertEmailChangeRequest): Promise<EmailChangeRequest>;
  getEmailChangeRequests(): Promise<EmailChangeRequest[]>;
  reviewEmailChangeRequest(id: number, status: "approved" | "rejected"): Promise<EmailChangeRequest | undefined>;

  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId?: number): Promise<Order[]>;

  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(userId?: number): Promise<Appointment[]>;

  createReview(review: InsertReview): Promise<Review>;
  getReviews(productId: number): Promise<(Review & { user: { username: string } })[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const user = await collection<User>("users").findOne({ id });
    return user ?? undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await collection<User>("users").findOne({ username });
    return user ?? undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await collection<User>("users").findOne({ email });
    return user ?? undefined;
  }

  async updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined> {
    const res = await collection<User>("users").findOneAndUpdate(
      { id },
      { $set: update as any },
      { returnDocument: "after" },
    );
    return res.value ?? undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = await getNextId("users");
    const now = new Date();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: (insertUser as any).role ?? "user",
      email: (insertUser as any).email ?? null,
      phone: (insertUser as any).phone ?? null,
      whatsappNumber: (insertUser as any).whatsappNumber ?? null,
      avatarUrl: (insertUser as any).avatarUrl ?? null,
      location: (insertUser as any).location ?? null,
      createdAt: now,
    };

    await collection<User>("users").insertOne(user as any);
    return user;
  }

  async getProducts(filters?: { category?: string, isFeatured?: boolean, isTrending?: boolean, search?: string }): Promise<Product[]> {
    const query: Record<string, unknown> = {};
    if (filters?.category) query.category = filters.category;
    if (filters?.isFeatured) query.isFeatured = true;
    if (filters?.isTrending) query.isTrending = true;
    if (filters?.search) {
      query.name = { $regex: escapeRegex(filters.search), $options: "i" };
    }

    return await collection<Product>("products")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const product = await collection<Product>("products").findOne({ id });
    return product ?? undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = await getNextId("products");
    const now = new Date();
    const product: Product = {
      id,
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      category: insertProduct.category,
      images: insertProduct.images,
      features: (insertProduct as any).features ?? null,
      benefits: (insertProduct as any).benefits ?? null,
      isFeatured: (insertProduct as any).isFeatured ?? false,
      isTrending: (insertProduct as any).isTrending ?? false,
      rating: (insertProduct as any).rating ?? "0",
      reviewsCount: (insertProduct as any).reviewsCount ?? 0,
      createdAt: now,
    };

    await collection<Product>("products").insertOne(product as any);
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product | undefined> {
    const res = await collection<Product>("products").findOneAndUpdate(
      { id },
      { $set: update as any },
      { returnDocument: "after" },
    );
    return res.value ?? undefined;
  }

  async deleteProduct(id: number): Promise<void> {
    await collection<Product>("products").deleteOne({ id });
  }

  async getServices(): Promise<Service[]> {
    return await collection<Service>("services").find({}).sort({ createdAt: -1 }).toArray();
  }

  async getService(id: number): Promise<Service | undefined> {
    const service = await collection<Service>("services").findOne({ id });
    return service ?? undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = await getNextId("services");
    const now = new Date();
    const service: Service = {
      id,
      name: insertService.name,
      description: insertService.description,
      category: (insertService as any).category ?? "General",
      benefits: (insertService as any).benefits ?? null,
      images: insertService.images,
      isFeatured: (insertService as any).isFeatured ?? false,
      isTrending: (insertService as any).isTrending ?? false,
      createdAt: now,
    };

    await collection<Service>("services").insertOne(service as any);
    return service;
  }

  async updateService(id: number, update: Partial<InsertService>): Promise<Service | undefined> {
    const res = await collection<Service>("services").findOneAndUpdate(
      { id },
      { $set: update as any },
      { returnDocument: "after" },
    );
    return res.value ?? undefined;
  }

  async deleteService(id: number): Promise<void> {
    await collection<Service>("services").deleteOne({ id });
  }

  async getNews(): Promise<News[]> {
    return await collection<News>("news")
      .find({})
      .sort({ isUrgent: -1, createdAt: -1 })
      .toArray();
  }

  async getNewsItem(id: number): Promise<News | undefined> {
    const item = await collection<News>("news").findOne({ id });
    return item ?? undefined;
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const id = await getNextId("news");
    const now = new Date();
    const item: News = {
      id,
      title: insertNews.title,
      content: insertNews.content,
      type: (insertNews as any).type ?? "news",
      isUrgent: (insertNews as any).isUrgent ?? false,
      imageUrl: (insertNews as any).imageUrl ?? null,
      authorName: (insertNews as any).authorName ?? null,
      createdAt: now,
    };

    await collection<News>("news").insertOne(item as any);
    return item;
  }

  async updateNews(id: number, update: Partial<InsertNews>): Promise<News | undefined> {
    const res = await collection<News>("news").findOneAndUpdate(
      { id },
      { $set: update as any },
      { returnDocument: "after" },
    );
    return res.value ?? undefined;
  }

  async deleteNews(id: number): Promise<void> {
    await collection<News>("news").deleteOne({ id });
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const settings = await collection<SiteSettings>("siteSettings")
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .next();
    return settings ?? undefined;
  }

  async upsertSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();
    const now = new Date();

    if (!existing) {
      const id = await getNextId("siteSettings");
      const created: SiteSettings = {
        id,
        defaultWhatsappNumber: settings.defaultWhatsappNumber,
        showUrgentBanner: (settings as any).showUrgentBanner ?? true,
        createdAt: now,
        updatedAt: now,
      };
      await collection<SiteSettings>("siteSettings").insertOne(created as any);
      return created;
    }

    const updatedAt = now;
    const res = await collection<SiteSettings>("siteSettings").findOneAndUpdate(
      { id: existing.id },
      {
        $set: {
          defaultWhatsappNumber: settings.defaultWhatsappNumber,
          showUrgentBanner: (settings as any).showUrgentBanner ?? existing.showUrgentBanner,
          updatedAt,
        } as any,
      },
      { returnDocument: "after" },
    );

    if (!res.value) {
      throw new Error("Failed to upsert site settings");
    }

    return res.value;
  }

  async getFavorites(userId: number): Promise<(typeof favorites.$inferSelect)[]> {
    return await collection<(typeof favorites.$inferSelect)>("favorites")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async addFavorite(
    userId: number,
    data: { productId?: number; serviceId?: number }
  ): Promise<(typeof favorites.$inferSelect)> {
    const id = await getNextId("favorites");
    const now = new Date();
    const created = {
      id,
      userId,
      productId: data.productId ?? null,
      serviceId: data.serviceId ?? null,
      createdAt: now,
    } as unknown as (typeof favorites.$inferSelect);

    await collection<(typeof favorites.$inferSelect)>("favorites").insertOne(created as any);
    return created;
  }

  async deleteFavorite(userId: number, favoriteId: number): Promise<void> {
    await collection<(typeof favorites.$inferSelect)>("favorites").deleteOne({ id: favoriteId, userId } as any);
  }

  async getServiceOffices(): Promise<ServiceOffice[]> {
    return await collection<ServiceOffice>("serviceOffices").find({}).sort({ createdAt: -1 }).toArray();
  }

  async createServiceOffice(data: InsertServiceOffice): Promise<ServiceOffice> {
    const id = await getNextId("serviceOffices");
    const now = new Date();
    const office: ServiceOffice = {
      id,
      name: data.name,
      address: (data as any).address ?? null,
      county: (data as any).county ?? null,
      subCounty: (data as any).subCounty ?? null,
      area: (data as any).area ?? null,
      phone: (data as any).phone ?? null,
      isActive: (data as any).isActive ?? true,
      createdAt: now,
    };
    await collection<ServiceOffice>("serviceOffices").insertOne(office as any);
    return office;
  }

  async updateServiceOffice(id: number, data: Partial<InsertServiceOffice>): Promise<ServiceOffice | undefined> {
    const res = await collection<ServiceOffice>("serviceOffices").findOneAndUpdate(
      { id },
      { $set: data as any },
      { returnDocument: "after" },
    );
    return res.value ?? undefined;
  }

  async deleteServiceOffice(id: number): Promise<void> {
    await collection<ServiceOffice>("serviceOffices").deleteOne({ id });
  }

  async getKenyaCounties(): Promise<KenyaCounty[]> {
    return await collection<KenyaCounty>("kenyaCounties").find({}).sort({ name: 1 }).toArray();
  }

  async getKenyaSubCounties(countyId: number): Promise<KenyaSubCounty[]> {
    return await collection<KenyaSubCounty>("kenyaSubCounties")
      .find({ countyId })
      .sort({ name: 1 })
      .toArray();
  }

  async getKenyaAreas(subCountyId: number): Promise<KenyaArea[]> {
    return await collection<KenyaArea>("kenyaAreas")
      .find({ subCountyId })
      .sort({ name: 1 })
      .toArray();
  }

  async subscribeNewsletter(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = await getNextId("newsletterSubscribers");
    const now = new Date();
    const subscriber: NewsletterSubscriber = {
      id,
      email: data.email,
      isActive: true,
      createdAt: now,
    };

    await collection<NewsletterSubscriber>("newsletterSubscribers").insertOne(subscriber as any);
    return subscriber;
  }

  async createEmailChangeRequest(userId: number, data: InsertEmailChangeRequest): Promise<EmailChangeRequest> {
    const id = await getNextId("emailChangeRequests");
    const now = new Date();
    const request: EmailChangeRequest = {
      id,
      userId,
      newEmail: (data as any).newEmail,
      status: "pending",
      createdAt: now,
      reviewedAt: null,
    };

    await collection<EmailChangeRequest>("emailChangeRequests").insertOne(request as any);
    return request;
  }

  async getEmailChangeRequests(): Promise<EmailChangeRequest[]> {
    return await collection<EmailChangeRequest>("emailChangeRequests")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  }

  async reviewEmailChangeRequest(id: number, status: "approved" | "rejected"): Promise<EmailChangeRequest | undefined> {
    const reviewedAt = new Date();
    const res = await collection<EmailChangeRequest>("emailChangeRequests").findOneAndUpdate(
      { id },
      { $set: { status, reviewedAt } as any },
      { returnDocument: "after" },
    );

    if (!res.value) return undefined;

    if (status === "approved") {
      await collection<User>("users").updateOne({ id: res.value.userId }, { $set: { email: res.value.newEmail } as any });
    }

    return res.value;
  }

  // Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = await getNextId("orders");
    const now = new Date();
    const order: Order = {
      id,
      userId: (insertOrder as any).userId ?? null,
      items: (insertOrder as any).items,
      totalAmount: (insertOrder as any).totalAmount,
      deliveryInfo: (insertOrder as any).deliveryInfo,
      status: (insertOrder as any).status ?? "pending",
      createdAt: now,
    };

    await collection<Order>("orders").insertOne(order as any);
    return order;
  }

  async getOrders(userId?: number): Promise<Order[]> {
    const query = userId ? { userId } : {};
    return await collection<Order>("orders").find(query as any).sort({ createdAt: -1 }).toArray();
  }

  // Appointments
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = await getNextId("appointments");
    const now = new Date();
    const appointment: Appointment = {
      id,
      userId: (insertAppointment as any).userId ?? null,
      serviceId: (insertAppointment as any).serviceId ?? null,
      date: (insertAppointment as any).date,
      office: (insertAppointment as any).office,
      officeId: (insertAppointment as any).officeId ?? null,
      location: (insertAppointment as any).location,
      status: (insertAppointment as any).status ?? "pending",
      createdAt: now,
    };

    await collection<Appointment>("appointments").insertOne(appointment as any);
    return appointment;
  }

  async getAppointments(userId?: number): Promise<Appointment[]> {
    const query = userId ? { userId } : {};
    return await collection<Appointment>("appointments")
      .find(query as any)
      .sort({ createdAt: -1 })
      .toArray();
  }

  // Reviews
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = await getNextId("reviews");
    const now = new Date();
    const review: Review = {
      id,
      userId: (insertReview as any).userId ?? null,
      productId: (insertReview as any).productId ?? null,
      rating: (insertReview as any).rating,
      comment: (insertReview as any).comment ?? null,
      createdAt: now,
    };

    await collection<Review>("reviews").insertOne(review as any);
    return review;
  }

  async getReviews(productId: number): Promise<(Review & { user: { username: string } })[]> {
    const result = await collection<Review>("reviews")
      .aggregate([
        { $match: { productId } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: 1,
            userId: 1,
            productId: 1,
            rating: 1,
            comment: 1,
            createdAt: 1,
            user: { username: "$user.username" },
          },
        },
      ])
      .toArray();

    return result as unknown as (Review & { user: { username: string } })[];
  }
}

export const storage = new DatabaseStorage();
