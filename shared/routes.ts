import { z } from 'zod';
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertServiceSchema, 
  insertNewsSchema, 
  insertOrderSchema, 
  insertAppointmentSchema, 
  insertReviewSchema,
  users,
  products,
  services,
  news,
  orders,
  appointments,
  reviews
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      input: z.object({
        category: z.string().optional(),
        isFeatured: z.boolean().optional(),
        isTrending: z.boolean().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services',
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/services/:id',
      responses: {
        200: z.custom<typeof services.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/services',
      input: insertServiceSchema,
      responses: {
        201: z.custom<typeof services.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/services/:id',
      input: insertServiceSchema.partial(),
      responses: {
        200: z.custom<typeof services.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/services/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  news: {
    list: {
      method: 'GET' as const,
      path: '/api/news',
      responses: {
        200: z.array(z.custom<typeof news.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/news',
      input: insertNewsSchema,
      responses: {
        201: z.custom<typeof news.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/news/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
  },
  appointments: {
    create: {
      method: 'POST' as const,
      path: '/api/appointments',
      input: insertAppointmentSchema,
      responses: {
        201: z.custom<typeof appointments.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/appointments',
      responses: {
        200: z.array(z.custom<typeof appointments.$inferSelect>()),
      },
    },
  },
  reviews: {
    create: {
      method: 'POST' as const,
      path: '/api/reviews',
      input: insertReviewSchema,
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/products/:productId/reviews',
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect & { user: { username: string } }>()),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
