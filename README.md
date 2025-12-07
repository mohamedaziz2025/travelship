# 🚢 TravelShip

**Une plateforme premium de mise en relation entre voyageurs et expéditeurs**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Vue d'ensemble

TravelShip connecte les voyageurs (shippers) qui peuvent transporter des colis avec les expéditeurs (senders) qui ont besoin d'envoyer des articles. Design moderne inspiré d'Airbnb, Stripe et Revolut.

## ✨ Fonctionnalités principales

- 🔍 **Recherche intelligente** - Trouvez des voyages ou annonces compatibles
- 💬 **Chat temps réel** - Communication instantanée entre utilisateurs
- 🎯 **Matching algorithmique** - Score de compatibilité automatique
- ✅ **Système de vérification** - Badges et profils vérifiés
- 📱 **Responsive design** - Optimisé mobile et desktop
- 🔒 **Sécurité avancée** - JWT, rate limiting, validation stricte

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State**: Zustand + React Query
- **Real-time**: Socket.io-client
- **Upload**: Cloudinary

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT (Access + Refresh tokens)
- **Real-time**: Socket.io
- **Jobs**: BullMQ + Redis
- **Validation**: Zod

## 📁 Structure du projet

```
travelship/
├── frontend/          # Next.js 14 application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utils & configs
│   ├── hooks/        # Custom hooks
│   └── styles/       # Global styles
├── backend/          # Express API
│   └── src/
│       ├── config/   # Configuration
│       ├── models/   # Mongoose models
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── middlewares/
│       └── jobs/
└── docs/            # Documentation
```

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- MongoDB Atlas account
- Redis (pour jobs)

### Installation

1. **Clone et install**
```bash
cd travelship
npm install
```

2. **Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

3. **Backend**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## 🎨 Design System

### Palette de couleurs
- **Primary Gradient**: `#3B82F6 → #9333EA`
- **Accent**: `#00E5A8`
- **Dark Text**: `#0F172A`
- **Light Text**: `#F8FAFC`

### Design Tokens
- **Glassmorphism**: `rgba(255,255,255,0.15) + backdrop-blur-16px`
- **Shadows**: `0 10px 40px rgba(0,0,0,0.15)`
- **Border Radius**: `12-20px`
- **Typography**: Inter / SF Pro

### Composants principaux
- NavBar / SideBar
- SearchBar
- AnnouncementCard / TripCard
- FilterPanel
- Modal / StepperForm
- ChatWindow
- Badges (Premium, Verified)
- Toast notifications

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `POST /auth/refresh` - Rafraîchir le token
- `POST /auth/logout` - Se déconnecter

### Users
- `GET /users/me` - Profil utilisateur
- `PATCH /users/me` - Mettre à jour profil
- `POST /users/verify` - Vérifier compte

### Announcements
- `POST /announcements` - Créer annonce
- `GET /announcements` - Liste annonces
- `GET /announcements/:id` - Détails annonce
- `PATCH /announcements/:id` - Modifier
- `DELETE /announcements/:id` - Supprimer

### Trips
- `POST /trips` - Créer trajet
- `GET /trips` - Liste trajets
- `GET /trips/:id` - Détails trajet
- `PATCH /trips/:id` - Modifier

### Matching
- `GET /matches/announcements/:id` - Trajets compatibles
- `GET /matches/trips/:id` - Annonces compatibles

### Chat
- `GET /conversations` - Liste conversations
- `GET /conversations/:id/messages` - Messages
- WebSocket events pour temps réel

### Admin
- `GET /admin/flags` - Signalements
- `POST /admin/announcements/:id/ban` - Bannir

## 🔐 Sécurité

- JWT avec refresh tokens
- Cookies HttpOnly
- Rate limiting
- Helmet.js
- Validation Zod
- CORS configuré
- Sanitization des inputs

## 📊 Modèles de données

### User
- Informations personnelles
- Rôle (sender/shipper/both)
- Vérification et badges
- Statistiques

### Announcement
- Type (colis/achat)
- Localisation (from/to)
- Dates et récompense
- Photos et description
- Status premium

### Trip
- Localisation voyage
- Dates disponibles
- Kg disponibles
- Notes

### Message
- Conversation
- Utilisateurs
- Contenu et pièces jointes

## 🌟 Fonctionnalités avancées

- **Multi-step forms** - Création d'annonce guidée
- **Autocomplete cities** - Recherche de villes intelligente
- **Map view** - Visualisation géographique
- **Score matching** - Algorithme de compatibilité
- **Upload images** - Cloudinary integration
- **Email notifications** - BullMQ jobs
- **Admin dashboard** - Modération contenu

## 📱 Pages principales

1. **Landing** - Hero moderne + CTA
2. **Search** - Filtres avancés + résultats
3. **Dashboard** - Vue d'ensemble utilisateur
4. **Create Announcement** - Form multi-étapes
5. **Create Trip** - Form trajet
6. **Matching Details** - Score compatibilité
7. **Chat** - Messagerie temps réel
8. **Profile** - Profil public + stats
9. **Admin Panel** - Modération

## 🚀 Déploiement

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)
```bash
cd backend
# Configure environment variables
# Deploy via Git integration
```

## 📝 License

MIT License - voir LICENSE file

## 👥 Contribution

Les contributions sont les bienvenues ! Voir CONTRIBUTING.md

---

Développé avec ❤️ pour connecter voyageurs et expéditeurs
