# DR Gabriel - Quick Start Guide

## 🚀 Start Development in 5 Minutes

### Requirements
- Node.js 18+ installed
- MongoDB running locally OR MongoDB Atlas account

### Option 1: Local MongoDB

#### 1. Start MongoDB (if installed locally)
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Windows with MongoDB installed
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### 2. Start Backend
```bash
cd server
npm install
npm run seed      # Load demo data
npm run dev       # Start server at http://localhost:3000
```

#### 3. Start Frontend (new terminal)
```bash
cd client
npm install
npm run dev       # Start at http://localhost:5173
```

#### 4. Access the App
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api

---

### Option 2: MongoDB Atlas (Cloud)

#### 1. Setup MongoDB Atlas
- Create account at https://mongodb.com/cloud/atlas
- Create a free cluster
- Create a database user
- Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/db`)

#### 2. Configure Backend
```bash
cd server

# Create .env file
cat > .env << 'EOF'
PORT=3000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/dr-gabriel
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
CLIENT_URL=http://localhost:5173
EOF

npm install
npm run seed      # Load demo data
npm run dev
```

#### 3. Start Frontend
```bash
cd client
npm install
npm run dev
```

---

## 📝 Demo Credentials

After seeding, log in with:
- **Email**: admin@drgabriel.com
- **Password**: admin123456

---

## 🧪 Testing the App

### 1. As Admin
1. Login with admin credentials
2. Go to `/admin` dashboard
3. Try adding a product
4. View analytics

### 2. As Regular User
1. Create new account at `/register`
2. Browse products and services
3. Add to cart
4. Try checkout flow

### 3. WhatsApp Integration
1. Create order and proceed to checkout
2. Fill delivery details
3. Click "Checkout on WhatsApp"
4. You'll be redirected to WhatsApp (if installed)

---

## 📁 Project Structure Quick Reference

```
dr-gabriel/
├── client/               # React app
│   ├── src/pages/       # All page components
│   ├── src/components/  # Reusable components
│   ├── src/hooks/       # Custom hooks
│   └── src/lib/         # Utilities
│
├── server/              # Node/Express API
│   ├── src/db.ts       # MongoDB models
│   ├── src/auth.ts     # Authentication
│   ├── src/routes.ts   # API endpoints
│   └── src/index.ts    # Server entry point
```

---

## 🔗 Key URLs

**Frontend Pages:**
- Home: `/`
- Shop: `/shop`
- Product: `/products/:id`
- Services: `/services`
- Cart: `/cart`
- Login: `/login`
- Register: `/register`
- Admin: `/admin`

**API Base:** `http://localhost:3000/api`

---

## 💡 Common Tasks

### Clear Database
```bash
# Stop server
# Delete MongoDB database and restart
```

### Restart with Fresh Data
```bash
cd server
npm run seed
```

### Check for Errors
```bash
# Backend terminal: Look for errors
# Frontend terminal: Check browser console (F12)
```

### Change Admin Credentials
1. Login as admin
2. Go to profile
3. Update email/password

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Can't connect to MongoDB" | Start MongoDB or check MONGODB_URI |
| "Port 3000 already in use" | `npm run dev -- --port 3001` |
| "CORS error" | Check CLIENT_URL in server .env |
| "Blank page in browser" | Check browser console (F12) for errors |
| "API returns 401" | Token expired, login again |

---

## 📚 Next Steps

1. **Explore the code** - Check out `src/pages/` and `src/components/`
2. **Read full docs** - See `README.md` for detailed info
3. **Deploy** - See `DEPLOYMENT.md` for production setup
4. **Customize** - Update branding, colors, content as needed

---

## ✅ Features to Test

- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Product details and reviews
- [ ] Add to cart and checkout
- [ ] Admin dashboard
- [ ] Product management
- [ ] Create new products
- [ ] View analytics

---

**Stuck?** Check the terminal for error messages and see the main README.md
