const infoContainer = document.getElementById("pokemon-details");
//j utilise le BOM pour recuperer des info dans l URL
const params = new URLSearchParams(window.location.search);
const pokemonId = params.get("id");
const breadcrumb = document.getElementById("breadcrumb");

// page du site d'où l'on vient (vide si la fiche a été ouverte directement)
const previousPage =
  document.referrer !== "" &&
  new URL(document.referrer).origin === location.origin
    ? new URL(document.referrer).pathname.split("/").pop() || "index.html"
    : "";

// lien qui revient à la page précédente avec history.back() (filtres et position gardés),
// ou qui ouvre simplement la page si on ne vient pas de là
function createBackLink(href, text) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  link.addEventListener("click", (event) => {
    if (previousPage === href) {
      event.preventDefault();
      history.back();
    }
  });
  return link;
}

// fil d'Ariane : Home / page précédente (Discover ou My Pokédex) / nom du pokemon
function renderBreadcrumb(name) {
  breadcrumb.textContent = "";
  const list = document.createElement("ol");
  const items = [createBackLink("index.html", "Home")];

  if (previousPage === "pokedex.html") {
    items.push(createBackLink("pokedex.html", "My Pokédex"));
  } else if (previousPage !== "index.html") {
    items.push(createBackLink("decouvrir.html", "Discover"));
  }

  // dernière étape : la page actuelle, sans lien
  const current = document.createElement("span");
  current.textContent = name;
  items.push(current);

  items.forEach((item, index) => {
    const li = document.createElement("li");
    if (index === items.length - 1) {
      li.setAttribute("aria-current", "page");
    }
    li.appendChild(item);
    list.appendChild(li);
  });
  breadcrumb.appendChild(list);
}

renderBreadcrumb("Details");

if (!pokemonId) {
  showMessage(infoContainer, "No Pokémon selected.");
} else {
  showMessage(infoContainer, "Loading...");
  getDetails();
}

//je recherche dans l api avec les info recupere, puis la description dans "pokemon-species"
function getDetails() {
  let pokemon;

  fetch(API_URL + "pokemon/" + encodeURIComponent(pokemonId))
    .then((response) => {
      if (response.status === 404) {
        throw new Error("not found");
      }
      if (!response.ok) {
        throw new Error("api");
      }
      return response.json();
    })
    .then((data) => {
      pokemon = data;
      return (
        fetch(data.species.url)
          .then((response) => response.json())
          .then((species) => getDescription(species))
          // la page s'affiche quand même si la description ne se charge pas
          .catch(() => "")
      );
    })
    .then((description) => {
      renderDetails(pokemon, description);
    })
    .catch((error) => {
      if (error.message === "not found") {
        showMessage(infoContainer, "This Pokémon does not exist.");
      } else {
        showMessage(
          infoContainer,
          "The Pokémon API is not responding. Try again later.",
        );
      }
    });
}

// premier texte en anglais, sans les retours à la ligne de l'api
function getDescription(species) {
  const entry = species.flavor_text_entries.find(
    (e) => e.language.name === "en",
  );
  return entry ? entry.flavor_text.replace(/[\n\f\r]/g, " ") : "";
}

//creation contenu de la page
function renderDetails(p, description) {
  infoContainer.textContent = "";
  const pokemon = simplifyPokemon(p);
  const displayName = p.name[0].toUpperCase() + p.name.slice(1);
  document.title = "Pokedex - " + displayName;
  renderBreadcrumb(displayName);

  const img = document.createElement("img");
  img.src = pokemon.image;
  img.alt = p.name;

  const info = document.createElement("div");
  info.className = "info";

  const num = document.createElement("p");
  num.className = "number";
  num.textContent = "#" + p.id;

  // nom suivi de l'image animée, si l'api en a une
  const titleRow = document.createElement("div");
  titleRow.className = "title-row";

  const title = document.createElement("h1");
  title.textContent = p.name;
  titleRow.appendChild(title);

  const animated = p.sprites.other.showdown.front_default;
  if (animated) {
    const gif = document.createElement("img");
    gif.className = "animated";
    gif.src = animated;
    // image décorative : le nom est déjà écrit à côté
    gif.alt = "";
    titleRow.appendChild(gif);
  }

  // l'api donne la taille en décimètres et le poids en hectogrammes
  const measures = document.createElement("p");
  measures.className = "measures";
  measures.textContent = `Height: ${p.height / 10} m  |  Weight: ${p.weight / 10} kg`;

  const desc = document.createElement("p");
  desc.className = "description";
  desc.textContent = description;

  // statistiques avec une barre (255 est la valeur maximale)
  const statsList = document.createElement("ul");
  statsList.className = "stats";
  p.stats.forEach((s) => {
    const li = document.createElement("li");

    const name = document.createElement("span");
    // "hp" en majuscules, les autres noms avec une espace à la place du tiret
    name.textContent =
      s.stat.name === "hp" ? "HP" : s.stat.name.replace("-", " ");

    const value = document.createElement("strong");
    value.textContent = s.base_stat;

    const bar = document.createElement("div");
    bar.className = "stat-bar";
    const fill = document.createElement("span");
    fill.style.width = (s.base_stat / 255) * 100 + "%";
    bar.appendChild(fill);

    li.appendChild(name);
    li.appendChild(value);
    li.appendChild(bar);
    statsList.appendChild(li);
  });

  const actions = document.createElement("div");
  actions.className = "actions";

  // retour à la page précédente du site (Discover, accueil, équipe) à l'endroit où on était ;
  // sans page précédente du site, le lien ouvre Discover
  const back = createBackLink(previousPage || "decouvrir.html", "Back");
  back.className = "btn";

  actions.appendChild(createTeamButton(pokemon));
  actions.appendChild(back);

  info.appendChild(num);
  info.appendChild(titleRow);
  info.appendChild(createTypes(pokemon.types));
  info.appendChild(measures);
  if (description) {
    info.appendChild(desc);
  }
  info.appendChild(statsList);
  info.appendChild(actions);

  infoContainer.appendChild(img);
  infoContainer.appendChild(info);
}
