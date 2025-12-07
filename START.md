# 🚀 Démarrage Rapide - TravelShip

## ⚡ Lancer l'application en 3 minutes

### 1. Démarrer MongoDB

**Option A - MongoDB local:**
```bash
# Assurez-vous que MongoDB est installé et lancez-le
mongod
```

**Option B - MongoDB Atlas (cloud - recommandé):**
1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un cluster gratuit
3. Récupérez votre connection string
4. Mettez à jour `backend/.env` avec votre URI MongoDB

### 2. Démarrer le Backend

**Terminal 1:**
```bash
cd backend
npm run dev
```

✅ Le backend démarre sur **http://localhost:5000**

### 3. Démarrer le Frontend

**Terminal 2:**
```bash
cd frontend
npm run dev
```

✅ Le frontend démarre sur **http://localhost:3000**

---

## 🎯 Test de l'Application

### Créer un compte
1. Ouvrez http://localhost:3000
2. Cliquez sur **"S'inscrire"**
3. Remplissez le formulaire :
   - Nom : Jean Dupont
   - Email : jean@example.com
   - Mot de passe : 123456
   - Rôle : Les deux
4. Cliquez sur **"Créer mon compte"**

### Se connecter
1. Cliquez sur **"Se connecter"**
2. Email : jean@example.com
3. Mot de passe : 123456
4. Cliquez sur **"Se connecter"**

### Créer une annonce
1. Une fois connecté, allez dans le **Dashboard**
2. Cliquez sur **"Créer une annonce"** ou allez sur `/announcements/new`
3. Remplissez le formulaire :
   - Type : Colis existant
   - De : Paris, France
   - À : Lyon, France
   - Date de collecte : Demain
   - Date de livraison : Dans 3 jours
   - Poids : 2 kg
   - Récompense : 25 €
   - Description : Mon colis fragile
4. Cliquez sur **"Publier l'annonce"**

### Créer un trajet
1. Dans le Dashboard, cliquez sur **"Publier un trajet"** ou allez sur `/trips/new`
2. Remplissez le formulaire :
   - De : Paris, France
   - À : Lyon, France
   - Date de départ : Demain
   - Date d'arrivée : Dans 2 jours
   - Poids disponible : 5 kg
3. Cliquez sur **"Publier le trajet"**

### Rechercher des annonces
1. Allez sur la page **"Rechercher"** (`/search`)
2. Utilisez les filtres :
   - Ville de départ : Paris
   - Ville d'arrivée : Lyon
3. Cliquez sur **"Rechercher"**

### Voir votre profil
1. Cliquez sur votre avatar en haut à droite
2. Ou allez sur `/profile`
3. Vous pouvez modifier vos informations

---

## 📱 Pages Disponibles

| Page | URL | Description |
|------|-----|-------------|
| **Accueil** | `/` | Landing page avec hero et features |
| **Connexion** | `/login` | Se connecter à son compte |
| **Inscription** | `/register` | Créer un nouveau compte |
| **Dashboard** | `/dashboard` | Tableau de bord personnel |
| **Recherche** | `/search` | Rechercher annonces et trajets |
| **Nouvelle annonce** | `/announcements/new` | Créer une annonce de colis |
| **Nouveau trajet** | `/trips/new` | Publier un trajet |
| **Profil** | `/profile` | Voir et modifier son profil |
| **Chat** | `/chat` | Messages (à compléter) |

---

## 🔧 Résolution de Problèmes

### Port déjà utilisé
```bash
# Backend - Changez le port dans backend/.env
PORT=5001

# Frontend - Next.js proposera automatiquement un autre port
```

### Erreur MongoDB
```bash
# Vérifiez que MongoDB est lancé
mongod

# Ou utilisez MongoDB Atlas (cloud)
```

### Erreur CORS
```bash
# Vérifiez que FRONTEND_URL est correct dans backend/.env
FRONTEND_URL=http://localhost:3000
```

### Erreur "Cannot find module"
```bash
# Réinstallez les dépendances
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Fonctionnalités Implémentées

✅ **Authentification complète**
- Inscription avec validation
- Connexion avec JWT
- Refresh tokens
- Protection des routes

✅ **Gestion des annonces**
- Créer une annonce (colis/shopping)
- Lister les annonces
- Rechercher avec filtres
- Voir les détails

✅ **Gestion des trajets**
- Créer un trajet
- Lister les trajets
- Rechercher avec filtres

✅ **Dashboard utilisateur**
- Statistiques personnelles
- Actions rapides
- Activité récente

✅ **Profil utilisateur**
- Voir ses informations
- Modifier nom et téléphone
- Voir ses stats et badges

✅ **Design moderne**
- Glassmorphism
- Gradients bleu → violet
- Animations fluides
- Responsive mobile

---

## 📚 Documentation Complète

- **API Documentation** : `docs/API_DOCUMENTATION.md`
- **Design System** : `docs/DESIGN_SYSTEM.md`
- **Architecture** : `docs/ARCHITECTURE.md`
- **Deployment** : `docs/DEPLOYMENT_GUIDE.md`

---

## 🚧 Prochaines Fonctionnalités

- [ ] Upload d'images (Cloudinary)
- [ ] Chat temps réel (Socket.io)
- [ ] Système de matching amélioré
- [ ] Notifications en temps réel
- [ ] Système de paiement
- [ ] Reviews et ratings
- [ ] Admin dashboard

---

## 💡 Conseils

1. **Utilisez MongoDB Atlas** pour éviter d'installer MongoDB localement
2. **Créez plusieurs comptes** pour tester les interactions
3. **Vérifiez les logs** dans les terminaux pour déboguer
4. **Utilisez React DevTools** pour inspecter le state

---

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans les terminaux
2. Consultez la documentation dans `/docs`
3. Vérifiez que les ports 3000 et 5000 sont disponibles
4. Assurez-vous que MongoDB est lancé

---

**Bon développement ! 🚀**
