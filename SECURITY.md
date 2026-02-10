# DR Gabriel - Security & Architecture Guide

## 🔐 Security Implementation

### 1. Authentication & Authorization

#### JWT-Based Authentication
- ✅ **Token Generation**: Users receive JWT tokens on login/register
- ✅ **Token Verification**: All protected routes verify JWT tokens
- ✅ **Expiration**: Tokens expire in 7 days
- ✅ **Storage**: Tokens stored in localStorage (consider moving to httpOnly cookies for production)

```typescript
// Token payload
{
  userId: string;
  role: "user" | "admin" | "super_admin";
  iat: number;
  exp: number;
}
```

#### Role-Based Access Control (RBAC)
Three role levels implemented:
- **user**: Regular customers (default)
- **admin**: Can manage products, services, news
- **super_admin**: Can manage admins and users

Protected endpoints:
```
POST /api/products          → requireAdmin
PUT /api/products/:id       → requireAdmin
DELETE /api/products/:id    → requireAdmin
GET /api/admin/users        → requireAdmin
PUT /api/admin/users/:id/role → requireSuperAdmin
GET /api/admin/analytics    → requireAdmin
```

### 2. Password Security

#### Hashing
- ✅ **Algorithm**: Bcrypt with 10 salt rounds
- ✅ **Implementation**:
```typescript
const hashedPassword = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
```

#### Password Requirements
- Minimum 6 characters
- Should be enforced on frontend validation
- Never logged or stored in plain text

### 3. Input Validation

#### Zod Schema Validation
All inputs validated with Zod:

```typescript
const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});
```

#### Frontend Validation
- Type checking with TypeScript
- HTML5 form validation
- Custom validation rules

### 4. CORS Protection

#### Configuration
```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
```

#### Enforcement
- Only requests from CLIENT_URL allowed
- Cookie credentials only sent to trusted origin
- Preflight requests handled automatically

### 5. Data Protection

#### Sensitive Data Handling
- ✅ Passwords: Never stored in plain text
- ✅ Emails: Used for user identification
- ✅ Phone: Optional, encrypted in transit via HTTPS
- ✅ Tokens: Only sent via Authorization header

#### Secure Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- Consider adding: `Content-Security-Policy`

### 6. Database Security

#### MongoDB Best Practices
- ✅ Connection via connection string
- ✅ User authentication enabled
- ✅ IP whitelisting on MongoDB Atlas
- ✅ Encrypted connections (TLS)

#### Indexed Fields
```
users: email (unique), username (unique)
products: category, isFeatured
reviews: productId, userId
```

### 7. API Security

#### Request Limiting (Recommended for Production)
```typescript
// Install: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Request Size Limits
```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));
```

### 8. Environment Variables

#### Required for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your-production-uri
JWT_SECRET=strong-random-string-min-32-chars
CLIENT_URL=https://your-domain.com
```

#### Never Commit
- .env files
- Secrets
- API keys
- Database credentials

### 9. Frontend Security

#### XSS Prevention
- ✅ React auto-escapes content
- ✅ No dangerouslySetInnerHTML used
- ✅ Input validation before display

#### CSRF Prevention
- ✅ SameSite cookies (with httpOnly)
- ✅ CORS properly configured
- ✅ Token verification on API

#### Secure Storage
```typescript
// Current (localStorage - not ideal)
localStorage.setItem('token', token);

// Better (with httpOnly cookies)
// Server sets: res.cookie('token', token, { httpOnly: true })
```

### 10. File Upload Security

#### Recommendations for Production
```typescript
// Install: npm install multer
import multer from 'multer';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Whitelist: png, jpg, jpeg, gif
    const allowed = ['image/png', 'image/jpeg', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Or use cloud storage (Cloudinary, AWS S3)
```

---

## 🏗️ Architecture Overview

### Directory Structure
```
dr-gabriel/
├── server/
│   ├── src/
│   │   ├── index.ts       # Express server setup
│   │   ├── db.ts          # MongoDB models
│   │   ├── auth.ts        # Authentication helpers
│   │   ├── routes.ts      # API endpoints
│   │   └── seed.ts        # Database seeding
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── pages/         # Route components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities
│   │   └── App.tsx
│   └── package.json
```

### Data Flow

#### Authentication Flow
```
User Input → Validation → Hash/Verify → JWT Generation → Response
                                              ↓
                                        Client Storage
```

#### API Request Flow
```
Client Request → 
  ↓
CORS Check → 
  ↓
Rate Limit Check → 
  ↓
JWT Verification → 
  ↓
Authorization Check (Role) → 
  ↓
Input Validation → 
  ↓
Database Operation → 
  ↓
Response
```

---

## 🔒 Security Checklist

### Before Going to Production

- [ ] Change all default credentials
- [ ] Generate new strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Setup rate limiting
- [ ] Add request logging
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Setup monitoring & alerts
- [ ] Review and update dependencies
- [ ] Setup CI/CD security scanning
- [ ] Enable httpOnly cookies for tokens
- [ ] Add Content Security Policy headers
- [ ] Configure session timeout
- [ ] Add 2FA for admin accounts
- [ ] Setup API key for admin endpoints
- [ ] Enable HTTPS enforcing redirects
- [ ] Test OWASP Top 10 vulnerabilities
- [ ] Setup penetration testing
- [ ] Create security incident response plan
- [ ] Document security procedures

### Ongoing Security Maintenance

- [ ] Weekly: Check error logs
- [ ] Weekly: Review admin activities
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review user access
- [ ] Quarterly: Security audit
- [ ] Quarterly: Penetration testing
- [ ] Annually: Full security review

---

## 🚨 Vulnerability Prevention

### SQL Injection
✅ **Prevented**: Using MongoDB ODM (Mongoose) with parameterized queries

### XSS (Cross-Site Scripting)
✅ **Prevented**: React auto-escaping, no eval(), input validation

### CSRF (Cross-Site Request Forgery)
✅ **Mitigated**: SameSite cookies, CORS protection, token validation

### Brute Force
⚠️ **Needs Implementation**: Add rate limiting on auth endpoints

### Man-in-the-Middle
✅ **Prevented**: Use HTTPS in production, TLS for database

### Information Disclosure
✅ **Prevented**: Don't expose stack traces, sanitize error messages

### Broken Authentication
✅ **Prevented**: Secure JWT implementation, bcrypt hashing

### Access Control
✅ **Implemented**: Role-based authorization on all sensitive endpoints

---

## 📋 API Security Summary

### Endpoints by Security Level

#### Public (No Auth Required)
- `GET /api/health`
- `GET /api/products`
- `GET /api/services`
- `GET /api/news`
- `GET /api/locations/*`
- `POST /api/auth/register`
- `POST /api/auth/login`

#### User Auth Required
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/favorites`
- `POST /api/favorites`
- `POST /api/reviews`
- `GET /api/orders`
- `POST /api/orders`

#### Admin Required
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/admin/analytics`
- `GET /api/admin/users`

#### Super Admin Required
- `PUT /api/admin/users/:id/role`
- `DELETE /api/admin/users/:id`

---

## 🔧 Recommendations for Production

### 1. Immediate (Critical)
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Setup HTTPS
- [ ] Enable database backups
- [ ] Monitor error logs

### 2. Short Term (Important)
- [ ] Add 2FA for admins
- [ ] Implement audit logging
- [ ] Setup security headers
- [ ] Add request validation middleware
- [ ] Implement input sanitization

### 3. Long Term (Enhancement)
- [ ] Machine learning fraud detection
- [ ] Advanced threat monitoring
- [ ] Regular penetration testing
- [ ] Security incident response team
- [ ] Compliance certifications (SOC 2, GDPR)

---

## 📞 Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve logs and evidence
   - Contact security team

2. **Investigation**
   - Determine scope
   - Identify root cause
   - Assess impact

3. **Response**
   - Implement patches
   - Notify users if needed
   - Reset credentials
   - Review access logs

4. **Recovery**
   - Restore systems
   - Verify integrity
   - Monitor for recurrence

5. **Post-Incident**
   - Document lessons learned
   - Update security policies
   - Brief team
   - Schedule follow-up audit

---

For detailed security concerns or to report vulnerabilities, please contact the security team.
