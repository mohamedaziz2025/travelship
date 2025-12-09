# Credentials Admin - TravelShip

## Super Admin (Accès Complet)

**Email:** `superadmin@travelship.com`  
**Mot de passe:** `SuperAdmin@123`  
**Rôle:** Super Administrator

### Permissions
- ✅ Gestion complète des utilisateurs
- ✅ Gestion des annonces
- ✅ Gestion des conversations et messages
- ✅ Modération des signalements
- ✅ Gestion des pages statiques
- ✅ Paramètres système
- ✅ Gestion des autres administrateurs
- ✅ Toutes les statistiques

---

## Admin/Modérateur

**Email:** `admin@travelship.com`  
**Mot de passe:** `Admin@123`  
**Rôle:** Moderator

### Permissions
- ✅ Gestion des utilisateurs (limité)
- ✅ Modération du contenu
- ✅ Gestion des conversations
- ✅ Consultation des statistiques
- ❌ Gestion des autres admins
- ❌ Paramètres système critiques

---

## Première Connexion

1. Le serveur backend créera automatiquement ces comptes au premier démarrage
2. Accédez à `/admin/login` dans le frontend
3. Connectez-vous avec l'un des comptes ci-dessus
4. **Important:** Changez les mots de passe après la première connexion

---

## Fonctionnalités Admin

### 📊 Dashboard
- Vue d'ensemble des statistiques
- Graphiques de croissance
- Activité récente

### 👥 Gestion des Utilisateurs
- Liste complète des utilisateurs
- Recherche et filtres
- Modification des rôles
- Suspension/Blocage de comptes
- Vérification des utilisateurs

### 📦 Gestion des Annonces
- Toutes les annonces (Shipper/Sender)
- Modération du contenu
- Suppression d'annonces
- Statistiques par type

### 💬 Gestion des Conversations (NOUVEAU)
- Surveillance de toutes les conversations
- Vue détaillée des messages
- Suppression de messages inappropriés
- Blocage/Déblocage de conversations
- Recherche par utilisateur

### ⚠️ Signalements
- Gestion des reports utilisateurs
- Actions de modération
- Historique des décisions

### 📈 Statistiques
- Analyses détaillées
- Graphiques avancés
- Export de données

### 📄 Pages Statiques
- Gestion du contenu des pages
- CGU, Politique de confidentialité, etc.

### ⚙️ Paramètres
- Configuration système
- Paramètres de l'application

### 🛡️ Gestion des Admins
- Ajout/Suppression d'administrateurs
- Attribution des rôles
- Gestion des permissions

---

## Routes API Admin

### Conversations
```
GET    /api/admin/conversations              # Liste toutes les conversations
GET    /api/admin/conversations/:id/messages # Messages d'une conversation
DELETE /api/admin/conversations/:id          # Supprimer une conversation
PATCH  /api/admin/conversations/:id/block    # Bloquer/Débloquer
DELETE /api/admin/messages/:id               # Supprimer un message
```

### Autres Routes
Voir la documentation complète dans `/docs/API_DOCUMENTATION.md`

---

## Notes de Sécurité

⚠️ **IMPORTANT:**
- Changez les mots de passe par défaut immédiatement
- N'exposez jamais ces credentials dans le code
- Utilisez des variables d'environnement en production
- Activez l'authentification à deux facteurs (si disponible)
- Surveillez régulièrement les logs d'accès admin

---

## Support

Pour toute question ou problème:
- Consultez la documentation complète
- Vérifiez les logs du serveur
- Contactez l'équipe de développement
