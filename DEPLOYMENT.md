# DR Gabriel - Deployment Guide

This guide will help you deploy DR Gabriel to production using Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account with repository
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- MongoDB Atlas account (https://mongodb.com/cloud/atlas)

## Step 1: MongoDB Setup (Atlas)

1. Go to https://mongodb.com/cloud/atlas
2. Create a new account or login
3. Create a new project
4. Create a cluster (M0 Free tier is fine)
5. Add your IP to Network Access
6. Create a database user with strong password
7. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/dr-gabriel?retryWrites=true&w=majority`

## Step 2: GitHub Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: DR Gabriel app"
git remote add origin https://github.com/yourusername/dr-gabriel.git
git push -u origin main
```

## Step 3: Deploy Backend to Render

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `dr-gabriel-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dr-gabriel
   JWT_SECRET=generate-a-long-random-string-here
   CLIENT_URL=https://dr-gabriel.vercel.app (update with your Vercel domain)
   ```

6. Choose Free tier and deploy
7. Wait for deployment to complete
8. Copy the API URL (e.g., `https://dr-gabriel-api.onrender.com`)

### Generate JWT Secret

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

## Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://dr-gabriel-api.onrender.com
   ```

6. Deploy
7. Your app is now live at: `https://dr-gabriel.vercel.app`

## Step 5: Test the Deployment

1. Visit your Vercel domain
2. Test login with demo credentials:
   - Email: `admin@drgabriel.com`
   - Password: `admin123456`
3. Try creating products in admin dashboard
4. Test the full user flow

## Step 6: Post-Deployment

### Seed Production Database

1. Go to Render dashboard
2. Go to your service settings
3. Click "Shell" tab
4. Run:
   ```bash
   npm run seed
   ```

### Update Admin Credentials

After seeding, log in and change admin password:
1. Go to admin dashboard
2. Update profile
3. Consider creating new admin accounts

### Monitor Logs

- **Backend**: Check Render logs for errors
- **Frontend**: Check Vercel logs for build issues
- **Monitor**: Use Render's analytics and error tracking

## Troubleshooting

### Backend deployment fails
- Check MongoDB URI is correct
- Ensure all environment variables are set
- Check build logs for TypeScript errors
- Verify Node.js version is 18+

### Frontend can't connect to API
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Check browser console for errors

### Seed fails
- Ensure MongoDB URI is correct
- Check MongoDB Atlas allows your IP
- Verify database credentials

### Performance issues
- Consider upgrading MongoDB tier
- Enable caching on Vercel
- Optimize images
- Consider CDN for assets

## Environment Variables Checklist

### Backend (.env on Render)
- [ ] NODE_ENV=production
- [ ] PORT=3000
- [ ] MONGODB_URI (from MongoDB Atlas)
- [ ] JWT_SECRET (strong random string)
- [ ] CLIENT_URL (Vercel domain)

### Frontend (.env on Vercel)
- [ ] VITE_API_URL (Render API URL)

## Security Checklist

- [ ] MongoDB: Strong password set
- [ ] JWT_SECRET: Unique, strong random string
- [ ] CORS: Configured with correct CLIENT_URL
- [ ] Admin password: Changed from demo
- [ ] Database: Regular backups enabled
- [ ] Render: Auto-deploy only from main branch

## Monitoring & Maintenance

1. **Weekly**: Check admin dashboard for orders
2. **Monthly**: Review error logs
3. **Monthly**: Update dependencies
4. **Quarterly**: Review security settings

## Custom Domain

### For Vercel Frontend:
1. Go to Vercel dashboard → Project settings
2. Add custom domain
3. Update DNS records at your domain provider
4. SSL certificate auto-generated

### For Render Backend:
1. Go to Render dashboard → Service settings
2. Add custom domain
3. Update DNS records
4. Update VITE_API_URL in Vercel

## Scaling

### When you outgrow free tier:

**MongoDB**: Upgrade M0 to M2/M5+ cluster
**Render**: Upgrade from free to paid tier
**Vercel**: Already scalable, no changes needed

---

**Need help?** Check the main README.md or contact support.
