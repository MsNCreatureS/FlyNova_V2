# 🚀 Quick Start - Super Admin

## Installation rapide

### 1. Appliquer la migration SQL
```bash
cd c:\wamp64\www\FlyNova
mysql -u root -p flynova < database/migrations/003_add_super_admin.sql
```

### 2. Créer votre compte Super Admin
```bash
# D'abord, créez un compte utilisateur normal via l'interface web
# Puis utilisez ce script pour le promouvoir :

node set-super-admin.js votre.email@example.com
```

### 3. Accéder au Dashboard
1. Connectez-vous avec votre compte
2. Cliquez sur **"🔐 Super Admin"** dans la barre de navigation
3. Vous êtes dans le dashboard super admin !

## Que pouvez-vous faire ?

### ✈️ Gérer les Virtual Airlines
- Voir toutes les VAs de la plateforme
- Suspendre les VAs problématiques
- Supprimer les VAs si nécessaire

### 👥 Gérer les Utilisateurs
- Voir tous les utilisateurs
- Bannir (suspendre) des utilisateurs
- Supprimer des comptes (sauf propriétaires de VA)

### 📊 Surveiller l'activité
- Voir les statistiques globales
- Suivre les activités récentes
- Monitorer la croissance de la plateforme

## Sécurité

⚠️ **IMPORTANT** : 
- Vous ne pouvez pas vous suspendre ou vous supprimer vous-même
- Les utilisateurs propriétaires de VA ne peuvent pas être supprimés directement
- Toutes les suppressions sont définitives !

## Besoin d'aide ?

Consultez le fichier `SUPERADMIN_README.md` pour la documentation complète.
