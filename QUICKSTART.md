# 🚀 Guide de Démarrage Rapide - TravelShip

## ⚡ Installation en 5 minutes

### 1️⃣ Prérequis
- Node.js 18+ installé
- MongoDB (local ou Atlas)
- Git

### 2️⃣ Clone le projet
```bash
git clone https://github.com/your-username/travelship.git
cd travelship
```

### 3️⃣ Configuration Backend

```bash
cd backend
npm install
cp .env.example .env
```

**Modifiez `.env`:**
```bash
MONGODB_URI=mongodb://localhost:27017/travelship
JWT_SECRET=your_secret_here_change_me
JWT_REFRESH_SECRET=another_secret_here
FRONTEND_URL=http://localhost:3000
```

**Lancez:**
```bash
npm run dev
```

✅ Backend running on `http://localhost:5000`

### 4️⃣ Configuration Frontend

**Nouveau terminal:**
```bash
cd frontend
npm install
cp .env.example .env.local
```

**Modifiez `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**Lancez:**
```bash
npm run dev
```

✅ Frontend running on `http://localhost:3000`

### 5️⃣ Testez l'application

1. Ouvrez `http://localhost:3000`
2. Créez un compte
3. Explorez l'interface !

---

## 📱 Fonctionnalités Disponibles

### Déjà implémenté ✅
- ✅ Landing page moderne
- ✅ Authentification (Register/Login)
- ✅ Dashboard utilisateur
- ✅ Recherche avec filtres
- ✅ Création d'annonces
- ✅ Création de trajets
- ✅ Système de matching
- ✅ Chat temps réel (Socket.io)
- ✅ Design system complet
- ✅ API REST complète
- ✅ Responsive mobile

### À implémenter 🚧
- Upload d'images (Cloudinary)
- Système de paiement
- Notifications email
- Admin dashboard
- Reviews & ratings
- Carte interactive (Google Maps)

---

## 🎯 Prochaines Étapes

### Pour développer:
```bash
# Lancer les tests
npm run test

# Vérifier les types
npm run type-check

# Build production
npm run build
```

### Pour déployer:
Suivez le guide: `docs/DEPLOYMENT_GUIDE.md`

### Pour contribuer:
Lisez: `CONTRIBUTING.md`

---

## 📚 Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Design System**: `docs/DESIGN_SYSTEM.md`
- **Deployment**: `docs/DEPLOYMENT_GUIDE.md`

---

## 🆘 Besoin d'aide ?

### Erreurs communes

**MongoDB connection failed:**
```bash
# Assurez-vous que MongoDB est lancé
mongod

# Ou utilisez MongoDB Atlas (cloud)
```

**Port already in use:**
```bash
# Change le port dans .env
PORT=5001
```

**Module not found:**
```bash
# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Structure du Projet

```
travelship/
├── frontend/           # Next.js 14 app
│   ├── app/           # Pages (App Router)
│   ├── components/    # React components
│   ├── lib/           # Utils & configs
│   └── hooks/         # Custom hooks
│
├── backend/           # Express API
│   └── src/
│       ├── models/    # Mongoose schemas
│       ├── controllers/
│       ├── routes/
│       ├── middlewares/
│       └── socket.ts  # Socket.io
│
└── docs/              # Documentation
```

---

## 🎉 Vous êtes prêt !

L'application est maintenant en cours d'exécution. Explorez le code, testez les fonctionnalités et amusez-vous à développer !

**Happy coding! 🚀**
