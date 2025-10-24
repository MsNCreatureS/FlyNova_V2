# 📋 PIREP Validation Feature

## Vue d'ensemble

La fonctionnalité de validation des PIREPs (Pilot Reports) permet aux administrateurs et propriétaires de Virtual Airlines de valider les rapports de vol soumis par leurs pilotes. Cette page affiche toutes les données télémétriques du vol, y compris une carte interactive du trajet.

## Accès

### Pour les Admins/Owners uniquement
- **Depuis la page VA principale** : Bouton "📋 Validate PIREPs" (jaune)
- **Depuis la page Management** : Lien "📋 PIREPs" dans les onglets

## Fonctionnalités

### 1. Liste des PIREPs
- **Filtres par statut** :
  - ⏳ **Pending** : En attente de validation
  - ✅ **Approved** : Approuvés
  - ❌ **Rejected** : Rejetés
  - 📊 **All** : Tous les rapports

### 2. Informations affichées par PIREP
- Numéro de vol
- Nom du pilote (avec lien vers profil)
- Aéroports de départ/arrivée (ICAO)
- Durée du vol
- Distance parcourue
- Taux d'atterrissage (Landing Rate)
- Immatriculation et type d'avion
- Points attribués (si approuvé)
- Statut de validation
- Date de soumission

### 3. Vue détaillée d'un PIREP

Cliquez sur un PIREP pour voir tous les détails :

#### 📍 Informations de Route
- Aéroport de départ avec nom complet
- Aéroport d'arrivée avec nom complet
- Avion utilisé (immatriculation et type)

#### ⏱️ Performance du Vol
- Durée totale du vol
- Distance parcourue (en NM)
- Carburant consommé (en lbs)
- **Landing Rate** avec code couleur :
  - 🟢 Vert : < 100 fpm (excellent)
  - 🟡 Jaune : 100-200 fpm (bon)
  - 🔴 Rouge : > 200 fpm (dur)

#### 🗺️ Carte Interactive du Trajet
- Visualisation du trajet complet avec Leaflet
- Points de départ et d'arrivée marqués
- Waypoints du vol affichés
- Style aviation (thème sombre)
- Zoom et navigation interactifs

#### 📊 Télémétrie Détaillée
- Altitude maximale atteinte
- Vitesse maximale
- Vitesse moyenne
- Autres données de performance

### 4. Validation des PIREPs

Pour les rapports en attente (Pending) :

#### Options de validation
- **✅ Approve** : Approuver le vol
- **❌ Reject** : Rejeter le vol

#### Paramètres d'approbation
- **Points Awarded** : Nombre de points à attribuer au pilote
  - Calcul automatique par défaut basé sur :
    - Base : 100 points
    - Bonus distance : +50 pts (>500 NM), +100 pts (>1000 NM)
    - Bonus atterrissage : +50 pts (<100 fpm), +100 pts (<50 fpm)
- **Admin Notes** : Notes ou feedback pour le pilote (optionnel)

#### Actions automatiques lors de l'approbation
- ✅ Attribution des points au pilote
- 📈 Incrémentation du compteur de vols
- ⏱️ Ajout des heures de vol au total
- 📅 Enregistrement de la date de validation

## API Endpoints

### GET `/flights/va/:vaId/reports`
Récupère tous les rapports de vol d'une VA

**Query Parameters:**
- `status` : 'pending', 'approved', 'rejected', ou 'all'

**Authentification:** Requise (Admin/Owner uniquement)

**Retourne:**
```json
{
  "reports": [
    {
      "id": 1,
      "flight_id": 123,
      "flight_number": "FLY001",
      "pilot_username": "john_doe",
      "departure_icao": "LFPG",
      "arrival_icao": "KJFK",
      "flight_duration": 480,
      "distance_flown": 3625.5,
      "landing_rate": -145.2,
      "telemetry_data": {...},
      "validation_status": "pending",
      ...
    }
  ]
}
```

### GET `/flights/reports/:reportId`
Récupère les détails d'un rapport spécifique

**Authentification:** Requise (Admin/Owner uniquement)

### PUT `/flights/reports/:reportId/validate`
Valide (approuve ou rejette) un rapport de vol

**Body:**
```json
{
  "validation_status": "approved",
  "admin_notes": "Excellent flight!",
  "points_awarded": 250
}
```

**Authentification:** Requise (Admin/Owner uniquement)

## Structure de la base de données

### Table `flight_reports`
```sql
- id: INT (PRIMARY KEY)
- flight_id: INT (FOREIGN KEY)
- validation_status: ENUM('pending', 'approved', 'rejected')
- admin_id: INT (validateur)
- admin_notes: TEXT
- actual_departure_time: TIMESTAMP
- actual_arrival_time: TIMESTAMP
- flight_duration: INT (minutes)
- distance_flown: DECIMAL(10,2)
- fuel_used: DECIMAL(10,2)
- landing_rate: DECIMAL(6,2) (fpm)
- telemetry_data: JSON
- points_awarded: INT
- created_at: TIMESTAMP
- validated_at: TIMESTAMP
```

### Structure des données télémétriques (JSON)
```json
{
  "max_altitude": 37000,
  "max_speed": 485,
  "telemetry_points": [
    {
      "latitude": 48.8566,
      "longitude": 2.3522,
      "altitude": 35000,
      "groundSpeed": 450,
      "verticalSpeed": 1500,
      "heading": 270,
      "fuel": 25000,
      "phase": "Cruise",
      "onGround": false,
      "timestamp": "2025-10-24T10:30:00Z"
    }
  ]
}
```

## Logo de la VA

Le logo de la compagnie virtuelle est affiché en haut de la page pour une identification visuelle claire. Il est automatiquement récupéré depuis les données de la VA.

## Améliorations futures possibles

1. **Statistiques de validation**
   - Taux d'approbation
   - Points moyens attribués
   - Graphiques de performance

2. **Filtres avancés**
   - Par pilote
   - Par période
   - Par route

3. **Notifications**
   - Email au pilote lors de la validation
   - Notifications in-app

4. **Comparaison de vols**
   - Comparer plusieurs PIREPs
   - Classements mensuels

5. **Export de données**
   - Export CSV/Excel des rapports
   - Rapports détaillés

## Support

Pour toute question ou problème, contactez l'équipe de développement FlyNova.

---

*Dernière mise à jour : 24 octobre 2025*
