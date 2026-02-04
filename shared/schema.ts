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
  benefits: text("benefits").array(),
  images: text("images").array().notNull(),
  isFeatured: boolean("is_featured").default(false),
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
  createdAt: timestamp("created_at").defaultNow(),
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

// Types
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Service = typeof services.$inferSelect;
export type News = typeof news.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
