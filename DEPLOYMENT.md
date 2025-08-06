# Guide de Déploiement - LAFAOM-MAO Institut de Formation

## Prérequis

- Node.js 18+ 
- npm ou pnpm
- Serveur web (Nginx, Apache, ou service cloud)

## Étapes de Build pour la Production

### 1. Installation des dépendances
```bash
npm install
# ou
pnpm install
```

### 2. Build de production
```bash
npm run build:prod
# ou
pnpm build:prod
```

Le build sera généré dans le dossier `dist/`

### 3. Test local du build
```bash
npm run preview
# ou
pnpm preview
```

## Configuration du Serveur

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/lafaom-mao-institut/dist;
    index index.html;

    # Gestion des routes SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

### Apache Configuration (.htaccess)
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache pour les assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## Variables d'Environnement

Créer un fichier `.env.production` :
```env
NODE_ENV=production
VITE_APP_TITLE=LAFAOM-MAO Institut de Formation Carcérale
VITE_APP_VERSION=1.0.0
VITE_APP_API_URL=https://api.lafaom.com
VITE_APP_BASE_URL=/
```

## Optimisations de Performance

### 1. Compression Gzip
Ajouter dans Nginx :
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. CDN pour les Assets
Considérer l'utilisation d'un CDN pour les assets statiques.

### 3. Monitoring
- Configurer des outils de monitoring (New Relic, Sentry, etc.)
- Surveiller les performances avec Lighthouse

## Sécurité

### 1. Headers de Sécurité
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

### 2. HTTPS
Forcer HTTPS en production :
```nginx
server {
    listen 443 ssl http2;
    # Configuration SSL...
    
    # Redirection HTTP vers HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

## Déploiement Automatisé

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:prod
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
                         cd /var/www/lafaom-mao-institut
            git pull origin main
            npm ci
            npm run build:prod
            sudo systemctl reload nginx
```

## Maintenance

### 1. Sauvegarde
- Sauvegarder régulièrement les données
- Versionner les déploiements

### 2. Monitoring
- Surveiller les logs d'erreur
- Monitorer les performances
- Vérifier la disponibilité du service

### 3. Mises à jour
- Maintenir les dépendances à jour
- Tester en staging avant production
- Planifier les fenêtres de maintenance 
