# 📋 Dashboard Pilote - Documentation

## Vue d'ensemble

Le **Dashboard Pilote** est une interface complète pour les membres et pilotes d'une compagnie aérienne virtuelle (VA). Il permet de gérer tous les aspects du vol, de la réservation au briefing avec SimBrief.

## 🎯 Fonctionnalités

### 1. **Dashboard Principal** (`/va/[id]/pilot/dashboard`)

Le dashboard principal affiche :
- ✈️ **Statistiques du pilote**
  - Total des vols effectués
  - Heures de vol accumulées
  - Points gagnés
  - Rang dans la VA

- 🎯 **Événements actifs**
  - Événements en cours de la VA
  - Focus airports
  - Challenges et compétitions
  - Points bonus disponibles

- 🌍 **Vols en direct**
  - Liste des vols actuellement en cours par d'autres pilotes
  - Informations de route et d'avion
  - Statut en temps réel

### 2. **Réservation de Vol** (`/va/[id]/pilot/book-flight`)

Interface de réservation intuitive :
- 🔍 **Recherche et filtres**
  - Recherche par numéro de vol, aéroport, etc.
  - Filtrage par type de route (Civil, Cargo, Private)

- 🎫 **Sélection de route**
  - Affichage visuel des routes disponibles
  - Informations détaillées (départ, arrivée, type d'avion)
  
- ✈️ **Sélection d'avion**
  - Liste des avions disponibles de la flotte
  - Filtrage automatique selon le type requis
  - Informations sur l'immatriculation et base

### 3. **Briefing de Vol** (`/va/[id]/pilot/briefing/[flightId]`)

Page de briefing complète avec intégration SimBrief :

#### 📊 Informations générales
- Distance (Great Circle et route complète)
- Temps de vol estimé
- Altitude de croisière
- Vents moyens
- Statut ETOPS

#### 🗺️ Route et Navigation
- Route complète affichée
- Aéroport de dégagement
- Carte de vol SimBrief

#### 🌤️ Météo
- METAR de départ
- METAR d'arrivée
- Conditions actuelles

#### ⛽ Carburant
- Carburant à bord (ramp)
- Carburant au décollage
- Carburant à l'atterrissage
- Réserves et contingence
- Flux moyen

#### ⚖️ Poids
- Zero Fuel Weight (ZFW)
- Takeoff Weight (TOW)
- Landing Weight (LDW)
- Limites maximales

#### 📡 Instructions Tracker
- Guide étape par étape pour démarrer le vol
- Lien vers le téléchargement du tracker
- Bouton pour marquer le vol comme démarré

## 🔌 Intégration SimBrief API

### Configuration

La clé API SimBrief est configurée dans le code :
```javascript
const SIMBRIEF_API_KEY = '7visKd8EEiXJGFc0Jsp8LSu2Ck5L7WQw';
```

### Processus de génération

1. L'utilisateur clique sur "Generate with SimBrief"
2. Une fenêtre popup s'ouvre avec le formulaire SimBrief
3. SimBrief génère le plan de vol
4. L'utilisateur entre l'OFP ID
5. Les données sont récupérées via l'API XML de SimBrief
6. Affichage complet des données dans l'interface

### API Endpoints utilisés

- **Génération** : `https://www.simbrief.com/ofp/ofp.loader.api.php`
- **Récupération** : `https://www.simbrief.com/api/xml.fetcher.php?ofp_id={id}&json=1`
- **Carte** : `https://www.simbrief.com/ofp/flightplans/{directory}/map.png`

### Ressources SimBrief supplémentaires

- [Importing latest OFP data](https://forum.navigraph.com/t/fetching-a-users-latest-ofp-data/5297)
- [Dispatch redirect guide](https://forum.navigraph.com/t/dispatch-redirect-guide/5299)
- [Supported aircraft types](https://forum.navigraph.com/t/getting-currently-supported-aircraft-layout-options/5296)

## 🗄️ Base de Données

### Migration requise

Pour activer les fonctionnalités SimBrief, exécutez :

```sql
-- Fichier: add-simbrief-to-flights.sql
ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS simbrief_ofp_id VARCHAR(50) NULL COMMENT 'SimBrief OFP ID for flight plan';

ALTER TABLE flights 
ADD INDEX IF NOT EXISTS idx_simbrief (simbrief_ofp_id);
```

### Structure modifiée

Table `flights` :
- Ajout du champ `simbrief_ofp_id` pour stocker l'ID du plan de vol SimBrief

## 🛣️ Routes API Backend

### Events
- `GET /events/va/:vaId/active` - Récupérer les événements actifs d'une VA

### Flights
- `GET /flights/:flightId` - Détails d'un vol
- `POST /flights/book` - Réserver un vol
- `PUT /flights/:flightId/simbrief` - Sauvegarder l'OFP ID SimBrief
- `PUT /flights/:flightId/start` - Démarrer un vol
- `GET /flights/va/:vaId/active` - Vols actifs d'une VA

### Virtual Airlines
- `GET /virtual-airlines/:vaId/my-stats` - Statistiques du pilote dans la VA

## 📁 Structure des Fichiers

```
src/app/va/[id]/pilot/
├── dashboard/
│   └── page.tsx           # Dashboard principal pilote
├── book-flight/
│   └── page.tsx           # Page de réservation
└── briefing/
    └── [flightId]/
        └── page.tsx       # Page de briefing avec SimBrief

server/routes/
├── events.js              # Routes événements (modifiée)
├── flights.js             # Routes vols (modifiée)
└── virtualAirlines.js     # Routes VA (modifiée)

database/
└── schema.sql             # Schéma mis à jour

Simbrief_api/
├── README.txt             # Documentation API SimBrief
├── simbrief.apiv1.js      # Fonctions JavaScript SimBrief
└── simbrief.apiv1.php     # Fonctions PHP SimBrief
```

## 🚀 Utilisation

### Pour les Pilotes

1. **Accéder au dashboard** : Rejoindre une VA puis aller sur `/va/[id]/pilot/dashboard`
2. **Réserver un vol** : Cliquer sur "Book a Flight" → Choisir une route → Sélectionner un avion
3. **Générer le briefing** : Cliquer sur "Generate with SimBrief" sur la page de briefing
4. **Démarrer le vol** : Lancer le tracker et marquer le vol comme démarré
5. **Voler** : Suivre le plan de vol et profiter !

### Pour les Administrateurs

Les administrateurs peuvent :
- Créer et gérer des événements depuis `/va/[id]/manage`
- Voir les vols en cours de tous les pilotes
- Gérer la flotte et les routes

## 🎨 Personnalisation

### Couleurs et Styles
Les composants utilisent Tailwind CSS avec des classes personnalisées :
- `btn-primary` : Bouton principal aviation
- `btn-secondary` : Bouton secondaire
- `card` : Carte avec ombre et arrondi
- Couleurs aviation : `aviation-50` à `aviation-900`

### Animations
Utilise Framer Motion pour des animations fluides :
- Fade in/out
- Scale
- Slide

## ⚠️ Notes Importantes

1. **Popups** : Les utilisateurs doivent autoriser les popups pour SimBrief
2. **CORS** : L'API SimBrief peut nécessiter une configuration CORS
3. **Authentification** : Toutes les routes nécessitent un token JWT valide
4. **Membership** : L'utilisateur doit être membre de la VA pour réserver des vols

## 🔄 Prochaines Étapes

Fonctionnalités futures possibles :
- [ ] Import automatique du dernier OFP SimBrief
- [ ] Redirection vers SimBrief avec options pré-remplies
- [ ] Tracking en temps réel sur une carte
- [ ] Statistiques avancées par pilote
- [ ] Système de classement et badges
- [ ] Notifications pour les événements

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation SimBrief : [SimBrief API Forum](https://forum.navigraph.com/t/the-simbrief-api/5298)
- Vérifier les logs du serveur pour les erreurs API
- S'assurer que la clé API SimBrief est valide

---

**Date de création** : 23 octobre 2025  
**Version** : 1.0.0  
**Auteur** : FlyNova Development Team
