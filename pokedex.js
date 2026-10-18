const teamContainer = document.getElementById("team");
const teamCount = document.getElementById("team-count");

// affiche l'équipe enregistrée dans le localStorage (pas besoin de l'api)
function renderTeam() {
  const team = getTeam();
  teamCount.textContent = `${team.length} / ${TEAM_MAX} Pokémon in your team`;

  if (team.length === 0) {
    showMessage(
      teamContainer,
      "Your team is empty. Add Pokémon from the Discover page.",
    );
    return;
  }

  teamContainer.textContent = "";
  team.forEach((pokemon) => {
    const card = createPokemonCard(pokemon);

    const btnRemove = document.createElement("button");
    btnRemove.className = "btn";
    btnRemove.textContent = "Remove";
    btnRemove.setAttribute(
      "aria-label",
      "Remove " + pokemon.name + " from the team",
    );
    btnRemove.addEventListener("click", () => {
      removeFromTeam(pokemon.id);
      renderTeam();
    });

    card.appendChild(btnRemove);
    teamContainer.appendChild(card);
  });
}

renderTeam();
