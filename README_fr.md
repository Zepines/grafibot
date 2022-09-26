[English](https://github.com/Zepines/grafibot/blob/main/README.md)

# Grafibot
Grafibot est un robot Discord conçu pour la guilde Discord [Grafikart](https://grafikart.fr/tchat). Il vise à être une meilleure solution que le [robot actuel](https://github.com/Grafikart/grafibot), en reprenant ses fonctionnalités et en ajoutant des nouvelles.

Ce robot n'est pas conçu pour être utilisé sur une autre guilde.<br/>
Cependant, vous pouvez facilement l'adapter à votre guilde et à vos besoins.

# Mise en route
## Prérequis
`Node.js` version `16.17.0` ou plus récent.<br/>
`npm` version `8.15.0` ou plus récent.

## Installation
### Télécharger la dernière version
Téléchargez la dernière version de Grafibot sur la [page des versions](https://github.com/Zepines/grafibot/releases).

### Installer les dépendances
```console
npm install
```

### Variables d'environnement
Ce robot utilise un fichier `.env` pour stocker certaines configurations.

Vous avez besoin d'en créer un avec les variables suivantes:
```txt
# Le jeton de votre robot
CREDENTIAL_BOT_TOKEN=

# L'ID de votre application
CREDENTIAL_APPLICATION_ID=

# L'ID de l'administrateur de la guilde
# Cet utilisateur sera mentionné dans le salon de journalisation quand nécessaire
USER_ID_GRAFIKART=

# L'ID de votre guilde
CREDENTIAL_GUILD_ID=

# L'ID de votre rôle attribué aux modérateurs
# Ce rôle est utilisé pour restreindre certaines actions aux modérateurs
ROLE_ID_ACCUSTOMED=

# L'ID du salon de journalisation
CHANNEL_ID_LOGS=

# L'ID du salon du règlement
CHANNEL_ID_RULES=

# L'émoticône utilisée pour la ReactionResponse "Big Brain"
# Doit être une émoticône Unicode, par exemple "🧠"
EMOJI_NAME_BIG_BRAIN=

# Emojis name for the "Report" reaction response
# Doit être une émoticône Unicode, par exemple "👮"
EMOJI_NAME_REPORT=

# Emojis name for the "Dry" reaction response
# Doit être une émoticône Unicode, par exemple "🏜"
EMOJI_NAME_DRY=
```

### Construire le projet
Compilez le projet TypeScript en JavaScript.

#### En utilisant `npm`
```console
npm run build
```

#### En utilisant directement le module `typescript`
```
tsc
```

### Démarrer le robot
Vous pouvez maintenant démarrer le robot.

#### En utilisant `npm`
```console
npm run start
```

#### En utilisant directement `node`
```
node ./dist/
```

# Licence
Ce projet est distribué sous la [licence MIT](https://github.com/Zepines/grafibot/blob/main/LICENSE).