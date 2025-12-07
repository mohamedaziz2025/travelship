# 📋 Guide de Contribution TravelShip

Merci de votre intérêt pour contribuer à TravelShip ! Ce document vous guidera à travers le processus.

## 🚀 Démarrage Rapide

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/travelship.git
cd travelship
```

### 2. Installation
```bash
# Frontend
cd frontend
npm install
cp .env.example .env.local
# Modifiez .env.local avec vos configurations

# Backend
cd ../backend
npm install
cp .env.example .env
# Modifiez .env avec vos configurations
```

### 3. Lancer en dev
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📝 Standards de Code

### TypeScript
- Utilisez TypeScript strict
- Définissez des types/interfaces pour tout
- Évitez `any`, utilisez `unknown` si nécessaire

### Nomenclature
- **Components**: PascalCase (`NavBar.tsx`, `SearchBar.tsx`)
- **Files**: kebab-case (`user-controller.ts`, `auth-service.ts`)
- **Variables**: camelCase (`userId`, `isAuthenticated`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)

### Structure
```typescript
// Imports
import { ... } from '...'

// Types/Interfaces
interface Props { ... }

// Component/Function
export function Component({ props }: Props) {
  // Hooks
  const [state, setState] = useState()
  
  // Handlers
  const handleClick = () => { ... }
  
  // Effects
  useEffect(() => { ... }, [])
  
  // Render
  return (...)
}
```

## 🎨 Commits

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: Nouvelle fonctionnalité
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout de tests
- `chore`: Maintenance

### Exemples
```bash
feat(auth): add password reset functionality

Add email-based password reset with JWT tokens
Expires after 1 hour

Closes #123

fix(chat): resolve message duplication issue

Messages were duplicating when socket reconnected
Added deduplication logic based on message ID

perf(search): optimize announcement queries

Added compound index on from/to cities
Reduced query time from 500ms to 50ms
```

## 🌿 Workflow Git

### 1. Créer une branche
```bash
git checkout -b feature/nom-de-la-feature
# ou
git checkout -b fix/nom-du-bug
```

### 2. Faire vos changements
```bash
git add .
git commit -m "feat(scope): description"
```

### 3. Push & Pull Request
```bash
git push origin feature/nom-de-la-feature
```

Créez une Pull Request sur GitHub avec:
- Titre descriptif
- Description détaillée des changements
- Screenshots si UI changes
- Tests effectués

## ✅ Checklist PR

- [ ] Code suit les standards du projet
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de console.log inutiles
- [ ] Types TypeScript corrects
- [ ] Responsive sur mobile
- [ ] Pas de secrets/credentials

## 🧪 Tests

### Frontend
```bash
cd frontend
npm run test
npm run type-check
```

### Backend
```bash
cd backend
npm run test
npm run lint
```

## 📚 Documentation

Si vous ajoutez une nouvelle feature:
1. Mettez à jour `API_DOCUMENTATION.md` pour les endpoints
2. Ajoutez des exemples d'utilisation
3. Documentez les props des composants
4. Ajoutez des commentaires pour le code complexe

## 🐛 Rapporter un Bug

Créez une issue avec:
- Titre clair et descriptif
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots si applicable
- Environnement (OS, browser, version)

## 💡 Proposer une Feature

Créez une issue "Feature Request" avec:
- Problème que ça résout
- Solution proposée
- Alternatives considérées
- Mockups/designs si applicable

## 🎯 Priorités

### High Priority
- Bugs critiques
- Problèmes de sécurité
- Performance issues

### Medium Priority
- Nouvelles features
- Améliorations UX
- Optimisations

### Low Priority
- Documentation
- Refactoring
- Tests

## 📞 Questions

- Discord: [Join our server](https://discord.gg/travelship)
- Email: dev@travelship.com
- GitHub Discussions

## 🙏 Merci !

Chaque contribution compte, qu'elle soit grande ou petite. Merci de faire partie de la communauté TravelShip !
