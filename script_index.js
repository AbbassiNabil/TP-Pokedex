const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const container = document.getElementById("pokemon-container");

//recherche dans l api et je reutilise la function "createPokemonCard" de script_common.js
function searchPokemon(event) {
  event.preventDefault();
  const value = searchInput.value.trim().toLowerCase();

  if (value === "") {
    showMessage(container, "Type a name or a number.");
    return;
  }

  showMessage(container, "Loading...");

  fetch(API_URL + "pokemon/" + encodeURIComponent(value))
    .then((response) => {
      // l'api renvoie 404 quand le pokemon n'existe pas
      if (response.status === 404) {
        throw new Error("not found");
      }
      if (!response.ok) {
        throw new Error("api");
      }
      return response.json();
    })
    .then((data) => {
      const pokemon = simplifyPokemon(data);
      const card = createPokemonCard(pokemon);
      card.appendChild(createTeamButton(pokemon));
      container.textContent = "";
      container.appendChild(card);
      // dernière recherche gardée pour la retrouver au retour sur l'accueil
      sessionStorage.setItem("lastSearch", value);
    })
    .catch((error) => {
      if (error.message === "not found") {
        showMessage(container, `No Pokémon found for "${value}".`);
      } else {
        showMessage(
          container,
          "The Pokémon API is not responding. Try again later.",
        );
      }
    });
}

searchForm.addEventListener("submit", searchPokemon);

// au retour sur l'accueil, on relance la dernière recherche
const lastSearch = sessionStorage.getItem("lastSearch");
if (isBackNavigation() && lastSearch) {
  searchInput.value = lastSearch;
  searchPokemon(new Event("submit"));
}
