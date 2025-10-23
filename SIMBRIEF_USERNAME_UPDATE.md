# SimBrief Username Feature - Mise à jour

## 📋 Vue d'ensemble

Cette mise à jour ajoute un champ optionnel `simbrief_username` pour les utilisateurs, permettant de remplir automatiquement les plans de vol SimBrief sans avoir à entrer le nom d'utilisateur à chaque fois.

## 🗄️ Mise à jour de la base de données

### Option 1 : Via phpMyAdmin (Recommandé pour WAMP)

1. Ouvrez phpMyAdmin : http://localhost/phpmyadmin
2. Sélectionnez la base de données `flynova`
3. Cliquez sur l'onglet "SQL"
4. Copiez-collez le contenu du fichier `add-simbrief-username.sql`
5. Cliquez sur "Exécuter"

### Option 2 : Via MySQL CLI

```bash
# Depuis le dossier FlyNova
mysql -u root -p flynova < add-simbrief-username.sql
```

### Vérification

Exécutez cette requête dans phpMyAdmin pour vérifier :

```sql
DESCRIBE users;
```

Vous devriez voir la nouvelle colonne `simbrief_username` après la colonne `username`.

## ✅ Fonctionnalités ajoutées

### 1. Formulaire d'inscription
- Nouveau champ optionnel "SimBrief Username"
- Description : "Save your SimBrief username to auto-fill flight plans"
- Situé entre les champs Email et Password

### 2. Profil utilisateur
- Le champ `simbrief_username` est maintenant inclus dans les données utilisateur
- Retourné lors du login et des requêtes `/auth/me`

### 3. Génération de plan de vol
- Si l'utilisateur a un `simbrief_username` enregistré, il est automatiquement envoyé à SimBrief
- Le username est également utilisé pour récupérer automatiquement le plan de vol après génération
- Si aucun username n'est sauvegardé, l'utilisateur est invité à le saisir (comportement précédent)

### 4. Carte interactive
- **Correction du zoom** : La carte ne réinitialise plus la vue après chaque interaction
- L'utilisateur peut maintenant zoomer/dézoomer librement sans que la vue soit réinitialisée

## 🚀 Comment utiliser

### Pour les nouveaux utilisateurs
1. Créer un compte sur FlyNova
2. Remplir le champ optionnel "SimBrief Username" avec votre nom d'utilisateur SimBrief
3. Lors de la génération de plans de vol, votre username sera automatiquement utilisé

### Pour les utilisateurs existants
1. **Option A** : Modifier manuellement dans la base de données :
   ```sql
   UPDATE users SET simbrief_username = 'votre_username_simbrief' WHERE email = 'votre@email.com';
   ```

2. **Option B** : Ajouter une page de paramètres de profil (à implémenter ultérieurement)

## 📝 Modifications de fichiers

### Backend
- ✅ `server/routes/auth.js` : Ajout du champ `simbrief_username` dans register, login et me
- ✅ `add-simbrief-username.sql` : Migration SQL

### Frontend
- ✅ `src/app/auth/register/page.tsx` : Nouveau champ dans le formulaire
- ✅ `src/app/va/[id]/pilot/briefing/[flightId]/page.tsx` : 
  - Récupération du `simbrief_username` depuis le profil
  - Utilisation automatique du username dans la génération SimBrief
  - Utilisation automatique pour la récupération après génération
- ✅ `src/components/FlightMap.tsx` : Correction du zoom

## 🔧 Tests recommandés

1. **Test d'inscription** :
   - Créer un nouveau compte avec un SimBrief username
   - Vérifier que le compte est créé avec succès
   - Vérifier que le username est bien sauvegardé

2. **Test de login** :
   - Se connecter avec un compte ayant un SimBrief username
   - Vérifier que `localStorage.getItem('user')` contient `simbriefUsername`

3. **Test de génération SimBrief** :
   - Réserver un vol
   - Générer un plan de vol SimBrief
   - Vérifier que le username est automatiquement rempli (pas de prompt)
   - Vérifier que le plan de vol est automatiquement chargé après génération

4. **Test de la carte** :
   - Ouvrir un briefing avec plan de vol SimBrief
   - Zoomer sur la carte
   - Vérifier que le zoom ne se réinitialise pas automatiquement

## 🔐 Sécurité

- Le champ `simbrief_username` est optionnel (NULL autorisé)
- Pas de validation stricte car c'est juste un nom d'utilisateur externe
- Le champ est indexé pour des recherches rapides
- Aucune donnée sensible n'est stockée

## 📊 Impact sur les performances

- Ajout d'un index sur `simbrief_username` pour des recherches rapides
- Pas d'impact sur les requêtes existantes
- Charge minimale sur la base de données

## 🚨 Rollback

Si vous devez annuler cette mise à jour :

```sql
-- Supprimer l'index
DROP INDEX idx_simbrief_username ON users;

-- Supprimer la colonne
ALTER TABLE users DROP COLUMN simbrief_username;
```

## 📞 Support

En cas de problème :
1. Vérifier que la migration SQL a été appliquée correctement
2. Vérifier que les serveurs (backend + frontend) ont été redémarrés
3. Vider le cache du navigateur et vérifier localStorage
4. Vérifier les logs de la console (F12) pour les erreurs JavaScript

---

**Date de mise à jour** : 23 octobre 2025  
**Version** : 1.1.0
