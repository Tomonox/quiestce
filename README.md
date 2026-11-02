# 🧠 BRAINROT QUI EST-CE ? (Roblox Steal a Brainrot)

Jeu web multijoueur en ligne en temps réel inspiré du célèbre jeu de société **« Qui est-ce ? »**, mettant en scène les véritables personnages et illustrations de l'univers **Steal a Brainrot (Roblox)** !

Développé pour être déployé en 1 clic sur **[Render.com](https://render.com)**.

---

## 🌟 Fonctionnalités Principales

- **🎮 Multijoueur en Ligne Synchrone (2 Joueurs) :**
  - Création de salon avec code unique à 5 caractères (ex: `X5MMN`).
  - Lien d'invitation direct partageable (`?room=CODE`).
  - Salle d'attente (Lobby) avec statut en direct des 2 joueurs.
  - Synchronisation instantanée via **WebSockets (Socket.IO)**.

- **🖼️ 180 Vrais Brainrots & Images Officielles :**
  - Données et images récupérées depuis l'API officielle Fandom de *Steal a Brainrot*.
  - Raretés authentiques : *Common, Rare, Epic, Legendary, Mythic, Secret, OG, Brainrot God*.
  - Images officielles téléchargées et servies localement avec proxy CDN et fallback SVG.
  - Caractéristiques physiques : Animal, Nourriture, Chapeau, Lunettes, Arme, Couleurs, Volant, Duo/Famille.

- **🃏 Plateau de Jeu & Mécaniques Authentiques :**
  - Plateau personnel interactif : cliquez sur une carte pour l'éliminer (effet grisé + tampon rouge).
  - **Éliminations strictly personnelles :** votre adversaire ne voit pas quelles cartes vous éliminez (seul un compteur de progression est partagé).
  - Recherche instantanée et filtres par rareté ou traits physiques (Chapeau, Animal, Nourriture, etc.).

- **❓ Système de Questions Double Mode :**
  - **Mode Questions Rapides :** classées par catégories (*Rareté, Espèce & Nature, Couleur, Accessoires*).
  - **Mode Question Libre :** champ de texte personnalisé.
  - Invite de réponse pour l'adversaire avec boutons **OUI / NON** et rappel de son Brainrot secret.
  - Historique complet des questions/réponses accessible à tout moment.

- **🎯 Accusation Finale (« DEVINER ») :**
  - Le joueur peut tenter d'accuser le Brainrot adverse à son tour.
  - **Victoire immédiate** si l'accusation est exacte (confettis + fanfare !).
  - **Défaite immédiate** en cas d'erreur !

- **🔒 Sécurité & Anti-Triche Serveur :**
  - Le Brainrot mystère adverse est conservé exclusivement côté serveur et n'est **jamais** envoyé sur le réseau avant la fin de la partie.
  - Validation stricte des tours côté serveur.

- **🔊 Effets Sonores Rétro & Modernes :**
  - Bruitages synthétisés via l'API Web Audio (retournement de carte, notification de tour, fanfare de victoire, alerte).
  - Bouton pour couper/activer le son.

- **📖 Encyclopédie & Règles Intégrées :**
  - Consultation des 180 Brainrots avec stats, revenus ($/s), coût et citations.

---

## 🚀 Déploiement sur Render.com

Ce projet est configuré pour être déployé directement sur **Render.com** en tant que **Web Service Node.js** :

### Méthode 1 : Déploiement Blueprint (Automatique)
1. Poussez ce dépôt sur votre compte GitHub.
2. Rendez-vous sur [dashboard.render.com](https://dashboard.render.com).
3. Cliquez sur **New +** > **Blueprint**.
4. Sélectionnez votre dépôt : Render détecte automatiquement `render.yaml` et configure le service web !

### Méthode 2 : Déploiement Manuel
1. Créez un **Web Service** sur Render.
2. Reliez votre dépôt GitHub.
3. Configurez les options suivantes :
   - **Environment :** `Node`
   - **Build Command :** `npm run install-all && npm run build`
   - **Start Command :** `npm start`
4. Ajoutez la variable d'environnement :
   - `NODE_ENV` = `production`
5. Cliquez sur **Create Web Service**. Votre jeu sera accessible sur `https://votre-jeu.onrender.com` !

---

## 💻 Exécution en Local

### Prérequis
- Node.js version 18 ou supérieure.

### 1. Installation
```bash
npm run install-all
```

### 2. Démarrer le jeu
```bash
npm start
```
Ouvrez votre navigateur sur **`http://localhost:3005`** !

Pour tester le multijoueur, ouvrez un deuxième onglet (ou une fenêtre de navigation privée), créez un salon sur le premier et rejoignez-le avec le code sur le second.

---

## 📁 Architecture du Projet

```
QuiEstCe/
├── server/
│   ├── index.js              # Serveur Express & Socket.IO (production + WebSocket)
│   ├── gameManager.js        # Gestionnaire des salons, tours et secrets anti-triche
│   ├── brainrotData.js       # Chargement et génération des plateaux équilibrés
│   ├── data/
│   │   ├── brainrots.json    # Base de données locale des 180 Brainrots
│   │   └── images/           # Illustrations officielles sauvegardées localement
│   └── scripts/
│       └── fetchBrainrots.js # Script de scraping de l'API Fandom Steal a Brainrot
├── client/                   # Application Frontend React
│   ├── src/
│   │   ├── App.tsx           # Orchestration des états Socket.IO & navigation
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Barre de navigation & compteurs
│   │   │   ├── Home.tsx              # Page d'accueil & profil
│   │   │   ├── Lobby.tsx             # Salon d'attente multijoueur
│   │   │   ├── GameBoard.tsx         # Plateau de jeu principal
│   │   │   ├── CharacterCard.tsx     # Carte Brainrot avec élimination 3D
│   │   │   ├── QuestionModal.tsx     # Sélection de questions prédéfinies / libres
│   │   │   ├── AnswerPrompt.tsx      # Modal OUI / NON pour l'adversaire
│   │   │   ├── GuessModal.tsx        # Modal d'accusation finale
│   │   │   ├── GameOverModal.tsx     # Écran de fin & revanche
│   │   │   ├── HistoryDrawer.tsx     # Historique des tours
│   │   │   ├── RulesModal.tsx        # Guide des règles en français
│   │   │   └── EncyclopediaModal.tsx # Galerie des 180 personnages
│   │   └── utils/
│   │       └── audio.ts              # Synthétiseur sonore Web Audio API
├── render.yaml               # Configuration de déploiement Render
└── package.json              # Scripts racine & dépendances
```

---

## 🎮 Crédits & Univers
Inspiré du célèbre jeu de plateau **Qui est-ce ?** (Hasbro) et de l'univers du jeu Roblox **Steal a Brainrot** développé par Brazilian Spyder.
Toutes les illustrations sont issues des assets communautaires du jeu.
