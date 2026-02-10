# DR Gabriel - Professional E-commerce & Services Platform

A modern, full-stack e-commerce and wellness services application built with React, Node.js, Express, and MongoDB.

## 📋 Project Structure

```
dr-gabriel/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and config
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                 # Node.js Backend (Express)
│   ├── src/
│   │   ├── db.ts          # MongoDB models
│   │   ├── auth.ts        # Authentication
│   │   ├── routes.ts      # API routes
│   │   ├── seed.ts        # Database seeding
│   │   └── index.ts       # Server entry
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/dr-gabriel
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_URL=http://localhost:5173
```

Seed the database:
```bash
npm run seed
```

Start development server:
```bash
npm run dev
```

Server runs at: `http://localhost:3000`

#### 2. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

Start development server:
```bash
npm run dev
```

Client runs at: `http://localhost:5173`

## 📚 Features

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Role-based access control (User, Admin, Super Admin)
- ✅ Protected API endpoints

### Products
- ✅ 8 product categories (Immune Boosters, Sport Fit, Women's Beauty, etc.)
- ✅ Product gallery and details page
- ✅ Reviews and ratings
- ✅ Favorites/likes system
- ✅ Add to cart functionality
- ✅ WhatsApp order integration

### Services
- ✅ Service listings and details
- ✅ Service office management
- ✅ Appointment booking
- ✅ WhatsApp integration

### News & Offers
- ✅ Admin can post news and offers
- ✅ Urgent news banner
- ✅ Newsletter subscription
- ✅ News detail pages

### Admin Dashboard
- ✅ Analytics and statistics
- ✅ Product management (CRUD)
- ✅ Service management
- ✅ User management
- ✅ Order tracking
- ✅ Settings management

### Location Data
- ✅ All Kenya counties and sub-counties
- ✅ Hierarchical area selection
- ✅ Delivery address management

## 🔑 Demo Credentials

**Admin Account:**
- Email: `admin@drgabriel.com`
- Password: `admin123456`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Services
- `GET /api/services` - List services
- `GET /api/services/:id` - Service details
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Orders & Bookings
- `GET /api/orders` - User's orders
- `POST /api/orders` - Create order
- `GET /api/appointments` - User's appointments
- `POST /api/appointments` - Book appointment

### Reviews & Favorites
- `GET /api/reviews/:productId` - Product reviews
- `POST /api/reviews` - Add review
- `GET /api/favorites` - User's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove favorite

### Admin
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/role` - Change user role
- `GET /api/admin/analytics` - Dashboard analytics

### Locations
- `GET /api/locations/counties` - All counties
- `GET /api/locations/sub-counties/:countyId` - Sub-counties
- `GET /api/locations/areas/:subCountyId` - Areas

## 🎨 Tech Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- Vite
- React Query
- Wouter (routing)
- Axios

**Backend:**
- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- CORS enabled

## 📦 Build & Deployment

### Build Frontend
```bash
cd client
npm run build
```

Output: `client/dist/`

### Build Backend
```bash
cd server
npm run build
```

Output: `server/dist/index.cjs`

### Deploy to Vercel (Frontend)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variable:
   ```
   VITE_API_URL=https://your-render-api.onrender.com
   ```
4. Deploy

### Deploy to Render (Backend)

1. Push to GitHub
2. Create new Web Service on Render
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-production-secret
   CLIENT_URL=https://your-vercel-domain.vercel.app
   ```
4. Build command: `npm install && npm run build`
5. Start command: `npm start`

## 🔐 Security

- JWT tokens for authentication
- Bcrypt password hashing
- CORS protection
- Input validation with Zod
- Protected admin endpoints
- Environment variables for secrets

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS responsive utilities
- Optimized for all screen sizes
- Touch-friendly interface

## 🧪 Testing

Run frontend tests:
```bash
cd client
npm run check
```

Run backend type checks:
```bash
cd server
npm run check
```

## 📝 Available Scripts

### Server
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with demo data
- `npm run check` - TypeScript type check

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - TypeScript type check

## 🐛 Troubleshooting

### MongoDB connection error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- For MongoDB Atlas, allow your IP address

### CORS errors
- Check CLIENT_URL in server .env
- Ensure frontend is making requests to correct API URL

### Port already in use
- Change PORT in .env (backend)
- Vite dev server uses 5173 by default

## 📄 License

MIT License

## 👨‍💼 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for wellness & e-commerce**
