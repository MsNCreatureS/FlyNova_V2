# Super Admin System - FlyNova

## 📋 Vue d'ensemble

Le système Super Admin permet au créateur de FlyNova d'avoir un contrôle complet sur la plateforme, incluant la gestion de toutes les Virtual Airlines et de tous les utilisateurs.

## 🚀 Installation

### 1. Exécuter la migration SQL

Appliquez la migration dans votre base de données MySQL :

```bash
# Via MySQL client
mysql -u your_user -p flynova < database/migrations/003_add_super_admin.sql
```

Ou manuellement :

```sql
ALTER TABLE users 
ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE AFTER status;

CREATE INDEX idx_super_admin ON users(is_super_admin);
```

### 2. Définir le premier Super Admin

Utilisez le script fourni pour promouvoir un utilisateur en Super Admin :

```bash
node set-super-admin.js votre.email@example.com
```

Exemple :
```bash
node set-super-admin.js admin@flynova.com
```

## 🔐 Accès au Dashboard

Une fois qu'un utilisateur est défini comme Super Admin :

1. Connectez-vous avec le compte Super Admin
2. Un nouveau lien **"🔐 Super Admin"** apparaît dans la barre de navigation (en rouge)
3. Cliquez dessus pour accéder au dashboard : `/superadmin`

## 📊 Fonctionnalités du Dashboard

### Statistiques générales
- Total des VAs
- VAs actives
- Total des utilisateurs
- Nouveaux utilisateurs (7 derniers jours)
- Total des vols
- Vols complétés

### Onglet Overview
- Aperçu des activités récentes de la plateforme
- Créations de VA
- Enregistrements d'utilisateurs
- Vols complétés

### Onglet Virtual Airlines
- Liste de toutes les VAs avec :
  - Logo
  - Nom et callsign
  - Propriétaire (nom et email)
  - Nombre de membres
  - Nombre de vols
  - Statut
- Actions disponibles :
  - **Suspendre** une VA (change le statut à "suspended")
  - **Activer** une VA suspendue
  - **Supprimer** définitivement une VA (avec confirmation)

### Onglet Users
- Liste de tous les utilisateurs avec :
  - Avatar
  - Nom d'utilisateur
  - Email
  - Nombre de VAs
  - Nombre de vols
  - Statut
  - Badge Super Admin (si applicable)
- Actions disponibles :
  - **Suspendre** un utilisateur (empêche la connexion)
  - **Activer** un utilisateur suspendu
  - **Supprimer** un utilisateur (avec restrictions)

### Onglet Activities
- Historique complet des activités récentes
- Créations de VA
- Enregistrements d'utilisateurs
- Vols complétés

## 🔒 Sécurité

### Restrictions
- Un Super Admin **ne peut pas** se suspendre lui-même
- Un Super Admin **ne peut pas** se supprimer lui-même
- Un utilisateur propriétaire d'une VA **ne peut pas** être supprimé (la propriété doit être transférée d'abord)

### Vérifications
- Toutes les routes `/api/superadmin/*` sont protégées par le middleware `checkSuperAdmin`
- L'accès est vérifié côté serveur (pas seulement côté client)
- Un utilisateur non-Super Admin recevra une erreur 403 Forbidden

## 🎨 Interface

- Le lien Super Admin est **en rouge** dans la navbar pour le distinguer
- Icône 🔐 pour identifier visuellement le dashboard
- Modales de confirmation pour les actions destructives
- Design cohérent avec le reste de FlyNova

## 📝 API Endpoints

Toutes les routes nécessitent un token JWT valide et le rôle Super Admin :

```
GET  /api/superadmin/stats                           - Statistiques générales
GET  /api/superadmin/virtual-airlines                - Liste de toutes les VAs
GET  /api/superadmin/users                           - Liste de tous les utilisateurs
PUT  /api/superadmin/virtual-airlines/:vaId/status   - Changer le statut d'une VA
DELETE /api/superadmin/virtual-airlines/:vaId        - Supprimer une VA
PUT  /api/superadmin/users/:userId/status            - Changer le statut d'un utilisateur
DELETE /api/superadmin/users/:userId                 - Supprimer un utilisateur
GET  /api/superadmin/activities                      - Activités récentes
```

## 🛠️ Gestion des Super Admins

### Promouvoir un utilisateur
```bash
node set-super-admin.js utilisateur@example.com
```

### Révoquer les droits Super Admin
Manuellement via SQL :
```sql
UPDATE users SET is_super_admin = FALSE WHERE email = 'utilisateur@example.com';
```

### Vérifier les Super Admins actuels
```sql
SELECT id, username, email FROM users WHERE is_super_admin = TRUE;
```

## ⚠️ Important

- **Utilisez ce système avec précaution** - Les actions de suppression sont irréversibles
- **Gardez vos identifiants Super Admin sécurisés**
- **Ne partagez jamais l'accès Super Admin** avec des personnes non autorisées
- **Faites des backups réguliers** de votre base de données avant toute action destructive

## 🐛 Dépannage

### Le lien Super Admin n'apparaît pas
- Vérifiez que l'utilisateur a bien `is_super_admin = TRUE` dans la base de données
- Déconnectez-vous et reconnectez-vous pour rafraîchir le token JWT
- Vérifiez la console du navigateur pour d'éventuelles erreurs

### Erreur 403 Forbidden
- L'utilisateur n'a pas les droits Super Admin
- Le token JWT est expiré (reconnectez-vous)
- La migration n'a pas été appliquée correctement

### Impossible de supprimer un utilisateur
- L'utilisateur est propriétaire d'une ou plusieurs VAs
- Solution : Transférez la propriété des VAs ou supprimez les VAs d'abord

## 📞 Support

Pour toute question ou problème avec le système Super Admin, consultez la documentation du projet FlyNova.
