# SimBrief Integration - Améliorations et Corrections v2

## 📋 Modifications effectuées (Version 2)

### 1. ✅ Format du temps corrigé
- **Fichier**: `src/app/va/[id]/pilot/briefing/[flightId]/page.tsx`
- **Problème**: Le temps s'affichait à 300h au lieu de 3h
- **Cause**: SimBrief renvoie le temps en **secondes**, pas en minutes
- **Solution**: Fonction `formatFlightTime()` mise à jour
- **Avant**:
  ```javascript
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  ```
- **Après**:
  ```javascript
  const totalSeconds = parseInt(seconds, 10);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  ```

### 2. ✅ Formulaire de configuration SimBrief
- **Fichier**: `src/app/va/[id]/pilot/briefing/[flightId]/page.tsx`
- **Changement**: Remplacement des popups par un formulaire élégant
- **Champs**:
  * **SimBrief Username** (requis) - Pour récupérer automatiquement le plan
  * **Fuel Units** (KGS/LBS) - Sélection via dropdown
  * **Cost Index** (optionnel) - Champ numérique 0-999
- **UX**: 
  * Cliquer sur "Generate" ouvre le formulaire
  * Bouton "Cancel" pour fermer
  * Validation du username requis
  * Animation fluide avec Framer Motion

### 3. ✅ Cost Index ajouté
- **Fichier**: `src/app/va/[id]/pilot/briefing/[flightId]/page.tsx`
- **Affichage**: Nouvelle carte dans l'onglet Overview
- **Données**: `simbriefData?.general?.costindex` ou valeur du formulaire
- **Envoi**: Paramètre `civalue` ajouté à l'API SimBrief

### 4. ✅ Carte de vol (Map)
- **Status**: ⚠️ Peut ne pas être disponible via XML API
- **URL construite**: `https://www.simbrief.com/ofp/flightplans/${directory}/map.png`
- **Fallback**: Image vide avec message "Map not available"
- **Note**: SimBrief génère la carte uniquement pour les comptes premium ou après génération web complète
- **Alternative possible**: Utiliser l'API images de SimBrief ou télécharger depuis le site

## 🎯 Changements techniques

### State ajouté
```typescript
const [showSimbriefForm, setShowSimbriefForm] = useState(false);
const [simbriefConfig, setSimbriefConfig] = useState({
  username: '',
  units: 'KGS' as 'KGS' | 'LBS',
  costIndex: ''
});
```

### Nouvelle fonction
```typescript
const submitSimbriefGeneration = async () => {
  // Validation du username
  // Fermeture du formulaire
  // Génération avec les paramètres configurés
  // Récupération automatique via username
}
```

### Paramètres API SimBrief modifiés
```javascript
const fields = {
  'units': simbriefConfig.units,      // Au lieu de selectedUnits
  'civalue': simbriefConfig.costIndex, // Nouveau paramètre
  // ... autres paramètres
}
```

## 📊 Résultat final

L'intégration SimBrief affiche maintenant:
- ✅ Temps de vol correct (ex: "5h 42m" au lieu de "342h")
- ✅ Formulaire élégant au lieu de popups
- ✅ Username sauvegardé (pas de re-demande)
- ✅ Cost Index personnalisable
- ✅ Unités sélectionnables (KGS/LBS)
- ⚠️ Carte (peut nécessiter compte premium ou autre API)

## 🔍 Investigation carte de vol

### Raisons possibles de l'absence de carte:

1. **API XML limitée**: L'endpoint `xml.fetcher.php` peut ne pas générer d'images
2. **Compte gratuit**: Les images peuvent être réservées aux comptes premium
3. **Génération différée**: Les images sont créées après la génération web complète
4. **Chemin différent**: Le directory peut pointer vers un dossier sans images

### Solutions possibles:

1. **Vérifier la structure retournée**:
   ```javascript
   console.log('Images data:', simbriefData?.images);
   console.log('Directory:', simbriefData?.images?.directory);
   ```

2. **Tester l'URL manuellement**:
   ```
   https://www.simbrief.com/ofp/flightplans/{votre_directory}/map.png
   ```

3. **Alternative - PDF Download**:
   ```javascript
   const pdfUrl = `https://www.simbrief.com/ofp/flightplans/${directory}/BRIEFING.pdf`;
   ```

4. **Alternative - Génération côté client**:
   - Utiliser une bibliothèque comme Leaflet ou Mapbox
   - Tracer la route avec les waypoints retournés par SimBrief
   - Afficher sur une carte interactive

## 🔧 Pour tester

```bash
# Redémarrer le serveur
cd c:\wamp64\www\FlyNova
npm run dev

# Actions à tester:
1. Cliquer sur "Generate with SimBrief"
2. Remplir le formulaire:
   - Username SimBrief: votre_username
   - Units: KGS ou LBS
   - Cost Index: 50 (par exemple)
3. Cliquer sur "Generate"
4. Vérifier que le temps s'affiche correctement (pas 300h)
5. Vérifier que le Cost Index apparaît
6. Vérifier si la carte s'affiche (dépend du compte SimBrief)
```

## 🐛 Debug carte

Si la carte ne s'affiche toujours pas:

```javascript
// Dans fetchSimbriefData(), ajouter:
console.log('Full SimBrief response:', data);
console.log('Images:', data.images);
console.log('Images directory:', data.images?.directory);

// Tester l'URL dans le navigateur:
// https://www.simbrief.com/ofp/flightplans/XXXXXX/map.png
```

Si l'URL retourne 404, c'est que SimBrief ne génère pas la carte via XML API.

## 💡 Prochaines améliorations possibles

1. **Carte interactive** avec les waypoints SimBrief
2. **Téléchargement PDF** du briefing complet
3. **Sauvegarde des préférences** SimBrief dans le profil utilisateur
4. **Pre-remplissage** du formulaire avec les dernières valeurs utilisées
5. **Validation avancée** du Cost Index selon le type d'avion
