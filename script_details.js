const infoContainer = document.getElementById("pokemon-details");

const params = new URLSearchParams(window.location.search);
const pokemonId = params.get("id");

if (pokemonId) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then((response) => {
      return response.json();
    })
    .then((pokemon) => {
      renderDetails(pokemon);
    });
}

function renderDetails(p) {
  const img = document.createElement("img");
  img.src = p.sprites.other["official-artwork"].front_default;
  img.style.width = "400px";

  const title = document.createElement("h2");
  title.textContent = p.name.toUpperCase();

  const statsList = document.createElement("ul");
  p.stats.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `${s.stat.name}: ${s.base_stat}`;
    statsList.appendChild(li);
  });

  const desc = document.createElement("p");
  desc.textContent = `${p.name} est pokemon de type ${p.types[0].type.name} est une creature incroyable !`;

  infoContainer.appendChild(img);
  infoContainer.appendChild(title);
  infoContainer.appendChild(statsList);
  infoContainer.appendChild(desc);
}
