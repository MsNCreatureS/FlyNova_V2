# Changelog - Modifications de la Base de Données

## Changements récents (22 Oct 2025)

### 1. **Table `va_routes`** - Restructuration complète

#### ❌ Colonnes supprimées :
- `departure_airport_id` (INT)
- `arrival_airport_id` (INT)
- `aircraft_id` (INT)
- `distance` (INT)
- `duration` (INT)

#### ✅ Colonnes ajoutées :
- `route_type` ENUM('Civil', 'Cargo', 'Private') DEFAULT 'Civil'
- `departure_icao` VARCHAR(4)
- `departure_name` VARCHAR(255)
- `arrival_icao` VARCHAR(4)
- `arrival_name` VARCHAR(255)
- `aircraft_type` VARCHAR(50)

**Migration SQL :** `database/schema.sql` (version mise à jour)

---

### 2. **Table `va_fleet`** - Simplification

#### ❌ Colonnes supprimées :
- `aircraft_id` (INT + FK vers aircraft)
- `home_airport_id` (INT + FK vers airports)

#### ✅ Colonnes ajoutées :
- `aircraft_type` VARCHAR(50) NOT NULL
- `aircraft_name` VARCHAR(255) NOT NULL
- `home_airport` VARCHAR(4) - Code ICAO direct

**Raison :** Éviter les contraintes FK inutiles, utiliser directement les codes ICAO

---

### 3. **Table `va_members`** - Rôles en majuscules

#### Anciens rôles (minuscules) :
- `owner`, `admin`, `pilot`, `member`

#### ✅ Nouveaux rôles (majuscules) :
- `Owner`, `Admin`, `Pilot`, `Member`

**Script de correction :** `fix-permissions.sql`

---

## Fichiers Backend modifiés

### `server/routes/fleet.js`
- ✅ GET `/:vaId` - Requête simplifiée sans JOINs
- ✅ POST `/:vaId` - Accepte `aircraft_type`, `aircraft_name`, `home_airport`
- ✅ PUT `/:vaId/:fleetId` - Utilise `home_airport` au lieu de `home_airport_id`
- ✅ Rôles mis à jour : `['Owner', 'Admin']`

### `server/routes/routes.js`
- ✅ POST `/:vaId` - Nouvelle structure avec `route_type`, codes ICAO
- ✅ DELETE - Rôles mis à jour

### `server/routes/profile.js`
- ✅ Requête flights - Utilise directement `vr.departure_icao` et `vr.arrival_icao`
- ✅ Suppression des JOINs avec airports

---

## Fichiers Frontend modifiés

### `src/app/va/[id]/manage/page.tsx`
- ✅ Traduction complète en anglais
- ✅ Interface `Route` mise à jour avec `route_type`
- ✅ Formulaire de route avec select `route_type` (Civil/Cargo/Private)
- ✅ Composant `AircraftSearch` intégré pour routes ET flotte
- ✅ Badges colorés pour les types de routes
- ✅ Suppression de `distance` et `duration`

### `src/components/AircraftSearch.tsx`
- ✅ Nouveau composant créé
- ✅ Recherche dans la table `aircraft`
- ✅ Autocomplete avec ICAO/IATA codes
- ✅ Pattern identique à `AirportSearch`

---

## API Backend ajoutée

### `server/routes/aircraft.js` (NOUVEAU)
- ✅ GET `/api/aircraft/search?q=term` - Recherche d'avions
- ✅ GET `/api/aircraft` - Liste complète (limit 100)

### Routes enregistrées dans `server/index.js`
```javascript
const aircraftRoutes = require('./routes/aircraft');
app.use('/api/aircraft', aircraftRoutes);
```

---

## Instructions de migration

### Option 1 : Nouvelle installation propre (RECOMMANDÉ)
1. Sauvegarder les données importantes (si nécessaire)
2. Supprimer la base `flynova`
3. Créer une nouvelle base `flynova`
4. Importer `database/schema.sql`
5. Importer `aircraft.csv` et `airports.csv`

### Option 2 : Migration des données existantes
1. Exécuter `fix-permissions.sql` pour vérifier les permissions
2. Migrer manuellement les données de `va_routes` si tu as des routes existantes
3. Migrer les données de `va_fleet` si tu as des avions

---

## Tests à effectuer

### ✅ Checklist après migration :

1. **Authentification**
   - [ ] Login fonctionne
   - [ ] Token JWT valide
   - [ ] Profil utilisateur accessible

2. **Virtual Airlines**
   - [ ] Création de VA
   - [ ] Owner est automatiquement membre avec rôle 'Owner'
   - [ ] Upload de logo fonctionne
   - [ ] Édition de VA (owner uniquement)

3. **Fleet Management**
   - [ ] Recherche d'avions avec autocomplete
   - [ ] Ajout d'avion à la flotte
   - [ ] Affichage de la flotte
   - [ ] Suppression d'avion

4. **Routes Management**
   - [ ] Recherche d'aéroports (départ/arrivée)
   - [ ] Recherche d'avions
   - [ ] Sélection du type de route (Civil/Cargo/Private)
   - [ ] Création de route
   - [ ] Affichage avec badges colorés
   - [ ] Suppression de route

5. **Permissions**
   - [ ] Owner peut tout faire
   - [ ] Admin peut gérer flotte et routes
   - [ ] Member ne peut pas gérer
   - [ ] Non-membre ne peut pas accéder

---

## Problèmes connus et solutions

### Erreur: "Insufficient permissions"
**Cause :** Rôles en minuscules dans la DB, backend attend majuscules  
**Solution :** Exécuter les UPDATE dans `fix-permissions.sql`

### Erreur: "Not a member of this Virtual Airline"
**Cause :** Pas d'entrée dans `va_members` pour l'owner  
**Solution :** Vérifier avec les SELECT dans `fix-permissions.sql`, ajouter manuellement si besoin

### Erreur: "User not found" sur profil
**Cause :** Requête SQL avec anciennes colonnes (airport_id au lieu de icao)  
**Solution :** Backend `profile.js` déjà corrigé, redémarrer le serveur

### Erreur: Cannot drop column (FK constraint)
**Cause :** Contraintes de clés étrangères existantes  
**Solution :** Supprimer FK avant les colonnes, ou recréer la base proprement

---

## Maintenance future

### Ajouter un nouveau type de route :
```sql
ALTER TABLE va_routes 
MODIFY COLUMN route_type ENUM('Civil', 'Cargo', 'Private', 'Charter') DEFAULT 'Civil';
```

### Ajouter un nouveau rôle :
```sql
ALTER TABLE va_members 
MODIFY COLUMN role ENUM('Owner', 'Admin', 'Pilot', 'Member', 'Instructor') DEFAULT 'Member';
```

---

**Date de dernière modification :** 22 octobre 2025  
**Version DB Schema :** 2.0  
**Compatibilité :** Breaking changes - migration requise
