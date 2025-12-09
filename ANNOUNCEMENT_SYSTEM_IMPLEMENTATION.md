# Système d'Annonces - Implémentation Complète

## 📋 Vue d'ensemble

Le système d'annonces a été complètement refondu pour prendre en charge deux types d'utilisateurs distincts :
- **Shipper** : Personne qui voyage et peut transporter des colis
- **Sender** : Personne qui souhaite envoyer un colis

## 🎯 Fonctionnalités Implémentées

### 1. Annonce Shipper (Personne qui voyage)

#### Informations saisies :
- ✅ **Trajet** : Ville de départ → Ville d'arrivée
- ✅ **Date du voyage** : Date unique ou période
- ✅ **Moyen de transport** : Avion / Bateau / Train / Voiture
- ✅ **Poids disponible** : 
  - 0–1 kg
  - 2–5 kg
  - 5–10 kg
  - 10–15 kg
  - 15–20 kg
  - 20–25 kg
  - 25–30 kg
  - +30 kg
- ✅ **Type de service** : Rémunéré ou Gratuit
- ✅ **Type de colis accepté** :
  - Colis personnel
  - Achat
  - Les deux
- ✅ **Numéro de téléphone** (optionnel)

### 2. Annonce Sender (Personne qui envoie un colis)

#### Informations saisies :
- ✅ **Trajet** : Ville de départ → Ville d'arrivée
- ✅ **Période d'envoi** : Date de début → Date de fin
- ✅ **Titre de l'annonce**
- ✅ **Type de colis** : Colis personnel ou Achat
- ✅ **Description du colis**
- ✅ **Photos** (optionnel, max 3) - Infrastructure prête
- ✅ **Prix proposé**
- ✅ **Poids du colis** :
  - 0–1 kg
  - 2–5 kg
  - 5–10 kg
  - 10–15 kg
  - 15–20 kg
  - 20–25 kg
  - 25–30 kg
  - +30 kg
- ✅ **Numéro de téléphone** (optionnel)
- ✅ **Urgent** : Oui / Non

### 3. Filtres

#### Filtres Shipper
- ✅ Ville → Ville
- ✅ Intervalle de dates
- ✅ Poids disponible
- ✅ Rémunération / Gratuit
- ✅ Type de colis accepté : Personnel / Achat / Les deux
- ✅ Moyen de transport

#### Filtres Sender
- ✅ Ville → Ville
- ✅ Intervalle de dates
- ✅ Poids du colis
- ✅ Prix (min/max)
- ✅ Type de colis : Personnel / Achat
- ✅ Annonces urgentes uniquement

### 4. Tri des annonces
- ✅ **Plus récents** (par défaut)
- ✅ **Prix croissant** (du moins cher au plus cher)
- ✅ **Prix décroissant** (du plus cher au moins cher)

## 🗂️ Modifications Backend

### Modèle Announcement (backend/src/models/Announcement.ts)

Nouveaux champs ajoutés :
```typescript
{
  userType: 'shipper' | 'sender',           // Type d'utilisateur (REQUIS)
  packageType: 'personal' | 'purchase' | 'both', // Type de colis
  transportType: 'plane' | 'boat' | 'train' | 'car', // Moyen de transport
  weightRange: '0-1' | '2-5' | '5-10' | '10-15' | '15-20' | '20-25' | '25-30' | '30+', // Plage de poids (REQUIS)
  serviceType: 'paid' | 'free',             // Service rémunéré ou gratuit
  phoneNumber: string,                      // Numéro de téléphone (optionnel)
  isUrgent: boolean,                        // Annonce urgente (pour sender)
}
```

### Contrôleur Announcement (backend/src/controllers/announcement.controller.ts)

Nouveaux paramètres de filtrage dans `getAnnouncements` :
- `userType` : Filtrer par type d'utilisateur (shipper/sender)
- `transportType` : Filtrer par moyen de transport
- `weightRange` : Filtrer par plage de poids
- `serviceType` : Filtrer par type de service (rémunéré/gratuit)
- `packageType` : Filtrer par type de colis
- `isUrgent` : Filtrer les annonces urgentes
- `sortBy` : Tri (recent, price-asc, price-desc)

Logique de tri implémentée :
- `recent` : Par date de création (descendant) - par défaut
- `price-asc` : Par prix croissant
- `price-desc` : Par prix décroissant

Logique de filtrage par dates :
- Chevauchement de périodes pour les intervalles de dates
- Compatible avec recherches de dates simples ou périodes

## 🎨 Modifications Frontend

### Formulaire de création d'annonce (frontend/app/announcements/new/page.tsx)

**Nouveautés :**
1. **Sélection du type d'utilisateur** (Sender/Shipper)
2. **Formulaire dynamique** qui s'adapte selon le type choisi
3. **Champs spécifiques Shipper** :
   - Moyen de transport avec icônes (✈️ 🚢 🚂 🚗)
   - Type de service (Rémunéré/Gratuit)
   - Type de colis accepté (Personnel/Achat/Les deux)
4. **Champs spécifiques Sender** :
   - Titre de l'annonce
   - Case à cocher "Urgent"
   - Type de colis (Personnel/Achat)
5. **Champs communs** :
   - Sélecteur de plage de poids (dropdown)
   - Numéro de téléphone optionnel
   - Description adaptée au contexte

### Page de recherche (frontend/app/search/page.tsx)

**Filtres ajoutés :**
1. **Type d'annonce** : Sender/Shipper
2. **Moyen de transport** : Avion/Bateau/Train/Voiture (pour Shipper)
3. **Type de service** : Rémunéré/Gratuit (pour Shipper)
4. **Type de colis** : Personnel/Achat/Les deux
5. **Plage de poids** : 8 options de 0-1kg à +30kg
6. **Urgent uniquement** : Case à cocher (pour Sender)

**Tri implémenté :**
- Dropdown de tri avec 3 options
- État synchronisé avec les filtres
- Application automatique lors du changement

### Filtres conditionnels intelligents

Les filtres s'affichent dynamiquement selon le type d'annonce sélectionné :
- Si **Shipper** sélectionné → Affiche moyen de transport et type de service
- Si **Sender** sélectionné → Affiche case "Urgent uniquement"
- Tous les autres filtres sont disponibles pour les deux types

## 📊 Structure des données

### Exemple d'annonce Shipper :
```json
{
  "userType": "shipper",
  "transportType": "plane",
  "weightRange": "5-10",
  "serviceType": "paid",
  "packageType": "both",
  "from": {
    "city": "Paris",
    "country": "France"
  },
  "to": {
    "city": "New York",
    "country": "USA"
  },
  "dateFrom": "2025-01-15",
  "dateTo": "2025-01-20",
  "reward": 50,
  "description": "Je voyage en avion avec 10kg disponibles",
  "phoneNumber": "+33 6 12 34 56 78"
}
```

### Exemple d'annonce Sender :
```json
{
  "userType": "sender",
  "title": "Envoi urgent de documents",
  "weightRange": "0-1",
  "packageType": "personal",
  "isUrgent": true,
  "from": {
    "city": "Lyon",
    "country": "France"
  },
  "to": {
    "city": "Marseille",
    "country": "France"
  },
  "dateFrom": "2025-01-10",
  "dateTo": "2025-01-15",
  "reward": 30,
  "description": "Documents importants à livrer rapidement",
  "phoneNumber": "+33 6 98 76 54 32"
}
```

## 🔍 Exemples d'utilisation des filtres

### Rechercher des Shippers allant de Paris à Londres :
```
GET /api/v1/announcements?userType=shipper&from=Paris&to=Londres&sortBy=recent
```

### Rechercher des Senders avec colis urgent :
```
GET /api/v1/announcements?userType=sender&isUrgent=true&sortBy=price-asc
```

### Rechercher par poids et moyen de transport :
```
GET /api/v1/announcements?userType=shipper&weightRange=10-15&transportType=plane
```

### Rechercher par type de service :
```
GET /api/v1/announcements?userType=shipper&serviceType=free
```

## 🎨 Interface utilisateur

### Icônes et symboles utilisés :
- ✈️ Avion
- 🚢 Bateau
- 🚂 Train
- 🚗 Voiture
- 📦 Colis personnel
- 🛍️ Achat
- 💰 Rémunéré
- 🆓 Gratuit
- 🚨 Urgent

### Expérience utilisateur :
1. **Sélection intuitive** : Boutons visuels pour choisir Sender/Shipper
2. **Formulaire adaptatif** : Les champs changent selon le type d'utilisateur
3. **Filtres contextuels** : Seuls les filtres pertinents s'affichent
4. **Tri flexible** : Dropdown pour changer l'ordre d'affichage
5. **Labels clairs** : Textes adaptés au contexte (Shipper vs Sender)

## ✅ Tests recommandés

1. **Backend** :
   - Créer une annonce Shipper avec tous les champs
   - Créer une annonce Sender avec tous les champs
   - Tester tous les filtres individuellement
   - Tester les combinaisons de filtres
   - Tester les 3 options de tri
   - Vérifier les recherches par intervalle de dates

2. **Frontend** :
   - Basculer entre Sender/Shipper dans le formulaire
   - Vérifier que les champs conditionnels s'affichent correctement
   - Tester la validation des formulaires
   - Appliquer les filtres et vérifier les résultats
   - Changer l'ordre de tri et vérifier l'effet
   - Tester sur mobile pour la réactivité

## 🚀 Prochaines étapes possibles

1. **Upload de photos** : Implémenter le système de téléchargement d'images
2. **Géolocalisation** : Ajouter des coordonnées GPS automatiques
3. **Notifications** : Alerter les utilisateurs des nouvelles annonces correspondantes
4. **Matching automatique** : Suggérer des correspondances Shipper/Sender
5. **Système de chat** : Communication directe entre Shipper et Sender
6. **Historique** : Suivi des annonces passées et statistiques

## 📝 Notes importantes

- Tous les champs obligatoires sont validés côté frontend et backend
- Le tri par défaut est "Plus récents" pour afficher les annonces les plus fraîches
- Les plages de poids sont standardisées pour faciliter le matching
- Le système de filtrage est optimisé avec des index MongoDB
- L'interface est entièrement responsive et adaptée mobile

## 🔧 Configuration requise

Aucune migration de base de données nécessaire. Les nouveaux champs sont optionnels ou ont des valeurs par défaut, assurant la compatibilité avec les données existantes.

Pour les annonces existantes, il est recommandé d'ajouter :
- `userType: 'sender'` par défaut
- `weightRange` basé sur le champ `weight` existant
- `packageType` basé sur le champ `type` existant
