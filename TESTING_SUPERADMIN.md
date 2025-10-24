# 🧪 Guide de test - Super Admin System

## Prérequis
- ✅ Base de données FlyNova configurée
- ✅ Serveur backend en cours d'exécution
- ✅ Application Next.js en cours d'exécution
- ✅ Migration 003_add_super_admin.sql appliquée

## Étape 1 : Appliquer la migration

### Option A : Via MySQL command line
```bash
cd c:\wamp64\www\FlyNova
mysql -u root -p flynova
```

Puis dans MySQL :
```sql
source database/migrations/003_add_super_admin.sql
```

### Option B : Via script SQL
```sql
ALTER TABLE users 
ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE AFTER status;

CREATE INDEX idx_super_admin ON users(is_super_admin);
```

### Vérifier que la migration a fonctionné
```sql
DESCRIBE users;
-- Vous devriez voir le champ 'is_super_admin'
```

## Étape 2 : Créer un compte utilisateur test

1. Ouvrez votre navigateur : `http://localhost:3000`
2. Cliquez sur "Get Started" ou "Register"
3. Créez un compte avec :
   - Email : `admin@flynova.test`
   - Username : `SuperAdmin`
   - Password : `Test123!`
   - First Name : `Super`
   - Last Name : `Admin`

## Étape 3 : Promouvoir l'utilisateur en Super Admin

```bash
cd c:\wamp64\www\FlyNova
node set-super-admin.js admin@flynova.test
```

Vous devriez voir :
```
✅ SUCCESS!
User "SuperAdmin" (admin@flynova.test) has been promoted to Super Admin.

🔐 This user now has access to the Super Admin Dashboard at /superadmin
```

### Vérifier dans la base de données
```sql
SELECT id, username, email, is_super_admin 
FROM users 
WHERE email = 'admin@flynova.test';
```

Résultat attendu :
```
+----+------------+---------------------+----------------+
| id | username   | email               | is_super_admin |
+----+------------+---------------------+----------------+
|  1 | SuperAdmin | admin@flynova.test  |              1 |
+----+------------+---------------------+----------------+
```

## Étape 4 : Tester l'accès au dashboard

### 4.1 Se connecter
1. Allez sur `http://localhost:3000/auth/login`
2. Connectez-vous avec `admin@flynova.test` / `Test123!`

### 4.2 Vérifier la navbar
- ✅ Le lien **"🔐 Super Admin"** devrait apparaître en rouge dans la navbar

### 4.3 Accéder au dashboard
1. Cliquez sur "🔐 Super Admin"
2. Vous devriez être redirigé vers `http://localhost:3000/superadmin`
3. Le dashboard devrait charger avec les statistiques

## Étape 5 : Tester les fonctionnalités

### Test 1 : Statistiques
- ✅ Vérifier que les 6 cartes de statistiques s'affichent
- ✅ Total VAs, Active VAs, Total Users, etc.

### Test 2 : Onglet Virtual Airlines
1. Cliquez sur l'onglet "✈️ Virtual Airlines"
2. Créez une VA de test si vous n'en avez pas
3. Testez :
   - ✅ Suspendre une VA → Bouton "Suspend" → Confirmer
   - ✅ Activer une VA suspendue → Bouton "Activate"
   - ✅ Supprimer une VA → Bouton "Delete" → Confirmer

### Test 3 : Onglet Users
1. Cliquez sur l'onglet "👥 Users"
2. Créez un utilisateur de test via Register
3. Testez :
   - ✅ Suspendre un utilisateur → Bouton "Suspend" → Confirmer
   - ✅ Activer un utilisateur → Bouton "Activate"
   - ✅ Essayer de se suspendre soi-même → ❌ Devrait échouer
   - ✅ Supprimer un utilisateur sans VA → Bouton "Delete" → Confirmer

### Test 4 : Onglet Activities
1. Cliquez sur l'onglet "📈 Recent Activities"
2. Vérifiez que les activités s'affichent :
   - ✅ Créations de VA
   - ✅ Inscriptions d'utilisateurs
   - ✅ Vols complétés (si disponibles)

## Étape 6 : Tester la sécurité

### Test 1 : Accès non autorisé
1. Créez un autre compte utilisateur normal
2. Connectez-vous avec ce compte
3. Essayez d'accéder à `http://localhost:3000/superadmin`
4. ✅ Devrait afficher "Access denied" et rediriger vers `/dashboard`

### Test 2 : API Protection
Ouvrez la console développeur et testez :

```javascript
// Récupérer le token d'un user normal (pas super admin)
const token = localStorage.getItem('token');

// Essayer d'accéder aux stats
fetch('http://localhost:3001/api/superadmin/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

✅ Devrait retourner : `{ error: 'Super Admin access required' }` avec status 403

### Test 3 : Protection auto-suppression
1. Connectez-vous en tant que super admin
2. Allez dans l'onglet Users
3. Cherchez votre propre compte
4. ✅ Les boutons Suspend/Delete ne devraient PAS être affichés

### Test 4 : Protection propriétaire VA
1. Créez une VA avec un utilisateur
2. Essayez de supprimer cet utilisateur
3. ✅ Devrait afficher une erreur : "Cannot delete user who owns Virtual Airlines"

## Étape 7 : Tests d'intégration

### Scénario complet
1. **Créer 3 utilisateurs** (User1, User2, User3)
2. **User1 crée une VA** "Test Airlines"
3. **Super Admin suspend User2**
4. **User2 essaie de se connecter** → ❌ Devrait échouer
5. **Super Admin active User2**
6. **User2 se connecte** → ✅ Devrait fonctionner
7. **Super Admin suspend la VA de User1**
8. **User1 vérifie sa VA** → Status "suspended"
9. **Super Admin supprime User3** (qui n'a pas de VA)
10. **User3 essaie de se connecter** → ❌ Compte inexistant

## ✅ Checklist de validation

- [ ] Migration SQL appliquée avec succès
- [ ] Script set-super-admin.js fonctionne
- [ ] Lien Super Admin visible dans navbar (uniquement pour super admin)
- [ ] Dashboard accessible à `/superadmin`
- [ ] Statistiques affichées correctement
- [ ] Suspension de VA fonctionne
- [ ] Activation de VA fonctionne
- [ ] Suppression de VA fonctionne
- [ ] Suspension d'utilisateur fonctionne
- [ ] Activation d'utilisateur fonctionne
- [ ] Suppression d'utilisateur fonctionne
- [ ] Protection : impossible de se suspendre soi-même
- [ ] Protection : impossible de supprimer un propriétaire de VA
- [ ] Protection : accès refusé aux non-super-admins
- [ ] Activités affichées correctement
- [ ] Modales de confirmation fonctionnent

## 🐛 Résolution de problèmes

### Le lien n'apparaît pas dans la navbar
```bash
# Vérifier que l'utilisateur est bien super admin
mysql -u root -p flynova -e "SELECT username, email, is_super_admin FROM users WHERE email='admin@flynova.test';"

# Se déconnecter et reconnecter pour rafraîchir le token
```

### Erreur 403 au chargement du dashboard
```bash
# Vérifier que le middleware est bien appliqué
# Regarder les logs du serveur backend

# Vérifier que la route est bien enregistrée
# Dans server/index.js, vérifier : app.use('/api/superadmin', superAdminRoutes);
```

### Erreur de base de données
```sql
-- Vérifier que toutes les tables existent
SHOW TABLES;

-- Vérifier la structure de la table users
DESCRIBE users;
```

## 📊 Résultats attendus

Après tous les tests, vous devriez avoir :
- ✅ 1 super admin fonctionnel
- ✅ Dashboard accessible et fonctionnel
- ✅ Toutes les actions CRUD sur VAs et Users fonctionnent
- ✅ Sécurité validée
- ✅ Interface responsive et fluide

## 🎉 Succès !

Si tous les tests passent, le système Super Admin est pleinement opérationnel !

## 📝 Notes de test

Date du test : ______________
Testeur : ______________
Résultat global : ✅ Réussi / ❌ Échec
Commentaires :
_________________________________
_________________________________
_________________________________
