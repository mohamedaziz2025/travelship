// Validation d'email
export const validateEmail = (email: string): string | undefined => {
  if (!email) return 'L\'email est requis'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Email invalide'
  return undefined
}

// Validation de mot de passe
export const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Le mot de passe est requis'
  if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères'
  if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule'
  if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule'
  if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre'
  return undefined
}

// Validation de confirmation de mot de passe
export const validatePasswordConfirm = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) return 'Veuillez confirmer le mot de passe'
  if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas'
  return undefined
}

// Validation de nom
export const validateName = (name: string): string | undefined => {
  if (!name) return 'Le nom est requis'
  if (name.length < 2) return 'Le nom doit contenir au moins 2 caractères'
  if (name.length > 50) return 'Le nom ne peut pas dépasser 50 caractères'
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) return 'Le nom contient des caractères invalides'
  return undefined
}

// Validation de numéro de téléphone
export const validatePhone = (phone: string): string | undefined => {
  if (!phone) return undefined // Optionnel
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) return 'Numéro de téléphone invalide'
  return undefined
}

// Validation de ville
export const validateCity = (city: string): string | undefined => {
  if (!city) return 'La ville est requise'
  if (city.length < 2) return 'Le nom de la ville est trop court'
  return undefined
}

// Validation de pays
export const validateCountry = (country: string): string | undefined => {
  if (!country) return 'Le pays est requis'
  if (country.length < 2) return 'Le nom du pays est trop court'
  return undefined
}

// Validation de date
export const validateDate = (date: string): string | undefined => {
  if (!date) return 'La date est requise'
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (selectedDate < today) return 'La date ne peut pas être dans le passé'
  return undefined
}

// Validation de date de fin (doit être après date de début)
export const validateEndDate = (startDate: string, endDate: string): string | undefined => {
  if (!endDate) return 'La date de fin est requise'
  if (!startDate) return undefined
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (end < start) return 'La date de fin doit être après la date de début'
  return undefined
}

// Validation de nombre (positif)
export const validateNumber = (value: string, fieldName: string): string | undefined => {
  if (!value) return `${fieldName} est requis`
  const num = parseFloat(value)
  if (isNaN(num)) return `${fieldName} doit être un nombre`
  if (num <= 0) return `${fieldName} doit être positif`
  return undefined
}

// Validation de poids
export const validateWeight = (weight: string): string | undefined => {
  if (!weight) return undefined // Optionnel
  const num = parseFloat(weight)
  if (isNaN(num)) return 'Le poids doit être un nombre'
  if (num <= 0) return 'Le poids doit être positif'
  if (num > 100) return 'Le poids ne peut pas dépasser 100 kg'
  return undefined
}

// Validation de récompense
export const validateReward = (reward: string): string | undefined => {
  if (!reward) return 'La récompense est requise'
  const num = parseFloat(reward)
  if (isNaN(num)) return 'La récompense doit être un nombre'
  if (num < 0) return 'La récompense doit être positive'
  if (num > 10000) return 'La récompense ne peut pas dépasser 10 000€'
  return undefined
}

// Validation de description
export const validateDescription = (description: string, minLength = 10, maxLength = 500): string | undefined => {
  if (!description) return 'La description est requise'
  if (description.length < minLength) return `La description doit contenir au moins ${minLength} caractères`
  if (description.length > maxLength) return `La description ne peut pas dépasser ${maxLength} caractères`
  return undefined
}

// Validation de titre
export const validateTitle = (title: string): string | undefined => {
  if (!title) return 'Le titre est requis'
  if (title.length < 5) return 'Le titre doit contenir au moins 5 caractères'
  if (title.length > 100) return 'Le titre ne peut pas dépasser 100 caractères'
  return undefined
}
