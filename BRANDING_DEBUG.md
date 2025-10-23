# 🐛 Déboguer le problème de branding

## Problème : Les couleurs de la VA 1 s'affichent sur la VA 2

### Étape 1 : Vérifier la migration SQL

**Double-cliquez sur :** `check-branding-columns.bat`

Ou exécutez :
```bash
mysql -u root -p flynova -e "SHOW COLUMNS FROM virtual_airlines WHERE Field IN ('primary_color', 'secondary_color', 'accent_color', 'text_on_primary');"
```

**Résultat attendu :** 4 lignes affichées
- `primary_color`
- `secondary_color`
- `accent_color`
- `text_on_primary`

**Si aucune ligne n'apparaît :** La migration n'a pas été appliquée !
→ Exécutez `apply-branding-migration.bat`

---

### Étape 2 : Vérifier les données dans la base

```sql
SELECT id, name, primary_color, secondary_color, accent_color 
FROM virtual_airlines;
```

**Résultat attendu :**
```
+----+-----------+---------------+-----------------+--------------+
| id | name      | primary_color | secondary_color | accent_color |
+----+-----------+---------------+-----------------+--------------+
|  1 | VA 1      | #FF6600       | #FF8800         | #FFB84D      |
|  2 | VA 2      | #003087       | #BA0C2F         | #0057A6      |
+----+-----------+---------------+-----------------+--------------+
```

**Si toutes les VAs ont les mêmes couleurs (`#00c853`) :**
→ Les couleurs n'ont pas été définies lors de la création
→ Vous devez les mettre à jour manuellement

---

### Étape 3 : Vérifier les logs dans le navigateur

1. Ouvrir le navigateur (Chrome/Edge)
2. Appuyer sur **F12** pour ouvrir les DevTools
3. Aller dans l'onglet **Console**
4. Naviguer vers le dashboard de la **VA 2**
5. Observer les messages de log

**Logs attendus :**
```
🎨 Fetching branding for VA ID: 2
🎨 VA Data received: {
  id: 2,
  name: "VA 2",
  primary_color: "#003087",
  secondary_color: "#BA0C2F",
  ...
}
🎨 BrandingContext: Setting branding for VA 2 with colors: {...}
✅ CSS Variables applied: {primary: "#003087", ...}
✅ Branding applied for: VA 2
```

**Si vous voyez :**
```
primary_color: undefined
```
→ La migration SQL n'a pas été appliquée OU les données sont null

**Si vous voyez :**
```
primary_color: "#00c853"  (pour les 2 VAs)
```
→ Les couleurs n'ont pas été définies lors de la création des VAs

---

### Étape 4 : Mettre à jour manuellement les couleurs

Si les VAs ont déjà été créées AVANT l'application de la migration, leurs couleurs sont NULL. Mettez-les à jour :

```sql
-- VA 1 (exemple easyJet)
UPDATE virtual_airlines 
SET 
  primary_color = '#FF6600',
  secondary_color = '#FF8800',
  accent_color = '#FFB84D',
  text_on_primary = '#FFFFFF'
WHERE id = 1;

-- VA 2 (exemple Air France)
UPDATE virtual_airlines 
SET 
  primary_color = '#003087',
  secondary_color = '#BA0C2F',
  accent_color = '#0057A6',
  text_on_primary = '#FFFFFF'
WHERE id = 2;
```

Puis **actualisez la page** (Ctrl+R ou F5)

---

### Étape 5 : Vérifier les CSS Variables

Dans la console du navigateur, tapez :
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
```

**Résultat attendu :**
- Dans dashboard VA 1 : `"#FF6600"` (ou la couleur de VA 1)
- Dans dashboard VA 2 : `"#003087"` (ou la couleur de VA 2)
- Hors dashboard : `"#00c853"` (vert FlyNova)

---

### Étape 6 : Forcer le rechargement

Si le problème persiste :

1. **Vider le cache du navigateur :**
   - Chrome/Edge : `Ctrl + Shift + Delete`
   - Sélectionner "Images et fichiers en cache"
   - Cliquer "Effacer les données"

2. **Hard reload :**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

3. **Redémarrer le serveur Next.js :**
   ```bash
   # Terminal où Next.js tourne
   Ctrl + C
   npm run dev
   ```

---

### Solutions selon le diagnostic

#### ❌ Migration SQL non appliquée
```bash
# Solution :
apply-branding-migration.bat
```

#### ❌ Couleurs NULL dans la BDD
```sql
-- Solution : Mettre à jour manuellement (voir Étape 4)
UPDATE virtual_airlines SET primary_color = '#FF6600' WHERE id = 1;
```

#### ❌ Hook ne se met pas à jour
→ Vérifier les logs de la console
→ Le `vaId` change-t-il bien ?
→ Voir si `useEffect` se déclenche

#### ❌ CSS Variables ne changent pas
→ Vérifier que `setVABranding` est bien appelé
→ Inspecter les variables CSS dans DevTools (Elements → :root)

---

### Script de test complet

Copiez-collez dans la console du navigateur :

```javascript
// Test 1 : Vérifier les variables CSS actuelles
console.log('🎨 CSS Variables actuelles:');
console.log('Primary:', getComputedStyle(document.documentElement).getPropertyValue('--color-primary'));
console.log('Secondary:', getComputedStyle(document.documentElement).getPropertyValue('--color-secondary'));

// Test 2 : Vérifier l'URL actuelle
console.log('📍 URL:', window.location.pathname);

// Test 3 : Forcer un changement de couleur manuel
document.documentElement.style.setProperty('--color-primary', '#FF0000');
console.log('🔴 Couleur forcée à rouge. Si les éléments deviennent rouges, le système CSS fonctionne.');
```

---

### ✅ Checklist finale

- [ ] Migration SQL appliquée
- [ ] Colonnes existent dans `virtual_airlines`
- [ ] Chaque VA a des couleurs différentes dans la BDD
- [ ] Logs s'affichent correctement dans la console
- [ ] CSS Variables changent quand on change de VA
- [ ] Cache navigateur vidé
- [ ] Serveur Next.js redémarré

---

### 🆘 Si rien ne fonctionne

1. **Partagez les logs de la console** (copier-coller tout)
2. **Partagez le résultat de :**
   ```sql
   SELECT id, name, primary_color, secondary_color 
   FROM virtual_airlines;
   ```
3. **Indiquez l'URL** où vous avez le problème
4. **Vérifiez la version de Next.js :** `npm list next`

---

**La cause la plus probable :** Les colonnes de couleur n'existent pas encore car la migration n'a pas été appliquée.
