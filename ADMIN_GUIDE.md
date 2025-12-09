# Guide d'Administration - TravelShip

## 🚀 Démarrage Rapide

### 1. Créer le Super Admin

Le super admin est créé automatiquement au premier démarrage du serveur. Si vous avez besoin de le recréer ou réinitialiser le mot de passe :

```bash
cd backend
npm run create-superadmin
```

### 2. Connexion Admin

Accédez à `http://localhost:3000/admin/login` et connectez-vous avec :

**Super Admin:**
- Email: `superadmin@travelship.com`
- Mot de passe: `SuperAdmin@123`

**Admin/Modérateur:**
- Email: `admin@travelship.com`
- Mot de passe: `Admin@123`

---

## 📋 Fonctionnalités Disponibles

### ✅ Gestion des Utilisateurs
- Voir tous les utilisateurs avec pagination
- Rechercher par nom ou email
- Filtrer par rôle (sender/shipper/both)
- Modifier les informations utilisateur
- Vérifier/Suspendre/Bloquer des comptes
- Supprimer des utilisateurs

### ✅ Gestion des Annonces
- Liste de toutes les annonces (Shipper et Sender)
- Filtrer par type et statut
- Voir les détails complets
- Supprimer des annonces inappropriées
- Statistiques par type d'annonce

### ✅ Gestion des Conversations (NOUVEAU !)
- **Vue d'ensemble** : Liste de toutes les conversations entre utilisateurs
- **Détails** : Voir tous les messages d'une conversation
- **Modération** : Supprimer des messages inappropriés
- **Contrôle** : Bloquer/Débloquer des conversations
- **Recherche** : Trouver des conversations par nom ou email d'utilisateur

**Accès:** Menu Admin → Conversations

### ✅ Signalements
- Gérer les reports utilisateurs
- Prendre des décisions de modération
- Historique des actions

### ✅ Statistiques
- Dashboard avec métriques clés
- Analyses détaillées
- Graphiques de croissance

### ✅ Pages Statiques
- Éditer les pages du site
- CGU, Politique de confidentialité, etc.

### ✅ Paramètres Système
- Configuration de l'application
- Gestion des paramètres globaux

### ✅ Gestion des Admins
- Ajouter de nouveaux administrateurs
- Gérer les rôles et permissions

---

## 🔐 Rôles et Permissions

### Super Admin
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Peut créer/modifier/supprimer d'autres admins
- ✅ Accès aux paramètres système critiques

### Admin/Modérateur
- ✅ Gestion du contenu (annonces, conversations)
- ✅ Modération des utilisateurs (limité)
- ✅ Vue des statistiques
- ❌ Gestion des autres admins
- ❌ Paramètres système

---

## 🛡️ Gestion des Conversations

### Fonctionnalités Disponibles

#### 1. Liste des Conversations
```
GET /api/admin/conversations
```
- Voir toutes les conversations
- Pagination automatique
- Affichage des participants
- Statut de blocage
- Dernier message

#### 2. Détails d'une Conversation
```
GET /api/admin/conversations/:id/messages
```
- Tous les messages de la conversation
- Informations sur les expéditeurs
- Horodatage complet
- Status de lecture

#### 3. Bloquer/Débloquer
```
PATCH /api/admin/conversations/:id/block
Body: { "blocked": true/false }
```
- Empêche l'envoi de nouveaux messages
- Conserve l'historique
- Réversible

#### 4. Supprimer une Conversation
```
DELETE /api/admin/conversations/:id
```
- Supprime la conversation
- Supprime tous les messages associés
- Action irréversible

#### 5. Supprimer un Message
```
DELETE /api/admin/messages/:id
```
- Supprime un message spécifique
- Utile pour modération

---

## 📊 Interface Admin

### Navigation
Le menu latéral contient :
1. 📊 **Dashboard** - Vue d'ensemble
2. 👥 **Utilisateurs** - Gestion des comptes
3. 📦 **Annonces** - Annonces Shipper/Sender
4. 💬 **Conversations** - Discussions (NOUVEAU)
5. ⚠️ **Signalements** - Modération
6. 📈 **Statistiques** - Analyses
7. 📄 **Pages** - Contenu statique
8. ⚙️ **Paramètres** - Configuration
9. 🛡️ **Admins** - Gestion des admins

### Page Conversations

#### Vue Liste
- Affiche toutes les conversations
- Barre de recherche pour filtrer
- Actions rapides : Voir, Bloquer, Supprimer
- Pagination pour performances

#### Vue Détails
- Historique complet des messages
- Informations sur les participants
- Actions : Supprimer des messages individuels
- Retour à la liste

---

## 🔧 Configuration Backend

### Routes Ajoutées

```typescript
// Dans admin.routes.ts
router.get('/conversations', getAllConversations)
router.get('/conversations/:id/messages', getConversationMessages)
router.delete('/conversations/:id', deleteConversation)
router.patch('/conversations/:id/block', toggleConversationBlock)
router.delete('/messages/:id', deleteMessage)
```

### Contrôleurs Ajoutés

```typescript
// Dans admin.controller.ts
- getAllConversations()       // Liste paginée
- getConversationMessages()   // Messages d'une conversation
- deleteConversation()        // Suppression complète
- toggleConversationBlock()   // Bloquer/Débloquer
- deleteMessage()             // Supprimer un message
```

### Modèle Conversation Étendu

```typescript
interface IConversation {
  // ... champs existants
  blocked?: boolean           // État de blocage
  blockedBy?: ObjectId       // Admin qui a bloqué
  blockedAt?: Date           // Date de blocage
}
```

---

## 🔄 Mise à Jour

Pour appliquer les nouvelles fonctionnalités :

### 1. Backend
```bash
cd backend
npm install
npm run dev
```

Le seed admin s'exécute automatiquement au démarrage.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Vérification
1. Connectez-vous à l'admin : `http://localhost:3000/admin/login`
2. Cliquez sur "Conversations" dans le menu
3. Vous devriez voir la nouvelle interface

---

## ⚠️ Sécurité

### Recommandations

1. **Changez les mots de passe par défaut immédiatement**
   ```
   Après la première connexion, allez dans Paramètres → Modifier le mot de passe
   ```

2. **Environnement de production**
   ```env
   # .env
   JWT_SECRET=votre_secret_très_fort_et_aléatoire
   ADMIN_DEFAULT_PASSWORD=VotreMotDePasseSécurisé@2024
   ```

3. **Logs d'activité**
   - Surveillez les actions admin
   - Vérifiez régulièrement les logs de connexion
   - Auditez les modifications importantes

4. **Accès réseau**
   - Limitez l'accès IP si possible
   - Utilisez HTTPS en production
   - Activez le rate limiting

---

## 🐛 Dépannage

### Le super admin n'est pas créé

```bash
cd backend
npm run create-superadmin
```

### Impossible de se connecter

1. Vérifiez que le backend est démarré
2. Vérifiez les credentials dans la console backend
3. Effacez le cache/cookies du navigateur
4. Vérifiez les logs du serveur

### Les conversations ne s'affichent pas

1. Vérifiez que vous êtes connecté en tant qu'admin
2. Vérifiez la connexion à MongoDB
3. Regardez les logs du backend pour les erreurs
4. Vérifiez que des conversations existent dans la DB

### Erreur de permissions

- Vérifiez votre rôle (superadmin ou moderator)
- Certaines actions nécessitent le rôle superadmin
- Reconnectez-vous si nécessaire

---

## 📚 Documentation Complète

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Admin Credentials](./ADMIN_CREDENTIALS.md)

---

## 🆘 Support

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez les logs du serveur
3. Consultez la documentation API
4. Contactez l'équipe de développement

---

**Version:** 2.0.0  
**Dernière mise à jour:** Décembre 2025  
**Nouvelles fonctionnalités:** Gestion des conversations admin
