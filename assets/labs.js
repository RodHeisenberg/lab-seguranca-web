"use strict";

const byId = (id) => document.getElementById(id);
const estado = { vaga: null };

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function mostrarVaga() {
  byId("vaga-status").textContent = estado.vaga
    ? `Vaga #104 · Suporte técnico · ${moeda.format(estado.vaga.remuneracao)}`
    : "Vaga #104 ausente.";
}

const operacao = byId("operacao");
const perfil = byId("perfil");
const remuneracao = byId("remuneracao");
const metodos = { consultar: "GET", cadastrar: "POST", alterar: "PATCH", excluir: "DELETE" };

function atualizarRequisicao() {
  const altera = operacao.value === "alterar";
  byId("payload").hidden = !altera;
  remuneracao.disabled = !altera;
  byId("rota").value = operacao.value === "cadastrar" ? "/api/vagas" : "/api/vagas/104";
  const exemplo = byId("corpo-requisicao");
  exemplo.hidden = !altera && operacao.value !== "cadastrar";
  exemplo.textContent = JSON.stringify(altera
    ? { remuneracao: remuneracao.valueAsNumber }
    : { id: 104, titulo: "Suporte técnico", remuneracao: 2400 }, null, 2);
}

function restaurarVaga() {
  estado.vaga = { remuneracao: 2400 };
  mostrarVaga();
  byId("api-status").textContent = "Aguardando requisição";
  byId("corpo-resposta").textContent = "Envie uma requisição para ver a resposta.";
  byId("assericao").textContent = "";
  byId("api-historico").replaceChildren();
}

function exibirResposta(resultado) {
  const [status, mensagem] = resultado.split(" · ");
  byId("api-status").textContent = resultado;
  const corpo = status === "204" ? "Sem corpo na resposta."
    : JSON.stringify(status.startsWith("2")
      ? { id: 104, titulo: "Suporte técnico", remuneracao: estado.vaga.remuneracao }
      : { status: Number(status), mensagem }, null, 2);
  byId("corpo-resposta").textContent = corpo;
  const esperado = byId("esperado").value;
  const assercao = byId("assericao");
  assercao.dataset.kind = esperado === status ? "success" : "retry";
  assercao.textContent = esperado
    ? `Asserção ${esperado === status ? "passou" : "falhou"} · esperado ${esperado}, recebido ${status}.` : "";
  const linha = document.createElement("li");
  linha.textContent = `${metodos[operacao.value]} ${byId("rota").value} · ${perfil.selectedOptions[0].text} · HTTP ${status}`;
  const historico = byId("api-historico");
  historico.prepend(linha);
  if (historico.children.length > 12) historico.lastElementChild.remove();
  mostrarVaga();
}

byId("api-form").addEventListener("submit", (event) => {
  event.preventDefault();
  exibirResposta(executarOperacao(estado, perfil.value, operacao.value, remuneracao.valueAsNumber));
});
document.querySelectorAll("[data-operation]").forEach((botao) => botao.addEventListener("click", () => {
  perfil.value = botao.dataset.profile;
  operacao.value = botao.dataset.operation;
  byId("esperado").value = "";
  atualizarRequisicao();
}));
operacao.addEventListener("change", atualizarRequisicao);
remuneracao.addEventListener("input", atualizarRequisicao);
byId("api-reset").addEventListener("click", restaurarVaga);
atualizarRequisicao();
restaurarVaga();

const hashes = [
  "$2b$12$abcdefghijklmnopqrstuuIMT2XNpPLsIJWMG8zUfuyXI.nm76X5O",
  "$2b$12$ZYXWVUTSRQPONMLKJIHGFe/vtpjwTwkXpl7Qs17DenUXfIfBw93jC",
];
let indiceHash = 0;
byId("hash-status").textContent = hashes[indiceHash];
byId("novo-salt").addEventListener("click", () => {
  indiceHash = 1 - indiceHash;
  byId("hash-status").textContent = hashes[indiceHash];
  byId("hash-feedback").textContent = "Salt alternado. Confira a correspondência novamente.";
});
byId("hash-form").addEventListener("submit", (event) => {
  event.preventDefault();
  byId("hash-feedback").textContent = byId("senha").value === "VagaDemo2026"
    ? "Senha correspondente ao hash exibido."
    : "Senha diferente daquela usada para gerar o hash.";
});

const versoes = {
  antes: {
    codigo: `boolean fazerCoisa(String t, int v) {
    if (t == null || t.isBlank()) return false;
    if (v < 0) return false;
    return true;
}`,
    aceita(titulo, remuneracao) {
      if (!titulo?.trim()) return false;
      if (remuneracao < 0) return false;
      return true;
    },
  },
  depois: {
    codigo: `boolean podeCadastrarVaga(String titulo, int remuneracao) {
    return tituloValido(titulo) && remuneracao >= 0;
}

boolean tituloValido(String titulo) {
    return titulo != null && !titulo.isBlank();
}`,
    aceita(titulo, remuneracao) {
      return Boolean(titulo?.trim()) && remuneracao >= 0;
    },
  },
};
let versao = "antes";
function mostrarVersao(id) {
  versao = id;
  Object.keys(versoes).forEach((nome) => byId(nome).setAttribute("aria-pressed", nome === id));
  byId("codigo").textContent = versoes[id].codigo;
  byId("retorno-teste").textContent = "";
  byId("testes").textContent = "Os testes verificam título válido, título vazio e remuneração negativa.";
}
Object.keys(versoes).forEach((id) => byId(id).addEventListener("click", () => mostrarVersao(id)));
mostrarVersao(versao);

byId("testar").addEventListener("click", () => {
  const casos = [
    ["Título e remuneração válidos", "Suporte técnico", 2400, true],
    ["Título vazio", " ", 2400, false],
    ["Remuneração negativa", "Suporte técnico", -10, false],
  ];
  const tabela = document.createElement("table");
  tabela.className = "result-grid";
  tabela.innerHTML = "<thead><tr><th>Caso</th><th>Esperado</th><th>Obtido</th><th>Teste</th></tr></thead><tbody></tbody>";
  for (const [nome, titulo, valor, esperado] of casos) {
    const obtido = versoes[versao].aceita(titulo, valor);
    const linha = tabela.tBodies[0].insertRow();
    [nome, esperado ? "Aceito" : "Recusado", obtido ? "Aceito" : "Recusado", obtido === esperado ? "Passou" : "Falhou"]
      .forEach((texto) => { linha.insertCell().textContent = texto; });
  }
  byId("testes").replaceChildren(tabela);
});

byId("teste-personalizado").addEventListener("submit", (event) => {
  event.preventDefault();
  const esperado = byId("resultado-teste").value === "true";
  const obtido = versoes[versao].aceita(byId("titulo-teste").value, byId("valor-teste").valueAsNumber);
  const saida = byId("retorno-teste");
  saida.dataset.kind = obtido === esperado ? "success" : "retry";
  saida.textContent = `Teste ${obtido === esperado ? "passou" : "falhou"} · esperado ${esperado ? "aceito" : "recusado"}, obtido ${obtido ? "aceito" : "recusado"}.`;
});

let gitEtapa = 0;
const comandos = [
  "git status · SecurityConfig.java e VagaService.java têm alterações.",
  "git add · As alterações nos dois arquivos estão preparadas para o commit.",
  "git commit · Registro criado: Aplica permissões e organiza validação de vagas.",
];
document.querySelectorAll("[data-git]").forEach((botao) => botao.addEventListener("click", () => {
  const etapa = Number(botao.dataset.git);
  if (gitEtapa === comandos.length) {
    byId("git-status").textContent = "Commit registrado. Clique em Reiniciar para refazer a simulação.";
    return;
  }
  if (etapa !== gitEtapa) {
    byId("git-status").textContent = "Siga a ordem: revise as alterações, prepare os arquivos e crie o commit.";
    return;
  }
  byId("git-status").textContent = comandos[gitEtapa++];
}));
byId("git-reset").addEventListener("click", () => {
  gitEtapa = 0;
  byId("git-status").textContent = "Aguardando comando.";
});
