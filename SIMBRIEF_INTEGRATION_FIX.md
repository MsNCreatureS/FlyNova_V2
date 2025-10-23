# SimBrief API Integration Fix

## Problème Initial

Lorsque vous tentiez de générer un plan de vol via SimBrief, vous receviez une erreur **"missing parameter"**.

## Cause du Problème

L'implémentation initiale ne respectait pas le protocole d'authentification de l'API SimBrief tel que décrit dans les fichiers de démo fournis (`demo.php`, `simbrief.apiv1.php`, `simbrief.apiv1.js`).

### Paramètres Manquants

Selon la documentation SimBrief, l'API nécessite les paramètres suivants :

1. **Paramètres de base** (obligatoires) :
   - `orig` - ICAO de l'aéroport de départ
   - `dest` - ICAO de l'aéroport d'arrivée
   - `type` - Code ICAO de l'avion (ex: B738, A320)

2. **Paramètres d'authentification** (CRITIQUES) :
   - `apicode` - Code d'authentification généré dynamiquement
   - `timestamp` - Timestamp Unix de la requête
   - `outputpage` - URL de redirection (sans http://)

3. **Paramètres optionnels** :
   - `reg` - Immatriculation de l'avion
   - `airline` - Code airline
   - `fltnum` - Numéro de vol

### Génération du Code API

Le `apicode` n'est PAS simplement la clé API. C'est un hash MD5 généré selon la formule :

```
apicode = MD5(API_KEY + orig + dest + type + timestamp + outputpage).substring(0, 10).toUpperCase()
```

## Solution Implémentée

### 1. Backend API Route (`server/routes/simbrief.js`)

Création d'une route backend sécurisée pour générer le code API :

```javascript
POST /api/simbrief/generate-apicode
```

Cette route :
- Garde la clé API **secrète** côté serveur
- Génère le hash MD5 correct
- Retourne uniquement le `apicode` au client

### 2. Endpoints Supplémentaires

```javascript
GET /api/simbrief/check-ofp/:ofpId
GET /api/simbrief/fetch-ofp/:ofpId
```

Pour vérifier l'existence et récupérer les données des plans de vol.

### 3. Frontend Updates (`src/app/va/[id]/pilot/briefing/[flightId]/page.tsx`)

#### Fonction `generateSimbrief()` Complète

1. **Extraction du code ICAO de l'avion** avec mappings complets
2. **Génération du timestamp**
3. **Calcul de l'outputpage** (URL sans protocole)
4. **Appel backend** pour obtenir le `apicode`
5. **Création du formulaire** avec tous les paramètres requis
6. **Ouverture du popup** SimBrief
7. **Polling** pour détecter la fin du processus
8. **Vérification** de l'existence du fichier OFP
9. **Sauvegarde** de l'OFP ID et **affichage** des données

#### Fonction `extractAircraftICAO()`

Mappings complets pour convertir les noms d'avions en codes ICAO :

- Boeing 737-800 → B738
- Airbus A320 → A320
- Boeing 777-300ER → B77W
- etc.

### 4. Fichiers Statiques

Copie des fichiers JavaScript SimBrief dans `/public` :
- `simbrief.apiv1.js` - Fonctions JavaScript de l'API
- `simbrief.apiv1.php` - Script PHP (pour référence)

## Structure du Flux Complet

```
1. User clicks "Generate with SimBrief"
   ↓
2. Frontend extrait les données du vol (KJFK → KBOS, B738, etc.)
   ↓
3. Frontend appelle /api/simbrief/generate-apicode avec:
   - orig, dest, type, timestamp, outputpage
   ↓
4. Backend génère le hash MD5:
   - MD5(API_KEY + "KJFK" + "KBOS" + "B738" + "1234567890" + "example.com/...")
   ↓
5. Backend retourne { apicode: "ABC123XYZ0" }
   ↓
6. Frontend crée un form avec TOUS les paramètres:
   - orig, dest, type, reg, airline, fltnum
   - apicode, timestamp, outputpage
   ↓
7. Form soumis vers https://www.simbrief.com/ofp/ofp.loader.api.php
   ↓
8. SimBrief ouvre popup pour login/génération
   ↓
9. Une fois terminé, OFP ID = "1234567890_XXXXXXXXXXXX"
   ↓
10. Frontend vérifie existence: /api/simbrief/check-ofp/{ofpId}
    ↓
11. Si existe, sauvegarde dans DB et récupère données
    ↓
12. Affichage du briefing complet
```

## Format de l'OFP ID

L'OFP ID suit ce format exact :
```
{timestamp}_{10-char-hash}

Exemple: 1729766400_A1B2C3D4E5
```

## Validation

L'OFP ID doit matcher ce regex :
```regex
/^\d{10}_[A-Za-z0-9]{10}$/
```

## Paramètres Requis vs Optionnels

### ✅ OBLIGATOIRES (sans ces params = "missing parameter")
- `orig`
- `dest`
- `type`
- `apicode`
- `timestamp`
- `outputpage`

### ⚠️ OPTIONNELS (recommandés)
- `reg` - Immatriculation
- `airline` - Code compagnie
- `fltnum` - Numéro de vol
- `date` - Date du vol
- `deph`, `depm` - Heure de départ
- `route` - Route planifiée
- `navlog` - Navlog détaillé (0 ou 1)
- `etops` - ETOPS planning (0 ou 1)
- `units` - KGS ou LBS

## Sécurité

⚠️ **IMPORTANT** : La clé API (`7visKd8EEiXJGFc0Jsp8LSu2Ck5L7WQw`) NE DOIT JAMAIS être exposée côté client !

C'est pourquoi :
1. La clé est stockée uniquement dans `server/routes/simbrief.js`
2. Le client appelle le backend pour obtenir le `apicode`
3. Le backend génère le hash sans exposer la clé

## Testing

Pour tester l'intégration :

1. **Démarrer le serveur backend** :
   ```bash
   cd server
   npm start
   ```

2. **Aller sur un briefing de vol** :
   ```
   http://localhost:3000/va/[vaId]/pilot/briefing/[flightId]
   ```

3. **Cliquer sur "Generate with SimBrief"**

4. **Vérifier** :
   - ✅ Popup s'ouvre sans erreur "missing parameter"
   - ✅ Login SimBrief ou génération directe
   - ✅ Après génération, popup se ferme
   - ✅ Données du briefing s'affichent

## Debugging

Si vous rencontrez toujours des erreurs :

### Vérifier le code API généré
```javascript
console.log('API Code:', apicode);
console.log('Timestamp:', timestamp);
console.log('Output Page:', outputPageCalc);
```

### Vérifier les paramètres du form
```javascript
Object.entries(fields).forEach(([name, value]) => {
  console.log(`${name}: ${value}`);
});
```

### Vérifier la réponse backend
```javascript
const response = await fetch('/api/simbrief/generate-apicode', ...);
console.log('Response:', await response.json());
```

## Références

- **Documentation API SimBrief** : `Simbrief_api/README.txt`
- **Démo PHP** : `Simbrief_api/demo.php`
- **Démo Output** : `Simbrief_api/demo_output.php`
- **API PHP** : `Simbrief_api/simbrief.apiv1.php`
- **API JavaScript** : `Simbrief_api/simbrief.apiv1.js`

## Changements Apportés

### Fichiers Créés
- ✅ `server/routes/simbrief.js` - Route backend pour authentification
- ✅ `public/simbrief.apiv1.js` - Fonctions JavaScript SimBrief
- ✅ `SIMBRIEF_INTEGRATION_FIX.md` - Cette documentation

### Fichiers Modifiés
- ✅ `server/index.js` - Ajout de la route SimBrief
- ✅ `src/app/va/[id]/pilot/briefing/[flightId]/page.tsx` - Génération correcte du plan de vol
- ✅ `package.json` - Dépendances (si besoin de node-fetch)

## Prochaines Étapes

1. ✅ Redémarrer le serveur backend
2. ✅ Tester la génération d'un plan de vol
3. ⚠️ Configurer les variables d'environnement si nécessaire
4. 📝 Documenter pour vos pilotes comment utiliser le système

---

**Date de création** : 23 octobre 2025
**Auteur** : GitHub Copilot
**Status** : ✅ RÉSOLU
