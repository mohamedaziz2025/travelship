# Checklist de Test - Système d'Annonces

## ✅ Tests Backend

### Modèle Announcement
- [ ] Vérifier que tous les nouveaux champs sont présents dans le schéma
- [ ] Vérifier les énumérations (userType, transportType, weightRange, etc.)
- [ ] Tester la création d'une annonce Shipper avec tous les champs
- [ ] Tester la création d'une annonce Sender avec tous les champs
- [ ] Vérifier que `userType` et `weightRange` sont obligatoires
- [ ] Vérifier que les champs optionnels fonctionnent

### API Endpoints

#### POST /api/v1/announcements
- [ ] Créer une annonce Shipper avec transportType="plane"
- [ ] Créer une annonce Shipper avec serviceType="free"
- [ ] Créer une annonce Shipper avec packageType="both"
- [ ] Créer une annonce Sender avec isUrgent=true
- [ ] Créer une annonce Sender avec titre
- [ ] Créer une annonce avec phoneNumber
- [ ] Tester sans authentification (doit échouer)
- [ ] Tester avec des champs invalides (doit échouer)

#### GET /api/v1/announcements (Filtres)
- [ ] Filtrer par userType="shipper"
- [ ] Filtrer par userType="sender"
- [ ] Filtrer par transportType="plane"
- [ ] Filtrer par weightRange="5-10"
- [ ] Filtrer par serviceType="paid"
- [ ] Filtrer par packageType="personal"
- [ ] Filtrer par isUrgent=true
- [ ] Combiner plusieurs filtres
- [ ] Tester les intervalles de dates (dateFrom + dateTo)
- [ ] Tester les prix (minReward + maxReward)

#### GET /api/v1/announcements (Tri)
- [ ] Trier par sortBy="recent" (défaut)
- [ ] Trier par sortBy="price-asc"
- [ ] Trier par sortBy="price-desc"
- [ ] Vérifier que le tri fonctionne avec les filtres

#### GET /api/v1/announcements/:id
- [ ] Récupérer une annonce Shipper
- [ ] Récupérer une annonce Sender
- [ ] Vérifier que le compteur de vues s'incrémente
- [ ] Tester avec un ID invalide (404)

#### PATCH /api/v1/announcements/:id
- [ ] Modifier le prix d'une annonce
- [ ] Modifier isUrgent d'une annonce Sender
- [ ] Modifier transportType d'une annonce Shipper
- [ ] Tester modification par non-propriétaire (403)

#### DELETE /api/v1/announcements/:id
- [ ] Supprimer sa propre annonce
- [ ] Tester suppression d'une annonce d'un autre user (403)

### Migration Script
- [ ] Exécuter le script de migration
- [ ] Vérifier que les anciennes annonces ont userType="sender"
- [ ] Vérifier que weightRange est calculé correctement
- [ ] Vérifier que packageType est défini
- [ ] Vérifier qu'aucune erreur ne s'est produite

---

## ✅ Tests Frontend

### Formulaire de création (/announcements/new)

#### Interface générale
- [ ] La page se charge correctement
- [ ] Les deux boutons Sender/Shipper s'affichent
- [ ] Le basculement entre Sender/Shipper fonctionne
- [ ] Le titre change selon le type sélectionné

#### Formulaire Shipper
- [ ] Les 4 moyens de transport s'affichent avec icônes
- [ ] La sélection du moyen de transport fonctionne
- [ ] Le dropdown "Poids disponible" s'affiche
- [ ] Les options de poids sont correctes (0-1 à 30+)
- [ ] Les boutons Rémunéré/Gratuit fonctionnent
- [ ] Les 3 options de type de colis s'affichent (Personnel/Achat/Les deux)
- [ ] Le champ téléphone est optionnel
- [ ] La soumission fonctionne avec tous les champs

#### Formulaire Sender
- [ ] Le champ "Titre de l'annonce" s'affiche
- [ ] Le champ titre est obligatoire
- [ ] Le dropdown "Poids du colis" s'affiche
- [ ] Seulement 2 options de colis (Personnel/Achat, pas "Les deux")
- [ ] La case "Urgent" s'affiche
- [ ] La case "Urgent" fonctionne (checked/unchecked)
- [ ] Le champ téléphone est optionnel
- [ ] La soumission fonctionne avec tous les champs

#### Validation
- [ ] Les champs obligatoires sont validés
- [ ] Le formulaire ne se soumet pas si incomplet
- [ ] Un message d'erreur s'affiche en cas d'échec
- [ ] Un message de succès s'affiche après création
- [ ] Redirection vers le dashboard après succès

### Page de recherche (/search)

#### Filtres généraux
- [ ] Le dropdown "Type d'annonce" fonctionne (Tous/Sender/Shipper)
- [ ] Les champs Ville de départ/arrivée fonctionnent
- [ ] Les champs de dates fonctionnent
- [ ] Le filtre de prix fonctionne

#### Filtres conditionnels Shipper
- [ ] Sélectionner "Shipper" affiche le filtre "Moyen de transport"
- [ ] Le dropdown moyen de transport a 5 options (Tous + 4 moyens)
- [ ] Sélectionner "Shipper" affiche le filtre "Type de service"
- [ ] Le dropdown type de service a 3 options (Tous/Rémunéré/Gratuit)

#### Filtres conditionnels Sender
- [ ] Sélectionner "Sender" affiche la case "Urgent uniquement"
- [ ] La case "Urgent uniquement" fonctionne

#### Filtres communs
- [ ] Le dropdown "Type de colis" a 4 options (Tous/Personnel/Achat/Les deux)
- [ ] Le dropdown "Poids" a 9 options (Tous + 8 plages)
- [ ] Les filtres se combinent correctement

#### Tri
- [ ] Le dropdown de tri s'affiche
- [ ] 3 options de tri disponibles (Récent/Prix croissant/Prix décroissant)
- [ ] Le tri par "Plus récent" fonctionne (défaut)
- [ ] Le tri par "Prix croissant" fonctionne
- [ ] Le tri par "Prix décroissant" fonctionne
- [ ] Le tri fonctionne avec les filtres actifs

#### Résultats
- [ ] Les annonces s'affichent correctement
- [ ] Le compteur de résultats est correct
- [ ] Le badge "Shipper" ou "Sender" s'affiche sur chaque annonce
- [ ] Les détails spécifiques s'affichent (transport, urgent, etc.)
- [ ] La pagination fonctionne
- [ ] Le bouton "Réinitialiser" efface tous les filtres

### Liste de mes annonces (/announcements)
- [ ] Affiche toutes mes annonces
- [ ] Les annonces Shipper affichent les bons détails
- [ ] Les annonces Sender affichent les bons détails
- [ ] Les badges de type s'affichent correctement
- [ ] Les actions (voir/modifier/supprimer) fonctionnent

---

## ✅ Tests Responsive

### Mobile (< 768px)
- [ ] Le formulaire s'affiche correctement en colonne
- [ ] Les boutons de sélection Sender/Shipper sont empilés
- [ ] Les moyens de transport s'affichent en grille 2x2
- [ ] Les filtres sont accessibles (sidebar mobile)
- [ ] Le dropdown de tri est accessible

### Tablet (768px - 1024px)
- [ ] Grille à 2 colonnes où approprié
- [ ] Les filtres et résultats s'affichent bien
- [ ] Navigation fluide

### Desktop (> 1024px)
- [ ] Layout optimal avec sidebar de filtres
- [ ] Grille de résultats 3 colonnes
- [ ] Tous les éléments visibles

---

## ✅ Tests d'intégration

### Scénario complet Sender
1. [ ] Se connecter
2. [ ] Aller sur "Nouvelle annonce"
3. [ ] Sélectionner "Sender"
4. [ ] Remplir tous les champs (avec Urgent)
5. [ ] Soumettre le formulaire
6. [ ] Vérifier la création dans la liste
7. [ ] Rechercher l'annonce avec filtres
8. [ ] Modifier l'annonce
9. [ ] Supprimer l'annonce

### Scénario complet Shipper
1. [ ] Se connecter
2. [ ] Aller sur "Nouvelle annonce"
3. [ ] Sélectionner "Shipper"
4. [ ] Sélectionner "Avion"
5. [ ] Remplir tous les champs (Service gratuit)
6. [ ] Soumettre le formulaire
7. [ ] Vérifier la création dans la liste
8. [ ] Rechercher avec filtre "Shipper" + "Avion"
9. [ ] Vérifier que l'annonce apparaît
10. [ ] Modifier le prix
11. [ ] Vérifier la modification

### Test de matching
1. [ ] Créer une annonce Sender (Paris → Lyon, 2-5kg, 30€)
2. [ ] Créer une annonce Shipper (Paris → Lyon, 2-5kg, 25€)
3. [ ] Rechercher avec les mêmes critères
4. [ ] Vérifier que les deux annonces apparaissent
5. [ ] Vérifier le tri par prix

---

## ✅ Tests de performance

- [ ] Charger 100+ annonces et vérifier le temps de réponse
- [ ] Appliquer plusieurs filtres et mesurer le temps
- [ ] Vérifier les index MongoDB sont utilisés
- [ ] Tester la pagination avec de grandes quantités
- [ ] Vérifier qu'il n'y a pas de requêtes N+1

---

## ✅ Tests de sécurité

- [ ] Impossible de créer une annonce sans authentification
- [ ] Impossible de modifier l'annonce d'un autre utilisateur
- [ ] Impossible de supprimer l'annonce d'un autre utilisateur
- [ ] Les données sont validées côté serveur
- [ ] Pas d'injection possible dans les filtres
- [ ] Les tokens sont vérifiés correctement

---

## ✅ Tests edge cases

- [ ] Créer une annonce avec date de fin avant date de début
- [ ] Créer une annonce avec prix négatif
- [ ] Chercher avec des villes inexistantes
- [ ] Chercher avec des dates dans le passé
- [ ] Appliquer tous les filtres en même temps
- [ ] Tester avec des caractères spéciaux dans les villes
- [ ] Tester avec de très longs textes dans description
- [ ] Tester avec un téléphone invalide

---

## 📊 Métriques de succès

Une fois tous les tests passés, vérifier :
- [ ] Aucune erreur dans la console backend
- [ ] Aucune erreur dans la console frontend
- [ ] Temps de réponse < 500ms pour les recherches
- [ ] Temps de réponse < 200ms pour la création
- [ ] Pas de warning dans les logs
- [ ] Code coverage > 80% (si tests unitaires)

---

## 🚀 Déploiement

Avant de déployer en production :
- [ ] Tous les tests manuels passent
- [ ] La migration des données a été testée
- [ ] La documentation est à jour
- [ ] Les variables d'environnement sont configurées
- [ ] Le backup de la base de données est fait
- [ ] Le plan de rollback est prêt
