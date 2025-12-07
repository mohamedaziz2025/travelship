# Dashboard et Recherche - TravelShip

## ✅ Fonctionnalités implémentées

### 🏠 Dashboard dynamique (`/dashboard`)

#### Statistiques en temps réel
- **Annonces actives** - Compte les annonces avec status === 'active'
- **Trajets publiés** - Compte les trajets avec status === 'active'
- **Total annonces** - Nombre total d'annonces de l'utilisateur
- **Total trajets** - Nombre total de trajets de l'utilisateur

#### Données récupérées depuis MongoDB
- Utilise `announcementsApi.getMy()` pour récupérer les annonces
- Utilise `tripsApi.getMy()` pour récupérer les trajets
- Chargement simultané avec `Promise.all()` pour optimiser les performances

#### Affichage des annonces récentes (3 dernières)
- Ville de départ → Ville d'arrivée
- Type (📦 Colis ou 🛍️ Achat)
- Date de création relative (Il y a X jours)
- Date de début du transport
- Nombre de vues
- Lien cliquable vers le détail

#### Affichage des trajets récents (3 derniers)
- Ville de départ → Ville d'arrivée
- Date de départ formatée (Dans X jours / Aujourd'hui / Demain)
- Capacité disponible (kg)
- Nombre de vues
- Lien cliquable vers le détail

#### État vide
- Message et icône si aucune annonce
- Message et icône si aucun trajet
- Bouton pour créer une nouvelle annonce/trajet

### 🔍 Page de recherche (`/search`)

#### Filtres de recherche connectés à la base de données

**Filtres communs (Annonces & Trajets)**
- 📍 **Ville de départ** - Recherche par ville (ex: Paris, Lyon)
- 📍 **Ville d'arrivée** - Recherche par ville (ex: Marseille, Nice)
- 📅 **Date de début** - Filtre par date minimum
- 📅 **Date de fin** - Filtre par date maximum

**Filtres spécifiques aux annonces**
- 📦 **Type** - Colis ou Achat
- 💰 **Récompense min** - Montant minimum en euros
- 💰 **Récompense max** - Montant maximum en euros

**Filtres spécifiques aux trajets**
- ⚖️ **Capacité min** - Poids minimum disponible en kg

#### Appels API avec paramètres

**Pour les annonces** (`GET /api/v1/announcements`)
```typescript
{
  from: string,        // Ville de départ
  to: string,          // Ville d'arrivée
  dateFrom: string,    // Date ISO format
  dateTo: string,      // Date ISO format
  minReward: number,   // Montant minimum
  maxReward: number,   // Montant maximum
  type: 'package' | 'shopping'
}
```

**Pour les trajets** (`GET /api/v1/trips`)
```typescript
{
  from: string,        // Ville de départ
  to: string,          // Ville d'arrivée
  dateFrom: string,    // Date ISO format
  dateTo: string,      // Date ISO format
  minKg: number        // Capacité minimum
}
```

#### Affichage des résultats

**Vues disponibles**
- 🎨 **Vue grille** - Cartes en grille (2-3 colonnes selon l'écran)
- 📋 **Vue liste** - Cartes en liste verticale
- 🗺️ **Vue carte** - Placeholder pour intégration future (Google Maps/Mapbox)

**Informations affichées pour chaque annonce**
- Type et badge (Colis/Achat)
- Prix de la récompense
- Trajet (Ville départ → Ville arrivée)
- Description (limitée à 2 lignes)
- Date de début
- Poids (si renseigné)
- Nom de l'utilisateur + badge vérifié
- Nombre de vues
- Hover effect avec ombre premium

**Informations affichées pour chaque trajet**
- Badge Trajet
- Prix par kg
- Trajet (Ville départ → Ville arrivée)
- Date de départ
- Capacité disponible (kg)
- Nom de l'utilisateur + badge vérifié
- Nombre de vues
- Hover effect avec ombre premium

#### État vide
- Message personnalisé si aucun résultat
- Icône illustrative
- Bouton "Réinitialiser les filtres"

#### Compteur de résultats
- Affiche le nombre total de résultats trouvés
- Se met à jour automatiquement selon les filtres

#### Bouton de réinitialisation
- En haut des filtres
- Efface tous les critères de recherche
- Recharge les données

## 🔧 Implémentation technique

### Dashboard

```typescript
// Chargement des données
const loadDashboardData = async () => {
  const [announcementsRes, tripsRes] = await Promise.all([
    announcementsApi.getMy(),
    tripsApi.getMy()
  ])
  
  setAnnouncements(announcementsRes.data.data.announcements)
  setTrips(tripsRes.data.data.trips)
}

// Calcul des statistiques
const stats = [
  { 
    label: 'Annonces actives', 
    value: announcements.filter(a => a.status === 'active').length 
  },
  // ... autres stats
]
```

### Recherche

```typescript
// Gestion des filtres
const [filters, setFilters] = useState({
  from: '',
  to: '',
  dateFrom: '',
  dateTo: '',
  minReward: '',
  maxReward: '',
  type: '',
  minKg: ''
})

// Appel API avec paramètres
const loadData = async () => {
  const params: any = {}
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to
  // ... autres filtres
  
  const response = await announcementsApi.getAll(params)
  setAnnouncements(response.data.data.announcements)
}

// useEffect pour recharger automatiquement
useEffect(() => {
  loadData()
}, [searchType, filters])
```

## 📊 Structure des données

### Interface Announcement
```typescript
interface Announcement {
  _id: string
  type: 'package' | 'shopping'
  from: { city: string; country: string }
  to: { city: string; country: string }
  dateFrom: string
  dateTo: string
  reward: number
  weight?: number
  description: string
  status: string
  views: number
  userId: {
    name: string
    verified?: boolean
    stats?: { rating: number }
  }
}
```

### Interface Trip
```typescript
interface Trip {
  _id: string
  from: { city: string; country: string }
  to: { city: string; country: string }
  departureDate: string
  arrivalDate: string
  availableKg: number
  pricePerKg: number
  status: string
  views: number
  userId: {
    name: string
    verified?: boolean
    stats?: { rating: number }
  }
}
```

## 🎨 Fonctionnalités UX

### Dashboard
- ✅ Chargement avec indicateur
- ✅ État vide personnalisé
- ✅ Dates relatives (Il y a X jours, Dans X jours)
- ✅ Navigation directe vers les pages de création
- ✅ Liens cliquables vers les détails
- ✅ Design cohérent avec le reste de l'app

### Recherche
- ✅ Barre de recherche simple en haut
- ✅ Toggle entre Annonces et Trajets
- ✅ Toggle entre vues Grille/Liste/Carte
- ✅ Filtres collapsibles (bouton "Filtres")
- ✅ Position sticky pour les filtres
- ✅ Animations de survol (hover effects)
- ✅ Responsive design (mobile-friendly)
- ✅ Feedback visuel pendant le chargement

## 🚀 Routes API utilisées

### Dashboard
- `GET /api/v1/announcements/my` - Récupérer mes annonces
- `GET /api/v1/trips/my` - Récupérer mes trajets

### Recherche
- `GET /api/v1/announcements?from=...&to=...&dateFrom=...` - Recherche d'annonces
- `GET /api/v1/trips?from=...&to=...&minKg=...` - Recherche de trajets

## 📱 Pages accessibles

- http://localhost:3000/dashboard - Dashboard personnel
- http://localhost:3000/search - Recherche globale
- http://localhost:3000/announcements - Mes annonces
- http://localhost:3000/trips - Mes trajets

## ✨ Prochaines améliorations possibles

### Dashboard
- [ ] Graphiques de statistiques (Chart.js / Recharts)
- [ ] Notifications en temps réel
- [ ] Recommandations personnalisées
- [ ] Activité récente (dernières actions)
- [ ] Score de réputation

### Recherche
- [ ] Intégration carte Google Maps / Mapbox
- [ ] Géolocalisation automatique
- [ ] Recherche par rayon (km autour d'une ville)
- [ ] Sauvegarde des recherches favorites
- [ ] Tri avancé (distance, prix, date, popularité)
- [ ] Pagination pour grands résultats
- [ ] Filtres avancés (premium uniquement, vérifiés uniquement)
- [ ] Export des résultats (CSV/PDF)
- [ ] Comparaison d'annonces/trajets

## 🧪 Tests à effectuer

### Dashboard
1. Se connecter et accéder à `/dashboard`
2. Vérifier que les stats affichent les bons nombres
3. Créer une annonce et voir si le compteur s'incrémente
4. Cliquer sur une annonce récente pour voir le détail
5. Tester l'état vide (supprimer toutes les annonces)

### Recherche
1. Accéder à `/search`
2. Basculer entre Annonces et Trajets
3. Utiliser chaque filtre individuellement
4. Combiner plusieurs filtres
5. Réinitialiser les filtres
6. Tester les différentes vues (grille/liste/carte)
7. Cliquer sur un résultat pour voir le détail
8. Tester sur mobile (responsive)

---

**Date de création**: 6 décembre 2025
**Status**: ✅ Implémenté et fonctionnel
**Backend**: ✅ En ligne sur port 5000
**Frontend**: ✅ En ligne sur port 3000
