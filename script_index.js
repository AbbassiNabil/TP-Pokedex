const serchInput = document.getElementById("search-input");
const serchBtn = document.getElementById("search-btn");
const container = document.getElementById("pokemon-container");

function createPokemonCard(data) {
  container.textContent = "";

  const card = document.createElement("div");
  card.classList.add("pokemon-card");
  card.style.width = "300px";

  const nom = document.createElement("h2");
  nom.textContent = data.name.toUpperCase() + " #" + data.id;

  const img = document.createElement("img");
  img.src = data.sprites.other["official-artwork"].front_default;
  img.alt = data.name;
  img.style.width = "200px";

  const type = document.createElement("p");

  type.textContent = "Type: " + data.types[0].type.name;

  const btnDetails = document.createElement("button");
  btnDetails.textContent = "Voir details";
  btnDetails.style.padding = "10px";
  btnDetails.style.backgroundColor = "red";
  btnDetails.style.color = "white";

  btnDetails.addEventListener("click", () => {
    window.location.href = `details.html?id=${data.id}`;
  });

  const btnTeam = document.createElement("button");
  btnTeam.textContent = "Ajouter à l'equipe";
  btnTeam.style.padding = "10px";
  btnTeam.style.backgroundColor = "white";
  btnTeam.addEventListener("click", () => {});

  card.appendChild(btnDetails);
  card.appendChild(btnTeam);
  card.appendChild(img);
  card.appendChild(nom);
  card.appendChild(type);
  container.appendChild(card);
}

function searchPokemon() {
  const value = serchInput.value.toLowerCase();

  if (value === "") return;

  fetch("https://pokeapi.co/api/v2/pokemon/" + value)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      createPokemonCard(data);
    });
}

serchBtn.addEventListener("click", searchPokemon);

serchInput.addEventListener("keypress", function (a) {
  if (a.key === "Enter") {
    searchPokemon();
  }
});
