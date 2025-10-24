# Quick Start - Nouvelle gestion des Downloads

## 🚀 Étapes de déploiement

### 1. Exécuter la migration SQL
```bash
mysql -u root -p flynova < database/migrations/001_update_downloads_table.sql
```

OU depuis phpMyAdmin:
1. Sélectionner la base `flynova`
2. Aller dans l'onglet SQL
3. Copier/coller le contenu de `database/migrations/001_update_downloads_table.sql`
4. Exécuter

### 2. Redémarrer le serveur Node.js
```bash
# Si vous utilisez PM2
pm2 restart ecosystem.config.js

# Ou simplement
npm run dev
```

### 3. Tester

#### Page Downloads Principale
- Aller sur `http://localhost:3000/downloads`
- ✅ Devrait afficher uniquement **FlyNova-Acars**

#### Downloads VA (en tant que pilote)
- Aller sur `http://localhost:3000/va/[ID]/pilot/downloads`
- ✅ Devrait afficher les téléchargements de la VA

#### Gestion Downloads (en tant qu'admin)
1. Aller sur `http://localhost:3000/va/[ID]/manage`
2. Cliquer sur l'onglet **📥 Downloads**
3. Cliquer sur **+ Add Download Link**
4. Remplir:
   - **Titre**: "Test Livery"
   - **Description**: "Test description"
   - **Type**: Livery
   - **URL**: "https://www.google.com" (pour tester)
5. Soumettre
6. ✅ Le download devrait apparaître dans la liste

## 📝 Ce qui a changé

### Page `/downloads`
- ❌ Plus de téléchargements VA
- ✅ Uniquement FlyNova-Acars (Beta)
- ✅ Compatible MSFS 2020/2024 uniquement
- ✅ Windows uniquement pour le moment

### Nouvelle page `/va/[id]/pilot/downloads`
- ✅ Téléchargements spécifiques à la VA
- ✅ Livrées, documents, etc.
- ✅ Liens externes uniquement

### Gestion VA - Onglet Downloads
- ✅ Owner/Admin peuvent ajouter des liens
- ✅ Pas besoin d'uploader de fichiers
- ✅ Utiliser Google Drive, Mega, etc.

## 🎯 Utilisation recommandée

Pour les **livrées**:
1. Uploader la livrée sur Google Drive / Mega / Dropbox
2. Récupérer le lien de partage public
3. Ajouter le lien dans FlyNova via Downloads Management

Pour les **documents** (SOPs, guides):
1. Uploader sur Google Drive
2. Ou créer un Google Doc avec lien public
3. Ajouter dans FlyNova

## 🔧 Dépannage

**Erreur lors de l'ajout d'un download:**
- Vérifier que la migration SQL a été exécutée
- Vérifier que l'URL commence par `http://` ou `https://`

**Les downloads n'apparaissent pas:**
- Vérifier que vous êtes membre de la VA
- Actualiser la page
- Vérifier les logs serveur

**Impossible d'accéder à la gestion:**
- Vérifier que vous êtes Owner ou Admin de la VA
