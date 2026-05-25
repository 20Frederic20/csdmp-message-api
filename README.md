# CSDMP Message API

API de messagerie asynchrone avec architecture clean et gestion des emails via queue BullMQ.

## 🏗️ Architecture

Le projet suit une architecture clean avec séparation des responsabilités :

```
src/
├── domain/                 # Cœur métier
│   ├── entities/          # Entités de domaine
│   └── gateways/          # Interfaces des ports
├── infrastructure/         # Implémentations techniques
│   ├── gateways/         # Adapters (SMTP, etc.)
│   └── queue/            # Gestion des queues
├── presentation/          # API REST
│   └── controllers/      # Contrôleurs
└── use-cases/            # Logique métier
```

## 🚀 Fonctionnalités

- **Envoi d'emails asynchrone** via queue BullMQ
- **Gestion des erreurs** avec tentatives de retry
- **Configuration flexible** via variables d'environnement
- **Architecture scalable** avec séparation des couches

## 📋 Prérequis

- Node.js 18+
- Redis server
- pnpm (recommandé)

## 🛠️ Installation

```bash
# Cloner le projet
git clone <repository-url>
cd csdmp-message-api

# Installer les dépendances
pnpm install

# Démarrer Redis
sudo service redis-server start

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations
```

## ⚙️ Configuration

Variables d'environnement requises :

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (Gmail exemple)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre-email@gmail.com
MAIL_PASS=votre-mot-de-passe-app
```

## 🏃‍♂️ Démarrage

```bash
# Développement
pnpm dev

# Production
pnpm build
pnpm start
```

## 📡 API Endpoint

### POST /api/notify/email

Envoie un email de manière asynchrone.

**Corps de la requête :**

```json
{
  "to": "destinataire@example.com",
  "subject": "Sujet de l'email",
  "body": "Contenu de l'email"
}
```

**Réponse :**

```json
{
  "message": "Notification mise en attente pour envoi",
  "recipient": "destinataire@example.com"
}
```

## 🔧 Scripts disponibles

- `pnpm dev` : Démarrage en mode développement avec hot-reload
- `pnpm build` : Compilation TypeScript
- `pnpm start` : Démarrage en production
- `pnpm lint` : Vérification du code
- `pnpm lint:fix` : Correction automatique
- `pnpm format` : Formatage du code

## 📊 Monitoring

L'API utilise BullMQ pour la gestion des queues. Vous pouvez surveiller :

- Les jobs en attente
- Les traitements en cours
- Les erreurs et tentatives de retry

## 🛡️ Sécurité

- Variables d'environnement pour les configurations sensibles
- Validation des entrées utilisateur
- Gestion des erreurs sans exposition d'informations sensibles

## 🧪 Tests

```bash
# Lancer les tests
pnpm test

# Tests avec couverture
pnpm test:coverage
```

## 📝 Développement

### Architecture Clean

1. **Domain** : Logique métier pure, sans dépendances externes
2. **Use Cases** : Cas d'utilisation orchestrant le domaine
3. **Infrastructure** : Implémentations techniques (SMTP, Redis)
4. **Presentation** : API REST et contrôleurs

### Bonnes pratiques

- Injection de dépendances manuelle
- Séparation des responsabilités
- Configuration externalisée
- Gestion des erreurs robuste

## 🤝 Contribuer

1. Forker le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser la branche
5. Créer une Pull Request

## 📄 Licence

ISC
