# API Reference - Système d'Annonces

## Endpoints

### 1. Créer une annonce

**POST** `/api/v1/announcements`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Annonce Shipper (Voyageur)

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
  "dateFrom": "2025-01-15T00:00:00Z",
  "dateTo": "2025-01-20T00:00:00Z",
  "reward": 50,
  "description": "Je voyage en avion avec 10kg disponibles",
  "phoneNumber": "+33 6 12 34 56 78",
  "type": "package"
}
```

#### Annonce Sender (Expéditeur)

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
  "dateFrom": "2025-01-10T00:00:00Z",
  "dateTo": "2025-01-15T00:00:00Z",
  "reward": 30,
  "description": "Documents importants à livrer rapidement",
  "phoneNumber": "+33 6 98 76 54 32",
  "type": "package"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "announcement": {
      "_id": "...",
      "userType": "sender",
      "title": "Envoi urgent de documents",
      ...
    }
  }
}
```

---

### 2. Rechercher des annonces avec filtres

**GET** `/api/v1/announcements`

**Query Parameters:**

#### Filtres généraux
- `from` (string) - Ville de départ (ex: "Paris")
- `to` (string) - Ville d'arrivée (ex: "Londres")
- `dateFrom` (date) - Date de début (ISO 8601)
- `dateTo` (date) - Date de fin (ISO 8601)
- `minReward` (number) - Prix minimum
- `maxReward` (number) - Prix maximum
- `page` (number) - Page (défaut: 1)
- `limit` (number) - Résultats par page (défaut: 20)

#### Nouveaux filtres
- `userType` (string) - Type d'utilisateur: `"shipper"` ou `"sender"`
- `transportType` (string) - Moyen de transport: `"plane"`, `"boat"`, `"train"`, `"car"`
- `weightRange` (string) - Plage de poids: `"0-1"`, `"2-5"`, `"5-10"`, `"10-15"`, `"15-20"`, `"20-25"`, `"25-30"`, `"30+"`
- `serviceType` (string) - Type de service: `"paid"` ou `"free"`
- `packageType` (string) - Type de colis: `"personal"`, `"purchase"`, `"both"`
- `isUrgent` (boolean) - Annonces urgentes uniquement: `"true"` ou `"false"`
- `sortBy` (string) - Ordre de tri: `"recent"`, `"price-asc"`, `"price-desc"`

#### Exemples d'utilisation

**1. Tous les Shippers allant de Paris à Londres :**
```
GET /api/v1/announcements?userType=shipper&from=Paris&to=Londres
```

**2. Senders avec colis urgent, triés par prix :**
```
GET /api/v1/announcements?userType=sender&isUrgent=true&sortBy=price-asc
```

**3. Shippers voyageant en avion avec 10-15kg disponible :**
```
GET /api/v1/announcements?userType=shipper&transportType=plane&weightRange=10-15
```

**4. Services gratuits uniquement :**
```
GET /api/v1/announcements?userType=shipper&serviceType=free
```

**5. Recherche avec intervalle de dates :**
```
GET /api/v1/announcements?dateFrom=2025-01-15&dateTo=2025-01-31
```

**6. Prix entre 20€ et 50€, triés du plus cher au moins cher :**
```
GET /api/v1/announcements?minReward=20&maxReward=50&sortBy=price-desc
```

**7. Combinaison complexe :**
```
GET /api/v1/announcements?userType=shipper&from=Paris&transportType=plane&weightRange=5-10&serviceType=paid&packageType=both&sortBy=recent
```

**Response:**
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "_id": "...",
        "userType": "shipper",
        "transportType": "plane",
        "weightRange": "5-10",
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

### 3. Récupérer une annonce spécifique

**GET** `/api/v1/announcements/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "announcement": {
      "_id": "...",
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
      "dateFrom": "2025-01-10T00:00:00.000Z",
      "dateTo": "2025-01-15T00:00:00.000Z",
      "reward": 30,
      "description": "Documents importants à livrer rapidement",
      "phoneNumber": "+33 6 98 76 54 32",
      "views": 15,
      "status": "active",
      "userId": {
        "name": "Jean Dupont",
        "verified": true,
        "stats": {
          "rating": 4.8
        }
      },
      "createdAt": "2025-01-05T10:30:00.000Z",
      "updatedAt": "2025-01-05T10:30:00.000Z"
    }
  }
}
```

---

### 4. Mettre à jour une annonce

**PATCH** `/api/v1/announcements/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "reward": 40,
  "description": "Description mise à jour",
  "isUrgent": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "announcement": {
      ...
    }
  }
}
```

---

### 5. Supprimer une annonce

**DELETE** `/api/v1/announcements/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Annonce supprimée"
}
```

---

### 6. Récupérer mes annonces

**GET** `/api/v1/announcements/my`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "_id": "...",
        ...
      }
    ]
  }
}
```

---

## Valeurs valides

### userType
- `"shipper"` - Personne qui voyage et transporte
- `"sender"` - Personne qui envoie un colis

### transportType (Shipper uniquement)
- `"plane"` - Avion ✈️
- `"boat"` - Bateau 🚢
- `"train"` - Train 🚂
- `"car"` - Voiture 🚗

### weightRange (Obligatoire)
- `"0-1"` - 0 à 1 kg
- `"2-5"` - 2 à 5 kg
- `"5-10"` - 5 à 10 kg
- `"10-15"` - 10 à 15 kg
- `"15-20"` - 15 à 20 kg
- `"20-25"` - 20 à 25 kg
- `"25-30"` - 25 à 30 kg
- `"30+"` - Plus de 30 kg

### serviceType (Shipper uniquement)
- `"paid"` - Rémunéré 💰
- `"free"` - Gratuit 🆓

### packageType
- `"personal"` - Colis personnel 📦
- `"purchase"` - Achat 🛍️
- `"both"` - Les deux (Shipper uniquement)

### sortBy
- `"recent"` - Plus récents en premier (défaut)
- `"price-asc"` - Prix croissant
- `"price-desc"` - Prix décroissant

### status
- `"active"` - Annonce active
- `"matched"` - Annonce matchée
- `"completed"` - Annonce complétée
- `"cancelled"` - Annonce annulée

---

## Codes d'erreur

- `400` - Requête invalide (champs manquants ou incorrects)
- `401` - Non authentifié
- `403` - Non autorisé (pas le propriétaire)
- `404` - Annonce non trouvée
- `500` - Erreur serveur

---

## Notes importantes

1. **Authentification requise** pour créer, modifier et supprimer des annonces
2. **Pagination** par défaut : 20 résultats par page
3. **Tri par défaut** : Plus récents en premier (`sortBy=recent`)
4. **Intervalle de dates** : Utilise un système de chevauchement de périodes
5. **Compteur de vues** : Incrémenté automatiquement à chaque visualisation
6. **Statut** : Par défaut `active` lors de la création
7. **Moderation** : Par défaut `approved` (peut être changé en `pending` ou `rejected`)

---

## Migration des données existantes

Pour migrer les annonces existantes, exécuter :

```bash
cd backend
node migrateAnnouncements.js
```

Ce script va :
- Ajouter `userType: 'sender'` par défaut
- Calculer `weightRange` basé sur le champ `weight`
- Définir `packageType` basé sur le champ `type`
- Définir `isUrgent: false` par défaut
