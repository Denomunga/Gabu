import { z } from "zod";

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export const PRODUCT_CATEGORIES = [
  "Immune Boosters",
  "Sport Fit",
  "Women's Beauty",
  "Heart & Blood Fit",
  "Smart Kids",
  "Men's Power",
  "Suma Fit",
  "Suma Living",
] as const;

// Minimal zod-based input schemas used by client for typings
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  role: z.string().optional(),
});

export const insertProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  rating: z.string().optional(),
  reviewsCount: z.number().optional(),
});

export const insertServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const insertNewsSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.enum(["news", "offer"]).optional(),
  imageUrl: z.string().optional(),
});

export const insertServiceOfficeSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  county: z.string().optional(),
  subCounty: z.string().optional(),
  area: z.string().optional(),
  phone: z.string().optional(),
});

export const insertSiteSettingsSchema = z.object({
  defaultWhatsappNumber: z.string().optional(),
  showUrgentBanner: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type InsertServiceOffice = z.infer<typeof insertServiceOfficeSchema>;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;

export type User = {
  id?: string | number;
  username?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
};

export type Product = {
  _id?: string;
  id?: string | number;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  features?: string[];
  benefits?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  rating?: string | number;
  reviewsCount?: number;
  createdAt?: string;
};

export type Service = {
  _id?: string;
  id?: string | number;
  name?: string;
  description?: string;
  category?: string;
  images?: string[];
  benefits?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt?: string;
};

export type News = {
  _id?: string;
  id?: string | number;
  title?: string;
  content?: string;
  type?: "news" | "offer";
  isUrgent?: boolean;
  imageUrl?: string;
  authorName?: string;
  createdAt?: string;
};

export { z };
