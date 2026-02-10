import { z } from "zod";
import {
  insertProductSchema,
  insertServiceSchema,
  insertNewsSchema,
  insertSiteSettingsSchema,
  insertServiceOfficeSchema,
} from "./schema";

export function buildUrl(path: string, params?: Record<string, any>) {
  if (!params) return path;
  let p = path;
  Object.entries(params).forEach(([k, v]) => {
    p = p.replace(`:${k}`, String(v));
  });
  return p;
}

const any = z.any();

export const api = {
  settings: {
    get: { path: "/api/settings", method: "GET", responses: { 200: any } },
    upsert: { path: "/api/settings", method: "PUT", input: insertSiteSettingsSchema, responses: { 200: any } },
  },
  products: {
    list: { path: "/api/products", method: "GET", responses: { 200: z.array(any) } },
    get: { path: "/api/products/:id", method: "GET", responses: { 200: any, 404: any } },
    create: { path: "/api/products", method: "POST", input: insertProductSchema, responses: { 201: any } },
    update: { path: "/api/products/:id", method: "PATCH", input: insertProductSchema.partial(), responses: { 200: any } },
    delete: { path: "/api/products/:id", method: "DELETE", responses: { 204: any } },
  },
  services: {
    list: { path: "/api/services", method: "GET", responses: { 200: z.array(any) } },
    get: { path: "/api/services/:id", method: "GET", responses: { 200: any, 404: any } },
    create: { path: "/api/services", method: "POST", input: insertServiceSchema, responses: { 201: any } },
    update: { path: "/api/services/:id", method: "PATCH", input: insertServiceSchema.partial(), responses: { 200: any } },
    delete: { path: "/api/services/:id", method: "DELETE", responses: { 204: any } },
  },
  news: {
    list: { path: "/api/news", method: "GET", responses: { 200: z.array(any) } },
    get: { path: "/api/news/:id", method: "GET", responses: { 200: any, 404: any } },
    create: { path: "/api/news", method: "POST", input: insertNewsSchema, responses: { 201: any } },
    update: { path: "/api/news/:id", method: "PATCH", input: insertNewsSchema.partial(), responses: { 200: any } },
    delete: { path: "/api/news/:id", method: "DELETE", responses: { 204: any } },
  },
  favorites: {
    list: { path: "/api/favorites", method: "GET", responses: { 200: z.array(any) } },
    add: { path: "/api/favorites", method: "POST", input: z.any(), responses: { 201: any } },
    remove: { path: "/api/favorites/:id", method: "DELETE", responses: { 204: any } },
  },
  serviceOffices: {
    list: { path: "/api/service-offices", method: "GET", responses: { 200: z.array(any) } },
    create: { path: "/api/service-offices", method: "POST", input: insertServiceOfficeSchema, responses: { 201: any } },
    update: { path: "/api/service-offices/:id", method: "PATCH", input: insertServiceOfficeSchema.partial(), responses: { 200: any } },
    delete: { path: "/api/service-offices/:id", method: "DELETE", responses: { 204: any } },
  },
  locations: {
    counties: { path: "/api/locations/counties", method: "GET", responses: { 200: z.array(any) } },
    subCounties: { path: "/api/locations/:countyId/sub-counties", method: "GET", responses: { 200: z.array(any) } },
    areas: { path: "/api/locations/:subCountyId/areas", method: "GET", responses: { 200: z.array(any) } },
  },
  newsletter: {
    subscribe: { path: "/api/newsletter/subscribe", method: "POST", input: z.any(), responses: { 201: any } },
  },
  emailChange: {
    request: { path: "/api/email-change/request", method: "POST", input: z.any(), responses: { 201: any } },
    list: { path: "/api/email-change", method: "GET", responses: { 200: z.array(any) } },
    review: { path: "/api/email-change/:id/review", method: "POST", input: z.any(), responses: { 200: any } },
  },
  orders: {
    create: { path: "/api/orders", method: "POST", input: z.any(), responses: { 201: any } },
    list: { path: "/api/orders", method: "GET", responses: { 200: z.array(any) } },
  },
  appointments: {
    create: { path: "/api/appointments", method: "POST", input: z.any(), responses: { 201: any } },
    list: { path: "/api/appointments", method: "GET", responses: { 200: z.array(any) } },
  },
  reviews: {
    create: { path: "/api/reviews", method: "POST", input: z.any(), responses: { 201: any } },
    list: { path: "/api/reviews/:productId", method: "GET", responses: { 200: z.array(any) } },
  },
};

export type Product = any;
