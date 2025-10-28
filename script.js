const API = "https://pokeapi.co/api/v2/pokemon";
const pokemonsDiv = document.getElementById("pokemons");
const btnAnterior = document.getElementById("anterior");
const btnSiguiente = document.getElementById("siguiente");
const buscarBtn = document.getElementById("buscarBtn");
const filtro = document.getElementById("tipoFiltro");
const modoBtn = document.getElementById("modoBtn");

let offset = 0;
let limit = 20;

// === Cargar Pokémons ===
async function cargarPokemons() {
  pokemonsDiv.innerHTML = "<p>Cargando...</p>";

  for (let i = offset + 1; i <= offset + limit; i++) {
    try {
      const res = await fetch(`${API}/${i}`);
      const p = await res.json();

      const tipos = p.types.map(t => t.type.name).join(", ");

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.sprites.other['official-artwork'].front_default}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <p>${tipos}</p>
      `;
      card.addEventListener("click", () => mostrar(p.name));
      pokemonsDiv.appendChild(card);
    } catch (e) {
      console.error("Error cargando Pokémon #" + i, e);
    }
  }
}

// === Mostrar detalles ===
async function mostrar(nombre) {
  const panel = document.getElementById("info");
  const c = document.getElementById("contenido");
  panel.classList.add("active");
  c.innerHTML = "<p>Cargando...</p>";

  try {
    const r = await fetch(`${API}/${nombre}`);
    const p = await r.json();

    const tipos = p.types.map(t => `<span class='tipo'>${t.type.name}</span>`).join("");
    const stats = p.stats.map(s => `
      <div class="stat">
        <b>${s.stat.name}:</b>
        <div class="stat-bar">
          <div class="stat-fill ${s.stat.name}" style="width:${s.base_stat / 2}%"></div>
        </div>
      </div>`).join("");

    c.innerHTML = `
      <img src="${p.sprites.other['official-artwork'].front_default}" alt="${p.name}" />
      <h2>${p.name}</h2>
      <p><b>Tipo(s):</b></p>${tipos}
      <p><b>Altura:</b> ${p.height / 10} m</p>
      <p><b>Peso:</b> ${p.weight / 10} kg</p>
      <h3>Estadísticas</h3>${stats}
    `;
  } catch {
    c.innerHTML = "<p>Error al cargar Pokémon.</p>";
  }
}

// === Navegación ===
btnSiguiente.addEventListener("click", () => {
  offset += limit;
  cargarPokemons();
});
btnAnterior.addEventListener("click", () => {
  if (offset > 0) offset -= limit;
  cargarPokemons();
});

// === Buscar Pokémon ===
buscarBtn.addEventListener("click", () => {
  const nombre = document.getElementById("buscar").value.trim().toLowerCase();
  if (nombre) mostrar(nombre);
});

// === Filtro por tipo ===
filtro.addEventListener("change", async () => {
  const tipo = filtro.value;
  if (!tipo) return cargarPokemons();

  pokemonsDiv.innerHTML = "<p>Filtrando...</p>";

  const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
  const data = await res.json();
  pokemonsDiv.innerHTML = "";
  data.pokemon.slice(0, 20).forEach(async (p) => {
    const r = await fetch(p.pokemon.url);
    const poke = await r.json();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${poke.sprites.other['official-artwork'].front_default}" alt="${poke.name}" />
      <h3>${poke.name}</h3>
      <p>${tipo}</p>`;
    card.addEventListener("click", () => mostrar(poke.name));
    pokemonsDiv.appendChild(card);
  });
});

// === Cerrar panel ===
function cerrar() {
  document.getElementById("info").classList.remove("active");
}

// === Modo oscuro / claro ===
modoBtn.addEventListener("click", () => {
  document.body.classList.toggle("claro");
  const esClaro = document.body.classList.contains("claro");
  modoBtn.textContent = esClaro ? "☀️" : "🌙";
  localStorage.setItem("modo", esClaro ? "claro" : "oscuro");
});

// === Cargar modo guardado ===
window.addEventListener("load", () => {
  const modo = localStorage.getItem("modo");
  if (modo === "claro") {
    document.body.classList.add("claro");
    modoBtn.textContent = "☀️";
  }
  cargarPokemons();
});
