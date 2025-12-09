# 🐳 Guide de Déploiement Docker - TravelShip

Ce guide vous explique comment déployer l'application TravelShip en utilisant Docker et Docker Compose.

## 📋 Prérequis

- Docker (version 20.10 ou supérieure)
- Docker Compose (version 2.0 ou supérieure)
- 4 GB de RAM minimum
- 10 GB d'espace disque

### Vérifier l'installation

```bash
docker --version
docker-compose --version
```

## 🚀 Démarrage Rapide

### 1. Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditez le fichier `.env` et modifiez les valeurs suivantes :

```env
# JWT Configuration (IMPORTANT: Changez cette valeur)
JWT_SECRET=votre_secret_jwt_super_securise_unique

# Cloudinary (pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=votre_cloudinary_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### 2. Lancer l'Application

```bash
# Construire et démarrer tous les services
docker-compose up -d --build
```

### 3. Vérifier le Statut

```bash
# Voir les conteneurs en cours d'exécution
docker-compose ps

# Voir les logs
docker-compose logs -f
```

L'application sera accessible sur :
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 📦 Services Déployés

### 1. MongoDB (Base de données)
- **Image**: mongo:7.0
- **Port**: 27017
- **Volumes**: Données persistantes dans `mongodb_data`
- **Credentials par défaut**:
  - Username: `admin`
  - Password: `travelship_admin_password`
  - Database: `travelship`

### 2. Backend (API Node.js/TypeScript)
- **Build**: `./backend/Dockerfile`
- **Port**: 5000
- **Healthcheck**: Vérifie `/api/health` toutes les 30s

### 3. Frontend (Next.js)
- **Build**: `./frontend/Dockerfile`
- **Port**: 3000
- **Healthcheck**: Vérifie la page d'accueil toutes les 30s

## 🛠️ Commandes Utiles

### Gestion des Conteneurs

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ Supprime les données)
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Reconstruction

```bash
# Reconstruire tous les services
docker-compose up -d --build

# Reconstruire un service spécifique
docker-compose up -d --build backend

# Forcer la reconstruction sans cache
docker-compose build --no-cache
```

### Administration

```bash
# Créer un super admin
docker-compose exec backend node dist/createSuperAdmin.js

# Accéder au shell MongoDB
docker-compose exec mongodb mongosh -u admin -p travelship_admin_password

# Accéder au shell du backend
docker-compose exec backend sh

# Accéder au shell du frontend
docker-compose exec frontend sh
```

### Nettoyage

```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune

# Supprimer les volumes non utilisés
docker volume prune

# Nettoyage complet
docker system prune -a
```

## 🔍 Déboggage

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Vérifier la santé des conteneurs

```bash
docker-compose ps
```

Les conteneurs sains afficheront `healthy` dans la colonne STATUS.

### Problèmes courants

#### Le backend ne peut pas se connecter à MongoDB
```bash
# Vérifier que MongoDB est démarré
docker-compose ps mongodb

# Vérifier les logs MongoDB
docker-compose logs mongodb

# Redémarrer MongoDB
docker-compose restart mongodb
```

#### Erreur de build
```bash
# Reconstruire sans cache
docker-compose build --no-cache

# Supprimer les images et reconstruire
docker-compose down --rmi all
docker-compose up -d --build
```

#### Port déjà utilisé
```bash
# Trouver le processus utilisant le port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Tuer le processus (Windows)
taskkill /PID <PID> /F
```

## 🔒 Sécurité en Production

### Variables d'Environnement

⚠️ **Important**: Changez les valeurs par défaut avant de déployer en production !

```env
# Générez un secret JWT fort
JWT_SECRET=$(openssl rand -base64 32)

# Changez le mot de passe MongoDB dans docker-compose.yml
MONGO_INITDB_ROOT_PASSWORD=un_mot_de_passe_tres_securise
```

### Recommandations

1. **Ne jamais commiter le fichier `.env`** dans Git
2. Utilisez des **secrets Docker** pour les valeurs sensibles en production
3. Configurez un **reverse proxy** (Nginx) pour HTTPS
4. Activez les **limites de ressources** dans docker-compose.yml
5. Configurez des **sauvegardes automatiques** de MongoDB

## 🌐 Déploiement en Production

### Avec Docker Swarm

```bash
# Initialiser Swarm
docker swarm init

# Déployer la stack
docker stack deploy -c docker-compose.yml travelship

# Voir les services
docker stack services travelship
```

### Avec Nginx Reverse Proxy

Ajoutez un service nginx dans `docker-compose.yml` :

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/nginx/ssl
  depends_on:
    - frontend
    - backend
  networks:
    - travelship-network
```

## 📊 Monitoring

### Ajouter des limites de ressources

Dans `docker-compose.yml`, ajoutez pour chaque service :

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Logs centralisés

```bash
# Exporter les logs vers un fichier
docker-compose logs > logs.txt

# Utiliser un driver de log
# Ajoutez dans docker-compose.yml pour chaque service
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🔄 Sauvegarde et Restauration

### Sauvegarder MongoDB

```bash
# Créer un backup
docker-compose exec mongodb mongodump \
  -u admin \
  -p travelship_admin_password \
  --authenticationDatabase admin \
  --out /data/backup

# Copier le backup sur l'hôte
docker cp travelship-mongodb:/data/backup ./backup
```

### Restaurer MongoDB

```bash
# Copier le backup dans le conteneur
docker cp ./backup travelship-mongodb:/data/backup

# Restaurer
docker-compose exec mongodb mongorestore \
  -u admin \
  -p travelship_admin_password \
  --authenticationDatabase admin \
  /data/backup
```

## 📈 Scaling

Pour scaler horizontalement :

```bash
# Augmenter le nombre d'instances backend
docker-compose up -d --scale backend=3

# Note: Nécessite un load balancer (ex: Nginx) pour distribuer le trafic
```

## 🆘 Support

Pour plus d'informations :
- Consultez les logs : `docker-compose logs -f`
- Documentation Docker : https://docs.docker.com/
- Documentation Docker Compose : https://docs.docker.com/compose/

## 📝 Structure des Fichiers Docker

```
travelship/
├── docker-compose.yml          # Orchestration des services
├── .env.example                # Template des variables d'environnement
├── .env                        # Variables d'environnement (à créer)
├── backend/
│   ├── Dockerfile              # Image Docker du backend
│   └── .dockerignore           # Fichiers à exclure du build
└── frontend/
    ├── Dockerfile              # Image Docker du frontend
    └── .dockerignore           # Fichiers à exclure du build
```

## ✅ Checklist de Déploiement

- [ ] Docker et Docker Compose installés
- [ ] Fichier `.env` créé et configuré
- [ ] JWT_SECRET changé
- [ ] Cloudinary configuré
- [ ] Ports 3000 et 5000 disponibles
- [ ] Build des images réussi
- [ ] Services démarrés (`docker-compose ps`)
- [ ] Healthchecks passent (tous en `healthy`)
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Backend accessible sur http://localhost:5000
- [ ] Super admin créé
- [ ] Tests de connexion effectués

Bon déploiement ! 🚀
