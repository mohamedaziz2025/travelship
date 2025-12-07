# 🎨 TravelShip Design System

## 📐 Design Tokens

### Palette de couleurs

#### Primary (Bleu)
```css
--primary: #3B82F6
--primary-light: #60A5FA
--primary-dark: #2563EB
```

#### Secondary (Violet)
```css
--secondary: #9333EA
--secondary-light: #A855F7
--secondary-dark: #7C3AED
```

#### Accent (Vert)
```css
--accent: #00E5A8
--accent-light: #34EDB8
--accent-dark: #00C792
```

#### Neutrals
```css
--dark: #0F172A
--dark-light: #1E293B
--dark-lighter: #334155

--light: #F8FAFC
--light-dark: #F1F5F9
--light-darker: #E2E8F0
```

#### Status
```css
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6
```

### Dégradés

#### Primary Gradient
```css
background: linear-gradient(135deg, #3B82F6 0%, #9333EA 100%);
```

#### Accent Gradient
```css
background: linear-gradient(135deg, #00E5A8 0%, #3B82F6 100%);
```

#### Dark Gradient
```css
background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
```

### Typography

#### Font Families
```css
--font-primary: 'Inter', system-ui, sans-serif;
--font-secondary: 'SF Pro Display', -apple-system, sans-serif;
```

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

#### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Border Radius

```css
--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 20px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### Shadows

#### Glass Effect
```css
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

#### Premium Shadow
```css
box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
```

#### Lift Shadow
```css
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
```

### Animations

#### Duration
```css
--duration-fast: 150ms;
--duration-base: 300ms;
--duration-slow: 500ms;
```

#### Easing
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

#### Keyframes
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-up {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes scale-in {
  from { 
    transform: scale(0.9); 
    opacity: 0; 
  }
  to { 
    transform: scale(1); 
    opacity: 1; 
  }
}

@keyframes slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

## 🧩 Components

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Click me
</button>
```
**Style**: Gradient background, white text, shadow on hover, scale animation

#### Secondary Button
```tsx
<button className="btn-secondary">
  Click me
</button>
```
**Style**: White background, border, primary color on hover

#### Accent Button
```tsx
<button className="btn-accent">
  Click me
</button>
```
**Style**: Accent color background, dark text

### Cards

#### Standard Card
```tsx
<div className="card">
  <h3>Title</h3>
  <p>Content</p>
</div>
```
**Style**: White background, rounded corners, shadow, lift on hover

#### Glass Card
```tsx
<div className="card-glass">
  <h3>Title</h3>
  <p>Content</p>
</div>
```
**Style**: Glassmorphism effect, transparent background, blur

### Badges

#### Premium Badge
```tsx
<span className="badge-premium">
  Premium
</span>
```
**Style**: Gradient background, white text

#### Verified Badge
```tsx
<span className="badge-verified">
  Vérifié
</span>
```
**Style**: Accent color background, dark text, checkmark icon

#### Info Badge
```tsx
<span className="badge-info">
  Info
</span>
```
**Style**: Primary color background with opacity, primary text

### Inputs

#### Text Input
```tsx
<input 
  type="text" 
  className="input"
  placeholder="Enter text..."
/>
```
**Style**: Border, rounded corners, primary color focus ring

#### Search Bar
```tsx
<SearchBar variant="hero" />
<SearchBar variant="compact" />
```
**Variants**: 
- `hero`: Full featured with filters
- `compact`: Simple from/to search

## 📱 Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

## 🎭 Page Layouts

### Landing Page
- Hero section with gradient background
- Search bar overlay
- Trust indicators (verified, secure, rated)
- How it works (3 steps)
- Features grid (4 items)
- CTA section with gradient
- Footer

### Dashboard
- Sidebar navigation (collapsible)
- Stats cards (4 metrics)
- Quick action cards (create announcement/trip)
- Recent activity lists
- Responsive grid layout

### Search Page
- Top navigation with search bar
- Filter sidebar (toggleable)
- Results grid/list/map view toggle
- Announcement/Trip cards
- Pagination

## 🎨 Design Principles

1. **Minimaliste**: Whitespace généreux, design épuré
2. **Premium**: Gradients, glassmorphism, shadows subtiles
3. **Moderne**: Animations douces, transitions fluides
4. **Accessible**: Contraste suffisant, tailles de texte lisibles
5. **Responsive**: Mobile-first, adaptation fluide aux écrans

## 🖼️ Illustrations & Icons

### Icon Library
**Lucide React** - Icons minimalistes et modernes
- Utilisez les icônes avec stroke-width: 2
- Taille par défaut: w-5 h-5 (20px)
- Couleur: Hérite du parent ou utilise primary/accent

### Images
- Format préféré: WebP pour performance
- Ratios recommandés: 16:9, 4:3, 1:1
- Placeholder: Gradient avec icon centered
- Lazy loading activé par défaut

## 🚀 Performance

### Optimizations
- Animations GPU-accelerated (transform, opacity)
- Images optimisées avec Next.js Image
- Lazy loading pour images et composants
- Code splitting par route
- Préchargement des données critiques

### Best Practices
- Utilisez `will-change` avec parcimonie
- Évitez les animations sur `width`, `height`
- Préférez `transform` pour mouvement
- Utilisez `backdrop-filter` avec modération
