# 🎨 Système de Branding Dynamique - Guide Rapide

## ✅ Qu'est-ce qui a été fait ?

Votre plateforme FlyNova dispose maintenant d'un **système de branding dynamique** !

Chaque Virtual Airline peut avoir :
- 🖼️ Son propre logo
- 🎨 Ses propres couleurs (primaire, secondaire, accent)
- 🏷️ Un affichage personnalisé dans le dashboard

## 🚀 Installation - 1 seule étape !

### Appliquer la migration SQL

**Double-cliquez sur :** `apply-branding-migration.bat`

OU exécutez manuellement :
```bash
mysql -u root -p flynova < add-va-branding.sql
```

C'est tout ! 🎉

## 📸 Résultat

### Avant
- Toutes les VAs ont le logo FlyNova
- Toutes les VAs ont les couleurs vertes par défaut

### Après
- Chaque VA a son propre logo dans le NavBar
- Chaque VA a ses propres couleurs dans son dashboard
- Les boutons, titres, badges s'adaptent automatiquement

## 🎨 Utilisation

### 1. Créer une VA avec des couleurs personnalisées

1. Aller sur **Virtual Airlines**
2. Cliquer sur **Create Virtual Airline**
3. Remplir le formulaire
4. **Nouveau !** Section "🎨 Brand Colors" :
   - Choisir la couleur primaire (boutons principaux)
   - Choisir la couleur secondaire (éléments secondaires)
   - Choisir la couleur accent (badges)
   - Choisir la couleur du texte
5. Prévisualisation en temps réel !
6. Soumettre

### 2. Les couleurs s'appliquent automatiquement

Quand un pilote navigue dans le dashboard de la VA :
- ✅ Le logo de la VA apparaît dans le NavBar
- ✅ Tous les boutons utilisent les couleurs de la VA
- ✅ Les titres, badges, et éléments s'adaptent
- ✅ Retour au logo FlyNova en quittant le dashboard

## 🎨 Exemples de couleurs

### easyJet (Orange)
- Primaire : `#FF6600`
- Secondaire : `#FF8800`
- Accent : `#FFB84D`

### Air France (Bleu/Rouge)
- Primaire : `#003087`
- Secondaire : `#BA0C2F`
- Accent : `#0057A6`

### Air Canada (Rouge)
- Primaire : `#DC0714`
- Secondaire : `#FF0000`
- Accent : `#FF4D4D`

### Ryanair (Bleu/Jaune)
- Primaire : `#073590`
- Secondaire : `#F1C933`
- Accent : `#4A90E2`

## 📋 Pages concernées

Le branding s'applique dans :
- 🏠 Dashboard pilote
- 📋 Page de briefing
- ✈️ Réservation de vol
- 📥 Downloads
- 🔧 Pages d'administration

**Important :** Le branding ne s'applique QUE dans le dashboard VA, pas dans les pages générales.

## 🐛 Problème ?

**Les couleurs ne changent pas :**
1. Vérifier que la migration SQL a été appliquée
2. Actualiser la page (F5)
3. Vider le cache du navigateur

**Le logo ne s'affiche pas :**
1. Vérifier que le logo a été uploadé lors de la création
2. Le fichier doit être dans `/public/uploads/logos/`

## 📚 Documentation complète

- `VA_BRANDING.md` - Documentation technique
- `VA_BRANDING_IMPLEMENTATION.md` - Détails d'implémentation

---

**Profitez de votre plateforme personnalisée !** 🚀✨
