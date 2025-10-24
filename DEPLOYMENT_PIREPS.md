# 🚀 Déploiement Rapide - Validation PIREPs

## Checklist de déploiement

### ⚡ Installation Express (5 minutes)

#### 1. Base de données (2 min)
```bash
# Ouvrir phpMyAdmin ou MySQL en ligne de commande
# Sélectionner la base 'flynova'
# Exécuter les scripts suivants dans l'ordre :

# Script 1 : Ajouter colonne SimBrief (si pas déjà fait)
source add-simbrief-column.sql

# Script 2 : Optimiser les indexes
source optimize-flight-reports.sql

# ✅ Vérification
SELECT * FROM information_schema.COLUMNS 
WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'simbrief_ofp_id';

SHOW INDEX FROM flight_reports;
```

#### 2. Serveur Backend (1 min)
```bash
# Redémarrer le serveur Node.js
cd c:\wamp64\www\FlyNova\server

# Option A : Avec npm
npm restart

# Option B : Avec PM2
pm2 restart flynova-server

# Option C : Manuellement
# Ctrl+C pour arrêter
node index.js

# ✅ Vérification
# Le serveur doit afficher : "Server running on port 3001"
```

#### 3. Frontend Next.js (2 min)
```bash
# Retour à la racine
cd c:\wamp64\www\FlyNova

# Rebuild (optionnel mais recommandé)
npm run build

# Démarrer
npm run dev

# ✅ Vérification
# Ouvrir http://localhost:3000
# Aller sur votre VA
# Le bouton "Validate PIREPs" doit être visible
```

---

## 🧪 Test Rapide (3 minutes)

### Option 1 : Avec données de test
```bash
# Dans MySQL/phpMyAdmin
# ⚠️ IMPORTANT : Modifier les IDs dans le fichier avant d'exécuter !

# Éditer create-test-pirep.sql :
# - Ligne 10 : user_id (votre ID pilote)
# - Ligne 11 : va_id (votre ID VA)
# - Ligne 12 : route_id (votre ID route)
# - Ligne 13 : fleet_id (votre ID fleet ou NULL)

# Puis exécuter :
source create-test-pirep.sql

# Aller sur : http://localhost:3000/va/[votre_va_id]/manage/pireps
# Vous devriez voir le PIREP de test !
```

### Option 2 : Test manuel
1. Avoir un pilote membre d'une VA
2. Réserver un vol via l'interface
3. "Simuler" la soumission d'un PIREP (via API ou directement en BDD)
4. Aller valider le PIREP

---

## ✅ Vérifications Post-Déploiement

### 1. Interface
- [ ] Bouton "Validate PIREPs" visible sur page VA (pour Admin/Owner)
- [ ] Lien "PIREPs" visible dans onglets Manage
- [ ] Page `/va/[id]/manage/pireps` accessible
- [ ] Logo de la VA affiché en haut

### 2. Fonctionnalités
- [ ] Liste des PIREPs s'affiche
- [ ] Filtres fonctionnent (Pending/Approved/Rejected/All)
- [ ] Clic sur un PIREP ouvre le modal
- [ ] Carte interactive s'affiche avec le trajet
- [ ] Données télémétriques visibles
- [ ] Boutons Approve/Reject fonctionnent

### 3. Validation
- [ ] Approbation d'un PIREP fonctionne
- [ ] Points attribués correctement
- [ ] Stats pilote mises à jour
- [ ] Notes admin sauvegardées
- [ ] Rejet d'un PIREP fonctionne

### 4. Sécurité
- [ ] Non-membres ne peuvent pas accéder
- [ ] Pilotes normaux ne peuvent pas accéder
- [ ] Seuls Admin/Owner ont accès
- [ ] Token JWT vérifié

### 5. Performance
- [ ] Chargement rapide (< 2 secondes)
- [ ] Carte s'affiche rapidement
- [ ] Pas d'erreur dans la console
- [ ] Pas d'erreur serveur

---

## 🔧 Dépannage

### Problème : Bouton "Validate PIREPs" invisible
**Solution :**
- Vérifier que vous êtes Admin ou Owner de la VA
- Vider le cache du navigateur
- Se reconnecter

### Problème : Page PIREPs vide
**Solutions :**
1. Vérifier qu'il y a des flight_reports dans la BDD
2. Vérifier les permissions (Admin/Owner)
3. Vérifier les logs serveur
4. Vérifier la console navigateur

### Problème : Carte ne s'affiche pas
**Solutions :**
- Vérifier que les données télémétriques contiennent un tableau "route"
- Vérifier que les aéroports ont des coordonnées (lat/lon)
- Vérifier la console pour erreurs Leaflet
- S'assurer que Leaflet est bien installé

### Problème : Validation échoue
**Solutions :**
1. Vérifier les logs serveur
2. Vérifier le token JWT
3. Vérifier les permissions en BDD
4. Tester l'endpoint avec Postman

### Problème : Points non attribués
**Solutions :**
- Vérifier que validation_status = 'approved'
- Vérifier la table va_members
- Vérifier les logs serveur
- Refaire une validation

---

## 📊 Monitoring

### Requêtes SQL utiles

```sql
-- Voir tous les PIREPs pending
SELECT fr.id, f.flight_number, u.username, fr.created_at
FROM flight_reports fr
JOIN flights f ON fr.flight_id = f.id
JOIN users u ON f.user_id = u.id
WHERE fr.validation_status = 'pending'
ORDER BY fr.created_at DESC;

-- Voir les stats de validation
SELECT 
  validation_status,
  COUNT(*) as count,
  AVG(points_awarded) as avg_points
FROM flight_reports
GROUP BY validation_status;

-- Voir les PIREPs d'une VA
SELECT fr.*, f.va_id, f.flight_number
FROM flight_reports fr
JOIN flights f ON fr.flight_id = f.id
WHERE f.va_id = 1; -- Remplacer 1 par votre VA ID
```

### Logs à surveiller

**Serveur Node.js :**
```bash
# Voir les logs en temps réel
tail -f server/logs/app.log

# Ou avec PM2
pm2 logs flynova-server
```

**Console navigateur :**
- Ouvrir DevTools (F12)
- Onglet Console
- Vérifier qu'il n'y a pas d'erreurs

---

## 🎯 URLs Importantes

### Dev
- Frontend : `http://localhost:3000`
- Backend API : `http://localhost:3001`
- VA Management : `http://localhost:3000/va/[id]/manage`
- PIREP Validation : `http://localhost:3000/va/[id]/manage/pireps`

### Production (à adapter)
- Frontend : `https://votre-domaine.com`
- Backend API : `https://api.votre-domaine.com`

---

## 📞 Contacts Support

### En cas de problème :

1. **Documentation :**
   - `PIREP_VALIDATION_GUIDE.md` (guide utilisateur)
   - `PIREP_VALIDATION_FEATURE.md` (doc technique)
   - `PIREP_VALIDATION_SUMMARY.md` (résumé global)

2. **Logs :**
   - Serveur Node.js : `server/logs/`
   - Console navigateur : F12

3. **Base de données :**
   - phpMyAdmin : `http://localhost/phpmyadmin`
   - Vérifier tables : `flights`, `flight_reports`, `va_members`

---

## ✨ Commandes Utiles

```bash
# Restart complet
cd c:\wamp64\www\FlyNova
npm run build
cd server
npm restart
cd ..
npm run dev

# Vérifier la base
mysql -u root -p
use flynova;
SHOW TABLES;
DESCRIBE flight_reports;

# Clear cache Next.js
rm -rf .next
npm run build

# Logs PM2
pm2 logs
pm2 status
```

---

## 🎉 C'est prêt !

Si toutes les vérifications sont passées, votre système de validation des PIREPs est opérationnel ! 

**Prochaine étape :** Former vos admins VA avec le guide `PIREP_VALIDATION_GUIDE.md`

---

**Bon vol ! ✈️**
