import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin"
} as const;

export const PRODUCT_CATEGORIES = [
  "Immune Boosters",
  "Sport Fit",
  "Women's Beauty",
  "Heart & Blood Fit",
  "Smart Kids",
  "Men's Power",
  "Suma Fit",
  "Suma Living"
] as const;

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["user", "admin", "super_admin"] }).default("user").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsappNumber: text("whatsapp_number"),
  avatarUrl: text("avatar_url"),
  location: text("location"), // Simple location string for profile
  createdAt: timestamp("created_at").defaultNow(),
});

// Products Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Storing in cents or smallest unit
  category: text("category").notNull(),
  images: text("images").array().notNull(), // URLs
  features: text("features").array(),
  benefits: text("benefits").array(),
  isFeatured: boolean("is_featured").default(false),
  isTrending: boolean("is_trending").default(false),
  rating: decimal("rating").default("0"),
  reviewsCount: integer("reviews_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services Table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").default("General").notNull(),
  benefits: text("benefits").array(),
  images: text("images").array().notNull(),
  isFeatured: boolean("is_featured").default(false),
  isTrending: boolean("is_trending").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceOffices = pgTable("service_offices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  county: text("county"),
  subCounty: text("sub_county"),
  area: text("area"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// News & Offers Table
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["news", "offer"] }).default("news").notNull(),
  isUrgent: boolean("is_urgent").default(false),
  imageUrl: text("image_url"),
  authorName: text("author_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  defaultWhatsappNumber: text("default_whatsapp_number").notNull(),
  showUrgentBanner: boolean("show_urgent_banner").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders Table (for record keeping)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  items: jsonb("items").notNull(), // Array of { productId, name, quantity, price }
  totalAmount: integer("total_amount").notNull(),
  deliveryInfo: jsonb("delivery_info").notNull(), // { county, subCounty, location, address, phone }
  status: text("status").default("pending"), // pending, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments Table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  serviceId: integer("service_id").references(() => services.id),
  date: timestamp("date").notNull(),
  office: text("office").notNull(),
  officeId: integer("office_id").references(() => serviceOffices.id),
  location: text("location").notNull(), // User's location
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews Table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites Table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id),
  serviceId: integer("service_id").references(() => services.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailChangeRequests = pgTable("email_change_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  newEmail: text("new_email").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const kenyaCounties = pgTable("kenya_counties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const kenyaSubCounties = pgTable("kenya_sub_counties", {
  id: serial("id").primaryKey(),
  countyId: integer("county_id").references(() => kenyaCounties.id).notNull(),
  name: text("name").notNull(),
});

export const kenyaAreas = pgTable("kenya_areas", {
  id: serial("id").primaryKey(),
  subCountyId: integer("sub_county_id").references(() => kenyaSubCounties.id).notNull(),
  name: text("name").notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  appointments: many(appointments),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const productRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  whatsappNumber: true,
  role: true, // Only admin can set this ideally, but schema allows it
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  rating: true, 
  reviewsCount: true, 
  createdAt: true 
});

export const insertServiceSchema = createInsertSchema(services).omit({ 
  id: true, 
  createdAt: true 
});

export const insertNewsSchema = createInsertSchema(news).omit({ 
  id: true, 
  createdAt: true 
});

export const insertServiceOfficeSchema = createInsertSchema(serviceOffices).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertEmailChangeRequestSchema = createInsertSchema(emailChangeRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  userId: true, 
  status: true, 
  createdAt: true 
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ 
  id: true, 
  userId: true, 
  status: true, 
  createdAt: true 
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ 
  id: true, 
  userId: true, 
  createdAt: true 
});

export type InsertUser = typeof users.$inferInsert;
export type InsertProduct = typeof products.$inferInsert;
export type InsertService = typeof services.$inferInsert;
export type InsertNews = typeof news.$inferInsert;
export type InsertOrder = typeof orders.$inferInsert;
export type InsertAppointment = typeof appointments.$inferInsert;
export type InsertReview = typeof reviews.$inferInsert;
export type InsertServiceOffice = typeof serviceOffices.$inferInsert;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
export type InsertEmailChangeRequest = typeof emailChangeRequests.$inferInsert;

// Types
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Service = typeof services.$inferSelect;
export type News = typeof news.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type ServiceOffice = typeof serviceOffices.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type EmailChangeRequest = typeof emailChangeRequests.$inferSelect;
export type KenyaCounty = typeof kenyaCounties.$inferSelect;
export type KenyaSubCounty = typeof kenyaSubCounties.$inferSelect;
export type KenyaArea = typeof kenyaAreas.$inferSelect;
