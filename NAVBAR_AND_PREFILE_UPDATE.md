# NavBar et Prefile VATSIM/IVAO - Mise à jour

## 📋 Vue d'ensemble

Cette mise à jour améliore l'expérience utilisateur des pilotes/membres dans les dashboards VA avec :
1. **NavBar contextuelle** - Navigation simplifiée selon le contexte
2. **Affichage conditionnel** - Briefing ou Book Flight selon l'état du vol
3. **Prefile VATSIM/IVAO** - Boutons de pré-dépôt direct depuis SimBrief

## 🎯 Fonctionnalités ajoutées

### 1. NavBar Contextuelle Intelligente

#### Détection automatique du contexte
La NavBar détecte automatiquement si l'utilisateur est dans un dashboard VA et adapte la navigation :

**Dashboard VA** (`/va/:id/pilot/*` ou `/va/:id/manage/*`) :
- ✈️ **Book Flight** ou 📋 **Flight Briefing** (conditionnel)
- 📥 **Downloads**
- ← **Back to Dashboard**

**Navigation Normale** (ailleurs) :
- Dashboard
- Virtual Airlines
- Tracker
- Downloads

#### Logique conditionnelle
- **Si vol actif (reserved/in_progress)** → Affiche "Flight Briefing"
- **Si pas de vol actif** → Affiche "Book Flight"
- Fonctionne en desktop ET mobile

### 2. Navigation Mobile Améliorée
- Menu hamburger avec mêmes règles contextuelles
- Liens avec émojis pour meilleure UX
- Responsive et touch-friendly

### 3. Boutons Prefile VATSIM/IVAO

#### Emplacement
Nouveaux boutons affichés dans la page de briefing **après** les données SimBrief, **avant** les instructions du tracker.

#### Fonctionnalités
- **VATSIM Prefile** :
  - Lien direct vers `my.vatsim.net/pilots/flightplan`
  - Auto-remplissage avec OFP ID SimBrief
  - Couleur bleue (brand VATSIM)
  
- **IVAO Prefile** :
  - Lien direct vers `fpl.ivao.aero/api/fp/load`
  - Auto-remplissage avec OFP ID SimBrief
  - Couleur rouge (brand IVAO)

#### Design
- Boutons côte à côte sur desktop
- Empilés verticalement sur mobile
- Icônes SVG pour network + external link
- Effet hover avec assombrissement
- Tooltip explicatif

## 🔧 Modifications techniques

### Fichiers modifiés

#### `src/components/NavBar.tsx`

**Nouvelles interfaces** :
```typescript
interface ActiveFlight {
  id: number;
  flight_number: string;
  status: 'reserved' | 'in_progress';
  va_id: number;
}
```

**Nouveaux states** :
```typescript
const [activeFlight, setActiveFlight] = useState<ActiveFlight | null>(null);
```

**Détection de contexte** :
```typescript
const vaMatch = pathname.match(/\/va\/(\d+)\/(pilot|manage)/);
const isInVADashboard = !!vaMatch;
const currentVaId = vaMatch ? vaMatch[1] : null;
```

**Récupération du vol actif** :
```typescript
const fetchActiveFlight = async () => {
  const response = await fetch(
    `${API_URL}/flights/my-flights?status=reserved,in_progress`
  );
  // Filtre par VA ID et status
};
```

#### `src/app/va/[id]/pilot/briefing/[flightId]/page.tsx`

**Nouvelle section Prefile** :
```tsx
{simbriefData && (
  <motion.div className="card p-6 mt-6">
    <h2>🌐 Online Network Filing</h2>
    {/* Boutons VATSIM et IVAO */}
  </motion.div>
)}
```

**URLs de prefile** :
- VATSIM : `https://my.vatsim.net/pilots/flightplan?autoFill={ofp_id}`
- IVAO : `https://fpl.ivao.aero/api/fp/load?sbid={ofp_id}`

## 🎨 Design & UX

### Palette de couleurs
- **VATSIM** : `bg-blue-600 hover:bg-blue-700`
- **IVAO** : `bg-red-600 hover:bg-red-700`
- **Back to Dashboard** : Style secondaire existant

### Émojis utilisés
- ✈️ Book Flight
- 📋 Flight Briefing
- 📥 Downloads
- ← Back indicator
- 🌐 Online Networks
- 💡 Tips

### Responsive
- **Desktop** : Boutons côte à côte, menu horizontal
- **Tablet** : Boutons empilés, menu hamburger
- **Mobile** : Full width, navigation drawer

## 🚀 Workflow utilisateur

### Scénario 1 : Nouveau vol
1. Pilote entre dans le dashboard VA
2. NavBar affiche "✈️ Book Flight"
3. Pilote réserve un vol
4. NavBar bascule automatiquement sur "📋 Flight Briefing"
5. Pilote génère le plan SimBrief
6. Boutons VATSIM/IVAO apparaissent
7. Pilote peut prefile sur le réseau de son choix

### Scénario 2 : Vol en cours
1. Pilote entre dans le dashboard VA avec un vol actif
2. NavBar affiche directement "📋 Flight Briefing"
3. Clic direct vers le briefing du vol actif
4. Pas besoin de chercher le vol dans la liste

### Scénario 3 : Retour au dashboard
1. À tout moment, bouton "← Back to Dashboard" visible
2. Un clic ramène à la liste des VAs
3. Navigation claire et intuitive

## 📊 Impact sur les performances

### Requêtes API supplémentaires
- 1 requête `/flights/my-flights` lors de l'entrée dans un dashboard VA
- Mise en cache côté client (state React)
- Pas de polling, uniquement lors du changement de route

### Optimisations
- Détection via regex sur `pathname` (aucune API call)
- Fetch conditionnel (seulement si dans VA dashboard)
- useEffect avec dépendance sur `pathname` (pas de re-fetch inutile)

## 🔐 Sécurité

### Authentification
- Toutes les requêtes utilisent le token JWT
- Filtrage côté serveur par `user_id`
- Pas d'exposition d'informations sensibles

### Liens externes
- `target="_blank"` sur VATSIM/IVAO
- `rel="noopener noreferrer"` pour sécurité
- Pas de transmission de données sensibles (seulement OFP ID public)

## 🧪 Tests recommandés

### Test 1 : NavBar contextuelle
- [ ] Entrer dans un dashboard VA sans vol → voir "Book Flight"
- [ ] Réserver un vol → NavBar change automatiquement
- [ ] Cliquer sur "Flight Briefing" → ouvre le bon briefing
- [ ] Annuler le vol → NavBar revient sur "Book Flight"

### Test 2 : Navigation mobile
- [ ] Ouvrir le menu hamburger dans un dashboard VA
- [ ] Vérifier les liens corrects avec émojis
- [ ] Tester "Back to Dashboard"
- [ ] Vérifier responsive sur différentes tailles

### Test 3 : Prefile VATSIM/IVAO
- [ ] Générer un plan SimBrief
- [ ] Vérifier l'apparition des boutons
- [ ] Cliquer sur VATSIM → ouvre dans nouvel onglet avec données
- [ ] Cliquer sur IVAO → ouvre dans nouvel onglet avec données
- [ ] Vérifier que l'OFP ID est bien passé dans l'URL

### Test 4 : Multi-VA
- [ ] Avoir des vols dans plusieurs VAs
- [ ] Entrer dans VA #1 → voir vol de VA #1 uniquement
- [ ] Entrer dans VA #2 → voir vol de VA #2 uniquement
- [ ] Pas de confusion entre les vols de différentes VAs

## 🐛 Dépannage

### NavBar n'affiche pas "Flight Briefing"
1. Vérifier que le vol existe : `/api/flights/my-flights`
2. Vérifier le status : `reserved` ou `in_progress`
3. Vérifier que `va_id` correspond à l'URL
4. Vérifier la console pour erreurs JS

### Boutons VATSIM/IVAO manquants
1. Vérifier que `simbriefData` est chargé
2. Vérifier que `params.ofp_id` existe
3. Ouvrir la console : `console.log(simbriefData?.params?.ofp_id)`

### "Back to Dashboard" ne fonctionne pas
1. Vérifier que `/dashboard` existe et est accessible
2. Vérifier l'authentification utilisateur
3. Vérifier les logs de navigation

## 📝 Notes d'implémentation

### Pourquoi regex pour la détection ?
```typescript
const vaMatch = pathname.match(/\/va\/(\d+)\/(pilot|manage)/);
```
- Capture le VA ID dynamiquement
- Fonctionne pour `/pilot/*` ET `/manage/*`
- Pas besoin de props supplémentaires
- Réactif aux changements de route

### Pourquoi conditionnel sur activeFlight ?
- Évite la confusion pour le pilote
- Accès direct au briefing si vol en cours
- Évite les clics inutiles
- UX fluide et intuitive

### Pourquoi séparer VATSIM/IVAO ?
- Deux réseaux distincts avec processus différents
- Styles de marque respectés
- Utilisateur choisit son réseau préféré
- Pas d'ambiguïté

## 🔄 Mises à jour futures possibles

### Court terme
- [ ] Ajouter PilotEdge prefile (si demandé)
- [ ] Badge "New" sur les boutons prefile (premiers jours)
- [ ] Shortcut clavier pour navigation rapide

### Moyen terme
- [ ] Cache intelligent du vol actif (Redux/Context)
- [ ] Notification si nouveau vol disponible
- [ ] Compteur de vols en attente dans NavBar

### Long terme
- [ ] Prefile direct depuis FlyNova (API custom)
- [ ] Synchronisation automatique avec networks
- [ ] Historique des prefiles

## 📞 Support

En cas de problème :
1. Vérifier la console navigateur (F12)
2. Vérifier les logs serveur backend
3. Tester avec différents browsers
4. Vider cache et localStorage si nécessaire

---

**Date de mise à jour** : 23 octobre 2025  
**Version** : 1.2.0  
**Compatibilité** : Next.js 14, React 18, TypeScript 5
