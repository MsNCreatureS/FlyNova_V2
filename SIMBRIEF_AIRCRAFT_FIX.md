# Fix: "Unknown aircraft type" - SimBrief Error

## 🔍 Problème

SimBrief retourne l'erreur **"Unknown aircraft type"** lors de la génération du plan de vol.

## ✅ Cause

Le code ICAO de l'avion (`aircraft_type` dans `va_fleet`) est soit :
- ❌ Vide/NULL
- ❌ Invalide (pas reconnu par SimBrief)
- ❌ Au mauvais format

## 🔧 Solution Appliquée

### 1. Backend - Requête SQL Mise à Jour

**Fichier** : `server/routes/flights.js`

```javascript
// Ajout de aircraft_icao dans la requête
SELECT 
  f.*,
  vr.flight_number,
  vr.departure_icao,
  vr.departure_name,
  vr.arrival_icao,
  vr.arrival_name,
  vfl.registration as aircraft_registration,
  vfl.aircraft_name,
  vfl.aircraft_type as aircraft_icao  // ✅ Code ICAO récupéré depuis la DB
```

### 2. Frontend - Utilisation du Code ICAO

**Fichier** : `src/app/va/[id]/pilot/briefing/[flightId]/page.tsx`

```typescript
// Utilisation du code ICAO de la base de données
const aircraftType = flight.aircraft_icao || extractAircraftICAO(flight.aircraft_name);

// Validation avant envoi à SimBrief
if (!aircraftType || aircraftType.length < 3) {
  alert('Code ICAO de l\'avion invalide');
  return;
}
```

## 📋 Étapes pour Corriger

### Étape 1 : Vérifier vos codes ICAO

Exécutez cette requête SQL dans phpMyAdmin :

```sql
SELECT 
    id,
    registration,
    aircraft_type,
    aircraft_name
FROM va_fleet
ORDER BY aircraft_name;
```

### Étape 2 : Identifier les codes manquants/invalides

```sql
SELECT 
    id,
    registration,
    aircraft_type,
    aircraft_name
FROM va_fleet
WHERE aircraft_type IS NULL 
   OR aircraft_type = '' 
   OR LENGTH(aircraft_type) < 3;
```

### Étape 3 : Mettre à jour les codes ICAO

Utilisez le fichier `fix-aircraft-icao-codes.sql` fourni ou exécutez directement :

```sql
-- Exemple : Mettre à jour tous les Boeing 737-800
UPDATE va_fleet 
SET aircraft_type = 'B738' 
WHERE aircraft_name LIKE '%737-800%';

-- Exemple : Mettre à jour tous les Airbus A320
UPDATE va_fleet 
SET aircraft_type = 'A320' 
WHERE aircraft_name LIKE '%A320%';
```

## 📖 Codes ICAO Courants

### Boeing
| Avion | Code ICAO |
|-------|-----------|
| Boeing 737-700 | `B737` |
| Boeing 737-800 | `B738` |
| Boeing 737-900 | `B739` |
| Boeing 737 MAX 8 | `B38M` |
| Boeing 747-400 | `B744` |
| Boeing 777-200 | `B772` |
| Boeing 777-300ER | `B77W` |
| Boeing 787-8 | `B788` |
| Boeing 787-9 | `B789` |

### Airbus
| Avion | Code ICAO |
|-------|-----------|
| Airbus A318 | `A318` |
| Airbus A319 | `A319` |
| Airbus A320 | `A320` |
| Airbus A321 | `A321` |
| Airbus A320neo | `A20N` |
| Airbus A330-200 | `A332` |
| Airbus A330-300 | `A333` |
| Airbus A350-900 | `A359` |
| Airbus A380-800 | `A388` |

### Autres
| Avion | Code ICAO |
|-------|-----------|
| Embraer E-190 | `E190` |
| Bombardier CRJ-900 | `CRJ9` |
| ATR 72 | `AT72` |
| Dash 8-Q400 | `DH8D` |

## 🧪 Test

1. **Mettre à jour les codes ICAO** dans votre DB
2. **Redémarrer le serveur backend** :
   ```powershell
   cd c:\wamp64\www\FlyNova\server
   node index.js
   ```
3. **Tester la génération** d'un plan de vol
4. **Vérifier la console** pour voir le code ICAO envoyé :
   ```
   Console → aircraftType: "B738"
   ```

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. Allez sur une page de briefing
2. Ouvrez la console du navigateur (F12)
3. Cliquez sur "Generate with SimBrief"
4. Vérifiez qu'aucune erreur "Unknown aircraft type" n'apparaît
5. Le popup SimBrief devrait s'ouvrir normalement

## 🔗 Ressources

- **Documentation ICAO** : https://www.icao.int/publications/DOC8643/
- **SimBrief Aircraft Database** : https://www.simbrief.com/system/aircraft.php
- **Script de correction** : `fix-aircraft-icao-codes.sql`

---

**Date** : 23 octobre 2025  
**Status** : ✅ RÉSOLU
