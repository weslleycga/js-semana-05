// Entregável Desenvolvimento Web – Objetos, Dados e Assincronismo – Semana 05

// ============================================================
// PARTE 1 – Manipulação e validação de dados (Console)
// ============================================================
const pedidos = [
  { cliente: "Bia", valor: 120, status: "pago" },
  { cliente: "Caio", valor: 80, status: "pendente" },
  { cliente: "", valor: 50, status: "pago" },
  { cliente: "Duda", valor: -10, status: "pago" },
  { cliente: "Edu", valor: "abc", status: "pago" },
  { cliente: "Fabi", valor: 200.5, status: "pago" },
];

const pedidoValido = (p) =>
  typeof p.cliente === "string" &&
  p.cliente.trim() !== "" &&
  typeof p.valor === "number" &&
  Number.isFinite(p.valor) &&
  p.valor > 0;

const pedidosValidos = pedidos.filter(pedidoValido);
const pedidosPagos = pedidosValidos.filter((p) => p.status === "pago");
const totalFaturado = pedidosPagos.reduce((acc, p) => acc + p.valor, 0);
const textos = pedidosPagos.map((p) => `${p.cliente} — R$ ${p.valor.toFixed(2)}`);

console.log("Pedidos válidos:", pedidosValidos);
console.log("Pedidos pagos:", pedidosPagos);
console.log(`Total faturado: R$ ${totalFaturado.toFixed(2)}`);
textos.forEach((t) => console.log(t));

// ============================================================
// Utilitários de estado de tela (Carregando / Erro / Vazio / Sucesso)
// ============================================================
function setStatus(el, mensagem, ehErro = false) {
  el.textContent = mensagem;
  el.classList.toggle("erro", ehErro);
}

async function buscarJSON(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) {
    const erro = new Error(`HTTP ${response.status}`);
    erro.status = response.status;
    throw erro;
  }
  return response.json();
}

// ============================================================
// PARTE 2 – Buscador de CEP
// ============================================================
const formCep = document.querySelector("#form-cep");
const inputCep = document.querySelector("#cep");
const btnCep = document.querySelector("#btn-cep");
const statusCep = document.querySelector("#status-cep");
const resultadoCep = document.querySelector("#resultado-cep");
const historicoCep = document.querySelector("#historico-cep");
const historico = []; // [{ cep, cidade, uf }]

function renderHistorico() {
  historicoCep.replaceChildren(
    ...historico.map((h) => {
      const li = document.createElement("li");
      li.textContent = `${h.cep} — ${h.cidade}/${h.uf}`;
      return li;
    })
  );
}

function renderEndereco(dados) {
  const campos = [
    ["Rua", dados.logradouro],
    ["Bairro", dados.bairro],
    ["Cidade", dados.localidade],
    ["UF", dados.uf],
  ];
  const itens = campos.flatMap(([rotulo, valor]) => {
    const dt = document.createElement("dt");
    dt.textContent = rotulo;
    const dd = document.createElement("dd");
    dd.textContent = valor || "—";
    return [dt, dd];
  });
  resultadoCep.replaceChildren(...itens);
}

async function buscarCep(cep) {
  setStatus(statusCep, "Buscando...");
  btnCep.disabled = true;
  resultadoCep.replaceChildren();
  try {
    const dados = await buscarJSON(`https://viacep.com.br/ws/${cep}/json/`);
    if (dados.erro) {
      setStatus(statusCep, "CEP não encontrado", true);
      return;
    }
    renderEndereco(dados);
    setStatus(statusCep, "");
    historico.push({ cep, cidade: dados.localidade, uf: dados.uf });
    renderHistorico();
  } catch (erro) {
    console.error(erro);
    setStatus(statusCep, "Falha na conexão. Tente novamente.", true);
  } finally {
    btnCep.disabled = false;
  }
}

formCep.addEventListener("submit", (e) => {
  e.preventDefault();
  const cep = inputCep.value.trim().replace(/[-.\s]/g, "");
  if (!/^\d{8}$/.test(cep)) {
    resultadoCep.replaceChildren();
    setStatus(statusCep, "CEP inválido: digite exatamente 8 dígitos.", true);
    return;
  }
  buscarCep(cep);
});

// ============================================================
// PARTE 3 – Mini Pokédex
// ============================================================
const formPoke = document.querySelector("#form-poke");
const inputPoke = document.querySelector("#pokemon");
const btnPoke = document.querySelector("#btn-poke");
const statusPoke = document.querySelector("#status-poke");
const resultadoPoke = document.querySelector("#resultado-poke");

function renderPokemon(dados) {
  const titulo = document.createElement("h3");
  titulo.textContent = dados.name;

  const img = document.createElement("img");
  img.src = dados.sprites.front_default ?? "";
  img.alt = dados.name;

  const tipos = document.createElement("p");
  tipos.textContent = `Tipos: ${dados.types.map((t) => t.type.name).join(", ")}`;

  resultadoPoke.replaceChildren(titulo, img, tipos);
}

async function buscarPokemon(nome) {
  setStatus(statusPoke, "Buscando...");
  btnPoke.disabled = true;
  resultadoPoke.replaceChildren();
  try {
    const dados = await buscarJSON(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`
    );
    renderPokemon(dados);
    setStatus(statusPoke, "");
  } catch (erro) {
    console.error(erro);
    if (erro.status === 404) {
      setStatus(statusPoke, "Pokémon não encontrado", true);
    } else {
      setStatus(statusPoke, "Falha na conexão. Tente novamente.", true);
    }
  } finally {
    btnPoke.disabled = false;
  }
}

formPoke.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = inputPoke.value.trim().toLowerCase();
  if (nome === "") {
    setStatus(statusPoke, "Digite o nome de um Pokémon.", true);
    return;
  }
  buscarPokemon(nome);
});
