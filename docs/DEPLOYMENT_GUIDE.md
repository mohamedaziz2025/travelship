# 🚀 Guide de Déploiement TravelShip

## 📋 Prérequis

- Node.js 18+ installé
- MongoDB Atlas account (ou MongoDB local)
- Redis instance (pour BullMQ)
- Cloudinary account (pour images)
- Domaine configuré (optionnel)

---

## 🏗️ Architecture Déployée

```
┌─────────────────┐
│   Vercel        │  ← Frontend (Next.js)
│   (Frontend)    │
└────────┬────────┘
         │
         │ API calls
         ▼
┌─────────────────┐
│   Railway       │  ← Backend (Express + Socket.io)
│   (Backend)     │
└────────┬────────┘
         │
         ├─────────► MongoDB Atlas (Database)
         │
         └─────────► Redis Cloud (Jobs & Cache)
```

---

## 📦 Partie 1: Préparer le Code

### 1.1 Variables d'Environnement

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
NEXT_PUBLIC_ENV=production
```

**Backend (.env):**
```bash
NODE_ENV=production
PORT=5000
API_VERSION=v1

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/travelship
JWT_SECRET=your_super_secret_key_change_me
JWT_REFRESH_SECRET=another_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

REDIS_HOST=redis-xxxxx.redis.cloud
REDIS_PORT=12345
REDIS_PASSWORD=your_redis_password

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

FRONTEND_URL=https://your-app.vercel.app
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🗄️ Partie 2: MongoDB Atlas

### 2.1 Créer le Cluster

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un compte gratuit
3. Créez un nouveau cluster (M0 Free Tier)
4. Attendez 3-5 minutes pour le provisioning

### 2.2 Configuration

1. **Database Access:**
   - Créez un utilisateur avec read/write permissions
   - Notez username et password

2. **Network Access:**
   - Ajoutez `0.0.0.0/0` (autoriser tous les IPs)
   - Ou spécifiez les IPs de Railway

3. **Connection String:**
   - Cliquez sur "Connect" → "Connect your application"
   - Copiez la string de connexion
   - Remplacez `<password>` et `<dbname>`

```
mongodb+srv://user:password@cluster.mongodb.net/travelship?retryWrites=true&w=majority
```

---

## 🔴 Partie 3: Redis Cloud

### 3.1 Setup Redis

1. Allez sur [Redis Cloud](https://redis.com/try-free/)
2. Créez un compte gratuit (30MB)
3. Créez une nouvelle database
4. Notez: hostname, port, password

### 3.2 Configuration

```bash
REDIS_HOST=redis-12345.c123.eu-west-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_password
```

---

## ☁️ Partie 4: Cloudinary

### 4.1 Setup Images

1. Allez sur [Cloudinary](https://cloudinary.com/)
2. Créez un compte gratuit
3. Notez: Cloud Name, API Key, API Secret

### 4.2 Upload Preset

1. Settings → Upload
2. Créez un nouveau Upload Preset
3. **Signing Mode:** Unsigned
4. Notez le preset name

---

## 🚂 Partie 5: Déployer Backend (Railway)

### 5.1 Installation

1. Allez sur [Railway](https://railway.app/)
2. Connectez votre compte GitHub
3. Créez un nouveau projet

### 5.2 Déploiement

```bash
# Dans le dossier backend
railway login
railway init
railway link
```

Ou via l'interface web:
1. New Project → Deploy from GitHub repo
2. Sélectionnez votre repository
3. Root Directory: `/backend`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`

### 5.3 Variables d'Environnement

Dans Railway Dashboard:
- Variables → Add All Variables
- Collez toutes les variables du `.env`

### 5.4 Domaine

1. Settings → Generate Domain
2. Ou ajoutez un custom domain
3. Notez l'URL: `https://your-app.railway.app`

---

## ▲ Partie 6: Déployer Frontend (Vercel)

### 6.1 Installation

```bash
# Dans le dossier frontend
npm install -g vercel
vercel login
```

### 6.2 Déploiement

```bash
cd frontend
vercel
```

Suivez les prompts:
- Setup and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **travelship**
- Directory? **./frontend**
- Override settings? **No**

### 6.3 Variables d'Environnement

```bash
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_SOCKET_URL
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

Ou via Dashboard:
1. Project Settings → Environment Variables
2. Ajoutez toutes les variables `NEXT_PUBLIC_*`

### 6.4 Production Deploy

```bash
vercel --prod
```

---

## 🔧 Partie 7: Configuration Post-Déploiement

### 7.1 CORS

Vérifiez dans `backend/src/index.ts`:
```typescript
cors({
  origin: 'https://your-app.vercel.app',
  credentials: true,
})
```

### 7.2 Cookies

Pour les refresh tokens, assurez-vous:
```typescript
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'none', // Cross-domain
  maxAge: 7 * 24 * 60 * 60 * 1000,
})
```

### 7.3 WebSocket

Railway doit supporter WebSocket par défaut.
Testez la connexion:
```javascript
const socket = io('https://your-backend.railway.app')
```

---

## ✅ Partie 8: Tests

### 8.1 Health Check

```bash
curl https://your-backend.railway.app/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "timestamp": "2025-01-10T..."
}
```

### 8.2 Tests Frontend

1. Visitez `https://your-app.vercel.app`
2. Testez l'inscription/connexion
3. Vérifiez que les API calls fonctionnent
4. Testez le chat en temps réel

### 8.3 Tests Backend

```bash
# Register
curl -X POST https://your-backend.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST https://your-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 📊 Partie 9: Monitoring

### 9.1 Railway

Dashboard → Metrics:
- CPU usage
- Memory usage
- Network traffic
- Logs en temps réel

### 9.2 Vercel

Analytics:
- Page views
- Response times
- Error tracking
- Web Vitals

### 9.3 Logs

**Railway:**
```bash
railway logs
```

**Vercel:**
```bash
vercel logs
```

---

## 🔒 Partie 10: Sécurité

### 10.1 Checklist

- ✅ HTTPS activé partout
- ✅ JWT secrets forts et uniques
- ✅ Rate limiting configuré
- ✅ Helmet.js actif
- ✅ Variables d'environnement sécurisées
- ✅ MongoDB authentication
- ✅ Redis password set
- ✅ CORS correctement configuré

### 10.2 Secrets

**JAMAIS** commit:
- `.env` files
- JWT secrets
- Database passwords
- API keys

Ajoutez au `.gitignore`:
```
.env
.env.local
.env.production
```

---

## 🚀 Partie 11: CI/CD

### 11.1 GitHub Actions (optionnel)

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: cd backend && npm install
      - run: cd backend && npm run build
      # Railway déploie automatiquement via Git
```

---

## 📝 Partie 12: Maintenance

### 12.1 Mises à Jour

**Frontend:**
```bash
cd frontend
git pull
vercel --prod
```

**Backend:**
```bash
cd backend
git pull
railway up
```

### 12.2 Backups MongoDB

1. Atlas → Clusters → Configure
2. Backup → Enable Cloud Backup
3. Schedule: Daily snapshots

### 12.3 Monitoring Errors

Intégrez Sentry (optionnel):
```bash
npm install @sentry/nextjs @sentry/node
```

---

## 🎉 Déploiement Terminé!

Votre application est maintenant live:
- **Frontend:** https://travelship.vercel.app
- **Backend:** https://travelship-api.railway.app
- **Database:** MongoDB Atlas
- **Cache:** Redis Cloud
- **CDN Images:** Cloudinary

**Next Steps:**
1. Configurez un domaine custom
2. Activez les analytics
3. Configurez les emails (Nodemailer)
4. Ajoutez monitoring (Sentry)
5. Optimisez les performances
