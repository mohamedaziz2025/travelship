# 💬 Gestion des Conversations - Guide Administrateur

## Vue d'ensemble

Le système de gestion des conversations permet aux administrateurs et super administrateurs de surveiller, contrôler et modérer toutes les conversations entre utilisateurs de la plateforme TravelShip.

## 🎯 Fonctionnalités

### 1. Vue d'ensemble des conversations

**Page:** `/admin/conversations`

#### Statistiques en temps réel
- **Total des conversations** : Nombre total de conversations sur la plateforme
- **Conversations actives** : Conversations non bloquées et fonctionnelles
- **Conversations bloquées** : Conversations désactivées par un administrateur

#### Filtres disponibles
- **Recherche** : Rechercher par nom ou email des participants
- **Statut** :
  - Toutes les conversations
  - Conversations actives uniquement
  - Conversations bloquées uniquement

### 2. Liste des conversations

Pour chaque conversation, les informations suivantes sont affichées :
- 👥 **Participants** : Noms et emails des deux utilisateurs
- 💬 **Dernier message** : Contenu et horodatage du dernier message échangé
- 📅 **Date de création** : Quand la conversation a été initiée
- 🚫 **Statut** : Badge indiquant si la conversation est bloquée

### 3. Actions disponibles

#### Sur la liste
- **👁️ Voir les messages** : Accéder au détail de la conversation
- **🚫 Bloquer/Débloquer** : Empêcher ou autoriser les échanges de messages
- **🗑️ Supprimer** : Supprimer définitivement la conversation et tous ses messages

#### Sur la page de détail
- **Voir tous les messages** : Historique complet des échanges
- **Supprimer un message** : Retirer un message spécifique (au survol)
- **Bloquer la conversation** : Empêcher de nouveaux messages
- **Supprimer la conversation** : Supprimer tout l'historique

## 📡 API Backend

### Routes disponibles

#### GET `/api/admin/conversations`
Récupérer la liste des conversations avec pagination et filtres.

**Paramètres de requête:**
```typescript
{
  page?: number        // Page actuelle (défaut: 1)
  limit?: number       // Nombre par page (défaut: 20)
  search?: string      // Recherche par nom/email
  blocked?: boolean    // Filtrer par statut bloqué
}
```

**Réponse:**
```typescript
{
  success: boolean
  data: Conversation[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}
```

#### GET `/api/admin/conversations/:id`
Obtenir les détails d'une conversation spécifique.

**Réponse:**
```typescript
{
  success: boolean
  data: {
    _id: string
    participants: User[]
    blocked: boolean
    blockedBy?: User
    blockedAt?: Date
    createdAt: Date
    updatedAt: Date
  }
}
```

#### GET `/api/admin/conversations/:id/messages`
Récupérer les messages d'une conversation.

**Paramètres:**
```typescript
{
  page?: number    // Page actuelle
  limit?: number   // Messages par page (défaut: 50)
}
```

**Réponse:**
```typescript
{
  success: boolean
  data: Message[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}
```

#### PATCH `/api/admin/conversations/:id/block`
Bloquer ou débloquer une conversation.

**Body:**
```typescript
{
  blocked: boolean
}
```

**Réponse:**
```typescript
{
  success: boolean
  message: string
  data: Conversation
}
```

#### DELETE `/api/admin/conversations/:id`
Supprimer une conversation et tous ses messages.

**Réponse:**
```typescript
{
  success: boolean
  message: string
}
```

#### DELETE `/api/admin/messages/:id`
Supprimer un message spécifique.

**Réponse:**
```typescript
{
  success: boolean
  message: string
}
```

## 🔐 Permissions

Toutes les routes de gestion des conversations nécessitent :
- ✅ Authentification valide (token JWT)
- ✅ Rôle `admin` ou `super-admin`

Les routes sont protégées par les middlewares :
- `protect` : Vérifie l'authentification
- `authorize('admin')` : Vérifie le rôle administrateur

## 💾 Modèles de données

### Conversation
```typescript
{
  participants: ObjectId[]           // Références aux utilisateurs
  lastMessage?: {
    content: string
    senderId: ObjectId
    timestamp: Date
  }
  archivedBy: ObjectId[]            // Utilisateurs ayant archivé
  deletedBy: ObjectId[]             // Utilisateurs ayant supprimé
  blocked: boolean                   // Statut de blocage
  blockedBy?: ObjectId              // Admin ayant bloqué
  blockedAt?: Date                  // Date du blocage
  createdAt: Date
  updatedAt: Date
}
```

### Message
```typescript
{
  conversationId: ObjectId          // Référence à la conversation
  senderId: ObjectId                // Expéditeur du message
  content: string                   // Contenu du message
  read: boolean                     // Statut de lecture
  createdAt: Date
  updatedAt: Date
}
```

## 🎨 Interface utilisateur

### Composants utilisés
- **AdminSidebar** : Navigation principale
- **Icons Lucide React** :
  - `MessageSquare` : Icône de conversation
  - `Search` : Recherche
  - `Ban` : Blocage
  - `CheckCircle` : Déblocage
  - `Trash2` : Suppression
  - `Eye` : Visualisation
  - `XCircle` : Statut bloqué

### Couleurs et états
- 🟢 **Vert** : Conversations actives, actions de déblocage
- 🔴 **Rouge** : Conversations bloquées, suppressions
- 🔵 **Bleu** : Actions de visualisation, information
- 🟠 **Orange** : Actions de blocage

## 📋 Cas d'usage

### Modération d'une conversation inappropriée
1. Aller sur `/admin/conversations`
2. Rechercher ou filtrer la conversation
3. Cliquer sur l'icône 👁️ pour voir les messages
4. Identifier les messages problématiques
5. Options :
   - Supprimer des messages spécifiques
   - Bloquer la conversation entière
   - Supprimer toute la conversation

### Déblocage d'une conversation
1. Filtrer par "Conversations bloquées"
2. Localiser la conversation à débloquer
3. Cliquer sur le bouton "Débloquer" (vert)
4. Confirmer l'action

### Surveillance des conversations
1. Utiliser les statistiques du dashboard
2. Filtrer par statut pour voir les conversations actives
3. Rechercher par nom d'utilisateur spécifique
4. Examiner les derniers messages échangés

## ⚠️ Avertissements

- ⚠️ **Suppression définitive** : La suppression d'une conversation ou d'un message est IRRÉVERSIBLE
- ⚠️ **Blocage** : Une conversation bloquée empêche tout nouvel échange, mais conserve l'historique
- ⚠️ **Vie privée** : Accéder aux conversations des utilisateurs doit être fait uniquement à des fins de modération

## 🚀 Démarrage rapide

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

### Accès admin
1. Se connecter avec un compte admin : `/admin/login`
2. Naviguer vers "Conversations" dans le menu latéral
3. Explorer les conversations et utiliser les outils de modération

## 📊 Monitoring

### Métriques à surveiller
- Nombre total de conversations
- Taux de conversations bloquées
- Volume de messages échangés
- Activité récente

### Logs
- Toutes les actions administratives sont enregistrées
- Les erreurs sont loggées dans la console serveur
- Les notifications utilisateur via `react-hot-toast`

## 🔄 Mises à jour futures

Fonctionnalités prévues :
- [ ] Export des conversations en CSV/PDF
- [ ] Recherche avancée dans le contenu des messages
- [ ] Filtres par date de création
- [ ] Statistiques détaillées par utilisateur
- [ ] Système de signalement automatique
- [ ] Notifications admin pour contenus suspects
- [ ] Historique des actions admin (audit log)

## 🐛 Dépannage

### Les conversations ne s'affichent pas
- Vérifier la connexion MongoDB
- Vérifier les permissions administrateur
- Consulter les logs du serveur

### Erreur lors de la suppression
- Vérifier que la conversation existe
- Vérifier les permissions
- Consulter les logs d'erreur dans la console

### Messages ne se chargent pas
- Vérifier l'ID de la conversation
- Vérifier la pagination
- Tester la route API directement

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation API : `/docs/API_DOCUMENTATION.md`
- Vérifier le guide admin : `/ADMIN_GUIDE.md`
- Examiner les logs serveur en temps réel
