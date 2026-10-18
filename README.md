# Pokedex

Site web Pokémon réalisé en HTML, CSS et JavaScript (sans framework).
Les données et les images proviennent de l'API publique [PokéAPI](https://pokeapi.co/).
Le site s'adapte aux petits écrans (téléphone, tablette).
Police : Lato, hébergée dans le dossier `fonts/` (licence SIL Open Font License), sans dépendre de Google Fonts.
Les textes du site sont en anglais, comme les données fournies par l'API.

## Pages

| Page             | Description                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`     | Page d'accueil : bandeau avec des nuages animés et la barre de recherche (nom ou numéro, bouton ou touche Entrée), puis trois sections de présentation (Search, Discover, My Pokédex).               |
| `decouvrir.html` | « Discover » : tous les Pokémon dans l'ordre du Pokédex, 24 à la fois avec le bouton « Load more », ou filtrés par région (Kanto à Paldea), rareté (Common, Baby, Legendary, Mythical) et puissance. |     |
| `details.html`   | Fiche d'un Pokémon (`details.html?id=25`) : image officielle, nom suivi d'une petite image animée (sprite `showdown` de l'API, si elle existe), types, taille, poids, description et statistiques.   |
| `pokedex.html`   | « My Pokédex » : l'équipe du joueur (6 Pokémon maximum), avec un bouton pour retirer chaque Pokémon.                                                                                                 |

Les cartes Pokémon prennent la couleur de leur type (fond de la carte un peu plus foncé, fond clair derrière l'image et étiquettes des types, 18 couleurs définies dans `style.css`) ; au survol, la carte se soulève et l'image s'agrandit.
La barre de navigation affiche le nombre de Pokémon de l'équipe à côté du lien « My Pokédex ».
Le bouton « Add to team » (accueil, Discover, fiche) ajoute un Pokémon à l'équipe, enregistrée dans le `localStorage` du navigateur.
Un fil d'Ariane sous la barre de navigation indique où l'on est (`Home / Discover / Pikachu`, ou `Home / My Pokédex / Pikachu` si la fiche a été ouverte depuis l'équipe) ; ses liens ramènent à la page précédente.
En revenant sur une page (bouton « Back » de la fiche ou bouton précédent du navigateur), on retrouve l'endroit où on était : Discover remet les filtres, le même nombre de cartes et fait défiler jusqu'au Pokémon ouvert ; l'accueil relance la dernière recherche. Ces informations sont gardées dans le `sessionStorage` (seulement pour l'onglet ouvert).
Un bouton « Back to top » (en bas à droite, sur toutes les pages) apparaît quand on a descendu la page et ramène tout en haut.
Si l'API ne répond pas ou si le Pokémon n'existe pas, un message s'affiche sur la page.

## Structure

- `style.css` : feuille de style unique (navigation, pied de page, boutons, cartes, puis styles de chaque page).
- `script_common.js` : fonctions partagées par toutes les pages (équipe dans le `localStorage`, cartes Pokémon, messages).
- `script_index.js` : recherche de la page d'accueil.
- `script_decouvrir.js` : liste de la page Discover.
- `script_details.js` : fiche d'un Pokémon.
- `pokedex.js` : page de l'équipe.

Sur l'accueil, le bandeau remplit tout l'écran ; Lugia, Ho-Oh, Latias, Latios, Rayquaza, Articuno, Zapdos et Moltres (images animées `showdown` de PokéAPI) y volent entre les nuages, de droite à gauche.
Sous le bandeau, une prairie verte (colline dessinée dans `grass.svg`) accueille 14 Pokémon animés éparpillés autour des trois sections de présentation : les légendaires de Kanto et Johto (Mewtwo, Mew, Raikou, Entei, Suicune) et des Pokémon connus (Pikachu, Charmander, Charizard, Bulbasaur, Squirtle, Eevee, Jigglypuff, Snorlax, Psyduck). Sur téléphone, seuls 7 d'entre eux sont affichés.
Chaque Pokémon animé de l'accueil (dans le ciel ou dans la prairie) est un lien vers sa fiche ; au survol, il s'arrête et grossit un peu.
Images : `Logo_Pokedex.svg` (logo), `grass.svg` (colline de la prairie) et `cloud.svg` (nuages blancs de l'accueil, qui traversent le bandeau de droite à gauche ; ils restent immobiles si le système demande moins d'animations).
`maquette.pdf` contient la maquette d'origine du site.

## Lancer le projet

Aucune installation n'est nécessaire : il suffit d'ouvrir `index.html` dans un navigateur (ou avec Live Server).
Une connexion Internet est requise pour interroger l'API.

## Auteur

Abbassi Nabil
