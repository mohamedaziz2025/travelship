# 🧪 Guide de Test TravelShip

## 🚀 Démarrage

### 1. Lancer MongoDB
```bash
# MongoDB local
mongod

# OU utiliser MongoDB Atlas (recommandé)
# Mettez à jour backend/.env avec votre URI MongoDB Atlas
```

### 2. Lancer le Backend
```bash
cd backend
npm run dev
```
✅ Backend sur http://localhost:5000

### 3. Lancer le Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend sur http://localhost:3000

---

## ✅ Test Complet - Étape par Étape

### Étape 1 : Créer un compte
1. Ouvrez http://localhost:3000
2. Cliquez sur **"S'inscrire"**
3. Remplissez :
   - Nom : **Jean Dupont**
   - Email : **jean@test.com**
   - Mot de passe : **123456**
   - Rôle : **Les deux**
4. Cliquez sur **"Créer mon compte"**
5. ✅ Vous devriez être redirigé vers la page de connexion

### Étape 2 : Se connecter
1. Email : **jean@test.com**
2. Mot de passe : **123456**
3. Cliquez sur **"Se connecter"**
4. ✅ Vous devriez être redirigé vers le dashboard

### Étape 3 : Créer une annonce
1. Dans le dashboard, cliquez sur **"Créer une annonce"**
   - OU allez sur http://localhost:3000/announcements/new
2. Remplissez le formulaire :
   - Type : **Colis existant**
   - Ville de départ : **Paris**
   - Pays de départ : **France**
   - Ville d'arrivée : **Lyon**
   - Pays d'arrivée : **France**
   - Date de collecte : **Aujourd'hui ou demain**
   - Date de livraison : **Dans 3 jours**
   - Poids : **2**
   - Récompense : **25**
   - Description : **Mon colis fragile à livrer**
3. Cliquez sur **"Publier l'annonce"**
4. ✅ Vous devriez voir un message de succès et être redirigé vers le dashboard

### Étape 4 : Voir mes annonces
1. Cliquez sur **"Mes annonces"** dans le menu (sidebar ou navbar)
   - OU allez sur http://localhost:3000/announcements
2. ✅ Vous devriez voir l'annonce que vous venez de créer

### Étape 5 : Créer un trajet
1. Cliquez sur **"Publier un trajet"** dans le dashboard
   - OU allez sur http://localhost:3000/trips/new
2. Remplissez le formulaire :
   - Ville de départ : **Paris**
   - Pays de départ : **France**
   - Ville d'arrivée : **Lyon**
   - Pays d'arrivée : **France**
   - Date de départ : **Demain**
   - Date d'arrivée : **Dans 2 jours**
   - Poids disponible : **5**
   - Notes : **Voyage en train, colis fragiles acceptés**
3. Cliquez sur **"Publier le trajet"**
4. ✅ Message de succès et redirection vers le dashboard

### Étape 6 : Voir mes trajets
1. Cliquez sur **"Mes trajets"** dans le menu
   - OU allez sur http://localhost:3000/trips
2. ✅ Vous devriez voir le trajet que vous venez de créer

### Étape 7 : Rechercher
1. Allez sur la page **"Rechercher"**
   - OU http://localhost:3000/search
2. Utilisez les filtres :
   - Ville de départ : **Paris**
   - Ville d'arrivée : **Lyon**
3. Cliquez sur **"Rechercher"**
4. ✅ Vous devriez voir vos annonces et trajets correspondants

### Étape 8 : Voir le profil
1. Cliquez sur votre avatar en haut à droite
2. Sélectionnez **"Profil"**
   - OU allez sur http://localhost:3000/profile
3. ✅ Vous devriez voir vos informations et statistiques

### Étape 9 : Modifier le profil
1. Sur la page profil, cliquez sur **"Modifier le profil"**
2. Changez votre nom ou téléphone
3. Cliquez sur **"Enregistrer"**
4. ✅ Message de succès

### Étape 10 : Accéder aux paramètres
1. Dans le menu, cliquez sur **"Paramètres"**
   - OU allez sur http://localhost:3000/settings
2. ✅ Vous devriez voir la page de paramètres

### Étape 11 : Se déconnecter
1. Cliquez sur votre avatar
2. Cliquez sur **"Se déconnecter"**
3. ✅ Vous devriez être redirigé vers la page d'accueil

---

## 📱 Pages Disponibles

| URL | Description | Accès |
|-----|-------------|-------|
| `/` | Page d'accueil | Public |
| `/login` | Connexion | Public |
| `/register` | Inscription | Public |
| `/dashboard` | Tableau de bord | Authentifié |
| `/announcements` | Mes annonces | Authentifié |
| `/announcements/new` | Créer une annonce | Authentifié |
| `/trips` | Mes trajets | Authentifié |
| `/trips/new` | Créer un trajet | Authentifié |
| `/search` | Rechercher | Authentifié |
| `/profile` | Mon profil | Authentifié |
| `/chat` | Messages | Authentifié |
| `/settings` | Paramètres | Authentifié |

---

## 🔧 Problèmes Courants

### ❌ Erreur : "Cannot connect to MongoDB"
**Solution :**
```bash
# Vérifiez que MongoDB est lancé
mongod

# OU vérifiez votre URI MongoDB Atlas dans backend/.env
MONGODB_URI=mongodb+srv://...
```

### ❌ Erreur : "Network Error" ou "API not responding"
**Solution :**
1. Vérifiez que le backend tourne sur le port 5000
2. Vérifiez `frontend/.env.local` :
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### ❌ Erreur : "Validation failed: dateFrom is required"
**Solution :** Ce problème est maintenant corrigé. Le formulaire envoie les bons champs.

### ❌ Erreur : "Cannot find module 'react-hot-toast'"
**Solution :**
```bash
cd frontend
npm install react-hot-toast
```

### ❌ Les annonces/trajets ne s'affichent pas
**Vérification :**
1. Ouvrez la console du navigateur (F12)
2. Vérifiez s'il y a des erreurs
3. Vérifiez que vous êtes bien connecté
4. Vérifiez que vous avez créé des annonces/trajets

---

## 🎯 Fonctionnalités Testées

✅ **Authentification**
- ✅ Inscription
- ✅ Connexion
- ✅ Déconnexion
- ✅ Protection des routes

✅ **Annonces**
- ✅ Créer une annonce
- ✅ Lister mes annonces
- ✅ Voir les détails
- ✅ Statistiques

✅ **Trajets**
- ✅ Créer un trajet
- ✅ Lister mes trajets
- ✅ Voir les détails
- ✅ Statistiques

✅ **Profil**
- ✅ Voir son profil
- ✅ Modifier ses informations
- ✅ Voir ses stats

✅ **Navigation**
- ✅ Menu sidebar
- ✅ Menu navbar
- ✅ Dropdown utilisateur

---

## 🚧 Fonctionnalités à Venir

- [ ] Supprimer une annonce/trajet
- [ ] Modifier une annonce/trajet
- [ ] Chat temps réel avec Socket.io
- [ ] Upload d'images
- [ ] Système de matching avancé
- [ ] Notifications en temps réel
- [ ] Paiements
- [ ] Reviews et ratings

---

## 📊 Données de Test

### Compte 1
- Email : jean@test.com
- Mot de passe : 123456
- Rôle : Les deux

### Compte 2 (créez-en un autre)
- Email : marie@test.com
- Mot de passe : 123456
- Rôle : Voyageur

### Annonce Test
- Paris → Lyon
- 2kg, 25€
- Dates : aujourd'hui + 3 jours

### Trajet Test
- Paris → Lyon
- 5kg disponibles
- Dates : demain + 2 jours

---

**✅ Si tous les tests passent, l'application fonctionne correctement !**
