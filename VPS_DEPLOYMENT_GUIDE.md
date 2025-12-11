# 🚀 Guide de Déploiement VPS - TravelShip

Ce guide vous explique comment déployer TravelShip sur un serveur VPS (Virtual Private Server).

## 📋 Prérequis

- Un VPS avec Ubuntu 20.04 ou 22.04 (recommandé)
- Au moins 2 GB de RAM
- 20 GB d'espace disque
- Accès root ou sudo
- Un nom de domaine (optionnel mais recommandé)

## 🔧 1. Préparation du VPS

### Connexion au VPS
```bash
ssh root@VOTRE_IP_VPS
```

### Mise à jour du système
```bash
apt update && apt upgrade -y
```

### Installation de Docker et Docker Compose
```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
apt-get install docker-compose-plugin -y

# Vérifier l'installation
docker --version
docker compose version
```

### Installation de Git
```bash
apt install git -y
```

### Configuration du pare-feu
```bash
# Installer UFW si non installé
apt install ufw -y

# Autoriser SSH (IMPORTANT!)
ufw allow 22/tcp

# Autoriser HTTP et HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Activer le pare-feu
ufw enable

# Vérifier le status
ufw status
```

## 📦 2. Déploiement de l'application

### Cloner le projet
```bash
cd /opt
git clone https://github.com/mohamedaziz2025/travelship.git
cd travelship
```

### Configuration des variables d'environnement

#### A. Backend Configuration
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

**Modifier les valeurs suivantes:**
```env
# Environment
NODE_ENV=production

# Server
PORT=5000

# Database (pour Docker Compose)
MONGODB_URI=mongodb://admin:VOTRE_MOT_DE_PASSE@mongodb:27017/travelship?authSource=admin

# JWT - IMPORTANT: Générer des secrets forts!
# Commande: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=GENERER_UN_SECRET_FORT_64_CARACTERES
JWT_REFRESH_SECRET=GENERER_UN_AUTRE_SECRET_FORT_64_CARACTERES

# Frontend URL (votre domaine ou IP)
FRONTEND_URL=http://VOTRE_IP:3000
# Ou avec domaine: FRONTEND_URL=https://votredomaine.com

# Cloudinary (inscription sur cloudinary.com)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_app_password
```

#### B. Frontend Configuration
```bash
cp frontend/.env.example frontend/.env.local
nano frontend/.env.local
```

**Modifier les valeurs suivantes:**
```env
# API URLs
NEXT_PUBLIC_API_URL=http://VOTRE_IP:5000/api
NEXT_PUBLIC_SOCKET_URL=http://VOTRE_IP:5000

# Ou avec domaine:
# NEXT_PUBLIC_API_URL=https://api.votredomaine.com/api
# NEXT_PUBLIC_SOCKET_URL=https://api.votredomaine.com

NEXT_PUBLIC_APP_URL=http://VOTRE_IP:3000
# Ou: NEXT_PUBLIC_APP_URL=https://votredomaine.com

NEXT_PUBLIC_ENV=production
```

#### C. Docker Compose Configuration
```bash
cp .env.vps .env
nano .env
```

**Modifier les valeurs suivantes:**
```env
# Domaine
DOMAIN=votredomaine.com

# MongoDB
MONGO_INITDB_ROOT_PASSWORD=CHOISIR_UN_MOT_DE_PASSE_FORT

# JWT
JWT_SECRET=LE_MEME_QUE_BACKEND_ENV
JWT_REFRESH_SECRET=LE_MEME_QUE_BACKEND_ENV

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Email
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_app_password
```

### Construire et démarrer les conteneurs
```bash
# Construire les images
docker compose build

# Démarrer les services
docker compose up -d

# Vérifier que tout fonctionne
docker compose ps
docker compose logs -f
```

## 🔐 3. Configuration de Nginx avec SSL (Recommandé)

### Installation de Nginx
```bash
apt install nginx -y
```

### Configuration Nginx pour HTTP (temporaire)
```bash
nano /etc/nginx/sites-available/travelship
```

**Contenu du fichier:**
```nginx
# Frontend
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.votredomaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO support
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Activer le site
```bash
ln -s /etc/nginx/sites-available/travelship /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Installation de SSL avec Let's Encrypt
```bash
# Installer Certbot
apt install certbot python3-certbot-nginx -y

# Obtenir les certificats SSL
certbot --nginx -d votredomaine.com -d www.votredomaine.com -d api.votredomaine.com

# Renouvellement automatique (cron)
certbot renew --dry-run
```

### Si vous utilisez seulement l'IP (sans domaine)
```bash
nano /etc/nginx/sites-available/travelship
```

**Configuration pour IP uniquement:**
```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 5000;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🗄️ 4. Gestion de la base de données

### Créer un super administrateur
```bash
cd /opt/travelship/backend
docker compose exec backend npm run create-superadmin
```

### Backup de la base de données
```bash
# Créer un backup
docker compose exec mongodb mongodump --username admin --password VOTRE_MOT_DE_PASSE --authenticationDatabase admin --out /data/backup

# Copier le backup hors du conteneur
docker cp travelship-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)

# Compresser le backup
tar -czf mongodb-backup-$(date +%Y%m%d).tar.gz mongodb-backup-$(date +%Y%m%d)
```

### Restaurer un backup
```bash
# Copier le backup dans le conteneur
docker cp ./mongodb-backup travelship-mongodb:/data/restore

# Restaurer
docker compose exec mongodb mongorestore --username admin --password VOTRE_MOT_DE_PASSE --authenticationDatabase admin /data/restore
```

## 📊 5. Monitoring et Maintenance

### Voir les logs
```bash
# Tous les services
docker compose logs -f

# Backend seulement
docker compose logs -f backend

# Frontend seulement
docker compose logs -f frontend

# MongoDB
docker compose logs -f mongodb
```

### Redémarrer les services
```bash
# Redémarrer tout
docker compose restart

# Redémarrer un service spécifique
docker compose restart backend
docker compose restart frontend
```

### Mettre à jour l'application
```bash
cd /opt/travelship

# Pull les dernières modifications
git pull origin main

# Rebuild et redémarrer
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Vérifier l'utilisation des ressources
```bash
# Utilisation CPU/RAM
docker stats

# Espace disque
df -h

# Espace utilisé par Docker
docker system df
```

### Nettoyer Docker
```bash
# Supprimer les images non utilisées
docker image prune -a

# Nettoyer tout (ATTENTION: supprime tout ce qui n'est pas utilisé)
docker system prune -a --volumes
```

## 🔒 6. Sécurité

### Créer un utilisateur non-root
```bash
# Créer un utilisateur
adduser travelship
usermod -aG sudo travelship
usermod -aG docker travelship

# Se connecter avec ce nouvel utilisateur
su - travelship
```

### Désactiver la connexion root SSH
```bash
nano /etc/ssh/sshd_config
```
Modifier: `PermitRootLogin no`
```bash
systemctl restart sshd
```

### Installer Fail2Ban
```bash
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

## 🧪 7. Tests

### Vérifier que l'application fonctionne
```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000

# Avec votre IP publique
curl http://VOTRE_IP:5000/api/health
curl http://VOTRE_IP:3000
```

### Tester depuis l'extérieur
Ouvrez dans votre navigateur:
- Frontend: `http://VOTRE_IP:3000` ou `https://votredomaine.com`
- Backend: `http://VOTRE_IP:5000/api/health` ou `https://api.votredomaine.com/api/health`

## 🚨 Troubleshooting

### Les conteneurs ne démarrent pas
```bash
docker compose logs
docker compose ps
```

### Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB tourne
docker compose ps mongodb

# Voir les logs
docker compose logs mongodb

# Vérifier les variables d'environnement
docker compose exec backend env | grep MONGODB_URI
```

### Le frontend ne se connecte pas au backend
1. Vérifier `NEXT_PUBLIC_API_URL` dans `frontend/.env.local`
2. Vérifier le pare-feu: `ufw status`
3. Vérifier que le backend est accessible: `curl http://localhost:5000/api/health`

### Erreur 502 Bad Gateway (Nginx)
```bash
# Vérifier les logs Nginx
tail -f /var/log/nginx/error.log

# Vérifier que les services tournent
docker compose ps

# Redémarrer Nginx
systemctl restart nginx
```

## 📝 Checklist de déploiement

- [ ] VPS configuré avec Ubuntu
- [ ] Docker et Docker Compose installés
- [ ] Pare-feu configuré (ports 22, 80, 443)
- [ ] Projet cloné sur le VPS
- [ ] Variables d'environnement configurées (backend/.env)
- [ ] Variables d'environnement configurées (frontend/.env.local)
- [ ] Secrets JWT générés (forts et uniques)
- [ ] Mot de passe MongoDB changé
- [ ] Compte Cloudinary créé et configuré
- [ ] Email SMTP configuré
- [ ] Conteneurs Docker démarrés
- [ ] Nginx installé et configuré
- [ ] SSL/TLS configuré (Let's Encrypt)
- [ ] Super admin créé
- [ ] Tests effectués (frontend et backend)
- [ ] Backup automatique configuré
- [ ] Monitoring en place

## 📚 Ressources utiles

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Cloudinary](https://cloudinary.com/documentation)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/) (alternative cloud)

## 💡 Conseils de production

1. **Utilisez toujours HTTPS en production**
2. **Générez des secrets JWT forts** (64+ caractères aléatoires)
3. **Configurez des backups automatiques** de la base de données
4. **Mettez en place un monitoring** (CPU, RAM, disque)
5. **Gardez vos dépendances à jour**
6. **Utilisez un nom de domaine** plutôt qu'une IP
7. **Configurez des logs centralisés**
8. **Testez vos backups régulièrement**

## 🆘 Support

En cas de problème, vérifiez:
1. Les logs Docker: `docker compose logs`
2. Les logs Nginx: `/var/log/nginx/error.log`
3. Les variables d'environnement
4. La configuration du pare-feu
5. Les permissions des fichiers

---

**Bon déploiement! 🚀**
