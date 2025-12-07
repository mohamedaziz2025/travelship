# 🎯 Guide Complet - TravelShip

## 📱 Toutes les Pages Disponibles

### 🏠 Pages Publiques
| Page | URL | Description |
|------|-----|-------------|
| **Accueil** | `/` | Landing page avec hero, features et CTA |
| **Recherche** | `/search` | Rechercher annonces et trajets avec filtres |
| **Connexion** | `/login` | Se connecter avec email/mot de passe |
| **Inscription** | `/register` | Créer un nouveau compte (sender/shipper/both) |

### 👤 Pages Utilisateur (Authentification requise)
| Page | URL | Description |
|------|-----|-------------|
| **Dashboard** | `/dashboard` | Tableau de bord avec stats et actions rapides |
| **Mes Annonces** | `/announcements` | Liste de toutes vos annonces avec gestion |
| **Nouvelle Annonce** | `/announcements/new` | Créer une annonce de colis |
| **Mes Trajets** | `/trips` | Liste de tous vos trajets avec gestion |
| **Nouveau Trajet** | `/trips/new` | Publier un nouveau trajet |
| **Messages** | `/chat` | Messagerie avec conversations |
| **Mon Profil** | `/profile` | Voir et modifier votre profil |
| **Paramètres** | `/settings` | Notifications, langue, confidentialité, sécurité |

---

## 🔐 Authentification

### Se connecter
1. Allez sur `/login`
2. Entrez votre email et mot de passe
3. Cliquez sur "Se connecter"
4. Redirection automatique vers le dashboard

### Créer un compte
1. Allez sur `/register`
2. Remplissez le formulaire :
   - Nom complet
   - Email
   - Téléphone (optionnel)
   - Mot de passe (min 6 caractères)
   - Confirmer le mot de passe
   - Choisir votre rôle : Expéditeur / Voyageur / Les deux
3. Accepter les conditions
4. Cliquez sur "Créer mon compte"
5. Redirection vers `/login` pour vous connecter

### Se déconnecter
**Option 1 - Menu utilisateur :**
1. Cliquez sur votre avatar en haut à droite
2. Menu dropdown s'ouvre
3. Cliquez sur "Se déconnecter"

**Option 2 - Paramètres :**
1. Allez dans Paramètres (`/settings`)
2. Descendez en bas de la page
3. Cliquez sur le bouton rouge "Se déconnecter"

**Option 3 - Sidebar :**
1. Dans le sidebar (barre latérale gauche)
2. Cliquez sur l'icône de déconnexion en bas

---

## 📦 Créer une Annonce

### Étapes
1. **Connectez-vous** à votre compte
2. **Accédez à la création** :
   - Via Dashboard : cliquez sur "Créer une annonce"
   - Via Sidebar : cliquez sur "Mes annonces" puis "Nouvelle annonce"
   - URL directe : `/announcements/new`

3. **Remplissez le formulaire** :
   - **Type** : Colis existant ou Shopping
   - **Départ** : Ville et pays
   - **Arrivée** : Ville et pays
   - **Dates** : Collecte et livraison souhaitée
   - **Poids** : En kilogrammes
   - **Dimensions** : Longueur, largeur, hauteur (optionnel)
   - **Récompense** : Montant en euros
   - **Description** : Détails du colis

4. **Publiez** : Cliquez sur "Publier l'annonce"

### Gérer vos annonces
- Allez sur `/announcements`
- **Voir** : Cliquez sur l'icône œil
- **Modifier** : Cliquez sur l'icône crayon
- **Supprimer** : Cliquez sur l'icône poubelle

---

## ✈️ Créer un Trajet

### Étapes
1. **Connectez-vous** à votre compte
2. **Accédez à la création** :
   - Via Dashboard : cliquez sur "Créer un trajet"
   - Via Sidebar : cliquez sur "Mes trajets" puis "Nouveau trajet"
   - URL directe : `/trips/new`

3. **Remplissez le formulaire** :
   - **Départ** : Ville et pays
   - **Arrivée** : Ville et pays
   - **Date de départ** : Quand vous partez
   - **Date d'arrivée** : Quand vous arrivez
   - **Poids disponible** : Kg que vous pouvez transporter
   - **Notes** : Informations complémentaires (optionnel)

4. **Publiez** : Cliquez sur "Publier le trajet"

### Gérer vos trajets
- Allez sur `/trips`
- **Voir** : Cliquez sur l'icône œil
- **Modifier** : Cliquez sur l'icône crayon
- **Supprimer** : Cliquez sur l'icône poubelle

---

## 💬 Messagerie

### Accéder aux messages
1. **Via Sidebar** : Cliquez sur "Messages"
2. **URL directe** : `/chat`

### Fonctionnalités
- Liste des conversations à gauche
- Messages au centre
- Envoyer un message (à venir - Socket.io)
- Notifications temps réel (à venir)

---

## 👤 Profil Utilisateur

### Voir votre profil
- **Via Sidebar** : Cliquez sur "Profil"
- **Via Menu** : Avatar → "Mon profil"
- **URL directe** : `/profile`

### Modifier votre profil
1. Allez sur `/profile`
2. Cliquez sur "Modifier le profil"
3. Changez votre nom ou téléphone
4. Cliquez sur "Enregistrer"

### Informations affichées
- Avatar avec initiale
- Nom et email
- Téléphone (si renseigné)
- Badge vérifié (si compte vérifié)
- **Statistiques** :
  - Matches
  - Note moyenne
  - Transactions complétées
  - Badges obtenus
- Type de compte (Expéditeur/Voyageur/Les deux)
- Badges obtenus

---

## ⚙️ Paramètres

### Accéder aux paramètres
- **Via Sidebar** : Cliquez sur "Paramètres"
- **Via Menu** : Avatar → "Paramètres"
- **URL directe** : `/settings`

### Sections disponibles

#### 📬 Notifications
- Notifications par email
- Notifications SMS
- Nouveaux matches
- Nouveaux messages

#### 🌍 Langue
- Français (par défaut)
- English
- Español
- Deutsch

#### 🔒 Confidentialité
- **Public** : Tout le monde peut voir votre profil
- **Vérifiés uniquement** : Seuls les membres vérifiés peuvent vous contacter

#### 🛡️ Sécurité
- Changer le mot de passe
- Authentification à deux facteurs (bientôt)

#### 🚪 Actions du compte
- **Se déconnecter** (bouton rouge)
- **Supprimer mon compte** (bouton gris)

---

## 🎯 Fonctionnalités par Page

### Dashboard (`/dashboard`)
✅ Vue d'ensemble de votre activité
✅ Statistiques : Annonces, Trajets, Matches, Messages
✅ Boutons d'action rapide : Créer annonce/trajet
✅ Liste des annonces récentes
✅ Liste des trajets récents

### Mes Annonces (`/announcements`)
✅ Liste complète de vos annonces
✅ Statistiques : Total, Actives, Matchées, Complétées
✅ Actions : Voir, Modifier, Supprimer
✅ Bouton "Nouvelle annonce"
✅ Filtrage par statut (via badges de couleur)

### Mes Trajets (`/trips`)
✅ Liste complète de vos trajets
✅ Statistiques : Total, Actifs, Matchés, Complétés
✅ Actions : Voir, Modifier, Supprimer
✅ Bouton "Nouveau trajet"
✅ Filtrage par statut (via badges de couleur)

### Messages (`/chat`)
✅ Liste des conversations
✅ Affichage des messages
✅ Interface de chat moderne
⏳ Envoi de messages en temps réel (à venir)
⏳ Socket.io integration (à venir)

### Profil (`/profile`)
✅ Affichage des informations personnelles
✅ Édition du nom et téléphone
✅ Statistiques utilisateur
✅ Badges et réalisations
✅ Type de compte

### Paramètres (`/settings`)
✅ Gestion des notifications
✅ Choix de langue
✅ Paramètres de confidentialité
✅ Options de sécurité
✅ Déconnexion
✅ Suppression de compte

---

## 🎨 Navigation

### Navbar (Barre du haut)
- **Logo** : Retour à l'accueil
- **Menu** : Accueil, Rechercher, Comment ça marche
- **Actions** :
  - Non connecté : "Se connecter" et "S'inscrire"
  - Connecté : Recherche, Notifications, Avatar (menu dropdown)

### Sidebar (Barre latérale)
- **Dashboard** : Tableau de bord
- **Rechercher** : Page de recherche
- **Mes annonces** : Gestion des annonces
- **Mes trajets** : Gestion des trajets
- **Messages** : Messagerie
- **Profil** : Votre profil
- **Paramètres** : Configuration
- **Bouton collapse** : Réduire/Agrandir le sidebar

### Menu Utilisateur (Avatar)
- **Mon profil** : Accès rapide au profil
- **Paramètres** : Configuration du compte
- **Se déconnecter** : Déconnexion rapide

---

## 🚀 Démarrage Rapide

### 1. Première utilisation
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Créer un compte
1. Ouvrez http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire
4. Connectez-vous

### 3. Tester les fonctionnalités
1. **Créez une annonce** : Dashboard → "Créer une annonce"
2. **Créez un trajet** : Dashboard → "Créer un trajet"
3. **Consultez vos listes** : Sidebar → "Mes annonces" / "Mes trajets"
4. **Modifiez votre profil** : Sidebar → "Profil" → "Modifier"
5. **Configurez les paramètres** : Sidebar → "Paramètres"
6. **Déconnectez-vous** : Avatar → "Se déconnecter"

---

## 📊 État d'Avancement

### ✅ Complété
- Authentication complète (login, register, logout)
- Dashboard avec stats
- Création et gestion d'annonces
- Création et gestion de trajets
- Profil utilisateur avec édition
- Paramètres complets
- Navigation complète (navbar + sidebar)
- Menu utilisateur avec déconnexion
- Design moderne et responsive

### 🚧 En cours / À venir
- Chat temps réel avec Socket.io
- Upload d'images (Cloudinary)
- Système de matching automatique
- Notifications push
- Paiements (Stripe)
- Reviews et ratings
- Admin dashboard
- Email notifications

---

## 🎉 Félicitations !

Toutes les pages principales sont maintenant créées et fonctionnelles ! Vous pouvez :
- ✅ Créer un compte et vous connecter
- ✅ Créer des annonces et des trajets
- ✅ Gérer vos publications (voir, modifier, supprimer)
- ✅ Consulter et modifier votre profil
- ✅ Configurer vos paramètres
- ✅ Vous déconnecter de multiples façons

**L'application est prête pour les tests ! 🚀**
