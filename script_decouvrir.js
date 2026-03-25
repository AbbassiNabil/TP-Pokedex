const pokemonContainer = document.getElementById("carosello");

function getPokemon() {
  fetch("https://pokeapi.co/api/v2/pokemon?limit=300")
    .then((response) => {
      return response.json();
    })

    .then((data) => {
      data.results.forEach((pokemon) => {
        pokemonCard(pokemon.url);
      });
    });
}

function pokemonCard(url) {
  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((pokemonData) => {
      const card = document.createElement("article");
      card.className = "pokemon-card";
      card.setAttribute("data-name", pokemonData.name);

      const img = document.createElement("img");
      img.src = pokemonData.sprites.other["official-artwork"].front_default;
      img.alt = pokemonData.name;
      img.style.width = "200px";
      img.style.backgroundColor = "whitesmoke";
      img.style.border = "1px solid black";
      img.style.borderRadius = "10px";

      const name = document.createElement("h3");
      name.textContent = pokemonData.name.toUpperCase();

      const num = document.createElement("p");
      num.textContent = "#" + pokemonData.id;

      const btnDetails = document.createElement("button");
      btnDetails.textContent = "Voir details";
      btnDetails.style.backgroundColor = "red";
      btnDetails.style.color = "white";
      btnDetails.addEventListener("click", () => {
        window.location.href = `details.html?id=${pokemonData.id}`;
      });

      const btnTeam = document.createElement("button");
      btnTeam.textContent = "Ajouter a l'equipe";
      btnTeam.style.backgroundColor = "white";
      btnTeam.addEventListener("click", () => {});

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(num);
      card.appendChild(btnDetails);
      card.appendChild(btnTeam);

      pokemonContainer.appendChild(card);
    });
}

getPokemon();
