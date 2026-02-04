import { 
  users, products, services, news, orders, appointments, reviews, favorites,
  type User, type InsertUser, type Product, type Service, type News, type Order, type Appointment, type Review,
  type InsertProduct, type InsertService, type InsertNews, type InsertOrder, type InsertAppointment, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and, or } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(filters?: { category?: string, isFeatured?: boolean, isTrending?: boolean, search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  // News
  getNews(): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  deleteNews(id: number): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(userId?: number): Promise<Order[]>;

  // Appointments
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(userId?: number): Promise<Appointment[]>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviews(productId: number): Promise<(Review & { user: { username: string } })[]>;
}

export class DatabaseStorage implements IStorage {
  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Products
  async getProducts(filters?: { category?: string, isFeatured?: boolean, isTrending?: boolean, search?: string }): Promise<Product[]> {
    let query = db.select().from(products).orderBy(desc(products.createdAt));

    const conditions = [];
    if (filters?.category) conditions.push(eq(products.category, filters.category));
    if (filters?.isFeatured) conditions.push(eq(products.isFeatured, true));
    if (filters?.isTrending) conditions.push(eq(products.isTrending, true));
    if (filters?.search) conditions.push(ilike(products.name, `%${filters.search}%`));

    if (conditions.length > 0) {
      // @ts-ignore - spread arguments for and() is valid but TS might complain
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(update).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: number, update: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db.update(services).set(update).where(eq(services.id, id)).returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // News
  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.isUrgent), desc(news.createdAt));
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const [item] = await db.insert(news).values(insertNews).returning();
    return item;
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrders(userId?: number): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    }
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  // Appointments
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async getAppointments(userId?: number): Promise<Appointment[]> {
    if (userId) {
      return await db.select().from(appointments).where(eq(appointments.userId, userId)).orderBy(desc(appointments.createdAt));
    }
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  // Reviews
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getReviews(productId: number): Promise<(Review & { user: { username: string } })[]> {
    const result = await db.select({
      id: reviews.id,
      userId: reviews.userId,
      productId: reviews.productId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      user: {
        username: users.username
      }
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
    
    return result;
  }
}

export const storage = new DatabaseStorage();
