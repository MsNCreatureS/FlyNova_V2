# SimBrief API Debug Guide

## Problème "Invalid API key!"

### Cause
Le hash MD5 était généré incorrectement. SimBrief attend :
- Hash complet (32 caractères)
- En minuscules (pas uppercase)
- Format exact : `MD5(API_KEY + orig + dest + type + timestamp + outputpage)`

### ❌ Ancien Code (INCORRECT)
```javascript
const apiString = SIMBRIEF_API_KEY + orig + dest + type + timestamp + outputpage;
const apicode = md5(apiString).toUpperCase().substring(0, 10);
```

### ✅ Nouveau Code (CORRECT)
```javascript
const api_req = orig + dest + type + timestamp + outputpage;
const apiString = SIMBRIEF_API_KEY + api_req;
const apicode = md5(apiString); // Full hash, lowercase
```

## Exemple de Calcul Correct

### Données d'entrée
```
API_KEY = "7visKd8EEiXJGFc0Jsp8LSu2Ck5L7WQw"
orig = "KJFK"
dest = "KBOS"
type = "B738"
timestamp = "1729766400"
outputpage = "localhost:3000/va/1/pilot/briefing/123"
```

### Étape 1 : Construire api_req
```
api_req = "KJFK" + "KBOS" + "B738" + "1729766400" + "localhost:3000/va/1/pilot/briefing/123"
api_req = "KJFKKBOSB7381729766400localhost:3000/va/1/pilot/briefing/123"
```

### Étape 2 : Construire apiString
```
apiString = "7visKd8EEiXJGFc0Jsp8LSu2Ck5L7WQw" + "KJFKKBOSB7381729766400localhost:3000/va/1/pilot/briefing/123"
```

### Étape 3 : Hash MD5
```javascript
apicode = md5(apiString) // Résultat : hash 32 caractères en minuscules
```

## Vérification dans le Code Backend

```javascript
// server/routes/simbrief.js
router.post('/generate-apicode', (req, res) => {
  const { orig, dest, type, timestamp, outputpage } = req.body;
  
  // Construire api_req (comme le JavaScript)
  const api_req = orig + dest + type + timestamp + outputpage;
  
  // Hash : MD5(API_KEY + api_req)
  const apiString = SIMBRIEF_API_KEY + api_req;
  const apicode = crypto.createHash('md5').update(apiString).digest('hex');
  // ⚠️ PAS de .toUpperCase() ni .substring()
  
  res.json({ apicode });
});
```

## Vérification dans le Code Frontend

```typescript
// src/app/va/[id]/pilot/briefing/[flightId]/page.tsx
const generateSimbrief = async () => {
  const timestamp = Math.round(Date.now() / 1000);
  
  // ⚠️ IMPORTANT : Retirer http:// (et https:// par sécurité)
  const outputPage = window.location.href.split('?')[0];
  const outputPageCalc = outputPage.replace('http://', '').replace('https://', '');
  
  // Appel backend pour obtenir apicode
  const { apicode } = await fetch('/api/simbrief/generate-apicode', {
    body: JSON.stringify({
      orig: "KJFK",
      dest: "KBOS", 
      type: "B738",
      timestamp: timestamp,
      outputpage: outputPageCalc
    })
  }).then(r => r.json());
  
  // Créer le form avec apicode, timestamp, outputpage
  const fields = {
    orig: "KJFK",
    dest: "KBOS",
    type: "B738",
    apicode: apicode,        // Hash MD5 complet
    timestamp: timestamp,     // Même timestamp
    outputpage: outputPageCalc // Même outputpage
  };
};
```

## Test Manuel

Pour tester si le hash est correct, vous pouvez utiliser ce code PHP :

```php
<?php
$api_key = '7visKd8EEiXJGFc0Jsp8LSu2Ck5L7WQw';
$api_req = 'KJFKKBOSB7381729766400localhost:3000/va/1/pilot/briefing/123';
$apicode = md5($api_key . $api_req);
echo $apicode; // Devrait matcher ce que retourne votre backend
?>
```

Ou en Node.js :

```javascript
const crypto = require('crypto');
const api_key = '7visKd8EEiXJGFc0Jsp8LSu2Ck5L7WQw';
const api_req = 'KJFKKBOSB7381729766400localhost:3000/va/1/pilot/briefing/123';
const apicode = crypto.createHash('md5').update(api_key + api_req).digest('hex');
console.log(apicode); // Devrait être un hash 32 chars lowercase
```

## Checklist de Débogage

Avant de tester :

- [ ] **Backend redémarré** après modification
- [ ] **Frontend rebuild** si nécessaire (`npm run build`)
- [ ] **Vérifier les logs backend** pour voir l'apicode généré
- [ ] **Vérifier la console browser** pour voir les paramètres envoyés

### Console Browser

Ajoutez des console.log dans votre frontend :

```typescript
console.log('Timestamp:', timestamp);
console.log('Output Page Calc:', outputPageCalc);
console.log('API Code:', apicode);
console.log('Form Fields:', fields);
```

### Logs Backend

Ajoutez des console.log dans votre backend :

```javascript
console.log('API Request:', { orig, dest, type, timestamp, outputpage });
console.log('API Req String:', api_req);
console.log('API Code Generated:', apicode);
```

## Erreurs Courantes

### ❌ "Invalid API key!"
- Hash généré incorrectement
- Vérifier : lowercase, 32 chars, pas de substring

### ❌ "Missing parameter"
- Un des champs requis est vide
- Vérifier : orig, dest, type, apicode, timestamp, outputpage

### ❌ OFP ID format incorrect
- Format attendu : `{timestamp}_{hash}`
- Exemple : `1729766400_a1b2c3d4e5`

## Solution Rapide

Si ça ne fonctionne toujours pas, vous pouvez utiliser directement le fichier PHP fourni :

1. Copier `Simbrief_api/simbrief.apiv1.php` dans votre dossier `public/`
2. Modifier le frontend pour utiliser ce fichier PHP au lieu du backend Node.js
3. Le PHP générera le hash correctement

Mais la solution backend est meilleure pour la sécurité !

---

**Date** : 23 octobre 2025
**Status** : ✅ Hash MD5 corrigé
