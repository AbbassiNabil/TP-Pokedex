const pokemonContainer = document.getElementById("carosello");
const loadMoreBtn = document.getElementById("load-more");
const regionFilter = document.getElementById("region-filter");
const rarityFilter = document.getElementById("rarity-filter");
const powerFilter = document.getElementById("power-filter");
const filterHint = document.getElementById("filter-hint");
// nombre de pokemon chargés à chaque clic sur "Load more"
const PAGE_SIZE = 24;
// position dans la liste complète (nombre de pokemon déjà chargés)
let offset = 0;
// clé de l'état de la page gardé dans le sessionStorage (filtres, cartes chargées, carte ouverte)
const STATE_KEY = "discoverState";

// numéros des pokemon de chaque région (une génération = une région)
const REGIONS = {
  kanto: [1, 151],
  johto: [152, 251],
  hoenn: [252, 386],
  sinnoh: [387, 493],
  unova: [494, 649],
  kalos: [650, 721],
  alola: [722, 809],
  galar: [810, 905],
  paldea: [906, 1025],
};
// régions déjà chargées, gardées en mémoire pour ne pas refaire les requêtes
const regionCache = {};

function checkResponse(response) {
  if (!response.ok) {
    throw new Error("api");
  }
  return response.json();
}

function showCards(list) {
  list.forEach((pokemon) => {
    const card = createPokemonCard(pokemon);
    card.appendChild(createTeamButton(pokemon));
    pokemonContainer.appendChild(card);
  });
}

//recherche les pokemon suivants dans l api, puis le detail de chacun
function getPokemon(limit = PAGE_SIZE) {
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = "Loading...";
  // retire le message d'erreur d'un essai précédent
  const oldMessage = pokemonContainer.querySelector(".message");
  if (oldMessage) {
    oldMessage.remove();
  }

  let hasNext = true;
  return fetch(API_URL + "pokemon?offset=" + offset + "&limit=" + limit)
    .then(checkResponse)
    .then((data) => {
      offset += data.results.length;
      hasNext = data.next !== null;
      // Promise.all garde l'ordre des numéros, même si les réponses arrivent dans le désordre
      return Promise.all(
        data.results.map((pokemon) => fetch(pokemon.url).then(checkResponse)),
      );
    })
    .then((list) => {
      // l'utilisateur a choisi une région pendant le chargement
      if (regionFilter.value !== "") {
        return;
      }
      showCards(list.map(simplifyPokemon));

      // plus de bouton quand tous les pokemon sont affichés
      loadMoreBtn.hidden = !hasNext;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "Load more";
    })
    .catch(() => {
      const message = document.createElement("p");
      message.className = "message";
      message.textContent =
        "The Pokémon API is not responding. Try again later.";
      pokemonContainer.appendChild(message);
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "Try again";
    });
}

// rareté donnée par l'endpoint "pokemon-species"
function getRarity(species) {
  if (species.is_mythical) {
    return "mythical";
  }
  if (species.is_legendary) {
    return "legendary";
  }
  if (species.is_baby) {
    return "baby";
  }
  return "common";
}

// charge tous les pokemon d'une région (fiche + espèce pour la rareté)
function loadRegion(name) {
  if (regionCache[name]) {
    return Promise.resolve(regionCache[name]);
  }

  const [first, last] = REGIONS[name];
  const ids = [];
  for (let id = first; id <= last; id++) {
    ids.push(id);
  }

  return Promise.all(
    ids.map((id) =>
      Promise.all([
        fetch(API_URL + "pokemon/" + id).then(checkResponse),
        fetch(API_URL + "pokemon-species/" + id).then(checkResponse),
      ]).then(([data, species]) => {
        const pokemon = simplifyPokemon(data);
        pokemon.rarity = getRarity(species);
        return pokemon;
      }),
    ),
  ).then((list) => {
    regionCache[name] = list;
    return list;
  });
}

// affiche les pokemon de la région qui correspondent à la rareté et à la puissance
function renderRegion(list) {
  const rarity = rarityFilter.value;
  const [min, max] = powerFilter.value
    ? powerFilter.value.split("-").map(Number)
    : [0, Infinity];

  const filtered = list.filter(
    (pokemon) =>
      (rarity === "" || pokemon.rarity === rarity) &&
      pokemon.power >= min &&
      pokemon.power <= max,
  );

  if (filtered.length === 0) {
    showMessage(pokemonContainer, "No Pokémon match these filters.");
    return;
  }
  pokemonContainer.textContent = "";
  showCards(filtered);
}

function changeRegion() {
  const name = regionFilter.value;
  // rareté et puissance seulement quand une région est choisie
  rarityFilter.disabled = name === "";
  powerFilter.disabled = name === "";
  filterHint.hidden = name !== "";

  // retour à la liste complète, 24 à la fois
  if (name === "") {
    rarityFilter.value = "";
    powerFilter.value = "";
    pokemonContainer.textContent = "";
    offset = 0;
    loadMoreBtn.hidden = false;
    return getPokemon();
  }

  loadMoreBtn.hidden = true;
  const label = regionFilter.selectedOptions[0].textContent;
  showMessage(pokemonContainer, `Loading ${label}...`);

  return loadRegion(name)
    .then((list) => {
      // affiche seulement si la région n'a pas changé entre-temps
      if (regionFilter.value === name) {
        renderRegion(list);
      }
    })
    .catch(() => {
      showMessage(
        pokemonContainer,
        "The Pokémon API is not responding. Try again later.",
      );
    });
}

// la rareté et la puissance filtrent la région déjà en mémoire, sans nouvelle requête
function changeFilter() {
  const list = regionCache[regionFilter.value];
  if (list) {
    renderRegion(list);
  }
}

// avant d'ouvrir une fiche, on garde les filtres, le nombre de cartes et le pokemon choisi
pokemonContainer.addEventListener("click", (event) => {
  const link = event.target.closest(".pokemon-card a");
  if (!link) {
    return;
  }
  const state = {
    region: regionFilter.value,
    rarity: rarityFilter.value,
    power: powerFilter.value,
    count: offset,
    id: link.closest(".pokemon-card").dataset.id,
  };
  sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
});

// fait défiler la page jusqu'à la carte du pokemon ouvert
function scrollToCard(id) {
  const card = pokemonContainer.querySelector(`[data-id="${id}"]`);
  if (card) {
    card.scrollIntoView({ block: "center" });
  }
}

// au retour sur la page, on remet les filtres et les cartes comme avant
function restoreState() {
  const state = JSON.parse(sessionStorage.getItem(STATE_KEY));
  regionFilter.value = state.region;

  if (state.region === "") {
    getPokemon(Math.max(state.count, PAGE_SIZE)).then(() =>
      scrollToCard(state.id),
    );
    return;
  }

  rarityFilter.value = state.rarity;
  powerFilter.value = state.power;
  changeRegion().then(() => scrollToCard(state.id));
}

// la page gère elle-même la position de défilement au retour
history.scrollRestoration = "manual";

loadMoreBtn.addEventListener("click", () => getPokemon());
regionFilter.addEventListener("change", changeRegion);
rarityFilter.addEventListener("change", changeFilter);
powerFilter.addEventListener("change", changeFilter);

if (isBackNavigation() && sessionStorage.getItem(STATE_KEY)) {
  restoreState();
} else {
  getPokemon();
}
