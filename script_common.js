// fonctions partagées par toutes les pages : équipe (localStorage), cartes et messages
const API_URL = "https://pokeapi.co/api/v2/";
const TEAM_KEY = "pokemonTeam";
const TEAM_MAX = 6;

// renvoie l'équipe enregistrée (tableau vide si rien n'est enregistré)
function getTeam() {
  return JSON.parse(localStorage.getItem(TEAM_KEY)) || [];
}

function saveTeam(team) {
  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
  updateTeamBadge();
}

// compteur de l'équipe à côté du lien "My Pokédex" dans la barre de navigation
function updateTeamBadge() {
  document.querySelectorAll(".team-badge").forEach((badge) => {
    badge.textContent = getTeam().length + "/" + TEAM_MAX;
  });
}

function isInTeam(id) {
  return getTeam().some((pokemon) => pokemon.id === id);
}

// ajoute un pokemon à l'équipe, renvoie false si l'équipe est déjà complète
function addToTeam(pokemon) {
  const team = getTeam();
  if (team.length >= TEAM_MAX) {
    return false;
  }
  team.push(pokemon);
  saveTeam(team);
  return true;
}

function removeFromTeam(id) {
  saveTeam(getTeam().filter((pokemon) => pokemon.id !== id));
}

// garde seulement les infos utiles de la réponse de l'API (pour la carte et l'équipe)
function simplifyPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites.other["official-artwork"].front_default ||
      data.sprites.front_default,
    types: data.types.map((t) => t.type.name),
    // puissance : total des statistiques de base (hp, attaque, défense...)
    power: data.stats.reduce((total, s) => total + s.base_stat, 0),
  };
}

// étiquettes des types (la classe "type-fire", "type-water"... donne la couleur)
function createTypes(types) {
  const list = document.createElement("div");
  list.className = "types";
  types.forEach((name) => {
    const type = document.createElement("span");
    type.className = "type type-" + name;
    type.textContent = name;
    list.appendChild(type);
  });
  return list;
}

// bouton "Add to team", désactivé si le pokemon est déjà dans l'équipe
function createTeamButton(pokemon) {
  const btn = document.createElement("button");
  btn.className = "btn";

  if (isInTeam(pokemon.id)) {
    btn.textContent = "In your team";
    btn.disabled = true;
  } else {
    btn.textContent = "Add to team";
  }

  btn.addEventListener("click", () => {
    if (addToTeam(pokemon)) {
      btn.textContent = "In your team";
      btn.disabled = true;
    } else {
      btn.textContent = "Team is full (6 max)";
    }
  });
  return btn;
}

// création de la carte pokemon (image, numéro, nom, types, boutons)
function createPokemonCard(pokemon) {
  const card = document.createElement("article");
  // la couleur du premier type sert au fond de l'image
  card.className = "pokemon-card type-" + pokemon.types[0];
  // numéro gardé sur la carte pour la retrouver au retour sur la page
  card.dataset.id = pokemon.id;

  // cadre autour de l'image, pour l'agrandir au survol sans sortir de la carte
  const imgBox = document.createElement("div");
  imgBox.className = "card-image";

  const img = document.createElement("img");
  img.src = pokemon.image;
  img.alt = pokemon.name;
  img.loading = "lazy";
  imgBox.appendChild(img);

  const num = document.createElement("p");
  num.className = "number";
  num.textContent = "#" + pokemon.id;

  const name = document.createElement("h2");
  name.textContent = pokemon.name;

  // lien qui renvoie à la page details
  const btnDetails = document.createElement("a");
  btnDetails.className = "btn btn-red";
  btnDetails.href = `details.html?id=${pokemon.id}`;
  btnDetails.textContent = "See details";

  card.appendChild(imgBox);
  card.appendChild(num);
  card.appendChild(name);
  const types = createTypes(pokemon.types);
  // étiquette de rareté (seulement sur la page Discover, quand une région est choisie)
  if (pokemon.rarity && pokemon.rarity !== "common") {
    const rarity = document.createElement("span");
    rarity.className = "rarity";
    rarity.textContent = pokemon.rarity;
    types.appendChild(rarity);
  }
  card.appendChild(types);

  // les pokemon enregistrés avant l'ajout de la puissance n'en ont pas
  if (pokemon.power) {
    const power = document.createElement("p");
    power.className = "power";
    power.textContent = "Power " + pokemon.power;
    card.appendChild(power);
  }

  card.appendChild(btnDetails);
  return card;
}

// vrai si on arrive sur la page avec le bouton "précédent" (du navigateur ou du site)
function isBackNavigation() {
  const navigation = performance.getEntriesByType("navigation")[0];
  return navigation !== undefined && navigation.type === "back_forward";
}

// message affiché à la place du contenu (chargement, aucun résultat, erreur)
function showMessage(container, text) {
  container.textContent = "";
  const message = document.createElement("p");
  message.className = "message";
  message.textContent = text;
  container.appendChild(message);
}

// affiche le compteur dès le chargement de la page
updateTeamBadge();

// bouton "Back to top" : visible quand on a descendu la page, remonte tout en haut
function createTopButton() {
  const btn = document.createElement("button");
  btn.id = "top-btn";
  btn.setAttribute("aria-label", "Back to top");

  // icône dessinée en SVG (flèche vers le haut)
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "22");
  svg.setAttribute("height", "22");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "M12 19V5M5 12l7-7 7 7");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "3");
  svg.appendChild(path);
  btn.appendChild(svg);

  btn.addEventListener("click", () => {
    // défilement direct si l'utilisateur a demandé moins d'animations
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("visible", window.scrollY > 600),
    { passive: true },
  );
  document.body.appendChild(btn);
}

createTopButton();
