# 🎨 Personnalisation de la Page d'Accueil FlyNova

## 📝 Modifications Effectuées

La page d'accueil de FlyNova a été complètement refaite avec :

### ✅ Sections Ajoutées/Améliorées

1. **Hero Section** - Section d'accueil avec gradient et animation
2. **Features Section** - Fonctionnalités principales de FlyNova
3. **Virtual Airlines** - Affichage des VAs actives (limité à 6 sur la page d'accueil)
4. **How It Works** - Explication détaillée du fonctionnement de FlyNova
5. **ACARS Section** - Présentation complète du système de tracking
6. **Support Section** - Section professionnelle avec bouton de donation PayPal
7. **CTA Section** - Appel à l'action avec avantages
8. **Footer** - Footer complet avec liens et réseaux sociaux

### ❌ Sections Supprimées

- **Statistics Section** (FlyNova by the Numbers) - Complètement retirée
- **Testimonials Section** - Remplacée par la section Support

## 🔧 Configuration du Lien PayPal

### Étape 1 : Trouver votre lien PayPal.me

1. Allez sur [https://www.paypal.me](https://www.paypal.me)
2. Créez votre lien PayPal.me si vous n'en avez pas
3. Votre lien sera du format : `https://www.paypal.com/paypalme/VotreNom`

### Étape 2 : Modifier le lien dans le code

Ouvrez le fichier : `src/app/page.tsx`

Cherchez la ligne (environ ligne 380) :

```tsx
<a 
  href="https://www.paypal.com/paypalme/YourPayPalUsername" 
  target="_blank" 
  rel="noopener noreferrer"
  className="inline-flex items-center gap-3..."
>
```

Remplacez `YourPayPalUsername` par votre nom d'utilisateur PayPal.

**Exemple :**
```tsx
href="https://www.paypal.com/paypalme/JohnDoe"
```

### Étape 3 : Modifier le lien dans le footer (optionnel)

Le même lien apparaît dans le footer (environ ligne 550) :

```tsx
<li><a href="https://www.paypal.com/paypalme/YourPayPalUsername" ...>Support Us</a></li>
```

Remplacez également `YourPayPalUsername` ici.

## 🎨 Personnalisation Supplémentaire

### Changer le texte de la section donation

Dans `src/app/page.tsx`, cherchez la section "Support FlyNova Development" :

```tsx
<h3 className="text-3xl font-bold mb-4 text-slate-900">Support FlyNova Development</h3>
<p className="text-lg text-slate-700 mb-8">
  FlyNova is completely <strong>free to use</strong> and will always remain so...
</p>
```

Vous pouvez modifier ce texte selon vos préférences.

### Modifier les réseaux sociaux

Dans le footer, les liens GitHub et Discord sont configurables :

```tsx
<a href="https://github.com/flynova" target="_blank" ...>
  {/* Icône GitHub */}
</a>
<a href="https://discord.gg/flynova" target="_blank" ...>
  {/* Icône Discord */}
</a>
```

Remplacez par vos propres liens.

### Ajuster les couleurs

Les couleurs utilisent les classes Tailwind. Les couleurs principales sont :
- `aviation-600` - Bleu aviation principal
- `aviation-700` - Bleu aviation foncé
- `slate-900` - Noir/gris foncé

## 📱 Sections de la Nouvelle Page d'Accueil

### 1. Hero Section
- Grande bannière avec logo FlyNova
- Titre et description
- Boutons "Get Started" et "Sign In"
- Animation de scroll

### 2. Features Section
- 6 cartes de fonctionnalités
- Icônes et descriptions
- Animation au scroll

### 3. Virtual Airlines Section
- Affichage de 6 VAs maximum
- Carte pour chaque VA avec logo, nom, callsign, description
- Bouton "View All Virtual Airlines"

### 4. How It Works Section
- **4 étapes** expliquant le processus
- **Bloc "What is FlyNova?"** avec détails complets
- **Simulateurs compatibles** (MSFS, X-Plane, P3D, FSX)

### 5. ACARS Section
- **Fond sombre** avec dégradé
- **Explication ACARS** en 4 étapes
- **Données trackées** (8 éléments)
- **Avantages ACARS** (validation automatique, etc.)

### 6. Support Section
- **3 valeurs** : Open Source, Regular Updates, Reliable & Secure
- **Bloc de donation** avec :
  - Explication de l'utilité des dons
  - Liste des bénéfices (serveurs, features, bugs, support)
  - **Bouton PayPal** bleu avec icône
  - Message de remerciement

### 7. CTA Section
- **Appel à l'action** final
- 2 boutons : "Create Free Account" et "Browse Virtual Airlines"
- **3 avantages** : No credit card, Free forever, Open source

### 8. Footer
- **Logo et description**
- **Liens réseaux sociaux** (GitHub, Discord)
- **Menu Platform** (VAs, ACARS, Downloads)
- **Menu Resources** (Docs, API, GitHub, Support)
- **Copyright et liens légaux**

## 🚀 Déploiement

Après avoir modifié les liens PayPal :

1. Sauvegardez le fichier `src/app/page.tsx`
2. Redémarrez le serveur Next.js si nécessaire :
   ```bash
   npm run dev
   ```
3. Vérifiez que les liens fonctionnent correctement
4. Testez le bouton PayPal en cliquant dessus

## ✨ Améliorations Futures Possibles

- [ ] Ajouter des statistiques réelles depuis l'API
- [ ] Intégrer un blog ou section actualités
- [ ] Ajouter une FAQ (Foire Aux Questions)
- [ ] Galerie de screenshots
- [ ] Vidéo de présentation
- [ ] Témoignages de vrais utilisateurs
- [ ] Section "Featured VAs" avec mise en avant

## 📞 Support

Si vous avez besoin d'aide pour personnaliser davantage la page d'accueil, n'hésitez pas à consulter la documentation Next.js et Tailwind CSS.

## 🎉 C'est Terminé !

Votre page d'accueil FlyNova est maintenant prête avec :
- ✅ Design moderne et professionnel
- ✅ Explication claire de FlyNova
- ✅ Présentation détaillée d'ACARS
- ✅ Section VAs améliorée
- ✅ Bouton de donation PayPal fonctionnel
- ✅ Footer complet
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Animations smooth au scroll
