# 🚀 Guide de Démarrage Rapide - Dashboard Pilote

Ce guide vous aidera à démarrer rapidement avec le nouveau dashboard pilote et l'intégration SimBrief.

## ⚡ Installation Rapide

### 1. Mise à jour de la base de données

Exécutez le script de migration SQL pour ajouter le support SimBrief :

```bash
# Dans phpMyAdmin ou MySQL Workbench
# Ouvrez et exécutez le fichier: add-simbrief-to-flights.sql
```

Ou en ligne de commande :

```bash
mysql -u root -p flynova < add-simbrief-to-flights.sql
```

### 2. Configuration

Aucune configuration supplémentaire n'est nécessaire ! La clé API SimBrief est déjà intégrée.

### 3. Démarrage du serveur

```bash
# Démarrer le backend
cd server
npm start

# Démarrer le frontend (nouveau terminal)
cd ..
npm run dev
```

## 📍 Accès aux Nouvelles Pages

### Pour les Pilotes

1. **Dashboard Pilote**
   ```
   http://localhost:3000/va/[ID_DE_LA_VA]/pilot/dashboard
   ```
   Remplacez `[ID_DE_LA_VA]` par l'ID de votre compagnie virtuelle

2. **Réserver un Vol**
   ```
   http://localhost:3000/va/[ID_DE_LA_VA]/pilot/book-flight
   ```

3. **Briefing de Vol**
   ```
   http://localhost:3000/va/[ID_DE_LA_VA]/pilot/briefing/[ID_DU_VOL]
   ```
   Cette page s'affiche automatiquement après la réservation d'un vol

## 🎯 Workflow Complet

### Étape 1 : Rejoindre une VA

1. Aller sur la page des Virtual Airlines
2. Cliquer sur une VA qui vous intéresse
3. Cliquer sur "Join This VA"

### Étape 2 : Accéder au Dashboard

1. Une fois membre, aller sur la page de la VA
2. Cliquer sur le bouton du dashboard pilote OU
3. Naviguer directement vers `/va/[ID]/pilot/dashboard`

### Étape 3 : Réserver un Vol

1. Sur le dashboard, cliquer sur "Book a Flight"
2. Parcourir les routes disponibles
3. Utiliser les filtres pour trouver la route souhaitée
4. Cliquer sur une route pour la sélectionner
5. Choisir un avion de la flotte
6. Cliquer sur "Book & Continue to Briefing"

### Étape 4 : Générer le Briefing

1. Sur la page de briefing, cliquer sur "Generate with SimBrief"
2. Une popup s'ouvre avec SimBrief
3. Compléter le processus SimBrief (si vous avez un compte Navigraph)
4. Récupérer votre OFP ID depuis l'URL ou votre compte SimBrief
5. Entrer l'OFP ID dans le prompt
6. Le briefing complet s'affiche automatiquement !

### Étape 5 : Voler

1. Télécharger le tracker FlyNova (si ce n'est pas déjà fait)
2. Lancer votre simulateur à l'aéroport de départ
3. Démarrer le tracker
4. Cliquer sur "Mark Flight as Started" dans le briefing
5. Profitez de votre vol ! ✈️

## 🔍 Fonctionnalités Clés

### Dashboard Pilote

- **Statistiques personnelles** : Vos vols, heures, points et rang
- **Événements actifs** : Participez aux challenges de la VA
- **Vols en direct** : Voyez qui vole actuellement
- **Accès rapide** : Liens directs vers réservation et tracker

### Réservation de Vol

- **Recherche intelligente** : Trouvez rapidement votre route
- **Filtres multiples** : Par type de route (Civil, Cargo, Private)
- **Sélection d'avion** : Choisissez parmi la flotte disponible
- **Interface visuelle** : Design moderne et intuitif

### Briefing SimBrief

#### Onglets disponibles :
1. **Overview** : Vue d'ensemble du vol + carte
2. **Route** : Route complète et aéroport de dégagement
3. **Weather** : METARs de départ et d'arrivée
4. **Fuel** : Plan carburant complet
5. **Weights** : Poids et limites

#### Données affichées :
- Distance et durée du vol
- Altitude de croisière
- Vents moyens
- Plan carburant détaillé
- Poids et limites de l'avion
- Carte de vol interactive
- Météo actuelle

## 🛠️ Résolution des Problèmes

### Le popup SimBrief ne s'ouvre pas

**Solution** : Autoriser les popups pour localhost dans votre navigateur
- Chrome : Cliquer sur l'icône de popup dans la barre d'adresse
- Firefox : Paramètres → Vie privée → Permissions → Popups

### Les données SimBrief ne s'affichent pas

**Vérifications** :
1. L'OFP ID est-il correct ? (8-12 chiffres)
2. Le plan de vol a-t-il bien été généré sur SimBrief ?
3. Vérifier la console du navigateur pour les erreurs

### Erreur "Not a member of this VA"

**Solution** : Assurez-vous d'avoir rejoint la VA via le bouton "Join This VA"

### Routes ou avions non disponibles

**Solution** : 
1. Vérifier que la VA a bien créé des routes et ajouté des avions
2. Les administrateurs peuvent gérer cela dans `/va/[ID]/manage`

## 📊 Tests Recommandés

### Créer une VA de Test

```sql
-- Créer un utilisateur test
INSERT INTO users (email, username, password_hash) 
VALUES ('pilot@test.com', 'TestPilot', '$2a$10$...');

-- Créer une VA
INSERT INTO virtual_airlines (name, callsign, owner_id, description)
VALUES ('Test Airways', 'TST', 1, 'Test Virtual Airline');

-- Ajouter une route
INSERT INTO va_routes (va_id, flight_number, route_type, departure_icao, departure_name, arrival_icao, arrival_name)
VALUES (1, 'TST001', 'Civil', 'LFPG', 'Paris Charles de Gaulle', 'EGLL', 'London Heathrow');

-- Ajouter un avion
INSERT INTO va_fleet (va_id, registration, aircraft_type, aircraft_name, home_airport)
VALUES (1, 'F-TEST', 'B738', 'Boeing 737-800', 'LFPG');
```

### Scénario de Test

1. ✅ S'inscrire et se connecter
2. ✅ Rejoindre la VA de test
3. ✅ Accéder au dashboard pilote
4. ✅ Réserver le vol TST001
5. ✅ Générer un briefing SimBrief
6. ✅ Vérifier toutes les données du briefing
7. ✅ Marquer le vol comme démarré

## 📝 Notes Importantes

### Compte SimBrief/Navigraph

Pour utiliser SimBrief, les pilotes doivent :
- Avoir un compte Navigraph (gratuit ou premium)
- Se connecter lors de la génération du plan de vol
- L'API ne bypasse PAS le système de login SimBrief

### Limitations

- Un pilote peut réserver plusieurs vols à la fois
- Les vols réservés ne sont pas automatiquement annulés
- Le tracker doit être développé séparément pour la soumission des PIREPs

### Sécurité

- Toutes les routes nécessitent une authentification JWT
- Les pilotes ne peuvent voir que leurs propres vols
- Les admins ont accès à tous les vols de leur VA

## 🎨 Personnalisation

### Modifier les Couleurs

Dans `tailwind.config.ts`, ajustez les couleurs aviation :

```typescript
colors: {
  aviation: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ... jusqu'à 900
  }
}
```

### Ajouter des Champs SimBrief

Dans `src/lib/simbrief.ts`, étendez l'interface `SimbriefData` :

```typescript
export interface SimbriefData {
  // Champs existants...
  
  // Nouveaux champs
  navlog?: any;
  atc?: any;
  // etc.
}
```

## 🔗 Ressources Utiles

- [Documentation SimBrief API](https://forum.navigraph.com/t/the-simbrief-api/5298)
- [Navigraph](https://navigraph.com/)
- [SimBrief Website](https://www.simbrief.com/)
- [FlyNova Documentation](./PILOT_DASHBOARD_FEATURE.md)

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] Exécuter la migration SQL
- [ ] Configurer les variables d'environnement
- [ ] Tester le workflow complet
- [ ] Vérifier les permissions des fichiers uploadés
- [ ] Tester avec différents navigateurs
- [ ] Vérifier la compatibilité mobile
- [ ] Documenter pour les utilisateurs finaux
- [ ] Créer des routes et avions de démo
- [ ] Tester l'intégration SimBrief
- [ ] Vérifier les logs serveur

## 🎉 C'est Tout !

Vous êtes maintenant prêt à utiliser le dashboard pilote avec l'intégration SimBrief !

Pour toute question ou problème, consultez la documentation complète dans `PILOT_DASHBOARD_FEATURE.md`.

**Bon vol ! ✈️**
