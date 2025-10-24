# 🚀 Guide Rapide - Validation des PIREPs

## Pour les Administrateurs/Owners de VA

### 1. Accéder à la page de validation

**Option A - Depuis la page VA :**
1. Allez sur la page de votre Virtual Airline
2. Cliquez sur le bouton jaune **"📋 Validate PIREPs"**

**Option B - Depuis Management :**
1. Allez dans **"🛠️ Manage VA"**
2. Cliquez sur l'onglet **"📋 PIREPs"**

### 2. Filtrer les PIREPs

En haut de la page, utilisez les onglets pour filtrer :
- **⏳ Pending** : Vols en attente de validation (prioritaire)
- **✅ Approved** : Vols déjà approuvés
- **❌ Rejected** : Vols rejetés
- **📊 All** : Tous les rapports

### 3. Examiner un PIREP

Cliquez sur n'importe quel PIREP dans la liste pour voir :
- 📍 **Informations de route** (départ, arrivée, avion)
- ⏱️ **Performance du vol** (durée, distance, carburant, landing rate)
- 🗺️ **Carte interactive** du trajet complet avec waypoints
- 📊 **Télémétrie détaillée** (altitude max, vitesse, etc.)

### 4. Valider un PIREP (Pending uniquement)

Dans la fenêtre de détails :

1. **Choisir l'action :**
   - ✅ **Approve** : Accepter le vol
   - ❌ **Reject** : Refuser le vol

2. **Si vous approuvez :**
   - Vérifiez les **points attribués** (calculés automatiquement)
   - Ajustez si nécessaire
   - Ajoutez des **notes** (optionnel, mais recommandé)

3. **Cliquer sur le bouton de validation**

### 5. Critères d'évaluation suggérés

#### ✅ Bon pour approbation :
- Landing rate < 300 fpm
- Route correctement suivie
- Durée de vol réaliste
- Données télémétriques complètes

#### ❌ Motifs de rejet :
- Landing rate > 600 fpm (crash)
- Route non respectée
- Durée de vol anormale
- Données manquantes ou suspectes
- Utilisation de pauses excessives

### 6. Calcul automatique des points

Le système calcule automatiquement les points selon :

**Base :** 100 points

**Bonus distance :**
- +50 points si > 500 NM
- +100 points si > 1000 NM

**Bonus atterrissage :**
- +50 points si landing rate < 100 fpm
- +100 points si landing rate < 50 fpm

**Exemple :**
- Vol de 800 NM avec -85 fpm = 100 + 50 + 50 = **200 points**

### 7. Effets de l'approbation

Quand vous approuvez un PIREP :
- ✅ Le pilote reçoit les points
- 📈 Son compteur de vols s'incrémente
- ⏱️ Ses heures de vol augmentent
- 📊 Ses stats VA sont mises à jour

### 8. Communication avec les pilotes

**Utilisez les notes admin pour :**
- Féliciter un excellent vol
- Donner des conseils d'amélioration
- Expliquer un rejet
- Encourager le pilote

**Exemples de notes :**
- ✅ Approuvé : "Excellent vol ! Landing parfait à -65 fpm. Continue comme ça ! 🎉"
- ❌ Rejeté : "Landing trop dur (-450 fpm). Essaie de descendre plus doucement. Bon vol suivant ! 💪"

### 9. Bonnes pratiques

1. **Réactivité** : Validez les PIREPs sous 24-48h
2. **Cohérence** : Utilisez les mêmes critères pour tous
3. **Communication** : Laissez toujours une note, surtout en cas de rejet
4. **Équité** : Soyez juste mais pas trop strict
5. **Encouragement** : Valorisez les progrès

### 10. Raccourcis clavier (dans la modale)

- **Échap** : Fermer la modale
- **Tab** : Naviguer entre les champs

---

## Questions fréquentes

**Q: Peut-on modifier une validation déjà faite ?**
R: Non, actuellement les validations sont définitives. Soyez sûr avant de valider.

**Q: Le pilote est-il notifié ?**
R: Pas encore, mais c'est prévu dans une future mise à jour.

**Q: Peut-on voir l'historique de tous les vols d'un pilote ?**
R: Oui, cliquez sur son nom pour accéder à son profil.

**Q: Que faire si les données télémétri ques sont incomplètes ?**
R: Si les données essentielles (départ, arrivée, durée) sont présentes, vous pouvez approuver. Sinon, rejetez avec une note explicative.

---

*Guide créé le 24 octobre 2025*
