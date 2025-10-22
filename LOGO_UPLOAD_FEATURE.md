# 🎨 Upload de Logo pour Virtual Airlines

## Fonctionnalité Ajoutée

### ✅ Upload de Logo depuis votre PC

Lors de la création d'une VA, vous pouvez maintenant :

1. **Uploader un fichier depuis votre ordinateur** 📁
   - Formats supportés : JPG, PNG, GIF, SVG, WEBP
   - Taille maximale : 5MB
   - Le fichier est stocké sur le serveur

2. **OU utiliser une URL externe** 🌐
   - Copier/coller l'URL d'une image hébergée ailleurs
   - Utile pour les images déjà en ligne

### 🖼️ Prévisualisation en temps réel

Quand vous sélectionnez un fichier, une prévisualisation s'affiche immédiatement avant la création de la VA.

---

## 🎨 Logo du Site FlyNova

Votre logo (`logo.png`) est maintenant utilisé partout sur le site :

✅ **NavBar** - En haut à gauche avec le nom FlyNova  
✅ **Homepage Hero** - Grande version sur la page d'accueil  
✅ **Footer** - En bas de page avec le nom  

Le logo apparaît sur toutes les pages du site !

---

## 📂 Structure des Fichiers

```
FlyNova/
├── logos/
│   └── logo.png                    # Votre logo original
├── public/
│   ├── logo.png                    # Logo copié pour le site
│   └── uploads/
│       └── logos/                  # Logos uploadés des VAs
│           ├── va-logo-123456.png
│           ├── va-logo-789012.jpg
│           └── ...
```

---

## 🔧 Modifications Techniques

### Backend (`server/routes/virtualAirlines.js`)
- ✅ Multer configuré pour l'upload
- ✅ Stockage dans `public/uploads/logos/`
- ✅ Noms de fichiers uniques (timestamp + random)
- ✅ Validation des types de fichiers
- ✅ Limite de 5MB

### Frontend (`src/app/virtual-airlines/page.tsx`)
- ✅ Input file avec prévisualisation
- ✅ FormData pour l'upload multipart
- ✅ Choix entre fichier ou URL
- ✅ Interface utilisateur claire avec "OR"

### Components
- ✅ NavBar avec logo
- ✅ Homepage avec logo
- ✅ Footer avec logo

---

## 🎯 Utilisation

### Créer une VA avec logo :

1. Aller sur `/virtual-airlines`
2. Cliquer sur "Create Your VA"
3. Remplir le formulaire
4. **Option 1** : Cliquer sur "Choose File" et sélectionner votre logo
5. **Option 2** : Coller une URL d'image dans le champ URL
6. Prévisualiser le logo
7. Cliquer sur "Create Virtual Airline"

Le logo sera automatiquement uploadé et associé à votre VA ! ✈️

---

## 📸 Où apparaît le logo ?

### Logo de la VA :
- ✅ Page de détail de la VA
- ✅ Liste des VAs
- ✅ Dashboard utilisateur
- ✅ Cards de VA partout sur le site

### Logo du site FlyNova :
- ✅ Toutes les pages (NavBar)
- ✅ Homepage (Hero section)
- ✅ Footer

---

## ⚡ Prêt à tester !

Votre système d'upload de logo est maintenant **100% fonctionnel** ! 🎉
