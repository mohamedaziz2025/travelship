# Guide d'Implémentation de la Validation des Formulaires

## ✅ Validation Complétée

### Formulaire d'Inscription (`/register`)
- ✅ Validation nom (2-50 caractères, caractères valides)
- ✅ Validation email (format valide)
- ✅ Validation mot de passe (6+ caractères, 1 majuscule, 1 minuscule, 1 chiffre)
- ✅ Validation confirmation mot de passe (correspondance)
- ✅ Validation téléphone (optionnel, format français)
- ✅ Affichage des erreurs en temps réel
- ✅ Icônes et messages d'erreur clairs

### Composants Créés

1. **`/components/form/input-field.tsx`**
   - InputField: Champ de texte avec validation intégrée
   - TextAreaField: Zone de texte avec compteur de caractères
   - Gestion de l'état "touched" (champ visité)
   - Affichage conditionnel des erreurs
   - Support du toggle pour mot de passe

2. **`/components/form/error-message.tsx`**
   - Composant réutilisable pour afficher les messages d'erreur
   - Icône d'avertissement
   - Affichage conditionnel basé sur l'état touched

3. **`/lib/validation.ts`**
   - Fonctions de validation réutilisables :
     - `validateEmail()`: Valide format email
     - `validatePassword()`: Exigences de sécurité
     - `validatePasswordConfirm()`: Correspondance des mots de passe
     - `validateName()`: Longueur et caractères valides
     - `validatePhone()`: Format téléphone français
     - `validateCity()`: Validation ville
     - `validateCountry()`: Validation pays
     - `validateDate()`: Date pas dans le passé
     - `validateEndDate()`: Date de fin après date de début
     - `validateNumber()`: Nombres positifs
     - `validateWeight()`: Poids 0-100kg
     - `validateReward()`: Récompense 0-10000€
     - `validateDescription()`: Longueur min/max
     - `validateTitle()`: Titre 5-100 caractères

## 🔄 Formulaires Partiellement Complétés

### Formulaire d'Annonce (`/announcements/new`)
- ✅ Système de validation importé
- ✅ État errors et touched ajoutés
- ✅ Fonctions validateField, handleChange, handleBlur créées
- ✅ Fonction validateForm complète
- ✅ Validation au submit
- ✅ Validation du titre ajoutée
- 🔶 **À FAIRE**: Ajouter validation aux autres champs (voir modèle ci-dessous)

### Formulaire de Trajet (`/trips/new`)
- ✅ Système de validation importé
- ✅ État errors et touched ajoutés
- ✅ Fonctions validateField, handleChange, handleBlur créées
- ✅ Fonction validateForm complète
- ✅ Validation au submit
- 🔶 **À FAIRE**: Ajouter validation aux champs UI (voir modèle ci-dessous)

## 📝 Modèle d'Implémentation

### Pour un champ texte standard :

```tsx
<div>
  <label className="block text-sm font-medium text-dark mb-2">
    Nom du champ <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    required
    value={formData.fieldName}
    onChange={(e) => handleChange('fieldName', e.target.value)}
    onBlur={() => handleBlur('fieldName')}
    className={`input ${errors.fieldName && touched.fieldName ? 'border-red-500' : ''}`}
    placeholder="Placeholder..."
  />
  <ErrorMessage error={errors.fieldName} touched={touched.fieldName} />
</div>
```

### Pour un champ date :

```tsx
<div>
  <label className="block text-sm font-medium text-dark mb-2">
    Date <span className="text-red-500">*</span>
  </label>
  <input
    type="date"
    required
    value={formData.date}
    onChange={(e) => handleChange('date', e.target.value)}
    onBlur={() => handleBlur('date')}
    className={`input ${errors.date && touched.date ? 'border-red-500' : ''}`}
  />
  <ErrorMessage error={errors.date} touched={touched.date} />
</div>
```

### Pour un champ LocationAutocomplete :

```tsx
<div>
  <label className="block text-sm font-medium text-dark mb-2">
    Lieu <span className="text-red-500">*</span>
  </label>
  <LocationAutocomplete
    value={formData.city && formData.country ? `${formData.city}, ${formData.country}` : formData.city}
    onChange={(value) => {
      if (value.includes(', ')) {
        const parts = value.split(', ')
        const newData = {
          ...formData,
          city: parts[0] || '',
          country: parts.slice(1).join(', ') || '',
        }
        setFormData(newData)
        if (touched.city) {
          validateField('city', parts[0] || '')
          validateField('country', parts.slice(1).join(', ') || '')
        }
      } else {
        setFormData({
          ...formData,
          city: value,
          country: '',
        })
      }
    }}
    onBlur={() => {
      handleBlur('city')
      handleBlur('country')
    }}
    placeholder="Rechercher une ville..."
    className={`${errors.city && touched.city ? 'border-red-500' : ''}`}
  />
  <ErrorMessage error={errors.city || errors.country} touched={touched.city || touched.country} />
</div>
```

### Pour un champ textarea :

```tsx
<div>
  <label className="block text-sm font-medium text-dark mb-2">
    Description <span className="text-red-500">*</span>
  </label>
  <textarea
    required
    rows={4}
    value={formData.description}
    onChange={(e) => handleChange('description', e.target.value)}
    onBlur={() => handleBlur('description')}
    className={`input ${errors.description && touched.description ? 'border-red-500' : ''}`}
    placeholder="Décrivez votre annonce..."
    maxLength={500}
  />
  <div className="flex justify-between items-start">
    <ErrorMessage error={errors.description} touched={touched.description} />
    <p className="text-xs text-gray-500 mt-1">
      {formData.description.length} / 500
    </p>
  </div>
</div>
```

## 🎯 Champs à Mettre à Jour

### Dans `/announcements/new/page.tsx` :

1. **Lieu de départ** (ligne ~438) - Ajouter validation fromCity et fromCountry
2. **Lieu d'arrivée** (ligne ~468) - Ajouter validation toCity et toCountry
3. **Date de départ** (ligne ~502) - Ajouter validation pickupDate
4. **Date d'arrivée** - Ajouter validation deliveryDate
5. **Récompense** - Ajouter validation reward
6. **Description** - Ajouter validation description
7. **Téléphone** (optionnel) - Ajouter validation phoneNumber
8. **Poids** (optionnel) - Ajouter validation weight

### Dans `/trips/new/page.tsx` :

1. **Lieu de départ** - Ajouter validation fromCity et fromCountry
2. **Lieu d'arrivée** - Ajouter validation toCity et toCountry
3. **Date de départ** - Ajouter validation departureDate
4. **Date d'arrivée** - Ajouter validation arrivalDate
5. **Poids disponible** - Ajouter validation availableKg
6. **Notes** (optionnel) - Ajouter validation notes

## 🔍 Vérification

Pour vérifier que la validation fonctionne :

1. Essayez de soumettre le formulaire vide
2. Entrez des données invalides (email sans @, mot de passe court, etc.)
3. Vérifiez que les bordures rouges apparaissent
4. Vérifiez que les messages d'erreur s'affichent sous les champs
5. Vérifiez que la soumission est bloquée tant qu'il y a des erreurs

## 💡 Messages d'Erreur

Les messages sont en français et user-friendly :
- "L'email est requis"
- "Email invalide"
- "Le mot de passe doit contenir au moins 6 caractères"
- "Le mot de passe doit contenir au moins une majuscule"
- "Les mots de passe ne correspondent pas"
- "La date ne peut pas être dans le passé"
- "La date de fin doit être après la date de début"
- etc.

## 🚀 Prochaines Étapes

1. Appliquer le modèle aux champs restants dans `/announcements/new`
2. Appliquer le modèle aux champs dans `/trips/new`
3. Tester tous les formulaires
4. Ajouter la validation au formulaire de modification de profil si nécessaire
5. Ajouter la validation aux formulaires d'édition (annonces/trajets)
